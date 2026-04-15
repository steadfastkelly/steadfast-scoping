from __future__ import annotations

import json
import os
import time
from collections import defaultdict
from datetime import datetime, timedelta, timezone
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from app.models import AssigneeWorkload, ClickUpWorkloadRequest, ClickUpWorkloadResult

CLICKUP_API_BASE = 'https://api.clickup.com/api/v2'


def _parse_clickup_epoch(raw_value: str | None) -> datetime | None:
  if not raw_value:
    return None

  try:
    return datetime.fromtimestamp(int(raw_value) / 1000, tz=timezone.utc)
  except (TypeError, ValueError):
    return None


def _fetch_tasks(team_id: str, token: str, page: int, due_date_gt_ms: int):
  params = {
    'include_closed': 'false',
    'subtasks': 'true',
    'page': str(page),
    'due_date_gt': str(due_date_gt_ms),
  }

  url = f'{CLICKUP_API_BASE}/team/{team_id}/task?{urlencode(params)}'
  request = Request(url, headers={'Authorization': token})

  with urlopen(request, timeout=25) as response:
    payload = json.loads(response.read().decode('utf-8'))

  return payload.get('tasks', [])


def _filter_by_lists(tasks: list[dict], list_ids: list[str]) -> list[dict]:
  if not list_ids:
    return tasks

  allowed = set(list_ids)
  filtered = []
  for task in tasks:
    task_list = task.get('list') or {}
    task_list_id = task_list.get('id')
    if task_list_id in allowed:
      filtered.append(task)

  return filtered


def fetch_clickup_workload(request: ClickUpWorkloadRequest) -> ClickUpWorkloadResult:
  token = request.token or os.getenv('CLICKUP_API_TOKEN')
  if not token:
    raise ValueError('Missing ClickUp token. Provide token in request or set CLICKUP_API_TOKEN.')

  if not request.team_id:
    raise ValueError('team_id is required.')

  now = datetime.now(tz=timezone.utc)
  horizon = now + timedelta(days=max(1, request.horizon_days))
  due_date_gt_ms = int((now - timedelta(days=90)).timestamp() * 1000)

  all_tasks: list[dict] = []
  warnings: list[str] = []

  for page in range(0, 10):
    tasks = _fetch_tasks(request.team_id, token, page, due_date_gt_ms)
    if not tasks:
      break

    all_tasks.extend(tasks)
    if len(tasks) < 100:
      break

    time.sleep(0.05)
  else:
    warnings.append('Task pagination reached cap (10 pages). Results may be partial.')

  scoped_tasks = _filter_by_lists(all_tasks, request.list_ids)

  assignee_stats = defaultdict(lambda: {'name': 'Unassigned', 'open': 0, 'overdue': 0, 'soon': 0})
  overdue_total = 0
  due_soon_total = 0

  for task in scoped_tasks:
    due_at = _parse_clickup_epoch(task.get('due_date'))
    status_obj = task.get('status') or {}
    status = str(status_obj.get('status', '')).lower()
    is_closed = status in {'complete', 'closed', 'done'}
    if is_closed:
      continue

    assignees = task.get('assignees') or []
    if not assignees:
      assignees = [{'id': 'unassigned', 'username': 'Unassigned'}]

    is_overdue = bool(due_at and due_at < now)
    is_due_soon = bool(due_at and now <= due_at <= horizon)

    if is_overdue:
      overdue_total += 1
    if is_due_soon:
      due_soon_total += 1

    for assignee in assignees:
      key = str(assignee.get('id') or 'unknown')
      name = assignee.get('username') or assignee.get('email') or 'Unknown'

      stats = assignee_stats[key]
      stats['name'] = name
      stats['open'] += 1
      if is_overdue:
        stats['overdue'] += 1
      if is_due_soon:
        stats['soon'] += 1

  assignee_rows = [
    AssigneeWorkload(
      assignee_id=assignee_id,
      assignee_name=stats['name'],
      open_tasks=stats['open'],
      overdue_tasks=stats['overdue'],
      due_soon_tasks=stats['soon'],
    )
    for assignee_id, stats in assignee_stats.items()
  ]
  assignee_rows.sort(key=lambda row: (row.overdue_tasks, row.open_tasks), reverse=True)

  return ClickUpWorkloadResult(
    team_id=request.team_id,
    horizon_days=request.horizon_days,
    total_open_tasks=sum(row.open_tasks for row in assignee_rows),
    tasks_due_soon=due_soon_total,
    tasks_overdue=overdue_total,
    assignees=assignee_rows,
    warnings=warnings,
  )

---
name: agency-profitability-app-builder
description: build a desktop application for reconciling project hours vs invoicing, calculating profitability, and forecasting project scope accuracy for agencies. use when creating internal tools for financial reconciliation, project scoping analysis, profitability dashboards, or when working with timely, invoice, and payment datasets with messy real-world structures.
---

# Overview

Build a complete Electron + React + Python desktop application that:

- Reconciles:
  - Timely (hours tracking)
  - Invoice data
  - Payment data

- Calculates:
  - Project profitability
  - Scope variance
  - Over/under servicing

- Forecasts:
  - Future project cost
  - Recommended pricing
  - Margin based on role mix

---

# Operating Mode

You are a semi-autonomous build agent.

- Build in phases
- Ask questions only when necessary
- Write real code (no summaries)
- Pause at logical checkpoints

---

# Core Business Logic

## Matching

Level 1: Invoice match + amount match  
Level 2: Multi-invoice sum match  
Level 3: Fuzzy (customer + date + amount)  
Level 4: Manual  

---

## Confidence

- Invoice: 60  
- Amount: 20  
- Customer: 10  
- Date: 10  

---

## Rates

- Design: 150  
- AM: 120  
- Strategy: 225  
- Content: 140  
- Development: 180  

---

# Profitability

cost =  
(strategy * 225) +  
(design * 150) +  
(dev * 180) +  
(content * 140) +  
(am * 120)  

profit = revenue - cost  
margin = profit / revenue  

---

# Build Phases

1. Architecture  
2. File ingestion  
3. Reconciliation  
4. Project mapping  
5. Profitability  
6. Dashboard  
7. Forecasting  

---

# UI Rules

- Use Steadfast design system when provided  
- Clean, minimal, structured  
- Card-based layout  
- Prioritize clarity  

---

# Start

Begin Phase 1:
- Electron + React + Python scaffold
- Ask only essential setup questions

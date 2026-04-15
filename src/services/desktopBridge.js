const desktopApi = window.desktop;

const fallback = {
  selectFile: async () => ({ canceled: true, filePaths: [] }),
  startBackend: async () => ({ running: false, pid: null }),
  stopBackend: async () => ({ running: false }),
  backendStatus: async () => ({ running: false, pid: null }),
};

export const desktopBridge = desktopApi || fallback;

export async function fetchBackendHealth() {
  const baseUrl = process.env.REACT_APP_BACKEND_URL || 'http://127.0.0.1:8765';

  try {
    const response = await fetch(`${baseUrl}/health`);
    if (!response.ok) {
      throw new Error(`Health check failed: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    return {
      status: 'unreachable',
      error: error.message,
    };
  }
}

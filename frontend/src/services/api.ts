import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 300000,
});

export function startImport(
  file: File,
  onProgress: (event: import('@/types').ProgressEvent) => void,
  onComplete: (event: import('@/types').ProgressEvent) => void,
  onError: (error: string) => void
): AbortController {
  const abortController = new AbortController();
  const formData = new FormData();
  formData.append('file', file);

  const eventSource = fetch(`${API_BASE_URL}/api/import`, {
    method: 'POST',
    body: formData,
    signal: abortController.signal,
  });

  eventSource
    .then(async (response) => {
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        onError(errorData.error || `Server error: ${response.status}`);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        onError('Failed to read response stream.');
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (trimmed.startsWith('data: ')) {
            try {
              const eventData = JSON.parse(trimmed.slice(6));
              if (eventData.type === 'complete') {
                onComplete(eventData);
              } else if (eventData.type === 'error') {
                onError(eventData.message || 'Import failed.');
              } else {
                onProgress(eventData);
              }
            } catch {
            }
          }
        }
      }
    })
    .catch((error) => {
      if (error instanceof DOMException && error.name === 'AbortError') {
        onError('Import was cancelled.');
        return;
      }
      onError(error instanceof Error ? error.message : 'Failed to connect to server.');
    });

  return abortController;
}

export async function cancelImport(importId: string): Promise<void> {
  await apiClient.post('/api/import/cancel', { importId });
}

export async function healthCheck(): Promise<boolean> {
  try {
    const response = await apiClient.get('/api/health');
    return response.data.status === 'healthy';
  } catch {
    return false;
  }
}

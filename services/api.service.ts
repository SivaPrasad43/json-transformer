export const apiService = {
  async testApiConnection(url: string, signal?: AbortSignal): Promise<any> {
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  },
};

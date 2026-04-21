import { config } from '@/lib/config';

export interface Api {
  id: string;
  name: string;
  url: string;
}

export interface TransformConfig {
  id?: string;
  name: string;
  apis: Api[];
  outputSchema?: any;
  mappings?: Record<string, string>;
  createdAt?: string;
}

export const configService = {
  async getAllConfigs(): Promise<TransformConfig[]> {
    const response = await fetch(`${config.backendUrl}/configs`);
    if (!response.ok) throw new Error('Failed to fetch configs');
    return response.json();
  },

  async getConfigById(id: string): Promise<TransformConfig> {
    const response = await fetch(`${config.backendUrl}/configs/${id}`);
    if (!response.ok) throw new Error('Failed to fetch config');
    return response.json();
  },

  async createConfig(data: TransformConfig): Promise<TransformConfig> {
    const response = await fetch(`${config.backendUrl}/configs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to create config');
    return response.json();
  },

  async updateConfig(id: string, data: TransformConfig): Promise<TransformConfig> {
    const response = await fetch(`${config.backendUrl}/configs/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('Failed to update config');
    return response.json();
  },

  async deleteConfig(id: string): Promise<void> {
    const response = await fetch(`${config.backendUrl}/configs/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('Failed to delete config');
  },
};

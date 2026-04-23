import { config } from '@/lib/config';

export interface TransformResponse {
  data: any;
  logs: string[];
  errors: string[];
}

export const transformService = {
  async executeTransformation(id: string): Promise<TransformResponse> {
    const response = await fetch(`${config.backendUrl}/transform/${id}`, {
      method: 'GET',
    });
    if (!response.ok) throw new Error('Failed to execute transformation');
    return response.json();
  },
};

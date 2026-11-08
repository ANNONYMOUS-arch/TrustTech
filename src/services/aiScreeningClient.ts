import { Project, ProjectApplication } from '../types';

export interface AiScreeningResponse {
  success: boolean;
  screening?: NonNullable<ProjectApplication['aiScreening']>;
  error?: string;
  isConfigured: boolean;
}

export async function requestAiProposalScreening(
  project: Project,
  proposal: ProjectApplication
): Promise<AiScreeningResponse> {
  try {
    const res = await fetch('/api/screen-proposal', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        project,
        proposal,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return {
        success: false,
        isConfigured: data.isConfigured !== false,
        error: data.message || data.error || 'Failed to screen proposal.',
      };
    }

    return {
      success: true,
      isConfigured: true,
      screening: data.screening,
    };
  } catch (err: any) {
    return {
      success: false,
      isConfigured: true,
      error: err.message || 'Network error connecting to screening engine.',
    };
  }
}

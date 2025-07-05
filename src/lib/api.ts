import { 
  RankPatientsRequest, 
  RankPatientsResponse, 
  MatchDoctorsRequest, 
  MatchDoctorsResponse
} from '@/types/triage';
import { supabase } from '@/integrations/supabase/client';

// Backend API endpoints (keeping for patient ranking and doctor matching)
const BACKEND_BASE_URL = 'https://8876697120128630784.us-central1-223266628372.prediction.vertexai.goog/v1/projects/223266628372/locations/us-central1/endpoints/8876697120128630784';

// Generic API call function
async function apiCall<T>(url: string, options: RequestInit): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    throw new Error(`API call failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Rank patients endpoint
export async function rankPatients(request: RankPatientsRequest): Promise<RankPatientsResponse> {
  return apiCall<RankPatientsResponse>(`${BACKEND_BASE_URL}/rank_patients`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

// Match doctors endpoint
export async function matchDoctors(request: MatchDoctorsRequest): Promise<MatchDoctorsResponse> {
  return apiCall<MatchDoctorsResponse>(`${BACKEND_BASE_URL}/match_doctors`, {
    method: 'POST',
    body: JSON.stringify(request),
  });
}

// Vertex AI endpoint for triage analysis via Supabase Edge Function
export async function performTriageAnalysis(
  patientInfo: any,
  vitals: any,
  notes: string,
  image?: string
): Promise<{
  summary: string;
  urgency_level: 'low' | 'moderate' | 'high' | 'critical';
  red_flags: string[];
  recommended_actions: string[];
}> {
  try {
    const { data, error } = await supabase.functions.invoke('medgemma-triage', {
      body: {
        patientInfo,
        vitals,
        notes,
        image
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Triage analysis failed: ${error.message}`);
    }

    return {
      summary: data.summary || 'No summary provided',
      urgency_level: data.urgency_level || 'low',
      red_flags: data.red_flags || [],
      recommended_actions: data.recommended_actions || []
    };
  } catch (error) {
    console.error('Triage analysis error:', error);
    throw new Error(`Triage analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Vertex AI endpoint for mortality prediction via Supabase Edge Function
export async function predictMortality(patientDescription: string): Promise<number> {
  try {
    const { data, error } = await supabase.functions.invoke('mortality-prediction', {
      body: {
        patientDescription
      }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Mortality prediction failed: ${error.message}`);
    }

    return data.percentage || 0;
  } catch (error) {
    console.error('Mortality prediction error:', error);
    throw new Error(`Mortality prediction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
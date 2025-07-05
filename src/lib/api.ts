import { 
  RankPatientsRequest, 
  RankPatientsResponse, 
  MatchDoctorsRequest, 
  MatchDoctorsResponse
} from '@/types/triage';
import { supabase } from '@/integrations/supabase/client';

// Rank patients endpoint via Supabase Edge Function
export async function rankPatients(request: RankPatientsRequest): Promise<RankPatientsResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('rank-patients', {
      body: request
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Rank patients failed: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Rank patients error:', error);
    throw new Error(`Rank patients failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Match doctors endpoint via Supabase Edge Function
export async function matchDoctors(request: MatchDoctorsRequest): Promise<MatchDoctorsResponse> {
  try {
    const { data, error } = await supabase.functions.invoke('match-doctors', {
      body: request
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Match doctors failed: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Match doctors error:', error);
    throw new Error(`Match doctors failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
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
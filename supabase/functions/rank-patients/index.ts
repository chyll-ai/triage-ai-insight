import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Local ranking algorithm
function rankPatientsLocally(patients: any[]) {
  return patients
    .map((patient, index) => ({
      patient_id: patient.id,
      rank: index + 1,
      priority_score: calculatePriorityScore(patient)
    }))
    .sort((a, b) => b.priority_score - a.priority_score)
    .map((item, index) => ({
      patient_id: item.patient_id,
      rank: index + 1
    }));
}

function calculatePriorityScore(patient: any) {
  let score = 0;
  
  // Triage level (1 = highest priority, 5 = lowest)
  score += (6 - patient.triage_level) * 30;
  
  // Severity score (1-10, higher = more urgent)
  score += patient.severity_score * 10;
  
  // Immediate attention required
  if (patient.requires_immediate_attention) score += 50;
  
  // Age factor (pediatric and elderly get priority)
  if (patient.age < 18 || patient.age > 65) score += 15;
  
  // Time waiting (older arrivals get slight priority)
  const arrivalTime = new Date(patient.arrival_time);
  const waitTime = Date.now() - arrivalTime.getTime();
  score += Math.min(waitTime / (1000 * 60 * 10), 20); // Max 20 points for waiting
  
  return score;
}

serve(async (req) => {
  console.log('Rank patients function called:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Reading request body...');
    const requestData = await req.json();
    console.log('Request data received:', requestData);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Fetch patient data from Supabase
    console.log('Fetching patient data from Supabase...');
    const { data: patients, error: patientsError } = await supabase
      .from('patients')
      .select('id, name, age, chief_complaint, severity_score, triage_level, arrival_time, requires_immediate_attention, requires_specialist')
      .in('id', requestData.patient_ids);

    if (patientsError) {
      console.error('Error fetching patients:', patientsError);
      throw new Error(`Failed to fetch patient data: ${patientsError.message}`);
    }

    console.log(`Fetched ${patients?.length || 0} patients`);

    // Try AI service first, fall back to local algorithm
    let rankedPatients;
    
    try {
      const authToken = Deno.env.get('GOOGLE_CLOUD_TOKEN');
      
      if (!authToken) {
        console.log('No Google Cloud token, using local ranking');
        throw new Error('Google Cloud token not configured');
      }

      console.log('Making request to Vertex AI endpoint...');
      const aiPayload = {
        patients: patients?.map(p => ({
          id: p.id,
          name: p.name,
          age: p.age,
          chief_complaint: p.chief_complaint,
          severity_score: p.severity_score,
          triage_level: p.triage_level,
          arrival_time: p.arrival_time,
          requires_immediate_attention: p.requires_immediate_attention,
          requires_specialist: p.requires_specialist
        }))
      };

      const response = await fetch('https://8876697120128630784.us-central1-223266628372.prediction.vertexai.goog/v1/projects/223266628372/locations/us-central1/endpoints/8876697120128630784/rank_patients', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(aiPayload),
      });

      if (!response.ok) {
        throw new Error(`AI service error: ${response.status}`);
      }

      const aiResult = await response.json();
      rankedPatients = aiResult.ranked || aiResult;
      console.log('AI ranking successful');
      
    } catch (aiError) {
      console.log('AI service failed, using local ranking:', aiError.message);
      rankedPatients = rankPatientsLocally(patients || []);
    }

    return new Response(JSON.stringify({
      ranked: rankedPatients,
      total_patients: patients?.length || 0,
      ranking_method: rankedPatients.length ? 'ai_with_fallback' : 'local'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in rank-patients function:', error);
    
    return new Response(JSON.stringify({
      error: error.message,
      status: 'error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
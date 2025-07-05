import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Local matching algorithm
function matchDoctorsLocally(patients: any[], doctors: any[]) {
  const matches = [];
  
  // Sort patients by priority (same logic as ranking)
  const sortedPatients = patients.sort((a, b) => calculatePatientPriority(b) - calculatePatientPriority(a));
  
  for (const patient of sortedPatients) {
    const availableDoctors = doctors.filter(d => 
      d.availability_status === 'available' && 
      d.current_patient_load < d.max_patient_capacity
    );
    
    if (availableDoctors.length === 0) continue;
    
    // Calculate matching scores for each available doctor
    const doctorScores = availableDoctors.map(doctor => ({
      doctor,
      score: calculateMatchingScore(patient, doctor),
      justification: generateJustification(patient, doctor)
    }));
    
    // Sort by score and pick the best match
    doctorScores.sort((a, b) => b.score - a.score);
    const bestMatch = doctorScores[0];
    
    if (bestMatch && bestMatch.score > 0) {
      matches.push({
        patient_id: patient.id,
        doctor_id: bestMatch.doctor.id,
        score: bestMatch.score,
        justification: bestMatch.justification
      });
      
      // Update doctor's patient load for next iteration
      bestMatch.doctor.current_patient_load++;
    }
  }
  
  return matches;
}

function calculatePatientPriority(patient: any) {
  let score = 0;
  score += (6 - patient.triage_level) * 30;
  score += patient.severity_score * 10;
  if (patient.requires_immediate_attention) score += 50;
  return score;
}

function calculateMatchingScore(patient: any, doctor: any) {
  let score = 0;
  
  // Specialty matching
  if (patient.requires_cardiac_specialist && doctor.cardiac_specialist) score += 40;
  if (patient.requires_pediatric_care && doctor.pediatric_qualified) score += 40;
  if (patient.requires_trauma_specialist && doctor.trauma_experience_level >= 4) score += 35;
  if (patient.requires_surgery && doctor.surgery_qualified) score += 35;
  
  // Experience factor for complex cases
  if (patient.severity_score >= 8) score += doctor.years_experience * 2;
  if (patient.triage_level <= 2) score += doctor.emergency_response_rating * 10;
  
  // Workload balance - prefer doctors with lower current load
  const loadFactor = (doctor.max_patient_capacity - doctor.current_patient_load) / doctor.max_patient_capacity;
  score += loadFactor * 20;
  
  // Age-specific care
  if (patient.age < 18 && doctor.pediatric_qualified) score += 25;
  if (patient.age > 65 && doctor.years_experience >= 10) score += 15;
  
  return Math.max(0, score);
}

function generateJustification(patient: any, doctor: any) {
  const reasons = [];
  
  if (patient.requires_cardiac_specialist && doctor.cardiac_specialist) {
    reasons.push("cardiac specialist match");
  }
  if (patient.requires_pediatric_care && doctor.pediatric_qualified) {
    reasons.push("pediatric qualification");
  }
  if (patient.requires_trauma_specialist && doctor.trauma_experience_level >= 4) {
    reasons.push("trauma experience");
  }
  if (patient.severity_score >= 8 && doctor.years_experience >= 10) {
    reasons.push("high experience for complex case");
  }
  if (doctor.current_patient_load < doctor.max_patient_capacity * 0.7) {
    reasons.push("optimal workload");
  }
  
  return reasons.length > 0 ? reasons.join(", ") : "general availability and experience match";
}

serve(async (req) => {
  console.log('Match doctors function called:', req.method);
  
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
    console.log('Fetching patient and doctor data from Supabase...');
    const [patientsResult, doctorsResult] = await Promise.all([
      supabase
        .from('patients')
        .select('id, name, age, chief_complaint, severity_score, triage_level, requires_immediate_attention, requires_specialist, requires_cardiac_specialist, requires_pediatric_care, requires_trauma_specialist, requires_surgery')
        .in('id', requestData.patient_ids),
      supabase
        .from('doctors')
        .select('id, name, employee_id, availability_status, current_patient_load, max_patient_capacity, years_experience, emergency_response_rating, cardiac_specialist, pediatric_qualified, surgery_qualified, trauma_experience_level')
        .in('id', requestData.doctor_ids)
    ]);

    if (patientsResult.error) {
      console.error('Error fetching patients:', patientsResult.error);
      throw new Error(`Failed to fetch patient data: ${patientsResult.error.message}`);
    }

    if (doctorsResult.error) {
      console.error('Error fetching doctors:', doctorsResult.error);
      throw new Error(`Failed to fetch doctor data: ${doctorsResult.error.message}`);
    }

    const patients = patientsResult.data || [];
    const doctors = doctorsResult.data || [];
    
    console.log(`Fetched ${patients.length} patients and ${doctors.length} doctors`);

    // Try AI service first, fall back to local algorithm
    let matches;
    
    try {
      const authToken = Deno.env.get('GOOGLE_CLOUD_TOKEN');
      
      if (!authToken) {
        console.log('No Google Cloud token, using local matching');
        throw new Error('Google Cloud token not configured');
      }

      console.log('Making request to Vertex AI endpoint...');
      const aiPayload = {
        patients: patients.map(p => ({
          id: p.id,
          name: p.name,
          age: p.age,
          chief_complaint: p.chief_complaint,
          severity_score: p.severity_score,
          triage_level: p.triage_level,
          requires_immediate_attention: p.requires_immediate_attention,
          requires_specialist: p.requires_specialist,
          requires_cardiac_specialist: p.requires_cardiac_specialist,
          requires_pediatric_care: p.requires_pediatric_care,
          requires_trauma_specialist: p.requires_trauma_specialist,
          requires_surgery: p.requires_surgery
        })),
        doctors: doctors.map(d => ({
          id: d.id,
          name: d.name,
          employee_id: d.employee_id,
          availability_status: d.availability_status,
          current_patient_load: d.current_patient_load,
          max_patient_capacity: d.max_patient_capacity,
          years_experience: d.years_experience,
          emergency_response_rating: d.emergency_response_rating,
          cardiac_specialist: d.cardiac_specialist,
          pediatric_qualified: d.pediatric_qualified,
          surgery_qualified: d.surgery_qualified,
          trauma_experience_level: d.trauma_experience_level
        }))
      };

      const response = await fetch('https://8876697120128630784.us-central1-223266628372.prediction.vertexai.goog/v1/projects/223266628372/locations/us-central1/endpoints/8876697120128630784/match_doctors', {
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
      matches = aiResult.matches || aiResult;
      console.log('AI matching successful');
      
    } catch (aiError) {
      console.log('AI service failed, using local matching:', aiError.message);
      matches = matchDoctorsLocally(patients, doctors);
    }

    return new Response(JSON.stringify({
      matches: matches,
      total_matches: matches?.length || 0,
      matching_method: matches?.length ? 'ai_with_fallback' : 'local'
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
    
  } catch (error) {
    console.error('Error in match-doctors function:', error);
    
    return new Response(JSON.stringify({
      error: error.message,
      status: 'error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
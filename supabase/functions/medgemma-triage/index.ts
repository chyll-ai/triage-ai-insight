import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('MedGemma Triage function called:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Reading request body...');
    const { patientInfo, vitals, notes, image } = await req.json();
    console.log('Request data received:', { 
      hasPatientInfo: !!patientInfo, 
      hasVitals: !!vitals, 
      hasNotes: !!notes, 
      hasImage: !!image 
    });

    // Get the Google Cloud token from environment variables
    const authToken = Deno.env.get('GOOGLE_CLOUD_TOKEN');
    console.log('Auth token check:', { hasToken: !!authToken, tokenLength: authToken?.length || 0 });
    
    if (!authToken) {
      console.error('Google Cloud token not configured');
      throw new Error('Google Cloud token not configured');
    }

    const patientData = `
Patient Information:
- Name: ${patientInfo?.fullName || 'N/A'}
- Age: ${patientInfo?.age || 'N/A'}
- Sex: ${patientInfo?.sex || 'N/A'}
- Chief Complaint: ${patientInfo?.chiefComplaint || 'N/A'}

Vital Signs:
- Heart Rate: ${vitals?.heartRate || 'N/A'} bpm
- Blood Pressure: ${vitals?.bloodPressure || 'N/A'}
- Oxygen Saturation: ${vitals?.oxygenSaturation || 'N/A'}%
- Temperature: ${vitals?.temperature || 'N/A'}°C
- GCS: ${vitals?.gcs || 'N/A'}

Clinical Notes: ${notes || 'N/A'}
${image ? 'Medical image provided for analysis.' : 'No medical image provided.'}
    `.trim();

    console.log('Patient data prepared, length:', patientData.length);

    const request = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You are an expert ER triage assistant. Analyze the following patient data and return a JSON response with the exact format:
{
  "summary": "Concise clinical summary of the findings",
  "urgency_level": "low | moderate | high | critical",
  "red_flags": ["list of any critical findings or signs"],
  "recommended_actions": ["list of next steps such as 'admit to ER', 'monitor vitals', 'request blood culture'"]
}

Patient Data:
${patientData}

Rules:
- If signs of infection + fever + low oxygen → suggest sepsis evaluation
- If burns cover large area or involve blisters/necrosis → flag as critical
- If GCS < 13 or active bleeding → flag as high or critical
- If stable vitals + superficial lesion → flag as low

Return only valid JSON:`
            }
          ]
        }
      ],
      generationConfig: {
        maxOutputTokens: 500,
        temperature: 0.1
      }
    };

    console.log('Making request to Vertex AI...');
    console.log('Request payload:', JSON.stringify(request, null, 2));
    console.log('Auth token length:', authToken?.length);
    
    const response = await fetch('https://us-central1-aiplatform.googleapis.com/v1/projects/223266628372/locations/us-central1/publishers/google/models/gemini-2.0-flash-001:generateContent', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    console.log('Vertex AI response status:', response.status);
    console.log('Vertex AI response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Vertex AI error:', response.status, errorText);
      throw new Error(`Vertex AI request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    console.log('Parsing Vertex AI response...');
    const data = await response.json();
    console.log('Full Vertex AI response:', JSON.stringify(data, null, 2));
    
    // Check if we have the expected structure
    if (!data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
      console.error('Unexpected response structure - no candidates array:', data);
      throw new Error('Vertex AI returned unexpected response structure');
    }
    
    const candidate = data.candidates[0];
    console.log('First candidate:', JSON.stringify(candidate, null, 2));
    
    if (!candidate.content || !candidate.content.parts || !Array.isArray(candidate.content.parts) || candidate.content.parts.length === 0) {
      console.error('No content parts in candidate:', candidate);
      throw new Error('Vertex AI returned no content parts');
    }
    
    // Extract the response text and parse the JSON
    const responseText = candidate.content.parts[0]?.text;
    console.log('Extracted response text:', responseText);
    
    if (!responseText) {
      console.error('No text found in content parts:', candidate.content.parts);
      throw new Error('No response text from Vertex AI');
    }

    // Try to parse the JSON response
    try {
      console.log('Attempting to parse JSON response...');
      const parsed = JSON.parse(responseText);
      console.log('Successfully parsed JSON:', parsed);
      
      const result = {
        summary: parsed.summary || 'No summary provided',
        urgency_level: parsed.urgency_level || 'low',
        red_flags: parsed.red_flags || [],
        recommended_actions: parsed.recommended_actions || []
      };

      console.log('Returning result:', result);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Response text:', responseText);
      
      // Return a fallback response instead of throwing an error
      const fallbackResult = {
        summary: 'Unable to parse AI response. Raw response: ' + responseText.substring(0, 200),
        urgency_level: 'low',
        red_flags: ['Unable to parse AI response'],
        recommended_actions: ['Manual review required', 'Retry analysis']
      };
      
      return new Response(JSON.stringify(fallbackResult), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in medgemma-triage function:', error);
    
    const errorResult = {
      summary: 'Error occurred during analysis: ' + error.message,
      urgency_level: 'low',
      red_flags: ['System error: ' + error.message],
      recommended_actions: ['Retry analysis', 'Contact support if error persists']
    };
    
    return new Response(JSON.stringify(errorResult), {
      status: 200, // Return 200 to avoid client-side errors
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
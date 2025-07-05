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
      instances: [
        {
          "@requestFormat": "chatCompletions",
          messages: [
            {
              role: "system",
              content: [
                {
                  type: "text",
                  text: "🧠 System Prompt: ER Triage Assistant (MedGemma)\nYou are the AI backend for a hospital emergency room (ER) triage assistant.\nYou receive patient data including clinical notes, vital signs, and medical images (such as wounds, rashes, burns, or trauma).\nYou must analyze this information and return clear, medically relevant insights to help ER staff prioritize care.\n\nYour task is to generate a clinical triage summary for each case based on urgency, severity, and need for medical resources.\n\n🩺 You are expected to:\nSummarize the patient condition clearly and concisely.\n\nEstimate urgency level (low, moderate, high, or critical) based on symptoms, image findings, and vitals.\n\nIdentify clinical red flags, such as signs of sepsis, deep tissue damage, severe bleeding, or airway risk.\n\nRecommend appropriate actions (e.g., monitor, admit, escalate, isolate, order labs).\n\nRemain neutral and factual; avoid speculation or informal tone.\n\n🔍 Input Types:\nText notes: Clinical descriptions, chief complaint, medical history\n\nVitals: Heart rate, temperature, oxygen saturation, blood pressure, GCS\n\nImage (optional): A wound, lesion, burn, rash, or trauma image\n\n🧾 Output Format:\nReturn a structured JSON response with the following fields:\n\n{\n  \"summary\": \"Concise clinical summary of the findings\",\n  \"urgency_level\": \"low | moderate | high | critical\",\n  \"red_flags\": [\"list of any critical findings or signs\"],\n  \"recommended_actions\": [\"list of next steps such as 'admit to ER', 'monitor vitals', 'request blood culture'\"]\n}\n\n⚠️ Special Handling Rules:\nIf signs of infection + fever + low oxygen → suggest sepsis evaluation.\n\nIf burns cover large area or involve blisters/necrosis → flag as critical.\n\nIf GCS < 13 or active bleeding → flag as high or critical.\n\nIf stable vitals + superficial lesion → flag as low."
                }
              ]
            },
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: patientData
                }
              ]
            }
          ],
          max_tokens: 500
        }
      ]
    };

    console.log('Making request to Vertex AI...');
    const response = await fetch('https://8876697120128630784.us-central1-223266628372.prediction.vertexai.goog/v1/projects/223266628372/locations/us-central1/endpoints/8876697120128630784:predict', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    console.log('Vertex AI response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Vertex AI error:', response.status, errorText);
      throw new Error(`Vertex AI request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    console.log('Parsing Vertex AI response...');
    const data = await response.json();
    console.log('Full Vertex AI response:', JSON.stringify(data, null, 2));
    
    // Check if we have the expected structure
    if (!data.predictions || !Array.isArray(data.predictions) || data.predictions.length === 0) {
      console.error('Unexpected response structure - no predictions array:', data);
      throw new Error('Vertex AI returned unexpected response structure');
    }
    
    const prediction = data.predictions[0];
    console.log('First prediction:', JSON.stringify(prediction, null, 2));
    
    if (!prediction.candidates || !Array.isArray(prediction.candidates) || prediction.candidates.length === 0) {
      console.error('No candidates in prediction:', prediction);
      throw new Error('Vertex AI returned no candidates');
    }
    
    const candidate = prediction.candidates[0];
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
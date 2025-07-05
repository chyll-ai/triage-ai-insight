import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { patientInfo, vitals, notes, image } = await req.json();

    // Get the Google Cloud token from environment variables
    const authToken = Deno.env.get('GOOGLE_CLOUD_TOKEN');
    if (!authToken) {
      throw new Error('Google Cloud token not configured');
    }

    const patientData = `
Patient Information:
- Name: ${patientInfo.fullName}
- Age: ${patientInfo.age}
- Sex: ${patientInfo.sex}
- Chief Complaint: ${patientInfo.chiefComplaint}

Vital Signs:
- Heart Rate: ${vitals.heartRate} bpm
- Blood Pressure: ${vitals.bloodPressure}
- Oxygen Saturation: ${vitals.oxygenSaturation}%
- Temperature: ${vitals.temperature}°C
- GCS: ${vitals.gcs}

Clinical Notes: ${notes}
${image ? 'Medical image provided for analysis.' : 'No medical image provided.'}
    `.trim();

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

    const response = await fetch('https://8876697120128630784.us-central1-223266628372.prediction.vertexai.goog/v1/projects/223266628372/locations/us-central1/endpoints/8876697120128630784:predict', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Vertex AI error:', response.status, errorText);
      throw new Error(`Vertex AI request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Extract the response text and parse the JSON
    const responseText = data.predictions[0]?.candidates[0]?.content?.parts[0]?.text;
    if (!responseText) {
      throw new Error('No response from Vertex AI');
    }

    // Try to parse the JSON response
    try {
      const parsed = JSON.parse(responseText);
      const result = {
        summary: parsed.summary || 'No summary provided',
        urgency_level: parsed.urgency_level || 'low',
        red_flags: parsed.red_flags || [],
        recommended_actions: parsed.recommended_actions || []
      };

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Response text:', responseText);
      throw new Error('Failed to parse triage analysis response');
    }
  } catch (error) {
    console.error('Error in medgemma-triage function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      summary: 'Error occurred during analysis',
      urgency_level: 'low',
      red_flags: ['System error'],
      recommended_actions: ['Retry analysis or contact support']
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
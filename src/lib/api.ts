import { 
  RankPatientsRequest, 
  RankPatientsResponse, 
  MatchDoctorsRequest, 
  MatchDoctorsResponse,
  VertexAIRequest,
  VertexAIResponse,
  ApiError 
} from '@/types/triage';

// Base API configuration
const VERTEX_AI_URL = 'https://8748789832957820928.europe-west4-223266628372.prediction.vertexai.goog/v1/projects/223266628372/locations/europe-west4/endpoints/8748789832957820928:predict';
const AUTH_TOKEN = 'ya29.a0AS3H6NykV8XP7bw-SGl76ntV1gtHCXcuRBv3wwRymbo6v-wCRWxT7x9JIq2Q7HBJVozFFj6qKQDk0FQcERgRTJ8SI0Qchfvj0e-pyTOBG8mooYpUG-i-TXa_HbrtUZP6FN6wgJERIwFGV3xRnhC_XfdFfU71-WmJcHSGeTK7pksW2AaCgYKASASARYSFQHGX2Miy2_dAAGqWQiyog37J0FFUg0181';

// Backend API endpoints
const BACKEND_BASE_URL = 'https://8748789832957820928.europe-west4-223266628372.prediction.vertexai.goog/v1/projects/223266628372/locations/europe-west4/endpoints/8748789832957820928';

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

// Vertex AI endpoint for triage analysis
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

  const request: VertexAIRequest = {
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

  try {
    const response = await fetch(VERTEX_AI_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Vertex AI request failed: ${response.status} ${response.statusText}`);
    }

    const data: VertexAIResponse = await response.json();
    
    // Extract the response text and parse the JSON
    const responseText = data.predictions[0]?.candidates[0]?.content?.parts[0]?.text;
    if (!responseText) {
      throw new Error('No response from Vertex AI');
    }

    // Try to parse the JSON response
    try {
      const parsed = JSON.parse(responseText);
      return {
        summary: parsed.summary || 'No summary provided',
        urgency_level: parsed.urgency_level || 'low',
        red_flags: parsed.red_flags || [],
        recommended_actions: parsed.recommended_actions || []
      };
    } catch (parseError) {
      throw new Error('Failed to parse triage analysis response');
    }
  } catch (error) {
    console.error('Vertex AI triage analysis error:', error);
    throw new Error(`Triage analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

// Vertex AI endpoint for mortality prediction
export async function predictMortality(patientDescription: string): Promise<number> {
  const request: VertexAIRequest = {
    instances: [
      {
        "@requestFormat": "chatCompletions",
        messages: [
          {
            role: "system",
            content: [
              {
                type: "text",
                text: "You are an expert system that analyzes patient data to predict ICU mortality risk. Return a JSON response with the percentage of the patient dying. You must respond in exact schema as in the example: {'pourcentage': 75}"
              }
            ]
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Here is the description of the patient:\n${patientDescription}`
              }
            ]
          }
        ],
        max_tokens: 200
      }
    ]
  };

  try {
    const response = await fetch(VERTEX_AI_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${AUTH_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Vertex AI request failed: ${response.status} ${response.statusText}`);
    }

    const data: VertexAIResponse = await response.json();
    
    // Extract the response text and parse the JSON
    const responseText = data.predictions[0]?.candidates[0]?.content?.parts[0]?.text;
    if (!responseText) {
      throw new Error('No response from Vertex AI');
    }

    // Try to parse the JSON response
    try {
      const parsed = JSON.parse(responseText);
      return parsed.pourcentage || 0;
    } catch (parseError) {
      // If JSON parsing fails, try to extract percentage from text
      const percentageMatch = responseText.match(/(\d+)/);
      return percentageMatch ? parseInt(percentageMatch[1]) : 0;
    }
  } catch (error) {
    console.error('Vertex AI prediction error:', error);
    throw new Error(`Mortality prediction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
} 
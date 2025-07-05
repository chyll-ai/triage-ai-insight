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
                text: "You are an expert system that tell the pourcentage of dying of people at ICU. Return me a json formated response with the pourcentage of the patient dying. You have to respond in exact schema as in the example below E.g : {'pourcentage': 75}"
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
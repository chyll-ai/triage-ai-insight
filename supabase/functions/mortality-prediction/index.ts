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
    const { patientDescription } = await req.json();

    // Get the Google Cloud token from environment variables
    const authToken = Deno.env.get('GOOGLE_CLOUD_TOKEN');
    if (!authToken) {
      throw new Error('Google Cloud token not configured');
    }

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
      const percentage = parsed.pourcentage || 0;
      
      return new Response(JSON.stringify({ percentage }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      // If JSON parsing fails, try to extract percentage from text
      const percentageMatch = responseText.match(/(\d+)/);
      const percentage = percentageMatch ? parseInt(percentageMatch[1]) : 0;
      
      return new Response(JSON.stringify({ percentage }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in mortality-prediction function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      percentage: 0
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
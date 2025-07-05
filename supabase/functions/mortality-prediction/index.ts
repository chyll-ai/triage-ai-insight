import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  console.log('Mortality prediction function called:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Reading request body...');
    const { patientDescription } = await req.json();
    console.log('Patient description received, length:', patientDescription?.length || 0);

    // Get the Google Cloud token from environment variables
    const authToken = Deno.env.get('GOOGLE_CLOUD_TOKEN');
    console.log('Auth token check:', { hasToken: !!authToken, tokenLength: authToken?.length || 0 });
    
    if (!authToken) {
      console.error('Google Cloud token not configured');
      throw new Error('Google Cloud token not configured');
    }

    if (!patientDescription) {
      console.error('No patient description provided');
      throw new Error('Patient description is required');
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

    console.log('Making request to Vertex AI...');
    console.log('Request payload:', JSON.stringify(request, null, 2));
    console.log('Auth token length:', authToken?.length);
    
    const response = await fetch('https://8876697120128630784.us-central1-223266628372.prediction.vertexai.goog/v1/projects/223266628372/locations/us-central1/endpoints/8876697120128630784:predict', {
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
      
      const percentage = parsed.pourcentage || 0;
      console.log('Extracted percentage:', percentage);
      
      return new Response(JSON.stringify({ percentage }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    } catch (parseError) {
      console.error('JSON parse error:', parseError, 'Response text:', responseText);
      
      // If JSON parsing fails, try to extract percentage from text
      const percentageMatch = responseText.match(/(\d+)/);
      const percentage = percentageMatch ? parseInt(percentageMatch[1]) : 0;
      console.log('Extracted percentage from regex:', percentage);
      
      return new Response(JSON.stringify({ percentage }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
  } catch (error) {
    console.error('Error in mortality-prediction function:', error);
    
    // Return a default response instead of throwing an error
    return new Response(JSON.stringify({ 
      percentage: 0,
      error: error.message
    }), {
      status: 200, // Return 200 to avoid client-side errors
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
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

    // No authentication required for the new MedGemma endpoints

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
        maxOutputTokens: 1000,
        temperature: 0.1,
        responseMimeType: "application/json"
      }
    };

    console.log('Making request to MedGemma 27B endpoint...');
    console.log('Request payload:', JSON.stringify(request, null, 2));
    
    const response = await fetch('https://call-vertex-ai-ii7brcvvyq-ez.a.run.app/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    console.log('MedGemma 27B response status:', response.status);
    console.log('MedGemma 27B response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('MedGemma 27B error:', response.status, errorText);
      throw new Error(`MedGemma 27B request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    console.log('Parsing MedGemma 27B response...');
    const data = await response.json();
    console.log('Full MedGemma 27B response:', JSON.stringify(data, null, 2));
    
    // Check if we have the expected structure
    if (!data.candidates || !Array.isArray(data.candidates) || data.candidates.length === 0) {
      console.error('Unexpected response structure - no candidates array:', data);
      throw new Error('MedGemma 27B returned unexpected response structure');
    }
    
    const candidate = data.candidates[0];
    console.log('First candidate:', JSON.stringify(candidate, null, 2));
    
    if (!candidate.content || !candidate.content.parts || !Array.isArray(candidate.content.parts) || candidate.content.parts.length === 0) {
      console.error('No content parts in candidate:', candidate);
      throw new Error('MedGemma 27B returned no content parts');
    }
    
    // Extract the response text and parse the JSON
    const responseText = candidate.content.parts[0]?.text;
    console.log('Extracted response text:', responseText);
    
    if (!responseText) {
      console.error('No text found in content parts:', candidate.content.parts);
      throw new Error('No response text from MedGemma 27B');
    }

    // Try to parse the JSON response
    try {
      console.log('Attempting to parse JSON response...');
      
      // Clean up the response text if it's truncated
      let cleanResponseText = responseText.trim();
      
      // If response doesn't end with }, try to fix common truncation issues
      if (!cleanResponseText.endsWith('}')) {
        console.log('Response appears truncated, attempting to fix...');
        
        // Find the last complete field and close the JSON
        const lastCompleteField = cleanResponseText.lastIndexOf('"');
        if (lastCompleteField > -1) {
          cleanResponseText = cleanResponseText.substring(0, lastCompleteField + 1);
          if (!cleanResponseText.endsWith('}')) {
            cleanResponseText += '}';
          }
        }
      }
      
      console.log('Cleaned response text:', cleanResponseText);
      const parsed = JSON.parse(cleanResponseText);
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
      
      // Extract basic info from the truncated response
      const summaryMatch = responseText.match(/"summary":\s*"([^"]+)/);
      const urgencyMatch = responseText.match(/"urgency_level":\s*"([^"]+)/);
      
      const fallbackResult = {
        summary: summaryMatch ? summaryMatch[1] : 'Unable to parse complete AI response',
        urgency_level: urgencyMatch ? urgencyMatch[1] : 'low',
        red_flags: ['Response was truncated - manual review required'],
        recommended_actions: ['Manual review required', 'Retry analysis with more specific information']
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
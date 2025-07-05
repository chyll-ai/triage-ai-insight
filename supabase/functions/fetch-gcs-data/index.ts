import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GCS_BASE_URL = 'https://storage.googleapis.com/josianne-asset-bucket';

serve(async (req) => {
  console.log('Fetch GCS data function called:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Reading request body...');
    const { dataType } = await req.json();
    console.log('Data type requested:', dataType);

    let url: string;
    
    switch (dataType) {
      case 'patients':
        url = `${GCS_BASE_URL}/patients/patients.json`;
        break;
      case 'doctors':
        url = `${GCS_BASE_URL}/Doctors/doctors.json`;
        break;
      default:
        throw new Error('Invalid data type. Use "patients" or "doctors"');
    }

    console.log('Making request to GCS:', url);
    const response = await fetch(url);

    console.log('GCS response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('GCS error:', response.status, errorText);
      throw new Error(`GCS request failed: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    console.log('GCS response data length:', Array.isArray(data) ? data.length : 'not array');

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in fetch-gcs-data function:', error);
    
    return new Response(JSON.stringify({
      error: error.message,
      status: 'error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
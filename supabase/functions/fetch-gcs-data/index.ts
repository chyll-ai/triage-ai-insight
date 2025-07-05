import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GCS_BASE_URL = 'https://storage.googleapis.com/josianne-asset-bucket';

// Helper function to fetch multiple individual files
async function fetchMultipleFiles(baseUrl: string, filePattern: string, maxFiles: number = 50): Promise<any[]> {
  console.log(`Fetching multiple files with pattern: ${filePattern}`);
  const results: any[] = [];
  const fetchPromises: Promise<void>[] = [];
  
  for (let i = 1; i <= maxFiles; i++) {
    const paddedIndex = i.toString().padStart(3, '0');
    const fileName = filePattern.replace('{index}', paddedIndex);
    const url = `${baseUrl}/${fileName}`;
    
    const fetchPromise = fetch(url)
      .then(async (response) => {
        if (response.ok) {
          const data = await response.json();
          results.push(data);
          console.log(`Successfully fetched: ${fileName}`);
        } else if (response.status === 404) {
          // File doesn't exist, which is expected when we reach the end
          console.log(`File not found (expected): ${fileName}`);
        } else {
          console.warn(`Unexpected error for ${fileName}: ${response.status}`);
        }
      })
      .catch((error) => {
        console.log(`Network error for ${fileName}:`, error.message);
      });
    
    fetchPromises.push(fetchPromise);
  }
  
  // Wait for all requests to complete
  await Promise.all(fetchPromises);
  
  console.log(`Fetched ${results.length} files successfully`);
  return results;
}

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

    let data: any[] = [];
    
    switch (dataType) {
      case 'patients':
        // Try different naming patterns for patients
        console.log('Fetching patient files...');
        data = await fetchMultipleFiles(`${GCS_BASE_URL}/patients`, 'patient_{index}.json', 100);
        
        // If no files found with first pattern, try alternative patterns
        if (data.length === 0) {
          console.log('Trying alternative patient file pattern...');
          data = await fetchMultipleFiles(`${GCS_BASE_URL}/patients`, 'Patient_{index}.json', 100);
        }
        if (data.length === 0) {
          console.log('Trying another patient file pattern...');
          data = await fetchMultipleFiles(`${GCS_BASE_URL}/patients`, 'p_{index}.json', 100);
        }
        break;
        
      case 'doctors':
        // Try different naming patterns for doctors
        console.log('Fetching doctor files...');
        data = await fetchMultipleFiles(`${GCS_BASE_URL}/Doctors`, 'doctor_{index}.json', 50);
        
        // If no files found with first pattern, try alternative patterns
        if (data.length === 0) {
          console.log('Trying alternative doctor file pattern...');
          data = await fetchMultipleFiles(`${GCS_BASE_URL}/Doctors`, 'Doctor_{index}.json', 50);
        }
        if (data.length === 0) {
          console.log('Trying another doctor file pattern...');
          data = await fetchMultipleFiles(`${GCS_BASE_URL}/Doctors`, 'd_{index}.json', 50);
        }
        break;
        
      default:
        throw new Error('Invalid data type. Use "patients" or "doctors"');
    }

    console.log(`Final data array length: ${data.length}`);
    
    if (data.length === 0) {
      console.warn(`No ${dataType} files found. Check file naming patterns.`);
      return new Response(JSON.stringify({
        error: `No ${dataType} files found. Please check the file naming pattern in GCS.`,
        status: 'warning',
        data: []
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

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
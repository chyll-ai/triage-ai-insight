import { supabase } from "@/integrations/supabase/client";

interface GCSPatient {
  id: string;
  name: string;
  age: number;
  condition: string;
  severity?: number;
  medicalHistory?: string[];
  vitals?: {
    heartRate?: number;
    bloodPressure?: string;
    temperature?: number;
    oxygenSaturation?: number;
  };
  imageIds?: string[];
}

interface GCSDoctor {
  id: string;
  name: string;
  specialty: string;
  availability?: boolean;
  experience?: number;
}

const GCS_BASE_URL = 'https://storage.googleapis.com/josianne-asset-bucket';

export async function fetchPatientsFromGCS(): Promise<GCSPatient[]> {
  try {
    const { data, error } = await supabase.functions.invoke('fetch-gcs-data', {
      body: { dataType: 'patients' }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Failed to fetch patients: ${error.message}`);
    }

    // Handle the new response format
    if (data && typeof data === 'object' && data.status === 'warning') {
      console.warn('Warning from GCS function:', data.error);
      return data.data || [];
    }
    
    return Array.isArray(data) ? data : (data ? [data] : []);
  } catch (error) {
    console.error('Error fetching patients from GCS:', error);
    throw error;
  }
}

export async function fetchDoctorsFromGCS(): Promise<GCSDoctor[]> {
  try {
    const { data, error } = await supabase.functions.invoke('fetch-gcs-data', {
      body: { dataType: 'doctors' }
    });

    if (error) {
      console.error('Supabase function error:', error);
      throw new Error(`Failed to fetch doctors: ${error.message}`);
    }

    // Handle the new response format
    if (data && typeof data === 'object' && data.status === 'warning') {
      console.warn('Warning from GCS function:', data.error);
      return data.data || [];
    }
    
    return Array.isArray(data) ? data : (data ? [data] : []);
  } catch (error) {
    console.error('Error fetching doctors from GCS:', error);
    throw error;
  }
}

export function getTraumaImageUrl(imageId: string): string {
  return `${GCS_BASE_URL}/Trauma%20Images/${imageId}`;
}

export async function fetchAvailableImages(): Promise<string[]> {
  try {
    // This would typically require the GCS API to list objects
    // For now, return some common image IDs that might exist
    const commonImageIds = [
      'trauma_001.jpg',
      'trauma_002.jpg', 
      'trauma_003.jpg',
      'xray_001.jpg',
      'xray_002.jpg'
    ];
    
    return commonImageIds;
  } catch (error) {
    console.error('Error fetching available images:', error);
    return [];
  }
}
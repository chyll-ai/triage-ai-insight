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
    // For now, we'll try to fetch a common file structure
    // This will need to be adjusted based on your actual file naming
    const response = await fetch(`${GCS_BASE_URL}/patients/patients.json`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch patients: ${response.statusText}`);
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [data];
  } catch (error) {
    console.error('Error fetching patients from GCS:', error);
    throw error;
  }
}

export async function fetchDoctorsFromGCS(): Promise<GCSDoctor[]> {
  try {
    const response = await fetch(`${GCS_BASE_URL}/Doctors/doctors.json`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch doctors: ${response.statusText}`);
    }
    
    const data = await response.json();
    return Array.isArray(data) ? data : [data];
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
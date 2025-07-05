export interface PatientInfo {
  fullName: string;
  age: number;
  sex: 'Male' | 'Female' | 'Other';
  chiefComplaint: string;
}

export interface Vitals {
  heartRate: number;
  bloodPressure: string;
  oxygenSaturation: number;
  temperature: number;
  gcs: number;
}

export interface TriageRequest {
  image: string; // base64 encoded
  notes: string;
  vitals: Vitals;
  patient: PatientInfo;
}

export interface TriageResponse {
  summary: string;
  urgencyLevel: 'High' | 'Medium' | 'Low';
  suggestedActions: string[];
}

export interface ApiError {
  message: string;
  details?: string;
}
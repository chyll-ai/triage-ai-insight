// Pre-filled patient data from DMP/medical records system
export interface PrefilledPatientData {
  // Demographics (read-only from DMP)
  fullName: string;
  age: number;
  sex: 'Male' | 'Female' | 'Other';
  patientId: string;
  address?: string;
  phone?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  
  // Medical history (read-only from DMP)
  medicalHistory: string[];
  currentMedications: string[];
  knownAllergies: string[];
  chronicConditions: string[];
  previousDiagnoses: string[];
  lastVisitDate?: string;
  insuranceInfo?: {
    provider: string;
    number: string;
  };
}

// Current visit data (editable by clinician)
export interface CurrentVisitData {
  chiefComplaint: string;
  currentSymptoms: string;
  clinicalNotes: string;
  onsetDate: string;
  symptomDuration: string;
}

// Combined patient info for triage
export interface PatientInfo extends PrefilledPatientData, CurrentVisitData {}

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

// New interfaces for ranking and doctor matching
export interface RankPatientsRequest {
  patient_ids: string[];
}

export interface RankedPatient {
  patient_id: string;
  rank: number;
}

export interface RankPatientsResponse {
  status: string;
  ranked: RankedPatient[];
}

export interface MatchDoctorsRequest {
  patient_ids: string[];
  doctor_ids: string[];
}

export interface DoctorMatch {
  patient_id: string;
  doctor_id: string;
  justification: string;
  score: number;
}

export interface MatchDoctorsResponse {
  status: string;
  matches: DoctorMatch[];
}

// Vertex AI endpoint interfaces
export interface VertexAIRequest {
  instances: Array<{
    "@requestFormat": string;
    messages: Array<{
      role: string;
      content: Array<{
        type: string;
        text: string;
      }>;
    }>;
    max_tokens: number;
  }>;
}

export interface VertexAIResponse {
  predictions: Array<{
    candidates: Array<{
      content: {
        parts: Array<{
          text: string;
        }>;
      };
    }>;
  }>;
}
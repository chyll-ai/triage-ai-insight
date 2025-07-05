// Database types for the new Supabase tables

export interface MedicalSpecialty {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface Doctor {
  id: string;
  employee_id: string;
  name: string;
  email?: string;
  phone?: string;
  primary_specialty_id?: string;
  secondary_specialties?: string[];
  years_experience: number;
  certifications?: string[];
  languages_spoken?: string[];
  availability_status: 'available' | 'busy' | 'off-duty' | 'on-call';
  current_patient_load: number;
  max_patient_capacity: number;
  shift_start_time?: string;
  shift_end_time?: string;
  emergency_response_rating?: number;
  patient_satisfaction_score?: number;
  average_case_duration_minutes?: number;
  trauma_experience_level: number;
  pediatric_qualified: boolean;
  cardiac_specialist: boolean;
  surgery_qualified: boolean;
  created_at: string;
  updated_at: string;
  // Joined data
  primary_specialty?: MedicalSpecialty;
}

export interface Patient {
  id: string;
  patient_id: string;
  name: string;
  age: number;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  phone?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  
  // Medical condition details
  chief_complaint: string;
  diagnosis_codes?: string[];
  condition_category?: 'cardiac' | 'respiratory' | 'trauma' | 'neurological' | 'pediatric' | 'surgical' | 'psychiatric' | 'infectious' | 'other';
  severity_score: number;
  triage_level: number;
  
  // Vital signs
  heart_rate?: number;
  blood_pressure_systolic?: number;
  blood_pressure_diastolic?: number;
  temperature_celsius?: number;
  oxygen_saturation?: number;
  glasgow_coma_scale?: number;
  
  // Medical history and risk factors
  medical_history?: string[];
  current_medications?: string[];
  allergies?: string[];
  chronic_conditions?: string[];
  previous_surgeries?: string[];
  
  // Emergency specifics
  arrival_time: string;
  symptoms_duration_hours?: number;
  pain_level?: number;
  requires_immediate_attention: boolean;
  requires_specialist: boolean;
  preferred_language: string;
  
  // Location and status
  room_assignment?: string;
  bed_number?: string;
  admission_status: 'waiting' | 'in-treatment' | 'under-observation' | 'discharged' | 'transferred';
  
  // Matching optimization fields
  complexity_score: number;
  estimated_treatment_duration_minutes?: number;
  requires_trauma_specialist: boolean;
  requires_pediatric_care: boolean;
  requires_cardiac_specialist: boolean;
  requires_surgery: boolean;
  
  created_at: string;
  updated_at: string;
}

export interface PatientAssignment {
  id: string;
  patient_id: string;
  doctor_id: string;
  assigned_at: string;
  completed_at?: string;
  assignment_reason?: string;
  matching_score?: number;
  treatment_outcome?: 'successful' | 'transferred' | 'referred' | 'ongoing' | 'complicated';
  duration_minutes?: number;
  patient_satisfaction?: number;
  created_at: string;
  // Joined data
  patient?: Patient;
  doctor?: Doctor;
}

export interface MatchingCriteriaWeight {
  id: string;
  criteria_name: string;
  weight_value: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
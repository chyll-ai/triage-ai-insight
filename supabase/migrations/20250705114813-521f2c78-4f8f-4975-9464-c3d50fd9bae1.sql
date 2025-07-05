-- Create medical specialties lookup table
CREATE TABLE public.medical_specialties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create doctors table with comprehensive fields for matching optimization
CREATE TABLE public.doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  primary_specialty_id UUID REFERENCES public.medical_specialties(id),
  secondary_specialties TEXT[], -- Array of specialty names
  years_experience INTEGER NOT NULL DEFAULT 0,
  certifications TEXT[],
  languages_spoken TEXT[] DEFAULT ARRAY['English'],
  availability_status TEXT CHECK (availability_status IN ('available', 'busy', 'off-duty', 'on-call')) DEFAULT 'available',
  current_patient_load INTEGER DEFAULT 0,
  max_patient_capacity INTEGER DEFAULT 8,
  shift_start_time TIME,
  shift_end_time TIME,
  emergency_response_rating DECIMAL(3,2) CHECK (emergency_response_rating >= 0 AND emergency_response_rating <= 5.0),
  patient_satisfaction_score DECIMAL(3,2) CHECK (patient_satisfaction_score >= 0 AND patient_satisfaction_score <= 5.0),
  average_case_duration_minutes INTEGER,
  trauma_experience_level INTEGER CHECK (trauma_experience_level >= 1 AND trauma_experience_level <= 5) DEFAULT 3,
  pediatric_qualified BOOLEAN DEFAULT false,
  cardiac_specialist BOOLEAN DEFAULT false,
  surgery_qualified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create patients table with comprehensive fields for matching optimization  
CREATE TABLE public.patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 0 AND age <= 150),
  gender TEXT CHECK (gender IN ('Male', 'Female', 'Other', 'Prefer not to say')),
  phone TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  
  -- Medical condition details
  chief_complaint TEXT NOT NULL,
  diagnosis_codes TEXT[],
  condition_category TEXT CHECK (condition_category IN ('cardiac', 'respiratory', 'trauma', 'neurological', 'pediatric', 'surgical', 'psychiatric', 'infectious', 'other')),
  severity_score INTEGER CHECK (severity_score >= 1 AND severity_score <= 10) NOT NULL,
  triage_level INTEGER CHECK (triage_level >= 1 AND triage_level <= 5) NOT NULL,
  
  -- Vital signs
  heart_rate INTEGER CHECK (heart_rate > 0 AND heart_rate < 300),
  blood_pressure_systolic INTEGER CHECK (blood_pressure_systolic > 0 AND blood_pressure_systolic < 300),
  blood_pressure_diastolic INTEGER CHECK (blood_pressure_diastolic > 0 AND blood_pressure_diastolic < 200),
  temperature_celsius DECIMAL(4,2) CHECK (temperature_celsius > 30 AND temperature_celsius < 50),
  oxygen_saturation INTEGER CHECK (oxygen_saturation >= 50 AND oxygen_saturation <= 100),
  glasgow_coma_scale INTEGER CHECK (glasgow_coma_scale >= 3 AND glasgow_coma_scale <= 15),
  
  -- Medical history and risk factors
  medical_history TEXT[],
  current_medications TEXT[],
  allergies TEXT[],
  chronic_conditions TEXT[],
  previous_surgeries TEXT[],
  
  -- Emergency specifics
  arrival_time TIMESTAMPTZ NOT NULL DEFAULT now(),
  symptoms_duration_hours INTEGER,
  pain_level INTEGER CHECK (pain_level >= 0 AND pain_level <= 10),
  requires_immediate_attention BOOLEAN DEFAULT false,
  requires_specialist BOOLEAN DEFAULT false,
  preferred_language TEXT DEFAULT 'English',
  
  -- Location and status
  room_assignment TEXT,
  bed_number TEXT,
  admission_status TEXT CHECK (admission_status IN ('waiting', 'in-treatment', 'under-observation', 'discharged', 'transferred')) DEFAULT 'waiting',
  
  -- Matching optimization fields
  complexity_score INTEGER CHECK (complexity_score >= 1 AND complexity_score <= 10) DEFAULT 5,
  estimated_treatment_duration_minutes INTEGER,
  requires_trauma_specialist BOOLEAN DEFAULT false,
  requires_pediatric_care BOOLEAN DEFAULT false,
  requires_cardiac_specialist BOOLEAN DEFAULT false,
  requires_surgery BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create patient-doctor assignments table for tracking history
CREATE TABLE public.patient_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id UUID REFERENCES public.patients(id) ON DELETE CASCADE,
  doctor_id UUID REFERENCES public.doctors(id) ON DELETE CASCADE,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  assignment_reason TEXT,
  matching_score DECIMAL(5,2),
  treatment_outcome TEXT CHECK (treatment_outcome IN ('successful', 'transferred', 'referred', 'ongoing', 'complicated')),
  duration_minutes INTEGER,
  patient_satisfaction INTEGER CHECK (patient_satisfaction >= 1 AND patient_satisfaction <= 5),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create matching criteria weights configuration table
CREATE TABLE public.matching_criteria_weights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  criteria_name TEXT NOT NULL UNIQUE,
  weight_value DECIMAL(3,2) NOT NULL CHECK (weight_value >= 0 AND weight_value <= 1),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.medical_specialties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matching_criteria_weights ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (allowing public access for now, can be restricted later)
CREATE POLICY "Allow public access to medical_specialties" ON public.medical_specialties FOR ALL USING (true);
CREATE POLICY "Allow public access to doctors" ON public.doctors FOR ALL USING (true);
CREATE POLICY "Allow public access to patients" ON public.patients FOR ALL USING (true);
CREATE POLICY "Allow public access to patient_assignments" ON public.patient_assignments FOR ALL USING (true);
CREATE POLICY "Allow public access to matching_criteria_weights" ON public.matching_criteria_weights FOR ALL USING (true);

-- Create indexes for performance optimization
CREATE INDEX idx_doctors_primary_specialty ON public.doctors(primary_specialty_id);
CREATE INDEX idx_doctors_availability ON public.doctors(availability_status);
CREATE INDEX idx_doctors_patient_load ON public.doctors(current_patient_load);
CREATE INDEX idx_patients_triage_level ON public.patients(triage_level);
CREATE INDEX idx_patients_severity_score ON public.patients(severity_score);
CREATE INDEX idx_patients_condition_category ON public.patients(condition_category);
CREATE INDEX idx_patients_admission_status ON public.patients(admission_status);
CREATE INDEX idx_patient_assignments_patient_id ON public.patient_assignments(patient_id);
CREATE INDEX idx_patient_assignments_doctor_id ON public.patient_assignments(doctor_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_doctors_updated_at
    BEFORE UPDATE ON public.doctors
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patients_updated_at
    BEFORE UPDATE ON public.patients
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_matching_criteria_weights_updated_at
    BEFORE UPDATE ON public.matching_criteria_weights
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert medical specialties
INSERT INTO public.medical_specialties (name, description) VALUES
('Emergency Medicine', 'Acute care for emergency medical conditions'),
('Cardiology', 'Heart and cardiovascular system disorders'),
('Pediatrics', 'Medical care for infants, children, and adolescents'),
('Surgery', 'Surgical procedures and operative medicine'),
('Neurology', 'Nervous system disorders'),
('Orthopedics', 'Musculoskeletal system disorders'),
('Internal Medicine', 'General adult medicine and complex medical conditions'),
('Trauma Surgery', 'Emergency surgical care for trauma patients'),
('Anesthesiology', 'Perioperative care and pain management'),
('Radiology', 'Medical imaging and diagnostic procedures'),
('Psychiatry', 'Mental health and behavioral disorders'),
('Infectious Disease', 'Treatment of infectious diseases');

-- Insert default matching criteria weights
INSERT INTO public.matching_criteria_weights (criteria_name, weight_value, description) VALUES
('specialty_match', 0.30, 'How well doctor specialty matches patient condition'),
('availability', 0.25, 'Doctor current availability and workload'),
('experience', 0.20, 'Doctor years of experience and expertise level'),
('patient_severity', 0.15, 'Patient severity and urgency level'),
('geographic_proximity', 0.05, 'Physical proximity between doctor and patient'),
('language_match', 0.05, 'Language compatibility between doctor and patient');
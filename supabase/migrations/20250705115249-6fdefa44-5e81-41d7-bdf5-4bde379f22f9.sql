-- Insert comprehensive mock doctors data
WITH specialty_ids AS (
  SELECT id, name FROM public.medical_specialties
)
INSERT INTO public.doctors (
  employee_id, name, email, phone, primary_specialty_id, secondary_specialties, 
  years_experience, certifications, languages_spoken, availability_status, 
  current_patient_load, max_patient_capacity, shift_start_time, shift_end_time,
  emergency_response_rating, patient_satisfaction_score, average_case_duration_minutes,
  trauma_experience_level, pediatric_qualified, cardiac_specialist, surgery_qualified
) VALUES
-- Emergency Medicine Doctors
('DR001', 'Dr. Sarah Johnson', 'sarah.johnson@hospital.com', '555-0101', 
 (SELECT id FROM specialty_ids WHERE name = 'Emergency Medicine'), 
 ARRAY['Trauma Surgery', 'Critical Care'], 12, ARRAY['ABEM', 'ATLS', 'ACLS'], 
 ARRAY['English', 'Spanish'], 'available', 2, 10, '06:00:00', '18:00:00', 
 4.8, 4.7, 45, 5, true, false, true),

('DR002', 'Dr. Michael Chen', 'michael.chen@hospital.com', '555-0102',
 (SELECT id FROM specialty_ids WHERE name = 'Emergency Medicine'),
 ARRAY['Internal Medicine'], 8, ARRAY['ABEM', 'ACLS'], 
 ARRAY['English', 'Mandarin'], 'available', 1, 8, '18:00:00', '06:00:00', 
 4.6, 4.5, 38, 4, false, true, false),

('DR003', 'Dr. Emily Martinez', 'emily.martinez@hospital.com', '555-0103',
 (SELECT id FROM specialty_ids WHERE name = 'Emergency Medicine'),
 ARRAY['Pediatrics'], 15, ARRAY['ABEM', 'PALS', 'ACLS'], 
 ARRAY['English', 'Spanish'], 'busy', 4, 8, '08:00:00', '20:00:00', 
 4.9, 4.8, 42, 4, true, false, false),

-- Surgery Doctors
('DR004', 'Dr. Robert Kim', 'robert.kim@hospital.com', '555-0104',
 (SELECT id FROM specialty_ids WHERE name = 'Surgery'),
 ARRAY['Trauma Surgery', 'General Surgery'], 20, ARRAY['ABS', 'ATLS'], 
 ARRAY['English', 'Korean'], 'on-call', 0, 6, '07:00:00', '19:00:00', 
 4.7, 4.6, 90, 5, false, false, true),

('DR005', 'Dr. Lisa Thompson', 'lisa.thompson@hospital.com', '555-0105',
 (SELECT id FROM specialty_ids WHERE name = 'Trauma Surgery'),
 ARRAY['Surgery', 'Emergency Medicine'], 18, ARRAY['ABS', 'ATLS', 'FACS'], 
 ARRAY['English'], 'available', 1, 5, '00:00:00', '12:00:00', 
 4.9, 4.7, 120, 5, false, false, true),

-- Cardiology Doctors
('DR006', 'Dr. James Wilson', 'james.wilson@hospital.com', '555-0106',
 (SELECT id FROM specialty_ids WHERE name = 'Cardiology'),
 ARRAY['Internal Medicine'], 25, ARRAY['ABIM', 'FACC'], 
 ARRAY['English'], 'available', 3, 6, '08:00:00', '17:00:00', 
 4.5, 4.4, 60, 3, false, true, false),

('DR007', 'Dr. Maria Rodriguez', 'maria.rodriguez@hospital.com', '555-0107',
 (SELECT id FROM specialty_ids WHERE name = 'Cardiology'),
 ARRAY['Emergency Medicine'], 14, ARRAY['ABIM', 'FACC', 'ACLS'], 
 ARRAY['English', 'Spanish'], 'busy', 2, 5, '12:00:00', '00:00:00', 
 4.6, 4.5, 55, 4, false, true, false),

-- Pediatrics Doctors
('DR008', 'Dr. David Park', 'david.park@hospital.com', '555-0108',
 (SELECT id FROM specialty_ids WHERE name = 'Pediatrics'),
 ARRAY['Emergency Medicine'], 10, ARRAY['ABP', 'PALS'], 
 ARRAY['English', 'Korean'], 'available', 2, 8, '09:00:00', '21:00:00', 
 4.8, 4.9, 35, 3, true, false, false),

('DR009', 'Dr. Jennifer Lee', 'jennifer.lee@hospital.com', '555-0109',
 (SELECT id FROM specialty_ids WHERE name = 'Pediatrics'),
 ARRAY['Neonatology'], 16, ARRAY['ABP', 'PALS', 'NRP'], 
 ARRAY['English'], 'available', 1, 6, '06:00:00', '18:00:00', 
 4.7, 4.8, 40, 4, true, false, false),

-- Neurology Doctors
('DR010', 'Dr. Christopher Brown', 'christopher.brown@hospital.com', '555-0110',
 (SELECT id FROM specialty_ids WHERE name = 'Neurology'),
 ARRAY['Emergency Medicine'], 22, ARRAY['ABPN'], 
 ARRAY['English'], 'off-duty', 0, 4, '08:00:00', '16:00:00', 
 4.4, 4.3, 75, 3, false, false, false),

-- Internal Medicine Doctors
('DR011', 'Dr. Amanda White', 'amanda.white@hospital.com', '555-0111',
 (SELECT id FROM specialty_ids WHERE name = 'Internal Medicine'),
 ARRAY['Emergency Medicine'], 9, ARRAY['ABIM'], 
 ARRAY['English'], 'available', 3, 8, '07:00:00', '19:00:00', 
 4.5, 4.4, 50, 3, false, false, false),

('DR012', 'Dr. Kevin Zhang', 'kevin.zhang@hospital.com', '555-0112',
 (SELECT id FROM specialty_ids WHERE name = 'Internal Medicine'),
 ARRAY['Cardiology'], 13, ARRAY['ABIM'], 
 ARRAY['English', 'Mandarin'], 'busy', 4, 7, '18:00:00', '06:00:00', 
 4.3, 4.2, 65, 2, false, true, false),

-- Orthopedics Doctors
('DR013', 'Dr. Rachel Green', 'rachel.green@hospital.com', '555-0113',
 (SELECT id FROM specialty_ids WHERE name = 'Orthopedics'),
 ARRAY['Surgery'], 17, ARRAY['ABOS'], 
 ARRAY['English'], 'on-call', 0, 4, '08:00:00', '20:00:00', 
 4.6, 4.5, 95, 4, false, false, true),

-- Anesthesiology Doctors
('DR014', 'Dr. Thomas Adams', 'thomas.adams@hospital.com', '555-0114',
 (SELECT id FROM specialty_ids WHERE name = 'Anesthesiology'),
 ARRAY['Critical Care'], 19, ARRAY['ABA'], 
 ARRAY['English'], 'available', 1, 3, '00:00:00', '08:00:00', 
 4.7, 4.6, 30, 4, false, false, true),

-- Psychiatry Doctors
('DR015', 'Dr. Nicole Taylor', 'nicole.taylor@hospital.com', '555-0115',
 (SELECT id FROM specialty_ids WHERE name = 'Psychiatry'),
 ARRAY['Emergency Medicine'], 11, ARRAY['ABPN'], 
 ARRAY['English'], 'available', 2, 6, '10:00:00', '22:00:00', 
 4.2, 4.3, 45, 2, false, false, false);

-- Insert comprehensive mock patients data
INSERT INTO public.patients (
  patient_id, name, age, gender, phone, emergency_contact_name, emergency_contact_phone,
  chief_complaint, diagnosis_codes, condition_category, severity_score, triage_level,
  heart_rate, blood_pressure_systolic, blood_pressure_diastolic, temperature_celsius, 
  oxygen_saturation, glasgow_coma_scale, medical_history, current_medications, allergies,
  chronic_conditions, previous_surgeries, symptoms_duration_hours, pain_level,
  requires_immediate_attention, requires_specialist, preferred_language, room_assignment,
  bed_number, admission_status, complexity_score, estimated_treatment_duration_minutes,
  requires_trauma_specialist, requires_pediatric_care, requires_cardiac_specialist, requires_surgery
) VALUES
-- Critical Cardiac Cases
('PT001', 'John Martinez', 65, 'Male', '555-1001', 'Maria Martinez', '555-1002',
 'Severe chest pain with shortness of breath', ARRAY['I21.9'], 'cardiac', 9, 1,
 110, 160, 95, 37.2, 88, 15, ARRAY['Hypertension', 'Diabetes'], 
 ARRAY['Metformin', 'Lisinopril'], ARRAY['Penicillin'], ARRAY['Type 2 Diabetes', 'HTN'],
 ARRAY['Appendectomy 2010'], 2, 9, true, true, 'Spanish', 'ER-1', 'A1',
 'waiting', 9, 120, false, false, true, false),

('PT002', 'Margaret Johnson', 72, 'Female', '555-1003', 'Robert Johnson', '555-1004',
 'Irregular heartbeat and dizziness', ARRAY['I48.91'], 'cardiac', 7, 2,
 145, 140, 85, 36.8, 92, 15, ARRAY['Atrial Fibrillation', 'Osteoporosis'],
 ARRAY['Warfarin', 'Calcium'], ARRAY['Sulfa'], ARRAY['Atrial Fibrillation'],
 NULL, 4, 6, false, true, 'English', 'ER-2', 'B3', 'waiting', 7, 90, false, false, true, false),

-- Trauma Cases
('PT003', 'Michael Thompson', 28, 'Male', '555-1005', 'Sarah Thompson', '555-1006',
 'Motor vehicle accident with multiple injuries', ARRAY['S06.9', 'S72.001A'], 'trauma', 10, 1,
 125, 90, 55, 36.5, 85, 12, ARRAY['None'], ARRAY['None'], ARRAY['None'], ARRAY['None'],
 NULL, 1, 8, true, true, 'English', 'Trauma-1', 'T1', 'in-treatment', 10, 180, true, false, false, true),

('PT004', 'Jennifer Davis', 34, 'Female', '555-1007', 'Mark Davis', '555-1008',
 'Fall from height with suspected spinal injury', ARRAY['S32.9'], 'trauma', 8, 1,
 98, 110, 70, 36.9, 94, 14, ARRAY['None'], ARRAY['Birth Control'], ARRAY['Latex'],
 ARRAY['None'], NULL, 3, 7, true, true, 'English', 'Trauma-2', 'T2', 'under-observation', 9, 150, true, false, false, true),

-- Pediatric Cases
('PT005', 'Emma Wilson', 7, 'Female', '555-1009', 'Lisa Wilson', '555-1010',
 'High fever and difficulty breathing', ARRAY['J18.9'], 'respiratory', 6, 2,
 140, 85, 50, 39.4, 90, 15, ARRAY['Asthma'], ARRAY['Albuterol'], ARRAY['Eggs'],
 ARRAY['Asthma'], NULL, 8, 4, false, true, 'English', 'Peds-1', 'P1', 'waiting', 6, 60, false, true, false, false),

('PT006', 'Liam Brown', 3, 'Male', '555-1011', 'Amanda Brown', '555-1012',
 'Severe dehydration and vomiting', ARRAY['K59.1'], 'pediatric', 7, 2,
 160, 70, 40, 38.1, 95, 15, ARRAY['None'], ARRAY['None'], ARRAY['None'],
 ARRAY['None'], NULL, 12, 5, false, true, 'English', 'Peds-2', 'P2', 'in-treatment', 5, 45, false, true, false, false),

-- Neurological Cases
('PT007', 'Robert Garcia', 58, 'Male', '555-1013', 'Carmen Garcia', '555-1014',
 'Sudden onset severe headache and confusion', ARRAY['G93.1'], 'neurological', 8, 1,
 88, 180, 110, 37.8, 96, 13, ARRAY['Migraines'], ARRAY['Sumatriptan'], ARRAY['None'],
 ARRAY['Chronic Migraines'], NULL, 2, 8, true, true, 'Spanish', 'Neuro-1', 'N1', 'waiting', 8, 100, false, false, false, false),

('PT008', 'Patricia Lee', 45, 'Female', '555-1015', 'David Lee', '555-1016',
 'Seizure episode with loss of consciousness', ARRAY['G40.9'], 'neurological', 7, 2,
 105, 130, 80, 37.0, 98, 14, ARRAY['Epilepsy'], ARRAY['Phenytoin'], ARRAY['Phenobarbital'],
 ARRAY['Epilepsy'], NULL, 1, 3, false, true, 'English', 'Neuro-2', 'N2', 'under-observation', 7, 75, false, false, false, false),

-- Respiratory Cases
('PT009', 'William Anderson', 67, 'Male', '555-1017', 'Helen Anderson', '555-1018',
 'Severe shortness of breath and chest tightness', ARRAY['J44.1'], 'respiratory', 8, 2,
 115, 150, 90, 37.3, 82, 15, ARRAY['COPD', 'Smoking History'], 
 ARRAY['Albuterol', 'Prednisone'], ARRAY['None'], ARRAY['COPD'], NULL, 6, 7, false, true, 'English', 'ER-3', 'C1', 'waiting', 7, 80, false, false, false, false),

('PT010', 'Mary Rodriguez', 52, 'Female', '555-1019', 'Carlos Rodriguez', '555-1020',
 'Persistent cough with blood in sputum', ARRAY['R04.2'], 'respiratory', 6, 3,
 92, 125, 75, 37.1, 94, 15, ARRAY['None'], ARRAY['None'], ARRAY['Codeine'],
 ARRAY['None'], NULL, 72, 4, false, false, 'Spanish', 'ER-4', 'C2', 'waiting', 6, 45, false, false, false, false),

-- General Emergency Cases
('PT011', 'James Miller', 41, 'Male', '555-1021', 'Susan Miller', '555-1022',
 'Severe abdominal pain and nausea', ARRAY['K35.9'], 'surgical', 7, 2,
 108, 120, 78, 37.5, 97, 15, ARRAY['None'], ARRAY['Ibuprofen'], ARRAY['None'],
 ARRAY['None'], NULL, 6, 8, false, true, 'English', 'ER-5', 'D1', 'waiting', 7, 90, false, false, false, true),

('PT012', 'Linda Taylor', 36, 'Female', '555-1023', 'Kevin Taylor', '555-1024',
 'Suspected food poisoning with severe symptoms', ARRAY['K59.1'], 'infectious', 5, 3,
 95, 100, 65, 37.8, 98, 15, ARRAY['IBS'], ARRAY['Probiotics'], ARRAY['Shellfish'],
 ARRAY['IBS'], NULL, 8, 6, false, false, 'English', 'ER-6', 'D2', 'waiting', 4, 30, false, false, false, false),

-- Psychiatric Emergency Cases
('PT013', 'Daniel White', 29, 'Male', '555-1025', 'Jennifer White', '555-1026',
 'Severe anxiety attack with suicidal ideation', ARRAY['F41.1'], 'psychiatric', 6, 2,
 120, 140, 85, 36.8, 99, 15, ARRAY['Depression', 'Anxiety'], 
 ARRAY['Sertraline', 'Lorazepam'], ARRAY['None'], ARRAY['Major Depression', 'GAD'], NULL, 4, 7, false, true, 'English', 'Psych-1', 'PS1', 'under-observation', 6, 120, false, false, false, false),

-- Additional Complex Cases
('PT014', 'Elizabeth Moore', 78, 'Female', '555-1027', 'Richard Moore', '555-1028',
 'Multiple medical issues - weakness and confusion', ARRAY['R53'], 'other', 5, 3,
 78, 95, 60, 36.2, 91, 14, ARRAY['Dementia', 'Hypertension', 'Diabetes'],
 ARRAY['Donepezil', 'Amlodipine', 'Insulin'], ARRAY['Morphine'], 
 ARRAY['Alzheimer Disease', 'HTN', 'Type 1 Diabetes'], ARRAY['Hip Replacement 2018'], 24, 3, false, false, 'English', 'ER-7', 'E1', 'waiting', 8, 60, false, false, false, false),

-- Fixed orthopedic case using 'surgical' category
('PT015', 'Christopher Davis', 22, 'Male', '555-1029', 'Nancy Davis', '555-1030',
 'Sports injury - possible fracture', ARRAY['S72.9'], 'surgical', 4, 4,
 85, 115, 72, 36.6, 99, 15, ARRAY['None'], ARRAY['None'], ARRAY['None'],
 ARRAY['None'], NULL, 2, 6, false, false, 'English', 'Ortho-1', 'O1', 'waiting', 4, 45, false, false, false, false);
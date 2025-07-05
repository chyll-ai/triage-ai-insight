import { supabase } from "@/integrations/supabase/client";
import { Doctor, Patient, MedicalSpecialty, PatientAssignment } from "@/types/database";

// Fetch all patients with comprehensive data
export async function fetchPatients(): Promise<Patient[]> {
  try {
    console.log('Fetching patients from Supabase...');
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .order('triage_level', { ascending: true })
      .order('severity_score', { ascending: false });

    if (error) {
      console.error('Error fetching patients:', error);
      throw new Error(`Failed to fetch patients: ${error.message}`);
    }

    console.log(`Successfully fetched ${data?.length || 0} patients`);
    return (data as any[]) || [];
  } catch (error) {
    console.error('Error in fetchPatients:', error);
    throw error;
  }
}

// Fetch all doctors with their specialty information
export async function fetchDoctors(): Promise<Doctor[]> {
  try {
    console.log('Fetching doctors from Supabase...');
    const { data, error } = await supabase
      .from('doctors')
      .select(`
        *,
        primary_specialty:medical_specialties(*)
      `)
      .order('availability_status', { ascending: true })
      .order('current_patient_load', { ascending: true });

    if (error) {
      console.error('Error fetching doctors:', error);
      throw new Error(`Failed to fetch doctors: ${error.message}`);
    }

    console.log(`Successfully fetched ${data?.length || 0} doctors`);
    return (data as any[]) || [];
  } catch (error) {
    console.error('Error in fetchDoctors:', error);
    throw error;
  }
}

// Fetch medical specialties
export async function fetchMedicalSpecialties(): Promise<MedicalSpecialty[]> {
  try {
    const { data, error } = await supabase
      .from('medical_specialties')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching medical specialties:', error);
      throw new Error(`Failed to fetch medical specialties: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Error in fetchMedicalSpecialties:', error);
    throw error;
  }
}

// Add a new patient
export async function addPatient(patient: Omit<Patient, 'id' | 'created_at' | 'updated_at'>): Promise<Patient> {
  try {
    const { data, error } = await supabase
      .from('patients')
      .insert([patient])
      .select()
      .single();

    if (error) {
      console.error('Error adding patient:', error);
      throw new Error(`Failed to add patient: ${error.message}`);
    }

    return data as any;
  } catch (error) {
    console.error('Error in addPatient:', error);
    throw error;
  }
}

// Add a new doctor
export async function addDoctor(doctor: Omit<Doctor, 'id' | 'created_at' | 'updated_at'>): Promise<Doctor> {
  try {
    const { data, error } = await supabase
      .from('doctors')
      .insert([doctor])
      .select(`
        *,
        primary_specialty:medical_specialties(*)
      `)
      .single();

    if (error) {
      console.error('Error adding doctor:', error);
      throw new Error(`Failed to add doctor: ${error.message}`);
    }

    return data as any;
  } catch (error) {
    console.error('Error in addDoctor:', error);
    throw error;
  }
}

// Update patient
export async function updatePatient(id: string, updates: Partial<Patient>): Promise<Patient> {
  try {
    const { data, error } = await supabase
      .from('patients')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating patient:', error);
      throw new Error(`Failed to update patient: ${error.message}`);
    }

    return data as any;
  } catch (error) {
    console.error('Error in updatePatient:', error);
    throw error;
  }
}

// Update doctor
export async function updateDoctor(id: string, updates: Partial<Doctor>): Promise<Doctor> {
  try {
    const { data, error } = await supabase
      .from('doctors')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        primary_specialty:medical_specialties(*)
      `)
      .single();

    if (error) {
      console.error('Error updating doctor:', error);
      throw new Error(`Failed to update doctor: ${error.message}`);
    }

    return data as any;
  } catch (error) {
    console.error('Error in updateDoctor:', error);
    throw error;
  }
}

// Delete patient
export async function deletePatient(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('patients')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting patient:', error);
      throw new Error(`Failed to delete patient: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in deletePatient:', error);
    throw error;
  }
}

// Delete doctor
export async function deleteDoctor(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('doctors')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting doctor:', error);
      throw new Error(`Failed to delete doctor: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in deleteDoctor:', error);
    throw error;
  }
}

// Create patient assignment
export async function createPatientAssignment(assignment: Omit<PatientAssignment, 'id' | 'created_at'>): Promise<PatientAssignment> {
  try {
    const { data, error } = await supabase
      .from('patient_assignments')
      .insert([assignment])
      .select(`
        *,
        patient:patients(*),
        doctor:doctors(*, primary_specialty:medical_specialties(*))
      `)
      .single();

    if (error) {
      console.error('Error creating assignment:', error);
      throw new Error(`Failed to create assignment: ${error.message}`);
    }

    return data as any;
  } catch (error) {
    console.error('Error in createPatientAssignment:', error);
    throw error;
  }
}

// Get patient assignments
export async function fetchPatientAssignments(): Promise<PatientAssignment[]> {
  try {
    const { data, error } = await supabase
      .from('patient_assignments')
      .select(`
        *,
        patient:patients(*),
        doctor:doctors(*, primary_specialty:medical_specialties(*))
      `)
      .order('assigned_at', { ascending: false });

    if (error) {
      console.error('Error fetching assignments:', error);
      throw new Error(`Failed to fetch assignments: ${error.message}`);
    }

    return (data as any[]) || [];
  } catch (error) {
    console.error('Error in fetchPatientAssignments:', error);
    throw error;
  }
}
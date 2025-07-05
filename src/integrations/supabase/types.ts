export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      doctors: {
        Row: {
          availability_status: string | null
          average_case_duration_minutes: number | null
          cardiac_specialist: boolean | null
          certifications: string[] | null
          created_at: string
          current_patient_load: number | null
          email: string | null
          emergency_response_rating: number | null
          employee_id: string
          id: string
          languages_spoken: string[] | null
          max_patient_capacity: number | null
          name: string
          patient_satisfaction_score: number | null
          pediatric_qualified: boolean | null
          phone: string | null
          primary_specialty_id: string | null
          secondary_specialties: string[] | null
          shift_end_time: string | null
          shift_start_time: string | null
          surgery_qualified: boolean | null
          trauma_experience_level: number | null
          updated_at: string
          years_experience: number
        }
        Insert: {
          availability_status?: string | null
          average_case_duration_minutes?: number | null
          cardiac_specialist?: boolean | null
          certifications?: string[] | null
          created_at?: string
          current_patient_load?: number | null
          email?: string | null
          emergency_response_rating?: number | null
          employee_id: string
          id?: string
          languages_spoken?: string[] | null
          max_patient_capacity?: number | null
          name: string
          patient_satisfaction_score?: number | null
          pediatric_qualified?: boolean | null
          phone?: string | null
          primary_specialty_id?: string | null
          secondary_specialties?: string[] | null
          shift_end_time?: string | null
          shift_start_time?: string | null
          surgery_qualified?: boolean | null
          trauma_experience_level?: number | null
          updated_at?: string
          years_experience?: number
        }
        Update: {
          availability_status?: string | null
          average_case_duration_minutes?: number | null
          cardiac_specialist?: boolean | null
          certifications?: string[] | null
          created_at?: string
          current_patient_load?: number | null
          email?: string | null
          emergency_response_rating?: number | null
          employee_id?: string
          id?: string
          languages_spoken?: string[] | null
          max_patient_capacity?: number | null
          name?: string
          patient_satisfaction_score?: number | null
          pediatric_qualified?: boolean | null
          phone?: string | null
          primary_specialty_id?: string | null
          secondary_specialties?: string[] | null
          shift_end_time?: string | null
          shift_start_time?: string | null
          surgery_qualified?: boolean | null
          trauma_experience_level?: number | null
          updated_at?: string
          years_experience?: number
        }
        Relationships: [
          {
            foreignKeyName: "doctors_primary_specialty_id_fkey"
            columns: ["primary_specialty_id"]
            isOneToOne: false
            referencedRelation: "medical_specialties"
            referencedColumns: ["id"]
          },
        ]
      }
      matching_criteria_weights: {
        Row: {
          created_at: string
          criteria_name: string
          description: string | null
          id: string
          is_active: boolean | null
          updated_at: string
          weight_value: number
        }
        Insert: {
          created_at?: string
          criteria_name: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string
          weight_value: number
        }
        Update: {
          created_at?: string
          criteria_name?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          updated_at?: string
          weight_value?: number
        }
        Relationships: []
      }
      medical_specialties: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      patient_assignments: {
        Row: {
          assigned_at: string
          assignment_reason: string | null
          completed_at: string | null
          created_at: string
          doctor_id: string | null
          duration_minutes: number | null
          id: string
          matching_score: number | null
          patient_id: string | null
          patient_satisfaction: number | null
          treatment_outcome: string | null
        }
        Insert: {
          assigned_at?: string
          assignment_reason?: string | null
          completed_at?: string | null
          created_at?: string
          doctor_id?: string | null
          duration_minutes?: number | null
          id?: string
          matching_score?: number | null
          patient_id?: string | null
          patient_satisfaction?: number | null
          treatment_outcome?: string | null
        }
        Update: {
          assigned_at?: string
          assignment_reason?: string | null
          completed_at?: string | null
          created_at?: string
          doctor_id?: string | null
          duration_minutes?: number | null
          id?: string
          matching_score?: number | null
          patient_id?: string | null
          patient_satisfaction?: number | null
          treatment_outcome?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "patient_assignments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "patient_assignments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      patients: {
        Row: {
          admission_status: string | null
          age: number
          allergies: string[] | null
          arrival_time: string
          bed_number: string | null
          blood_pressure_diastolic: number | null
          blood_pressure_systolic: number | null
          chief_complaint: string
          chronic_conditions: string[] | null
          complexity_score: number | null
          condition_category: string | null
          created_at: string
          current_medications: string[] | null
          diagnosis_codes: string[] | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          estimated_treatment_duration_minutes: number | null
          gender: string | null
          glasgow_coma_scale: number | null
          heart_rate: number | null
          id: string
          medical_history: string[] | null
          name: string
          oxygen_saturation: number | null
          pain_level: number | null
          patient_id: string
          phone: string | null
          preferred_language: string | null
          previous_surgeries: string[] | null
          requires_cardiac_specialist: boolean | null
          requires_immediate_attention: boolean | null
          requires_pediatric_care: boolean | null
          requires_specialist: boolean | null
          requires_surgery: boolean | null
          requires_trauma_specialist: boolean | null
          room_assignment: string | null
          severity_score: number
          symptoms_duration_hours: number | null
          temperature_celsius: number | null
          triage_level: number
          updated_at: string
        }
        Insert: {
          admission_status?: string | null
          age: number
          allergies?: string[] | null
          arrival_time?: string
          bed_number?: string | null
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          chief_complaint: string
          chronic_conditions?: string[] | null
          complexity_score?: number | null
          condition_category?: string | null
          created_at?: string
          current_medications?: string[] | null
          diagnosis_codes?: string[] | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          estimated_treatment_duration_minutes?: number | null
          gender?: string | null
          glasgow_coma_scale?: number | null
          heart_rate?: number | null
          id?: string
          medical_history?: string[] | null
          name: string
          oxygen_saturation?: number | null
          pain_level?: number | null
          patient_id: string
          phone?: string | null
          preferred_language?: string | null
          previous_surgeries?: string[] | null
          requires_cardiac_specialist?: boolean | null
          requires_immediate_attention?: boolean | null
          requires_pediatric_care?: boolean | null
          requires_specialist?: boolean | null
          requires_surgery?: boolean | null
          requires_trauma_specialist?: boolean | null
          room_assignment?: string | null
          severity_score: number
          symptoms_duration_hours?: number | null
          temperature_celsius?: number | null
          triage_level: number
          updated_at?: string
        }
        Update: {
          admission_status?: string | null
          age?: number
          allergies?: string[] | null
          arrival_time?: string
          bed_number?: string | null
          blood_pressure_diastolic?: number | null
          blood_pressure_systolic?: number | null
          chief_complaint?: string
          chronic_conditions?: string[] | null
          complexity_score?: number | null
          condition_category?: string | null
          created_at?: string
          current_medications?: string[] | null
          diagnosis_codes?: string[] | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          estimated_treatment_duration_minutes?: number | null
          gender?: string | null
          glasgow_coma_scale?: number | null
          heart_rate?: number | null
          id?: string
          medical_history?: string[] | null
          name?: string
          oxygen_saturation?: number | null
          pain_level?: number | null
          patient_id?: string
          phone?: string | null
          preferred_language?: string | null
          previous_surgeries?: string[] | null
          requires_cardiac_specialist?: boolean | null
          requires_immediate_attention?: boolean | null
          requires_pediatric_care?: boolean | null
          requires_specialist?: boolean | null
          requires_surgery?: boolean | null
          requires_trauma_specialist?: boolean | null
          room_assignment?: string | null
          severity_score?: number
          symptoms_duration_hours?: number | null
          temperature_celsius?: number | null
          triage_level?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

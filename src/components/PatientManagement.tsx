import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Users, 
  UserCheck, 
  AlertTriangle, 
  Loader2,
  Trophy,
  Stethoscope,
  Plus,
  Trash2,
  RefreshCw,
  Activity,
  Clock,
  Heart,
  Thermometer
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { rankPatients, matchDoctors, predictMortality } from "@/lib/api";
import { RankedPatient, DoctorMatch } from "@/types/triage";
import { 
  Doctor as DbDoctor, 
  Patient as DbPatient, 
  MedicalSpecialty 
} from "@/types/database";
import { 
  fetchPatients, 
  fetchDoctors, 
  fetchMedicalSpecialties,
  addPatient as addDbPatient, 
  addDoctor as addDbDoctor, 
  deletePatient as deleteDbPatient, 
  deleteDoctor as deleteDbDoctor,
  updatePatient,
  updateDoctor
} from "@/lib/supabase-data";

export function PatientManagement() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  
  // Patient and doctor data from Supabase
  const [patients, setPatients] = useState<DbPatient[]>([]);
  const [doctors, setDoctors] = useState<DbDoctor[]>([]);
  const [specialties, setSpecialties] = useState<MedicalSpecialty[]>([]);
  
  // Results
  const [rankedPatients, setRankedPatients] = useState<RankedPatient[]>([]);
  const [doctorMatches, setDoctorMatches] = useState<DoctorMatch[]>([]);
  const [mortalityPredictions, setMortalityPredictions] = useState<Record<string, number>>({});

  // Form inputs
  const [newPatient, setNewPatient] = useState({ 
    name: "", 
    age: "", 
    chief_complaint: "",
    severity_score: "5",
    triage_level: "3"
  });
  const [newDoctor, setNewDoctor] = useState({ 
    name: "", 
    employee_id: "",
    primary_specialty_id: "",
    years_experience: "5"
  });

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [patientsData, doctorsData, specialtiesData] = await Promise.all([
        fetchPatients(),
        fetchDoctors(), 
        fetchMedicalSpecialties()
      ]);
      
      setPatients(patientsData);
      setDoctors(doctorsData);
      setSpecialties(specialtiesData);
      
      toast({
        title: "Data Loaded",
        description: `Loaded ${patientsData.length} patients and ${doctorsData.length} doctors`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load data";
      setError(errorMessage);
      toast({
        title: "Loading Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh data
  const refreshData = () => {
    loadInitialData();
  };

  // Add new patient
  const addPatient = async () => {
    if (!newPatient.name || !newPatient.age || !newPatient.chief_complaint) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required patient fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const patientData = {
        patient_id: `PT_${Date.now()}`,
        name: newPatient.name,
        age: parseInt(newPatient.age),
        chief_complaint: newPatient.chief_complaint,
        severity_score: parseInt(newPatient.severity_score),
        triage_level: parseInt(newPatient.triage_level),
        arrival_time: new Date().toISOString(),
        requires_immediate_attention: parseInt(newPatient.triage_level) <= 2,
        requires_specialist: parseInt(newPatient.severity_score) >= 7,
        preferred_language: 'English',
        admission_status: 'waiting' as const,
        complexity_score: parseInt(newPatient.severity_score),
        requires_trauma_specialist: false,
        requires_pediatric_care: parseInt(newPatient.age) < 18,
        requires_cardiac_specialist: newPatient.chief_complaint.toLowerCase().includes('chest') || newPatient.chief_complaint.toLowerCase().includes('heart'),
        requires_surgery: false
      };

      const patient = await addDbPatient(patientData);
      setPatients([...patients, patient]);
      setNewPatient({ name: "", age: "", chief_complaint: "", severity_score: "5", triage_level: "3" });
      
      toast({
        title: "Patient Added",
        description: `${patient.name} has been added to the system`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add patient";
      toast({
        title: "Add Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add new doctor
  const addDoctor = async () => {
    if (!newDoctor.name || !newDoctor.employee_id || !newDoctor.primary_specialty_id || !newDoctor.years_experience) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required doctor fields",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const doctorData = {
        employee_id: newDoctor.employee_id,
        name: newDoctor.name,
        primary_specialty_id: newDoctor.primary_specialty_id,
        years_experience: parseInt(newDoctor.years_experience),
        availability_status: 'available' as const,
        current_patient_load: 0,
        max_patient_capacity: 8,
        trauma_experience_level: 3,
        pediatric_qualified: false,
        cardiac_specialist: false,
        surgery_qualified: false
      };

      const doctor = await addDbDoctor(doctorData);
      setDoctors([...doctors, doctor]);
      setNewDoctor({ name: "", employee_id: "", primary_specialty_id: "", years_experience: "5" });
      
      toast({
        title: "Doctor Added",
        description: `${doctor.name} has been added to the system`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to add doctor";
      toast({
        title: "Add Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Remove patient
  const removePatient = async (patientId: string) => {
    try {
      await deleteDbPatient(patientId);
      setPatients(patients.filter(p => p.id !== patientId));
      setRankedPatients(rankedPatients.filter(rp => rp.patient_id !== patientId));
      setDoctorMatches(doctorMatches.filter(dm => dm.patient_id !== patientId));
      
      const newMortalityPredictions = { ...mortalityPredictions };
      delete newMortalityPredictions[patientId];
      setMortalityPredictions(newMortalityPredictions);
      
      toast({
        title: "Patient Removed",
        description: "Patient has been removed from the system",
      });
    } catch (err) {
      toast({
        title: "Remove Failed",
        description: "Failed to remove patient",
        variant: "destructive"
      });
    }
  };

  // Remove doctor
  const removeDoctor = async (doctorId: string) => {
    try {
      await deleteDbDoctor(doctorId);
      setDoctors(doctors.filter(d => d.id !== doctorId));
      setDoctorMatches(doctorMatches.filter(dm => dm.doctor_id !== doctorId));
      
      toast({
        title: "Doctor Removed",
        description: "Doctor has been removed from the system",
      });
    } catch (err) {
      toast({
        title: "Remove Failed",
        description: "Failed to remove doctor",
        variant: "destructive"
      });
    }
  };

  // Rank patients
  const handleRankPatients = async () => {
    if (patients.length === 0) {
      toast({
        title: "No Patients",
        description: "Please add patients before ranking",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const patientIds = patients.map(p => p.id);
      const response = await rankPatients({ patient_ids: patientIds });
      setRankedPatients(response.ranked);
      
      toast({
        title: "Patients Ranked",
        description: `Successfully ranked ${patients.length} patients by priority`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to rank patients";
      setError(errorMessage);
      
      toast({
        title: "Ranking Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Match doctors
  const handleMatchDoctors = async () => {
    if (patients.length === 0 || doctors.length === 0) {
      toast({
        title: "Missing Data",
        description: "Please add both patients and doctors before matching",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const patientIds = patients.map(p => p.id);
      const doctorIds = doctors.map(d => d.id);
      const response = await matchDoctors({ patient_ids: patientIds, doctor_ids: doctorIds });
      setDoctorMatches(response.matches);
      
      toast({
        title: "Doctors Matched",
        description: `Successfully matched ${response.matches.length} patients with doctors`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to match doctors";
      setError(errorMessage);
      
      toast({
        title: "Matching Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Predict mortality for a patient
  const predictPatientMortality = async (patient: DbPatient) => {
    setIsLoading(true);
    setError("");

    try {
      const description = `patient_id: ${patient.patient_id},\nfull_name: ${patient.name},\nage: ${patient.age},\nchief_complaint: ${patient.chief_complaint}`;
      const mortalityRisk = await predictMortality(description);
      
      setMortalityPredictions(prev => ({
        ...prev,
        [patient.id]: mortalityRisk
      }));
      
      toast({
        title: "Mortality Prediction",
        description: `Predicted ${mortalityRisk}% mortality risk for ${patient.name}`,
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to predict mortality";
      setError(errorMessage);
      
      toast({
        title: "Prediction Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get patient by ID
  const getPatientById = (id: string) => patients.find(p => p.id === id);
  const getDoctorById = (id: string) => doctors.find(d => d.id === id);

  // Get severity badge color
  const getSeverityBadgeVariant = (score: number) => {
    if (score >= 8) return "destructive";
    if (score >= 6) return "default"; 
    return "secondary";
  };

  // Get triage badge color
  const getTriageBadgeVariant = (level: number) => {
    if (level === 1) return "destructive";
    if (level === 2) return "default";
    return "secondary";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
          <Users className="w-6 h-6" />
          Advanced Patient Management System
        </h2>
        <p className="text-muted-foreground mt-2">
          Comprehensive patient data management with AI-powered matching and prioritization
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button onClick={refreshData} disabled={isLoading} variant="outline">
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4 mr-2" />
          )}
          Refresh Data
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Patients Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Patients ({patients.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Patient Form */}
            <div className="space-y-3 p-4 border rounded-lg">
              <h4 className="font-medium">Add New Patient</h4>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Patient Name"
                  value={newPatient.name}
                  onChange={(e) => setNewPatient(prev => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  placeholder="Age"
                  type="number"
                  value={newPatient.age}
                  onChange={(e) => setNewPatient(prev => ({ ...prev, age: e.target.value }))}
                />
              </div>
              <Input
                placeholder="Chief Complaint"
                value={newPatient.chief_complaint}
                onChange={(e) => setNewPatient(prev => ({ ...prev, chief_complaint: e.target.value }))}
              />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-sm">Severity Score (1-10)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={newPatient.severity_score}
                    onChange={(e) => setNewPatient(prev => ({ ...prev, severity_score: e.target.value }))}
                  />
                </div>
                <div>
                  <Label className="text-sm">Triage Level (1-5)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="5"
                    value={newPatient.triage_level}
                    onChange={(e) => setNewPatient(prev => ({ ...prev, triage_level: e.target.value }))}
                  />
                </div>
              </div>
              <Button onClick={addPatient} size="sm" className="w-full" disabled={isLoading}>
                <Plus className="w-4 h-4 mr-2" />
                Add Patient
              </Button>
            </div>

            {/* Patient List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {patients.map((patient) => (
                <div key={patient.id} className="p-3 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{patient.name}</span>
                        <Badge variant="outline">{patient.age} years</Badge>
                        <Badge variant={getSeverityBadgeVariant(patient.severity_score)}>
                          Severity: {patient.severity_score}
                        </Badge>
                        <Badge variant={getTriageBadgeVariant(patient.triage_level)}>
                          Triage: {patient.triage_level}
                        </Badge>
                        {mortalityPredictions[patient.id] && (
                          <Badge variant="destructive">
                            {mortalityPredictions[patient.id]}% mortality risk
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{patient.chief_complaint}</p>
                      <div className="flex items-center gap-4 mt-1">
                        {patient.heart_rate && (
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            <span className="text-xs">{patient.heart_rate} bpm</span>
                          </div>
                        )}
                        {patient.temperature_celsius && (
                          <div className="flex items-center gap-1">
                            <Thermometer className="w-3 h-3" />
                            <span className="text-xs">{patient.temperature_celsius}°C</span>
                          </div>
                        )}
                        {patient.oxygen_saturation && (
                          <div className="flex items-center gap-1">
                            <Activity className="w-3 h-3" />
                            <span className="text-xs">{patient.oxygen_saturation}% O2</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => predictPatientMortality(patient)}
                        disabled={isLoading}
                      >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Predict Risk"}
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removePatient(patient.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Doctors Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Stethoscope className="w-5 h-5" />
              Doctors ({doctors.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Add Doctor Form */}
            <div className="space-y-3 p-4 border rounded-lg">
              <h4 className="font-medium">Add New Doctor</h4>
              <div className="grid grid-cols-2 gap-2">
                <Input
                  placeholder="Doctor Name"
                  value={newDoctor.name}
                  onChange={(e) => setNewDoctor(prev => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  placeholder="Employee ID"
                  value={newDoctor.employee_id}
                  onChange={(e) => setNewDoctor(prev => ({ ...prev, employee_id: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-sm">Primary Specialty</Label>
                  <Select value={newDoctor.primary_specialty_id} onValueChange={(value) => setNewDoctor(prev => ({ ...prev, primary_specialty_id: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select specialty" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map((specialty) => (
                        <SelectItem key={specialty.id} value={specialty.id}>
                          {specialty.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm">Years Experience</Label>
                  <Input
                    type="number"
                    min="0"
                    value={newDoctor.years_experience}
                    onChange={(e) => setNewDoctor(prev => ({ ...prev, years_experience: e.target.value }))}
                  />
                </div>
              </div>
              <Button onClick={addDoctor} size="sm" className="w-full" disabled={isLoading}>
                <Plus className="w-4 h-4 mr-2" />
                Add Doctor
              </Button>
            </div>

            {/* Doctor List */}
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{doctor.name}</span>
                      <Badge variant="secondary">
                        {doctor.primary_specialty?.name || 'No Specialty'}
                      </Badge>
                      <Badge variant={doctor.availability_status === 'available' ? 'default' : 'outline'}>
                        {doctor.availability_status}
                      </Badge>
                      {doctor.years_experience > 0 && (
                        <Badge variant="outline">{doctor.years_experience} years</Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Load: {doctor.current_patient_load}/{doctor.max_patient_capacity}
                      {doctor.emergency_response_rating && (
                        <span className="ml-2">Rating: {doctor.emergency_response_rating}/5.0</span>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => removeDoctor(doctor.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button
          onClick={handleRankPatients}
          disabled={isLoading || patients.length === 0}
          className="px-6"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <Trophy className="w-5 h-5 mr-2" />
          )}
          Rank Patients
        </Button>
        <Button
          onClick={handleMatchDoctors}
          disabled={isLoading || patients.length === 0 || doctors.length === 0}
          className="px-6"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          ) : (
            <UserCheck className="w-5 h-5 mr-2" />
          )}
          Match Doctors
        </Button>
      </div>

      {/* Results Section */}
      {(rankedPatients.length > 0 || doctorMatches.length > 0) && (
        <div className="space-y-6">
          {/* Ranked Patients */}
          {rankedPatients.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5" />
                  Patient Priority Ranking
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {rankedPatients.map((ranked) => {
                    const patient = getPatientById(ranked.patient_id);
                    return (
                      <div key={ranked.patient_id} className="flex items-center gap-4 p-3 border rounded-lg">
                        <Badge variant="default" className="w-8 h-8 rounded-full flex items-center justify-center">
                          {ranked.rank}
                        </Badge>
                        <div className="flex-1">
                          <div className="font-medium">{patient?.name || ranked.patient_id}</div>
                          <div className="text-sm text-muted-foreground">{patient?.chief_complaint}</div>
                        </div>
                        {mortalityPredictions[ranked.patient_id] && (
                          <Badge variant="destructive">
                            {mortalityPredictions[ranked.patient_id]}% mortality risk
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Doctor Matches */}
          {doctorMatches.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserCheck className="w-5 h-5" />
                  Doctor-Patient Matches
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {doctorMatches.map((match) => {
                    const patient = getPatientById(match.patient_id);
                    const doctor = getDoctorById(match.doctor_id);
                    return (
                      <div key={`${match.patient_id}-${match.doctor_id}`} className="p-4 border rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-4">
                            <div>
                              <div className="font-medium">{patient?.name || match.patient_id}</div>
                              <div className="text-sm text-muted-foreground">{patient?.chief_complaint}</div>
                            </div>
                            <div className="text-muted-foreground">→</div>
                            <div>
                              <div className="font-medium">{doctor?.name || match.doctor_id}</div>
                              <div className="text-sm text-muted-foreground">
                                {doctor?.primary_specialty?.name || 'Unknown Specialty'}
                              </div>
                            </div>
                          </div>
                          <Badge variant="outline">Score: {match.score}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <strong>Justification:</strong> {match.justification}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
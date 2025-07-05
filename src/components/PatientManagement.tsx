import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  UserCheck, 
  AlertTriangle, 
  Loader2,
  Trophy,
  Stethoscope,
  Plus,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { rankPatients, matchDoctors, predictMortality } from "@/lib/api";
import { RankedPatient, DoctorMatch } from "@/types/triage";

interface Patient {
  id: string;
  name: string;
  age: number;
  condition: string;
  mortalityRisk?: number;
}

interface Doctor {
  id: string;
  name: string;
  specialty: string;
}

export function PatientManagement() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string>("");
  
  // Patient management
  const [patients, setPatients] = useState<Patient[]>([
    { id: "p_001", name: "John Doe", age: 45, condition: "Chest pain" },
    { id: "p_002", name: "Jane Smith", age: 32, condition: "Fever and cough" },
    { id: "p_003", name: "Bob Johnson", age: 67, condition: "Difficulty breathing" },
  ]);
  
  const [doctors, setDoctors] = useState<Doctor[]>([
    { id: "d_100", name: "Dr. Sarah Wilson", specialty: "Cardiology" },
    { id: "d_200", name: "Dr. Michael Chen", specialty: "Emergency Medicine" },
  ]);
  
  // Results
  const [rankedPatients, setRankedPatients] = useState<RankedPatient[]>([]);
  const [doctorMatches, setDoctorMatches] = useState<DoctorMatch[]>([]);
  const [mortalityPredictions, setMortalityPredictions] = useState<Record<string, number>>({});

  // Form inputs
  const [newPatient, setNewPatient] = useState({ name: "", age: "", condition: "" });
  const [newDoctor, setNewDoctor] = useState({ name: "", specialty: "" });

  // Add new patient
  const addPatient = () => {
    if (!newPatient.name || !newPatient.age || !newPatient.condition) {
      toast({
        title: "Validation Error",
        description: "Please fill in all patient fields",
        variant: "destructive"
      });
      return;
    }

    const patient: Patient = {
      id: `p_${Date.now()}`,
      name: newPatient.name,
      age: parseInt(newPatient.age),
      condition: newPatient.condition
    };

    setPatients([...patients, patient]);
    setNewPatient({ name: "", age: "", condition: "" });
    
    toast({
      title: "Patient Added",
      description: `${patient.name} has been added to the system`,
    });
  };

  // Add new doctor
  const addDoctor = () => {
    if (!newDoctor.name || !newDoctor.specialty) {
      toast({
        title: "Validation Error",
        description: "Please fill in all doctor fields",
        variant: "destructive"
      });
      return;
    }

    const doctor: Doctor = {
      id: `d_${Date.now()}`,
      name: newDoctor.name,
      specialty: newDoctor.specialty
    };

    setDoctors([...doctors, doctor]);
    setNewDoctor({ name: "", specialty: "" });
    
    toast({
      title: "Doctor Added",
      description: `${doctor.name} has been added to the system`,
    });
  };

  // Remove patient
  const removePatient = (patientId: string) => {
    setPatients(patients.filter(p => p.id !== patientId));
    setRankedPatients(rankedPatients.filter(rp => rp.patient_id !== patientId));
    setDoctorMatches(doctorMatches.filter(dm => dm.patient_id !== patientId));
    
    const newMortalityPredictions = { ...mortalityPredictions };
    delete newMortalityPredictions[patientId];
    setMortalityPredictions(newMortalityPredictions);
  };

  // Remove doctor
  const removeDoctor = (doctorId: string) => {
    setDoctors(doctors.filter(d => d.id !== doctorId));
    setDoctorMatches(doctorMatches.filter(dm => dm.doctor_id !== doctorId));
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
  const predictPatientMortality = async (patient: Patient) => {
    setIsLoading(true);
    setError("");

    try {
      const description = `patient_id: ${patient.id},\nfull_name: ${patient.name},\nage: ${patient.age},\nchief_complaint: ${patient.condition}`;
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
          <Users className="w-6 h-6" />
          Patient Management System
        </h2>
        <p className="text-muted-foreground mt-2">
          Manage patients, rank by priority, and match with doctors using AI
        </p>
      </div>

      {/* Error Display */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <Input
                  placeholder="Name"
                  value={newPatient.name}
                  onChange={(e) => setNewPatient(prev => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  placeholder="Age"
                  type="number"
                  value={newPatient.age}
                  onChange={(e) => setNewPatient(prev => ({ ...prev, age: e.target.value }))}
                />
                <Input
                  placeholder="Condition"
                  value={newPatient.condition}
                  onChange={(e) => setNewPatient(prev => ({ ...prev, condition: e.target.value }))}
                />
              </div>
              <Button onClick={addPatient} size="sm" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Patient
              </Button>
            </div>

            {/* Patient List */}
            <div className="space-y-2">
              {patients.map((patient) => (
                <div key={patient.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{patient.name}</span>
                      <Badge variant="outline">{patient.age} years</Badge>
                      {mortalityPredictions[patient.id] && (
                        <Badge variant="destructive">
                          {mortalityPredictions[patient.id]}% mortality risk
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{patient.condition}</p>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <Input
                  placeholder="Name"
                  value={newDoctor.name}
                  onChange={(e) => setNewDoctor(prev => ({ ...prev, name: e.target.value }))}
                />
                <Input
                  placeholder="Specialty"
                  value={newDoctor.specialty}
                  onChange={(e) => setNewDoctor(prev => ({ ...prev, specialty: e.target.value }))}
                />
              </div>
              <Button onClick={addDoctor} size="sm" className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Add Doctor
              </Button>
            </div>

            {/* Doctor List */}
            <div className="space-y-2">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{doctor.name}</div>
                    <Badge variant="secondary">{doctor.specialty}</Badge>
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
                  {rankedPatients.map((ranked, index) => {
                    const patient = getPatientById(ranked.patient_id);
                    return (
                      <div key={ranked.patient_id} className="flex items-center gap-4 p-3 border rounded-lg">
                        <Badge variant="default" className="w-8 h-8 rounded-full flex items-center justify-center">
                          {ranked.rank}
                        </Badge>
                        <div className="flex-1">
                          <div className="font-medium">{patient?.name || ranked.patient_id}</div>
                          <div className="text-sm text-muted-foreground">{patient?.condition}</div>
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
                              <div className="text-sm text-muted-foreground">{patient?.condition}</div>
                            </div>
                            <div className="text-muted-foreground">→</div>
                            <div>
                              <div className="font-medium">{doctor?.name || match.doctor_id}</div>
                              <div className="text-sm text-muted-foreground">{doctor?.specialty}</div>
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
import { useState } from "react";
import { PatientInfo, Vitals } from "@/types/triage";
import { PatientForm } from "@/components/PatientForm";
import { PatientSummary } from "@/components/PatientSummary";
import { VitalsForm } from "@/components/VitalsForm";
import { ImageUpload } from "@/components/ImageUpload";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { performTriageAnalysis } from "@/lib/api";

interface TriageResults {
  summary: string;
  urgency_level: 'low' | 'moderate' | 'high' | 'critical';
  red_flags: string[];
  recommended_actions: string[];
}

export default function Triage() {
  const { toast } = useToast();
  
  // Sample pre-filled patient data (from DMP integration)
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    // Pre-filled data from DMP (read-only)
    fullName: "Marie Dubois",
    age: 67,
    sex: "Female",
    patientId: "DMP123456789",
    address: "15 rue de la République, 75011 Paris",
    phone: "01 42 85 67 93",
    emergencyContact: {
      name: "Jean Dubois",
      phone: "06 12 34 56 78",
      relationship: "Époux"
    },
    medicalHistory: [
      "Hypertension artérielle (2018)", 
      "Diabète type 2 (2020)",
      "Chirurgie de la cataracte OD (2022)"
    ],
    currentMedications: [
      "Metformine 850mg 2x/jour",
      "Lisinopril 10mg 1x/jour",
      "Aspirine 75mg 1x/jour"
    ],
    knownAllergies: ["Pénicilline", "Contraste iodé"],
    chronicConditions: ["Hypertension", "Diabète type 2"],
    previousDiagnoses: ["Cataracte", "Presbytie"],
    lastVisitDate: "2024-06-15",
    insuranceInfo: {
      provider: "CPAM Paris",
      number: "1 67 05 75011 123 45"
    },
    // Current visit data (editable)
    chiefComplaint: "",
    currentSymptoms: "",
    clinicalNotes: "",
    onsetDate: "",
    symptomDuration: ""
  });

  const [vitals, setVitals] = useState<Vitals>({
    heartRate: 0,
    bloodPressure: "",
    oxygenSaturation: 0,
    temperature: 0,
    gcs: 15
  });

  const [image, setImage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<TriageResults | null>(null);
  const [error, setError] = useState<string>("");

  const validateForm = (): boolean => {
    if (!patientInfo.chiefComplaint.trim()) {
      toast({
        title: "Validation Error",
        description: "Le motif de consultation est requis",
        variant: "destructive"
      });
      return false;
    }

    if (!patientInfo.currentSymptoms.trim()) {
      toast({
        title: "Validation Error", 
        description: "La description des symptômes actuels est requise",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsLoading(true);
    setError("");
    setResults(null);

    try {
      const analysisResults = await performTriageAnalysis(
        patientInfo,
        vitals,
        `${patientInfo.chiefComplaint} - Symptômes: ${patientInfo.currentSymptoms} - Notes: ${patientInfo.clinicalNotes}`,
        image
      );
      
      setResults(analysisResults);
      
      toast({
        title: "Analysis Complete",
        description: "MedGemma triage analysis completed successfully",
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      setError(errorMessage);
      
      toast({
        title: "Analysis Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    // Reset only the current visit data, keep pre-filled DMP data
    setPatientInfo(prev => ({
      ...prev,
      chiefComplaint: "",
      currentSymptoms: "",
      clinicalNotes: "",
      onsetDate: "",
      symptomDuration: ""
    }));
    setVitals({
      heartRate: 0,
      bloodPressure: "",
      oxygenSaturation: 0,
      temperature: 0,
      gcs: 15
    });
    setImage("");
    setResults(null);
    setError("");
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'moderate': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Activity className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-primary">Medical Triage Assistant</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            AI-powered medical triage system using MedGemma for instant analysis and priority assessment.
          </p>
        </div>

        {/* Results Display */}
        {results && (
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  Triage Analysis Results
                </CardTitle>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  size="sm"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  New Analysis
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Summary</h3>
                <p className="text-muted-foreground">{results.summary}</p>
              </div>
              
              <div>
                <h3 className="font-semibold mb-2">Urgency Level</h3>
                <Badge variant={getUrgencyColor(results.urgency_level)} className="text-sm">
                  {results.urgency_level.toUpperCase()}
                </Badge>
              </div>

              {results.red_flags.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2 text-red-600">Red Flags</h3>
                  <div className="space-y-1">
                    {results.red_flags.map((flag, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span className="text-sm">{flag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">Recommended Actions</h3>
                <div className="space-y-1">
                  {results.recommended_actions.map((action, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="text-sm">{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {isLoading && (
          <LoadingSpinner message="Analyzing patient data with MedGemma..." />
        )}

        {/* Error Display */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Form - Only show if no results */}
        {!results && !isLoading && (
          <div className="space-y-6">
            {/* Patient Summary from DMP */}
            <PatientSummary patientInfo={patientInfo} />
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <PatientForm 
                patientInfo={patientInfo}
                onChange={setPatientInfo}
              />
              <VitalsForm 
                vitals={vitals}
                onChange={setVitals}
              />
            </div>
            
            <ImageUpload 
              onImageChange={setImage}
              image={image}
            />

            <div className="flex justify-center">
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                size="lg"
                className="px-8"
              >
                <Activity className="w-5 h-5 mr-2" />
                Analyze with MedGemma
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
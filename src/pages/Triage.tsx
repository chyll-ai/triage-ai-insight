import { useState } from "react";
import { PatientInfo, Vitals, TriageRequest, TriageResponse, ApiError } from "@/types/triage";
import { PatientForm } from "@/components/PatientForm";
import { VitalsForm } from "@/components/VitalsForm";
import { ImageUpload } from "@/components/ImageUpload";
import { ApiConfig } from "@/components/ApiConfig";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ResultsDisplay } from "@/components/ResultsDisplay";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Activity, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Triage() {
  const { toast } = useToast();
  const [apiEndpoint, setApiEndpoint] = useState("https://medgemma-api.my-vm.net/analyze");
  
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    fullName: "",
    age: 0,
    sex: "Male",
    chiefComplaint: ""
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
  const [results, setResults] = useState<TriageResponse | null>(null);
  const [error, setError] = useState<string>("");

  const validateForm = (): boolean => {
    if (!patientInfo.fullName.trim()) {
      toast({
        title: "Validation Error",
        description: "Patient name is required",
        variant: "destructive"
      });
      return false;
    }

    if (!patientInfo.age || patientInfo.age <= 0) {
      toast({
        title: "Validation Error", 
        description: "Valid patient age is required",
        variant: "destructive"
      });
      return false;
    }

    if (!patientInfo.chiefComplaint.trim()) {
      toast({
        title: "Validation Error",
        description: "Chief complaint is required",
        variant: "destructive"
      });
      return false;
    }

    if (!image) {
      toast({
        title: "Validation Error",
        description: "Medical image is required",
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
      const requestData: TriageRequest = {
        image,
        notes: patientInfo.chiefComplaint,
        vitals,
        patient: patientInfo
      };

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData)
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const data: TriageResponse = await response.json();
      setResults(data);
      
      toast({
        title: "Analysis Complete",
        description: "MedGemma analysis completed successfully",
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
    setPatientInfo({
      fullName: "",
      age: 0,
      sex: "Male",
      chiefComplaint: ""
    });
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
            AI-powered medical triage system. Upload patient information and medical images 
            for instant analysis and priority assessment.
          </p>
        </div>

        <ApiConfig 
          apiEndpoint={apiEndpoint}
          onEndpointChange={setApiEndpoint}
        />

        {/* Results Display */}
        {results && (
          <ResultsDisplay 
            results={results}
            onReset={handleReset}
          />
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
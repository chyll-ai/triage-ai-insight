import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Users, Stethoscope, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Activity className="w-12 h-12 text-primary" />
            <h1 className="text-4xl font-bold text-primary">Medical Triage AI</h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Advanced AI-powered medical triage system with patient management, 
            priority ranking, and intelligent doctor matching capabilities.
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-6 h-6 text-primary" />
                Medical Triage Analysis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Upload patient information and medical images for instant AI analysis. 
                Get triage urgency levels and suggested actions.
              </p>
              <Link to="/triage">
                <Button className="w-full">
                  Start Triage Analysis
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-6 h-6 text-primary" />
                Patient Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Manage multiple patients, rank by priority, match with doctors, 
                and predict mortality risks using AI.
              </p>
              <Link to="/patient-management">
                <Button className="w-full">
                  Manage Patients
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-center mb-8">Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Activity className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">AI Triage Analysis</h3>
              <p className="text-sm text-muted-foreground">
                Advanced image analysis and patient data evaluation for accurate triage decisions.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Patient Ranking</h3>
              <p className="text-sm text-muted-foreground">
                Intelligent priority ranking based on medical urgency and patient conditions.
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <Stethoscope className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Doctor Matching</h3>
              <p className="text-sm text-muted-foreground">
                Smart matching of patients with appropriate doctors based on specialties and availability.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

import { TriageResponse } from "@/types/triage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, AlertCircle, Activity } from "lucide-react";

interface ResultsDisplayProps {
  results: TriageResponse;
  onReset: () => void;
}

export function ResultsDisplay({ results, onReset }: ResultsDisplayProps) {
  const getUrgencyConfig = (level: string) => {
    switch (level) {
      case 'High':
        return {
          color: 'bg-destructive text-destructive-foreground',
          icon: AlertTriangle,
          textColor: 'text-destructive'
        };
      case 'Medium':
        return {
          color: 'bg-warning text-warning-foreground',
          icon: AlertCircle,
          textColor: 'text-warning'
        };
      case 'Low':
        return {
          color: 'bg-success text-success-foreground',
          icon: CheckCircle,
          textColor: 'text-success'
        };
      default:
        return {
          color: 'bg-muted text-muted-foreground',
          icon: Activity,
          textColor: 'text-muted-foreground'
        };
    }
  };

  const urgencyConfig = getUrgencyConfig(results.urgencyLevel);
  const UrgencyIcon = urgencyConfig.icon;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-primary flex items-center gap-2">
            <Activity className="w-5 h-5" />
            MedGemma Analysis Results
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Urgency Level */}
          <div className="flex items-center gap-3">
            <UrgencyIcon className={`w-6 h-6 ${urgencyConfig.textColor}`} />
            <div>
              <p className="text-sm font-medium text-muted-foreground">Triage Urgency</p>
              <Badge className={urgencyConfig.color} variant="secondary">
                {results.urgencyLevel} Priority
              </Badge>
            </div>
          </div>

          {/* AI Summary */}
          <div>
            <h3 className="font-semibold text-primary mb-2">AI Summary</h3>
            <div className="bg-muted p-4 rounded-lg">
              <p className="text-sm leading-relaxed">{results.summary}</p>
            </div>
          </div>

          {/* Suggested Actions */}
          <div>
            <h3 className="font-semibold text-primary mb-3">Suggested Actions</h3>
            <ul className="space-y-2">
              {results.suggestedActions.map((action, index) => (
                <li key={index} className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{action}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-center">
        <button
          onClick={onReset}
          className="px-6 py-2 bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
        >
          Analyze Another Case
        </button>
      </div>
    </div>
  );
}
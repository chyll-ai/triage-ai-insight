import { PatientInfo } from "@/types/triage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Stethoscope } from "lucide-react";

interface PatientFormProps {
  patientInfo: PatientInfo;
  onChange: (info: PatientInfo) => void;
}

export function PatientForm({ patientInfo, onChange }: PatientFormProps) {
  const updateField = (field: keyof PatientInfo, value: string) => {
    onChange({ ...patientInfo, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Stethoscope className="w-5 h-5" />
          Consultation actuelle
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="chiefComplaint">Motif de consultation</Label>
          <Textarea
            id="chiefComplaint"
            value={patientInfo.chiefComplaint}
            onChange={(e) => updateField('chiefComplaint', e.target.value)}
            placeholder="Décrivez le motif principal de la consultation..."
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currentSymptoms">Symptômes actuels</Label>
          <Textarea
            id="currentSymptoms"
            value={patientInfo.currentSymptoms}
            onChange={(e) => updateField('currentSymptoms', e.target.value)}
            placeholder="Décrivez les symptômes actuels en détail..."
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="onsetDate">Date d'apparition</Label>
            <Input
              id="onsetDate"
              type="date"
              value={patientInfo.onsetDate}
              onChange={(e) => updateField('onsetDate', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="symptomDuration">Durée des symptômes</Label>
            <Input
              id="symptomDuration"
              value={patientInfo.symptomDuration}
              onChange={(e) => updateField('symptomDuration', e.target.value)}
              placeholder="ex: 3 jours, 2 heures..."
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="clinicalNotes">Observations cliniques</Label>
          <Textarea
            id="clinicalNotes"
            value={patientInfo.clinicalNotes}
            onChange={(e) => updateField('clinicalNotes', e.target.value)}
            placeholder="Notes cliniques, observations, examens physiques..."
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
}
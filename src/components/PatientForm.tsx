import { PatientInfo } from "@/types/triage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface PatientFormProps {
  patientInfo: PatientInfo;
  onChange: (info: PatientInfo) => void;
}

export function PatientForm({ patientInfo, onChange }: PatientFormProps) {
  const updateField = (field: keyof PatientInfo, value: string | number) => {
    onChange({ ...patientInfo, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary">Patient Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input
              id="fullName"
              value={patientInfo.fullName}
              onChange={(e) => updateField('fullName', e.target.value)}
              placeholder="Enter patient's full name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="age">Age</Label>
            <Input
              id="age"
              type="number"
              value={patientInfo.age || ''}
              onChange={(e) => updateField('age', parseInt(e.target.value) || 0)}
              placeholder="Age"
              min="0"
              max="150"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="sex">Sex</Label>
          <Select value={patientInfo.sex} onValueChange={(value) => updateField('sex', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select sex" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Male">Male</SelectItem>
              <SelectItem value="Female">Female</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="chiefComplaint">Chief Complaint</Label>
          <Textarea
            id="chiefComplaint"
            value={patientInfo.chiefComplaint}
            onChange={(e) => updateField('chiefComplaint', e.target.value)}
            placeholder="Describe the patient's primary concern or symptoms..."
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  );
}
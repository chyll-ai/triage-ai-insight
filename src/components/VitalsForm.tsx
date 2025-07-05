import { Vitals } from "@/types/triage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface VitalsFormProps {
  vitals: Vitals;
  onChange: (vitals: Vitals) => void;
}

export function VitalsForm({ vitals, onChange }: VitalsFormProps) {
  const updateField = (field: keyof Vitals, value: string | number) => {
    onChange({ ...vitals, [field]: value });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary">Vital Signs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="heartRate">Heart Rate (bpm)</Label>
            <Input
              id="heartRate"
              type="number"
              value={vitals.heartRate || ''}
              onChange={(e) => updateField('heartRate', parseInt(e.target.value) || 0)}
              placeholder="e.g., 72"
              min="0"
              max="300"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="bloodPressure">Blood Pressure</Label>
            <Input
              id="bloodPressure"
              value={vitals.bloodPressure}
              onChange={(e) => updateField('bloodPressure', e.target.value)}
              placeholder="e.g., 120/80"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="oxygenSaturation">Oxygen Saturation (%)</Label>
            <Input
              id="oxygenSaturation"
              type="number"
              value={vitals.oxygenSaturation || ''}
              onChange={(e) => updateField('oxygenSaturation', parseInt(e.target.value) || 0)}
              placeholder="e.g., 98"
              min="0"
              max="100"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="temperature">Temperature (°F)</Label>
            <Input
              id="temperature"
              type="number"
              step="0.1"
              value={vitals.temperature || ''}
              onChange={(e) => updateField('temperature', parseFloat(e.target.value) || 0)}
              placeholder="e.g., 98.6"
              min="80"
              max="110"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="gcs">Glasgow Coma Scale (GCS)</Label>
          <Input
            id="gcs"
            type="number"
            value={vitals.gcs || ''}
            onChange={(e) => updateField('gcs', parseInt(e.target.value) || 0)}
            placeholder="Score (3-15)"
            min="3"
            max="15"
          />
        </div>
      </CardContent>
    </Card>
  );
}
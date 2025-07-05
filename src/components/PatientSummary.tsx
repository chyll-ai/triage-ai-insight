import { PatientInfo } from "@/types/triage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, AlertTriangle, Phone, MapPin, Calendar, FileText } from "lucide-react";

interface PatientSummaryProps {
  patientInfo: PatientInfo;
}

export function PatientSummary({ patientInfo }: PatientSummaryProps) {
  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <User className="w-5 h-5" />
          Dossier Médical - {patientInfo.fullName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Demographics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="font-semibold text-sm mb-2">Informations personnelles</h3>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>{patientInfo.age} ans • {patientInfo.sex}</span>
              </div>
              {patientInfo.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{patientInfo.address}</span>
                </div>
              )}
              {patientInfo.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{patientInfo.phone}</span>
                </div>
              )}
            </div>
          </div>
          
          {patientInfo.emergencyContact && (
            <div>
              <h3 className="font-semibold text-sm mb-2">Contact d'urgence</h3>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>{patientInfo.emergencyContact.name}</div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>{patientInfo.emergencyContact.phone}</span>
                </div>
                <div className="text-xs">({patientInfo.emergencyContact.relationship})</div>
              </div>
            </div>
          )}
        </div>

        {/* Critical Information */}
        {patientInfo.knownAllergies.length > 0 && (
          <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              <h3 className="font-semibold text-sm text-destructive">Allergies connues</h3>
            </div>
            <div className="flex flex-wrap gap-1">
              {patientInfo.knownAllergies.map((allergy, index) => (
                <Badge key={index} variant="destructive" className="text-xs">
                  {allergy}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Medical History */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {patientInfo.currentMedications.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm mb-2">Traitements actuels</h3>
              <div className="space-y-1">
                {patientInfo.currentMedications.map((medication, index) => (
                  <div key={index} className="text-sm text-muted-foreground bg-secondary/50 px-2 py-1 rounded">
                    {medication}
                  </div>
                ))}
              </div>
            </div>
          )}

          {patientInfo.chronicConditions.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm mb-2">Pathologies chroniques</h3>
              <div className="flex flex-wrap gap-1">
                {patientInfo.chronicConditions.map((condition, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {condition}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        {patientInfo.medicalHistory.length > 0 && (
          <div>
            <h3 className="font-semibold text-sm mb-2">Antécédents médicaux</h3>
            <div className="space-y-1">
              {patientInfo.medicalHistory.map((history, index) => (
                <div key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                  <FileText className="w-3 h-3" />
                  {history}
                </div>
              ))}
            </div>
          </div>
        )}

        {patientInfo.lastVisitDate && (
          <div className="pt-2 border-t border-border">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Dernière consultation : {new Date(patientInfo.lastVisitDate).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
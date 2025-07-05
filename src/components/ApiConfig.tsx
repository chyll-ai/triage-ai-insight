import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Settings, Save } from "lucide-react";

interface ApiConfigProps {
  apiEndpoint: string;
  onEndpointChange: (endpoint: string) => void;
}

export function ApiConfig({ apiEndpoint, onEndpointChange }: ApiConfigProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [tempEndpoint, setTempEndpoint] = useState(apiEndpoint);

  const handleSave = () => {
    onEndpointChange(tempEndpoint);
    setIsOpen(false);
  };

  if (!isOpen) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="mb-4"
      >
        <Settings className="w-4 h-4 mr-2" />
        Configure API
      </Button>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-sm">API Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="apiEndpoint">MedGemma API Endpoint</Label>
          <Input
            id="apiEndpoint"
            value={tempEndpoint}
            onChange={(e) => setTempEndpoint(e.target.value)}
            placeholder="https://medgemma-api.my-vm.net/analyze"
          />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} size="sm">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
          <Button variant="outline" onClick={() => setIsOpen(false)} size="sm">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
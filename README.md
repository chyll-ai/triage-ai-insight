# Medical Triage AI System

An advanced AI-powered medical triage system with patient management, priority ranking, and intelligent doctor matching capabilities.

## Features

### 🏥 Medical Triage Analysis
- Upload patient information and medical images for instant AI analysis
- Get triage urgency levels (High, Medium, Low) and suggested actions
- Powered by MedGemma AI for accurate medical image analysis

### 👥 Patient Management System
- **Patient Ranking**: Intelligent priority ranking based on medical urgency
- **Doctor Matching**: Smart matching of patients with appropriate doctors
- **Mortality Prediction**: AI-powered mortality risk assessment using Vertex AI
- **Real-time Management**: Add, remove, and manage multiple patients and doctors

### 🔗 Backend Integration
The system integrates with multiple AI endpoints:

#### Patient Ranking Endpoint
- **POST** `/rank_patients`
- Ranks patients by priority based on medical conditions
- Returns ordered list with priority scores

#### Doctor Matching Endpoint  
- **POST** `/match_doctors`
- Matches patients with appropriate doctors
- Uses round-robin logic for optimal distribution
- Provides justification and matching scores

#### Mortality Prediction (Vertex AI)
- **Endpoint**: Google Vertex AI
- Predicts mortality risk percentage for ICU patients
- Uses advanced AI models for accurate risk assessment

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: React Query
- **AI Integration**: Vertex AI, Custom API endpoints

## Getting Started

### Prerequisites
- Node.js (v18.18.0 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd triage-ai-insight
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:8080`

## Usage

### Home Page
The landing page provides navigation to all system features:
- **Medical Triage Analysis**: Upload and analyze patient data
- **Patient Management**: Manage multiple patients and doctors

### Triage Analysis
1. Fill in patient information (name, age, sex, chief complaint)
2. Enter vital signs (heart rate, blood pressure, oxygen saturation, etc.)
3. Upload medical images (optional)
4. Click "Analyze with MedGemma" to get AI-powered triage assessment

### Patient Management
1. **Add Patients**: Enter patient details (name, age, condition)
2. **Add Doctors**: Add doctor information (name, specialty)
3. **Rank Patients**: Click "Rank Patients" to get priority ordering
4. **Match Doctors**: Click "Match Doctors" to assign patients to doctors
5. **Predict Mortality**: Use "Predict Risk" for individual mortality assessment

## API Endpoints

### Patient Ranking
```json
POST /rank_patients
{
  "patient_ids": ["p_001", "p_002", "p_003"]
}

Response:
{
  "status": "ok",
  "ranked": [
    { "patient_id": "p_001", "rank": 1 },
    { "patient_id": "p_002", "rank": 2 },
    { "patient_id": "p_003", "rank": 3 }
  ]
}
```

### Doctor Matching
```json
POST /match_doctors
{
  "patient_ids": ["p_001", "p_002", "p_003"],
  "doctor_ids": ["d_100", "d_200"]
}

Response:
{
  "status": "ok",
  "matches": [
    {
      "patient_id": "p_001",
      "doctor_id": "d_100",
      "justification": "Mock assignment based on round robin",
      "score": 3
    }
  ]
}
```

### Mortality Prediction (Vertex AI)
```json
POST https://vertex-ai-endpoint
{
  "instances": [{
    "@requestFormat": "chatCompletions",
    "messages": [
      {
        "role": "system",
        "content": [{"type": "text", "text": "You are an expert system..."}]
      },
      {
        "role": "user", 
        "content": [{"type": "text", "text": "Patient description..."}]
      }
    ],
    "max_tokens": 200
  }]
}

Response:
{
  "pourcentage": 75
}
```

## Project Structure

```
src/
├── components/
│   ├── PatientManagement.tsx    # Patient management interface
│   ├── Navigation.tsx           # Main navigation
│   ├── ApiConfig.tsx            # API configuration
│   ├── PatientForm.tsx          # Patient input form
│   ├── VitalsForm.tsx           # Vital signs form
│   ├── ImageUpload.tsx          # Image upload component
│   ├── ResultsDisplay.tsx       # Analysis results display
│   └── ui/                      # shadcn/ui components
├── pages/
│   ├── Index.tsx                # Landing page
│   ├── Triage.tsx               # Triage analysis page
│   ├── PatientManagement.tsx    # Patient management page
│   └── NotFound.tsx             # 404 page
├── lib/
│   ├── api.ts                   # API service functions
│   └── utils.ts                 # Utility functions
├── types/
│   └── triage.ts                # TypeScript interfaces
└── hooks/
    └── use-toast.ts             # Toast notifications
```

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Features
1. Create new components in `src/components/`
2. Add new pages in `src/pages/`
3. Update routing in `src/App.tsx`
4. Add TypeScript interfaces in `src/types/`
5. Implement API calls in `src/lib/api.ts`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please open an issue in the repository.

# Medical Triage AI System

An advanced AI-powered medical triage system with comprehensive patient classification, priority ranking, and intelligent doctor matching capabilities. The system uses MedGemma AI models for accurate medical analysis and decision support.

## Features

### 🏥 Medical Triage Analysis
- Upload patient information and medical images for instant AI analysis
- Get triage urgency levels (Critical, High, Moderate, Low) with detailed reasoning
- Powered by MedGemma AI (27B model) for accurate medical assessment
- Real-time red flag detection and recommended actions
- Comprehensive vital signs analysis and risk assessment

### 👥 Patient Management System
- **Patient Ranking**: Intelligent priority ranking based on medical urgency and multiple criteria
- **Doctor Matching**: Smart matching of patients with appropriate specialists using AI
- **Mortality Prediction**: AI-powered mortality risk assessment using MedGemma (4B model)
- **Real-time Management**: Add, remove, and manage multiple patients and doctors
- **Specialist Assignment**: Automatic detection of specialist requirements (cardiac, pediatric, trauma, surgical)

### 🔗 Backend Integration
The system integrates with multiple AI endpoints and Supabase Edge Functions:

#### MedGemma Triage Analysis (27B Model)
- **Endpoint**: `https://call-vertex-ai-ii7brcvvyq-ez.a.run.app/`
- Analyzes patient data and vital signs for triage assessment
- Returns urgency level, red flags, and recommended actions
- No authentication required

#### Mortality Prediction (4B Model)
- **Endpoint**: `https://us-central1-gemma-hcls25par-714.cloudfunctions.net/call-vertex-ai-4b`
- Predicts mortality risk percentage for patients
- Uses lightweight 4B model for fast predictions
- No authentication required

#### Patient Ranking (Supabase Edge Function)
- **POST** `/rank_patients`
- Ranks patients by priority using comprehensive scoring algorithm
- Considers triage level, severity score, age, wait time, and specialist needs
- Returns ordered list with priority scores

#### Doctor Matching (Supabase Edge Function)
- **POST** `/match_doctors`
- Matches patients with appropriate specialists using AI scoring
- Considers specialty requirements, experience, workload, and age-specific needs
- Provides justification and matching scores

## Technology Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI Components**: shadcn/ui, Tailwind CSS
- **Routing**: React Router DOM
- **State Management**: React Query
- **AI Integration**: MedGemma AI (27B & 4B models), Supabase Edge Functions
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Deployment**: Supabase Functions, Vercel/Netlify

## 🏥 Patient Classification System

### Triage Urgency Levels
The system classifies patients into 4 urgency levels:

- **Critical** - Immediate life-threatening conditions requiring immediate intervention
- **High** - Serious conditions requiring prompt attention within 10-15 minutes
- **Moderate** - Stable conditions needing medical attention within 30-60 minutes
- **Low** - Minor conditions that can wait for routine care

### AI Triage Analysis Rules
The MedGemma AI uses evidence-based clinical rules:

```typescript
Clinical Rules:
- If signs of infection + fever + low oxygen → suggest sepsis evaluation
- If burns cover large area or involve blisters/necrosis → flag as critical
- If GCS < 13 or active bleeding → flag as high or critical
- If stable vitals + superficial lesion → flag as low
```

### Patient Priority Scoring Algorithm
Patients are ranked using a comprehensive scoring system:

```typescript
Priority Score = 
  (6 - triage_level) × 30 +           // Triage level weight
  severity_score × 10 +               // Severity score weight
  immediate_attention_bonus +         // 50 points if immediate attention needed
  age_factor +                        // 15 points for pediatric/elderly
  wait_time_factor                    // Up to 20 points for waiting time
```

### Database Classification Fields

#### Core Classification
- **`triage_level`** (1-5): 1 = highest priority, 5 = lowest
- **`severity_score`** (1-10): Higher score = more severe condition
- **`requires_immediate_attention`** (boolean): Critical flag for urgent cases
- **`condition_category`**: cardiac, respiratory, trauma, neurological, pediatric, surgical, psychiatric, infectious, other

#### Specialist Requirements
- **`requires_cardiac_specialist`** (boolean): Heart-related conditions
- **`requires_pediatric_care`** (boolean): Patients under 18 years
- **`requires_trauma_specialist`** (boolean): Trauma/injury cases
- **`requires_surgery`** (boolean): Surgical intervention needed
- **`requires_specialist`** (boolean): General specialist consultation

#### Vital Signs Thresholds
- **Heart Rate**: 0-300 bpm
- **Blood Pressure**: Systolic 0-300, Diastolic 0-200 mmHg
- **Temperature**: 30-50°C
- **Oxygen Saturation**: 50-100%
- **Glasgow Coma Scale**: 3-15

### Doctor Matching Criteria
The system matches patients to doctors using a sophisticated scoring algorithm:

```typescript
Matching Score =
  specialty_match_bonus +             // 40 points for exact specialty match
  experience_factor +                 // Years of experience for complex cases
  emergency_rating_bonus +            // Emergency response rating for urgent cases
  workload_balance_factor +           // Prefer doctors with lower current load
  age_specific_care_bonus            // Pediatric/geriatric expertise
```

### Visual Classification Indicators
The UI uses color-coded badges for quick identification:
- **🔴 Red (destructive)**: Critical/High urgency, Severity 8-10, Triage Level 1
- **🔵 Blue (default)**: Moderate urgency, Severity 6-7, Triage Level 2
- **⚪ Gray (secondary)**: Low urgency, Severity 1-5, Triage Level 3-5

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

### MedGemma Triage Analysis
```json
POST https://call-vertex-ai-ii7brcvvyq-ez.a.run.app/
{
  "contents": [{
    "role": "user",
    "parts": [{
      "text": "Patient data and clinical rules..."
    }]
  }],
  "generationConfig": {
    "maxOutputTokens": 1000,
    "temperature": 0.1,
    "responseMimeType": "application/json"
  }
}

Response:
{
  "summary": "Clinical summary of findings",
  "urgency_level": "critical|high|moderate|low",
  "red_flags": ["list of critical findings"],
  "recommended_actions": ["list of next steps"]
}
```

### Mortality Prediction (MedGemma 4B)
```json
POST https://us-central1-gemma-hcls25par-714.cloudfunctions.net/call-vertex-ai-4b
{
  "contents": [{
    "role": "user",
    "parts": [{
      "text": "Patient description for mortality assessment..."
    }]
  }],
  "generationConfig": {
    "maxOutputTokens": 200,
    "temperature": 0.1
  }
}

Response:
{
  "percentage": 75
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

## Deployment & Configuration

### Supabase Setup
1. Create a new Supabase project
2. Run database migrations:
   ```bash
   supabase db push
   ```
3. Deploy Edge Functions:
   ```bash
   supabase functions deploy medgemma-triage
   supabase functions deploy mortality-prediction
   supabase functions deploy rank-patients
   supabase functions deploy match-doctors
   ```

### Environment Variables
Create a `.env.local` file with your Supabase credentials:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### AI Endpoints Configuration
The system uses pre-configured MedGemma endpoints:
- **Triage Analysis**: `https://call-vertex-ai-ii7brcvvyq-ez.a.run.app/` (27B model)
- **Mortality Prediction**: `https://us-central1-gemma-hcls25par-714.cloudfunctions.net/call-vertex-ai-4b` (4B model)

No additional authentication is required for these endpoints.

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run build:dev` - Build for development
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Features
1. Create new components in `src/components/`
2. Add new pages in `src/pages/`
3. Update routing in `src/App.tsx`
4. Add TypeScript interfaces in `src/types/`
5. Implement API calls in `src/lib/api.ts`
6. Add database migrations in `supabase/migrations/`

### Database Schema
The system uses a comprehensive patient management schema with:
- **Patients table**: Core patient data, vitals, classification fields
- **Doctors table**: Doctor information, specialties, availability
- **Medical Specialties table**: Available medical specialties
- **Patient Assignments table**: Historical patient-doctor assignments
- **Matching Criteria Weights table**: Configurable matching algorithm weights

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

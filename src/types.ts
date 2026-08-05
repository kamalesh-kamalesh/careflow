export type UserRole = 'patient' | 'doctor' | 'caregiver';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  bloodType: string;
  allergies: string[];
  conditions: string[];
  caregiverId: string | null;
  doctorId: string;
  lastVisit: string;
  phone: string;
  email: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
  vitals: {
    bloodPressure: string;
    heartRate: number;
    glucose: number;
    weight: string;
    oxygenLevel: number;
    lastUpdated: string;
  };
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  qualification?: string;
  hospital: string;
  availability: string;
  experience: string;
  rating: number;
  patientsCount: number;
  patients: string[];
  avatarUrl?: string;
  currentQueueCount: number;
  avgConsultationTimeMins: number;
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  type: 'Follow-up' | 'Consultation' | 'Routine Checkup' | 'Emergency' | 'Lab Review';
  priority?: 'Standard' | 'Urgent' | 'High Risk';
  notes?: string;
  doctorNotes?: string;
  prescriptionsIssued?: string[];
  estimatedWaitMins?: number;
  queuePosition?: number;
}

export interface Medicine {
  id: string;
  patientId: string;
  name: string;
  dosage: string;
  frequency: string;
  timeOfDay: ('Morning' | 'Afternoon' | 'Evening' | 'PRN')[];
  instructions: string;
  refillRemaining: number;
  prescribedBy: string; // Doctor name or ID
  // Adherence tracking for last 7 days (index 0 = 6 days ago, index 6 = Today)
  adherenceHistory: boolean[];
  takenToday: {
    Morning?: boolean;
    Afternoon?: boolean;
    Evening?: boolean;
    PRN?: boolean;
  };
}

export interface Caregiver {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  email: string;
  patientIds: string[];
}

export interface HealthAlert {
  id: string;
  patientId: string;
  patientName: string;
  type: 'missed_medication' | 'abnormal_vitals' | 'appointment_reminder' | 'refill_needed' | 'urgent_symptom';
  title: string;
  description: string;
  timestamp: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  resolved: boolean;
  actionTaken?: string;
}

export interface ChatBookingData {
  step: 'assessment' | 'doctor_list' | 'confirmation' | 'confirmed';
  specialty?: string;
  severity?: 'Mild' | 'Moderate' | 'Severe' | 'Urgent';
  doctors?: {
    doctor: Doctor;
    hospitalName: string;
    location: string;
    distance: string;
    fee: string;
    rating: number;
    availableSlots: string[];
  }[];
  pendingBooking?: {
    doctor: Doctor;
    hospitalName: string;
    date: string;
    time: string;
  };
  confirmedAppointment?: Appointment;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  source?: string;
  disclaimer?: string;
  bookingData?: ChatBookingData;
}

export interface ReportAnalysis {
  summary: string;
  keyFindings: string[];
  plainEnglishExplanation: string;
  recommendations: string[];
  abnormalValues?: string[];
  disclaimer?: string;
}

export interface Hospital {
  id: string;
  name: string;
  keySpecialties: string[];
  location: string;
  phone?: string;
  emergency24x7?: boolean;
  rating?: number;
}

export interface Symptom {
  id: string;
  name: string;
  onset?: string;
  severity: 'mild' | 'moderate' | 'severe';
  duration?: string;
}

export interface PossibleCondition {
  name: string;
  explanation: string;
  probability: number; // e.g., 0.85
}

export interface SymptomAssessmentRequest {
  patientId?: string;
  age?: number;
  gender?: string;
  symptoms: Symptom[];
  medicalHistory?: string[];
}

export interface DoctorRecommendationResponse {
  hospitalId: string;
  hospitalName: string;
  doctorId: string;
  doctorName: string;
  specialization: string;
  rating: number;
  distance?: string;
  availableSlots: string[];
  reason: string;
}

export interface SymptomAssessmentResponse {
  possibleConditions: PossibleCondition[];
  riskLevel: 'Low' | 'Moderate' | 'High';
  emergencyFlag: boolean;
  aiSummary: string;
  homeCare: string[];
  recommendedDoctors?: DoctorRecommendationResponse[];
  recommendedHospitals?: Hospital[];
}

export interface AppointmentRequest {
  patientId: string;
  hospitalId?: string;
  doctorId: string;
  date: string;
  time: string;
  reason?: string;
  type?: string;
}

export interface AppointmentResponse {
  appointmentId: string;
  status: 'scheduled' | 'confirmed' | 'rejected';
  message: string;
}

export interface CurrentUser {
  id: string;
  name: string;
  role: UserRole;
  email?: string;
  avatar?: string;
  title?: string;
}

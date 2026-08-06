import { Patient, Doctor, Appointment, Medicine, Caregiver, HealthAlert } from '../types';
import { ALL_DOCTORS } from './hospitalsData';

export const getTodayDateString = (offsetDays = 0): string => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return d.toISOString().split('T')[0];
};

export const seedPatients: Patient[] = [
  {
    id: 'p1',
    name: 'Jane Doe',
    age: 45,
    gender: 'Female',
    bloodType: 'A+',
    allergies: ['Penicillin', 'Sulfa Drugs'],
    conditions: ['Hypertension', 'Type 2 Diabetes'],
    caregiverId: 'c1',
    doctorId: 'd1',
    lastVisit: getTodayDateString(-14),
    phone: '+1 (555) 234-5678',
    email: 'jane.doe@example.com',
    emergencyContact: {
      name: 'Sarah Johnson',
      relationship: 'Daughter',
      phone: '+1 (555) 987-6543'
    },
    vitals: {
      bloodPressure: '132/85 mmHg',
      heartRate: 74,
      glucose: 118,
      weight: '68 kg',
      oxygenLevel: 98,
      lastUpdated: 'Today at 08:30 AM'
    }
  },
  {
    id: 'p2',
    name: 'John Smith',
    age: 68,
    gender: 'Male',
    bloodType: 'O-',
    allergies: ['Codeine'],
    conditions: ['Atrial Fibrillation', 'COPD', 'Hypertension'],
    caregiverId: 'c2',
    doctorId: 'd2',
    lastVisit: getTodayDateString(-5),
    phone: '+1 (555) 345-6789',
    email: 'john.smith@example.com',
    emergencyContact: {
      name: 'Robert Smith',
      relationship: 'Son',
      phone: '+1 (555) 876-5432'
    },
    vitals: {
      bloodPressure: '142/90 mmHg',
      heartRate: 82,
      glucose: 135,
      weight: '79 kg',
      oxygenLevel: 94,
      lastUpdated: 'Today at 09:15 AM'
    }
  },
  {
    id: 'p3',
    name: 'Maria Rodriguez',
    age: 32,
    gender: 'Female',
    bloodType: 'B+',
    allergies: ['Latex'],
    conditions: ['Asthma', 'Mild Anxiety'],
    caregiverId: null,
    doctorId: 'd1',
    lastVisit: getTodayDateString(-20),
    phone: '+1 (555) 456-7890',
    email: 'maria.r@example.com',
    emergencyContact: {
      name: 'Carlos Rodriguez',
      relationship: 'Spouse',
      phone: '+1 (555) 765-4321'
    },
    vitals: {
      bloodPressure: '118/76 mmHg',
      heartRate: 68,
      glucose: 92,
      weight: '58 kg',
      oxygenLevel: 99,
      lastUpdated: 'Yesterday'
    }
  }
];

export const seedDoctors: Doctor[] = [
  {
    id: 'd1',
    name: 'Dr. Sarah Chen',
    specialty: 'Cardiology & Internal Medicine',
    hospital: 'St. Jude Heart & Vascular Center',
    availability: 'Mon - Fri (09:00 AM - 05:00 PM)',
    experience: '14 Years',
    rating: 4.9,
    patientsCount: 142,
    patients: ['p1', 'p3'],
    currentQueueCount: 3,
    avgConsultationTimeMins: 15
  },
  {
    id: 'd2',
    name: 'Dr. Michael Rodriguez',
    specialty: 'Pulmonology & Respiratory Care',
    hospital: 'Metropolitan General Hospital',
    availability: 'Tue - Sat (10:00 AM - 06:00 PM)',
    experience: '18 Years',
    rating: 4.8,
    patientsCount: 180,
    patients: ['p2'],
    currentQueueCount: 5,
    avgConsultationTimeMins: 20
  },
  {
    id: 'd3',
    name: 'Dr. Amara Patel',
    specialty: 'Endocrinology & Diabetes Care',
    hospital: 'City Health Medical Hub',
    availability: 'Mon, Wed, Fri (08:30 AM - 04:30 PM)',
    experience: '11 Years',
    rating: 4.95,
    patientsCount: 115,
    patients: [],
    currentQueueCount: 2,
    avgConsultationTimeMins: 15
  },
  ...ALL_DOCTORS
];

export const seedAppointments: Appointment[] = [
  {
    id: 'a1',
    patientId: 'p1',
    doctorId: 'd1',
    date: getTodayDateString(0),
    time: '10:00 AM',
    status: 'scheduled',
    type: 'Follow-up',
    priority: 'Standard',
    notes: 'Routine blood pressure review & dosage check.',
    estimatedWaitMins: 15,
    queuePosition: 2
  },
  {
    id: 'a2',
    patientId: 'p2',
    doctorId: 'd2',
    date: getTodayDateString(0),
    time: '11:30 AM',
    status: 'in-progress',
    type: 'Consultation',
    priority: 'Urgent',
    notes: 'Review spirometry results and breathlessness symptoms.',
    estimatedWaitMins: 5,
    queuePosition: 1
  },
  {
    id: 'a3',
    patientId: 'p3',
    doctorId: 'd1',
    date: getTodayDateString(2),
    time: '02:00 PM',
    status: 'scheduled',
    type: 'Routine Checkup',
    priority: 'Standard',
    notes: 'Asthma inhaler refill evaluation.',
    estimatedWaitMins: 20,
    queuePosition: 4
  },
  {
    id: 'a4',
    patientId: 'p1',
    doctorId: 'd3',
    date: getTodayDateString(5),
    time: '09:30 AM',
    status: 'scheduled',
    type: 'Lab Review',
    priority: 'Standard',
    notes: 'HbA1c quarterly diabetes panel review.',
    estimatedWaitMins: 10,
    queuePosition: 1
  },
  {
    id: 'a5',
    patientId: 'p2',
    doctorId: 'd1',
    date: getTodayDateString(-7),
    time: '03:15 PM',
    status: 'completed',
    type: 'Emergency',
    priority: 'High Risk',
    notes: 'Arrhythmia episode review. Adjusted Warfarin dosage.',
    doctorNotes: 'EKG showed sinus rhythm. Patient counselled on dietary Vitamin K restrictions.'
  }
];

export const seedMedicines: Medicine[] = [
  {
    id: 'm1',
    patientId: 'p1',
    name: 'Lisinopril',
    dosage: '10 mg',
    frequency: 'Once daily',
    timeOfDay: ['Morning'],
    instructions: 'Take in the morning with food. Monitor blood pressure.',
    refillRemaining: 2,
    prescribedBy: 'Dr. Sarah Chen',
    adherenceHistory: [true, true, false, true, true, true, true],
    takenToday: { Morning: true }
  },
  {
    id: 'm2',
    patientId: 'p1',
    name: 'Metformin',
    dosage: '500 mg',
    frequency: 'Twice daily',
    timeOfDay: ['Morning', 'Evening'],
    instructions: 'Take after meals to reduce stomach upset.',
    refillRemaining: 1,
    prescribedBy: 'Dr. Amara Patel',
    adherenceHistory: [true, true, true, false, true, true, false],
    takenToday: { Morning: true, Evening: false }
  },
  {
    id: 'm3',
    patientId: 'p2',
    name: 'Warfarin',
    dosage: '5 mg',
    frequency: 'Once daily',
    timeOfDay: ['Evening'],
    instructions: 'Take at the exact same time every evening. Regular INR blood tests required.',
    refillRemaining: 3,
    prescribedBy: 'Dr. Sarah Chen',
    adherenceHistory: [true, false, true, true, true, false, true],
    takenToday: { Evening: false }
  },
  {
    id: 'm4',
    patientId: 'p2',
    name: 'Spiriva Respimat (Tiotropium)',
    dosage: '2.5 mcg',
    frequency: 'Once daily',
    timeOfDay: ['Morning'],
    instructions: 'Inhale 2 puffs once daily. Rinse mouth after use.',
    refillRemaining: 0,
    prescribedBy: 'Dr. Michael Rodriguez',
    adherenceHistory: [true, true, true, true, true, true, true],
    takenToday: { Morning: true }
  },
  {
    id: 'm5',
    patientId: 'p3',
    name: 'Albuterol Sulfate Inhaler',
    dosage: '90 mcg/actuation',
    frequency: 'As needed (PRN)',
    timeOfDay: ['PRN'],
    instructions: '1 to 2 inhalations every 4 to 6 hours as needed for shortness of breath.',
    refillRemaining: 4,
    prescribedBy: 'Dr. Sarah Chen',
    adherenceHistory: [true, true, true, true, true, true, true],
    takenToday: { PRN: true }
  }
];

export const seedCaregivers: Caregiver[] = [
  {
    id: 'c1',
    name: 'Sarah Johnson',
    relationship: 'Daughter & Primary Caregiver',
    phone: '+1 (555) 987-6543',
    email: 'sarah.j@example.com',
    patientIds: ['p1']
  },
  {
    id: 'c2',
    name: 'Robert Smith',
    relationship: 'Son & Medical Proxy',
    phone: '+1 (555) 876-5432',
    email: 'robert.s@example.com',
    patientIds: ['p2']
  }
];

export const seedAlerts: HealthAlert[] = [
  {
    id: 'alt1',
    patientId: 'p1',
    patientName: 'Jane Doe',
    type: 'missed_medication',
    title: 'Missed Evening Medication',
    description: 'Jane Doe did not log Metformin 500mg (Evening dose) yesterday.',
    timestamp: 'Yesterday at 09:30 PM',
    severity: 'medium',
    resolved: false
  },
  {
    id: 'alt2',
    patientId: 'p2',
    patientName: 'John Smith',
    type: 'abnormal_vitals',
    title: 'Elevated Blood Pressure Alert',
    description: 'Blood pressure recorded at 142/90 mmHg. Exceeds target baseline threshold.',
    timestamp: 'Today at 09:15 AM',
    severity: 'high',
    resolved: false
  },
  {
    id: 'alt3',
    patientId: 'p2',
    patientName: 'John Smith',
    type: 'refill_needed',
    title: 'Prescription Refill Warning',
    description: 'Spiriva Respimat has 0 refills remaining. Request renewal with Dr. Rodriguez.',
    timestamp: 'Today at 08:00 AM',
    severity: 'high',
    resolved: false
  },
  {
    id: 'alt4',
    patientId: 'p1',
    patientName: 'Jane Doe',
    type: 'appointment_reminder',
    title: 'Upcoming Appointment Today',
    description: 'Scheduled with Dr. Sarah Chen today at 10:00 AM.',
    timestamp: 'Today at 07:00 AM',
    severity: 'low',
    resolved: true,
    actionTaken: 'Confirmed by patient'
  }
];

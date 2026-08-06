import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Patient,
  Doctor,
  Appointment,
  Medicine,
  Caregiver,
  HealthAlert,
  CurrentUser,
  UserRole
} from '../types';
import {
  seedPatients,
  seedDoctors,
  seedAppointments,
  seedMedicines,
  seedCaregivers,
  seedAlerts
} from '../data/seedData';

export interface OfflineAction {
  id: string;
  actionType: string;
  payload: any;
  timestamp: number;
}

interface AppContextType {
  currentUser: CurrentUser | null;
  activeRole: UserRole;
  patients: Patient[];
  doctors: Doctor[];
  appointments: Appointment[];
  medicines: Medicine[];
  caregivers: Caregiver[];
  alerts: HealthAlert[];
  voiceGuidanceEnabled: boolean;
  setVoiceGuidanceEnabled: (enabled: boolean) => void;
  speak: (text: string) => void;
  switchRole: (role: UserRole, targetId?: string) => void;
  bookAppointment: (newApp: Omit<Appointment, 'id' | 'status'>) => Promise<Appointment>;
  updateAppointmentStatus: (id: string, status: Appointment['status'], doctorNotes?: string) => void;
  toggleMedicationDose: (medId: string, timeOfDay: 'Morning' | 'Afternoon' | 'Evening' | 'PRN') => void;
  addPrescription: (patientId: string, name: string, dosage: string, frequency: string, timeOfDay: ('Morning' | 'Afternoon' | 'Evening' | 'PRN')[], instructions: string) => void;
  resolveAlert: (alertId: string, actionNote?: string) => void;
  updatePatientVitals: (patientId: string, vitals: Partial<Patient['vitals']>) => void;
  refillRequest: (medId: string) => void;
  getActivePatient: () => Patient | undefined;
  getActiveDoctor: () => Doctor | undefined;
  getActiveCaregiver: () => Caregiver | undefined;
  registerNewPatient: (patientData: Partial<Patient>) => Patient;
  toastMessage: string | null;
  setToastMessage: (msg: string | null) => void;

  // Location / District selection state
  selectedDistrict: string;
  setSelectedDistrict: (district: string) => void;

  // Offline Caching & Synchronization extensions
  isOffline: boolean;
  simulatedOffline: boolean;
  setSimulatedOffline: (val: boolean) => void;
  lastCacheSyncedAt: number;
  pendingOfflineQueue: OfflineAction[];
  syncOfflineQueue: () => void;
  clearAndResetCache: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Offline network detection state
  const [isOffline, setIsOffline] = useState<boolean>(!navigator.onLine);
  const [simulatedOffline, setSimulatedOffline] = useState<boolean>(false);
  const [lastCacheSyncedAt, setLastCacheSyncedAt] = useState<number>(() => {
    const saved = localStorage.getItem('careflow_last_synced');
    return saved ? parseInt(saved, 10) : Date.now();
  });

  const [pendingOfflineQueue, setPendingOfflineQueue] = useState<OfflineAction[]>(() => {
    const saved = localStorage.getItem('careflow_pending_queue');
    return saved ? JSON.parse(saved) : [];
  });

  // Patient & Clinical Datasets loaded from LocalStorage or Seeded
  const [patients, setPatients] = useState<Patient[]>(() => {
    const saved = localStorage.getItem('careflow_patients');
    return saved ? JSON.parse(saved) : seedPatients;
  });

  const [doctors, setDoctors] = useState<Doctor[]>(() => {
    const saved = localStorage.getItem('careflow_doctors');
    if (!saved) return seedDoctors;
    try {
      const parsed: Doctor[] = JSON.parse(saved);
      const existingIds = new Set(parsed.map(d => d.id));
      const missing = seedDoctors.filter(d => !existingIds.has(d.id));
      return missing.length > 0 ? [...parsed, ...missing] : parsed;
    } catch {
      return seedDoctors;
    }
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('careflow_appointments');
    return saved ? JSON.parse(saved) : seedAppointments;
  });

  const [medicines, setMedicines] = useState<Medicine[]>(() => {
    const saved = localStorage.getItem('careflow_medicines');
    return saved ? JSON.parse(saved) : seedMedicines;
  });

  const [caregivers, setCaregivers] = useState<Caregiver[]>(() => {
    const saved = localStorage.getItem('careflow_caregivers');
    return saved ? JSON.parse(saved) : seedCaregivers;
  });

  const [alerts, setAlerts] = useState<HealthAlert[]>(() => {
    const saved = localStorage.getItem('careflow_alerts');
    return saved ? JSON.parse(saved) : seedAlerts;
  });

  const [activeRole, setActiveRole] = useState<UserRole>('patient');
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>({
    id: seedPatients[0].id,
    name: seedPatients[0].name,
    role: 'patient',
    email: seedPatients[0].email,
    title: 'Patient'
  });

  const [voiceGuidanceEnabled, setVoiceGuidanceEnabled] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // District / Location State
  const [selectedDistrict, setSelectedDistrictState] = useState<string>(() => {
    return localStorage.getItem('careflow_selected_district') || 'Erode';
  });

  const setSelectedDistrict = (district: string) => {
    setSelectedDistrictState(district);
    localStorage.setItem('careflow_selected_district', district);
    setToastMessage(`Location set to ${district} District`);
  };

  // Sync window online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      showToast('Network connection restored. Syncing offline cache...');
    };
    const handleOffline = () => {
      setIsOffline(true);
      showToast('You are offline. Offline cache mode active.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync state changes to LocalStorage and update cache timestamp
  useEffect(() => {
    localStorage.setItem('careflow_patients', JSON.stringify(patients));
    localStorage.setItem('careflow_doctors', JSON.stringify(doctors));
    localStorage.setItem('careflow_appointments', JSON.stringify(appointments));
    localStorage.setItem('careflow_medicines', JSON.stringify(medicines));
    localStorage.setItem('careflow_caregivers', JSON.stringify(caregivers));
    localStorage.setItem('careflow_alerts', JSON.stringify(alerts));
    
    const now = Date.now();
    localStorage.setItem('careflow_last_synced', now.toString());
    setLastCacheSyncedAt(now);
  }, [patients, doctors, appointments, medicines, caregivers, alerts]);

  // Sync pending offline queue to LocalStorage
  useEffect(() => {
    localStorage.setItem('careflow_pending_queue', JSON.stringify(pendingOfflineQueue));
  }, [pendingOfflineQueue]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const speak = (text: string) => {
    if (!voiceGuidanceEnabled || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  const enqueueOfflineAction = (actionType: string, payload: any) => {
    if (isOffline || simulatedOffline) {
      const newAction: OfflineAction = {
        id: `off_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        actionType,
        payload,
        timestamp: Date.now()
      };
      setPendingOfflineQueue(prev => [...prev, newAction]);
    }
  };

  const syncOfflineQueue = () => {
    if (pendingOfflineQueue.length === 0) return;
    const count = pendingOfflineQueue.length;
    setPendingOfflineQueue([]);
    showToast(`Successfully synced ${count} offline clinical action(s) with server!`);
    speak(`Synced ${count} pending offline operations.`);
  };

  const clearAndResetCache = () => {
    localStorage.removeItem('careflow_patients');
    localStorage.removeItem('careflow_doctors');
    localStorage.removeItem('careflow_appointments');
    localStorage.removeItem('careflow_medicines');
    localStorage.removeItem('careflow_caregivers');
    localStorage.removeItem('careflow_alerts');
    localStorage.removeItem('careflow_pending_queue');

    setPatients(seedPatients);
    setDoctors(seedDoctors);
    setAppointments(seedAppointments);
    setMedicines(seedMedicines);
    setCaregivers(seedCaregivers);
    setAlerts(seedAlerts);
    setPendingOfflineQueue([]);
    showToast('Offline cache reset to default clinical baseline.');
    speak('Local storage cache reset.');
  };

  const switchRole = (role: UserRole, targetId?: string) => {
    setActiveRole(role);
    if (role === 'patient') {
      const p = patients.find(item => item.id === targetId) || patients[0];
      setCurrentUser({
        id: p.id,
        name: p.name,
        role: 'patient',
        email: p.email,
        title: 'Patient'
      });
      speak(`Switched to Patient view for ${p.name}`);
    } else if (role === 'doctor') {
      const d = doctors.find(item => item.id === targetId) || doctors[0];
      setCurrentUser({
        id: d.id,
        name: d.name,
        role: 'doctor',
        title: d.specialty
      });
      speak(`Switched to Doctor Portal for ${d.name}`);
    } else if (role === 'caregiver') {
      const c = caregivers.find(item => item.id === targetId) || caregivers[0];
      setCurrentUser({
        id: c.id,
        name: c.name,
        role: 'caregiver',
        email: c.email,
        title: c.relationship
      });
      speak(`Switched to Caregiver Dashboard for ${c.name}`);
    }
  };

  const bookAppointment = async (newApp: Omit<Appointment, 'id' | 'status'>): Promise<Appointment> => {
    const doc = doctors.find(d => d.id === newApp.doctorId);
    const docQueueCount = appointments.filter(a => a.doctorId === newApp.doctorId && a.date === newApp.date && a.status === 'scheduled').length;
    
    const created: Appointment = {
      ...newApp,
      id: `app_${Date.now()}`,
      status: 'scheduled',
      estimatedWaitMins: (docQueueCount + 1) * (doc?.avgConsultationTimeMins || 15),
      queuePosition: docQueueCount + 1
    };

    setAppointments(prev => [created, ...prev]);
    enqueueOfflineAction('BOOK_APPOINTMENT', created);

    const isOff = isOffline || simulatedOffline;
    showToast(`Appointment booked with ${doc?.name || 'Doctor'} on ${created.date}! ${isOff ? '(Cached Offline)' : ''}`);
    speak(`Appointment successfully booked for ${created.date}.`);
    return created;
  };

  const updateAppointmentStatus = (id: string, status: Appointment['status'], doctorNotes?: string) => {
    setAppointments(prev =>
      prev.map(app => (app.id === id ? { ...app, status, ...(doctorNotes ? { doctorNotes } : {}) } : app))
    );
    enqueueOfflineAction('UPDATE_APPOINTMENT_STATUS', { id, status, doctorNotes });
    const isOff = isOffline || simulatedOffline;
    showToast(`Appointment status updated to ${status}. ${isOff ? '(Cached Offline)' : ''}`);
    speak(`Appointment status updated to ${status}.`);
  };

  const toggleMedicationDose = (medId: string, timeOfDay: 'Morning' | 'Afternoon' | 'Evening' | 'PRN') => {
    setMedicines(prev =>
      prev.map(med => {
        if (med.id !== medId) return med;
        const currentVal = med.takenToday[timeOfDay] || false;
        const updatedTakenToday = {
          ...med.takenToday,
          [timeOfDay]: !currentVal
        };

        const allDoses = med.timeOfDay;
        const takenCount = allDoses.filter(t => updatedTakenToday[t]).length;
        const isFullyTaken = takenCount >= allDoses.length;

        const updatedHistory = [...med.adherenceHistory];
        updatedHistory[updatedHistory.length - 1] = isFullyTaken;

        return {
          ...med,
          takenToday: updatedTakenToday,
          adherenceHistory: updatedHistory
        };
      })
    );
    enqueueOfflineAction('TOGGLE_MEDICATION_DOSE', { medId, timeOfDay });
    const isOff = isOffline || simulatedOffline;
    if (isOff) showToast('Medication dose recorded in offline cache.');
    speak(`Updated dosage status for medication.`);
  };

  const addPrescription = (
    patientId: string,
    name: string,
    dosage: string,
    frequency: string,
    timeOfDay: ('Morning' | 'Afternoon' | 'Evening' | 'PRN')[],
    instructions: string
  ) => {
    const docName = currentUser?.name || 'Dr. Sarah Chen';
    const newMed: Medicine = {
      id: `m_${Date.now()}`,
      patientId,
      name,
      dosage,
      frequency,
      timeOfDay,
      instructions,
      refillRemaining: 3,
      prescribedBy: docName,
      adherenceHistory: [true, true, true, true, true, true, false],
      takenToday: {}
    };

    setMedicines(prev => [newMed, ...prev]);
    enqueueOfflineAction('ADD_PRESCRIPTION', newMed);
    const isOff = isOffline || simulatedOffline;
    showToast(`New prescription ${name} saved! ${isOff ? '(Cached Offline)' : ''}`);
    speak(`Prescribed ${name} ${dosage} for patient.`);
  };

  const resolveAlert = (alertId: string, actionNote?: string) => {
    setAlerts(prev =>
      prev.map(alt =>
        alt.id === alertId
          ? { ...alt, resolved: true, actionTaken: actionNote || 'Acknowledged by Caregiver' }
          : alt
      )
    );
    enqueueOfflineAction('RESOLVE_ALERT', { alertId, actionNote });
    showToast('Alert resolved.');
    speak('Health alert resolved.');
  };

  const updatePatientVitals = (patientId: string, vitals: Partial<Patient['vitals']>) => {
    setPatients(prev =>
      prev.map(p =>
        p.id === patientId
          ? {
              ...p,
              vitals: {
                ...p.vitals,
                ...vitals,
                lastUpdated: 'Just now'
              }
            }
          : p
      )
    );
    enqueueOfflineAction('UPDATE_PATIENT_VITALS', { patientId, vitals });
    showToast('Patient vitals recorded successfully.');
  };

  const refillRequest = (medId: string) => {
    setMedicines(prev =>
      prev.map(med => {
        if (med.id === medId) {
          return { ...med, refillRemaining: med.refillRemaining + 1 };
        }
        return med;
      })
    );
    enqueueOfflineAction('REFILL_REQUEST', { medId });
    showToast('Refill request submitted.');
    speak('Refill request submitted.');
  };

  const getActivePatient = (): Patient | undefined => {
    if (activeRole === 'patient') {
      return patients.find(p => p.id === currentUser?.id) || patients[0];
    }
    return patients[0];
  };

  const getActiveDoctor = (): Doctor | undefined => {
    if (activeRole === 'doctor') {
      return doctors.find(d => d.id === currentUser?.id) || doctors[0];
    }
    return doctors[0];
  };

  const getActiveCaregiver = (): Caregiver | undefined => {
    if (activeRole === 'caregiver') {
      return caregivers.find(c => c.id === currentUser?.id) || caregivers[0];
    }
    return caregivers[0];
  };

  const registerNewPatient = (newPatientData: Partial<Patient>): Patient => {
    const id = 'p_' + Date.now();
    const newPatient: Patient = {
      id,
      name: newPatientData.name || 'New Patient',
      age: newPatientData.age || 30,
      gender: newPatientData.gender || 'Other',
      bloodType: newPatientData.bloodGroup || newPatientData.bloodType || 'O+',
      bloodGroup: newPatientData.bloodGroup || 'O+',
      phone: newPatientData.phone || '',
      email: newPatientData.email || '',
      district: newPatientData.district || selectedDistrict || 'Erode',
      location: newPatientData.location || '',
      conditions: newPatientData.conditions || [],
      allergies: newPatientData.allergies || [],
      hasCurrentMedications: newPatientData.hasCurrentMedications || 'No',
      currentMedicationsList: newPatientData.currentMedicationsList || '',
      otherConditionDetails: newPatientData.otherConditionDetails || '',
      otherAllergyDetails: newPatientData.otherAllergyDetails || '',
      consentDataStorage: newPatientData.consentDataStorage ?? true,
      emergencyContact: newPatientData.emergencyContact || {
        name: '',
        relationship: 'Emergency Contact',
        phone: ''
      },
      vitals: {
        bloodPressure: '120/80',
        heartRate: 72,
        spO2: 98,
        oxygenLevel: 98,
        temperature: 98.6,
        bloodSugar: 100,
        glucose: 100,
        lastUpdated: 'Just now'
      },
      doctorId: 'doc1',
      caregiverId: null,
      lastVisit: 'Just now'
    };

    setPatients(prev => {
      const updated = [newPatient, ...prev];
      localStorage.setItem('careflow_patients', JSON.stringify(updated));
      return updated;
    });

    setCurrentUser({ id: newPatient.id, role: 'patient', name: newPatient.name });
    setActiveRole('patient');
    localStorage.setItem('careflow_user', JSON.stringify({ id: newPatient.id, role: 'patient', name: newPatient.name }));
    showToast(`Welcome ${newPatient.name}! Health intake profile created successfully.`);
    speak(`Welcome to CareFlow AI, ${newPatient.name}`);
    return newPatient;
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        activeRole,
        patients,
        doctors,
        appointments,
        medicines,
        caregivers,
        alerts,
        voiceGuidanceEnabled,
        setVoiceGuidanceEnabled,
        speak,
        switchRole,
        bookAppointment,
        updateAppointmentStatus,
        toggleMedicationDose,
        addPrescription,
        resolveAlert,
        updatePatientVitals,
        refillRequest,
        getActivePatient,
        getActiveDoctor,
        getActiveCaregiver,
        registerNewPatient,
        toastMessage,
        setToastMessage,
        selectedDistrict,
        setSelectedDistrict,

        // Offline Caching & Sync Context exports
        isOffline,
        simulatedOffline,
        setSimulatedOffline,
        lastCacheSyncedAt,
        pendingOfflineQueue,
        syncOfflineQueue,
        clearAndResetCache
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

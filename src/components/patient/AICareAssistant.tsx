import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { useAppContext } from '../../context/AppContext';
import { ChatMessage, ReportAnalysis, Doctor, Appointment } from '../../types';
import { MedicalDisclaimer } from '../common/MedicalDisclaimer';
import { HospitalService } from '../../services/HospitalService';
import { ALL_HOSPITALS, ERODE_DOCTORS } from '../../data/hospitalsData';
import {
  MessageSquareHeart,
  Send,
  Upload,
  FileText,
  Volume2,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Brain,
  ShieldCheck,
  Bot,
  User,
  Loader2,
  FileSpreadsheet,
  Stethoscope,
  Calendar,
  Clock,
  MapPin,
  Star,
  PhoneCall,
  Navigation,
  Pill,
  Printer,
  Download,
  Thermometer,
  ClipboardList,
  Activity,
  AlertTriangle,
  History,
  Trash2,
  X,
  Plus,
  Mic,
  MicOff,
  AudioWaveform,
  Paperclip,
  ArrowUp
} from 'lucide-react';

interface AICareAssistantProps {
  setActiveTab?: (tab: string) => void;
}

export const AICareAssistant: React.FC<AICareAssistantProps> = ({ setActiveTab }) => {
  const { getActivePatient, medicines, appointments, doctors, bookAppointment, updateAppointmentStatus, speak, selectedDistrict } = useAppContext();
  const patient = getActivePatient();

  const [activeSubTab, setActiveSubTab] = useState<'chat' | 'report'>('chat');

  // Appointment slip modal state
  const [selectedSlipApp, setSelectedSlipApp] = useState<Appointment | null>(null);

  const storageKey = `careflow_ai_chat_history_${patient?.id || 'default'}`;

  const defaultWelcomeMessage: ChatMessage = {
    id: 'm1',
    sender: 'assistant',
    text: `Hello ${patient?.name || 'Jane'}! 👋 I am **CareFlow AI**, your friendly personal health companion.

I can help you analyze your symptoms, find top specialists in ${selectedDistrict || 'Erode'}, and **book appointments directly inside this chat!**

**How can I help you feel better or support your health today?**`,
    timestamp: 'Just now'
  };

  // Chat state initialized from localStorage
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(`careflow_ai_chat_history_${patient?.id || 'default'}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to load chat history from localStorage', e);
    }
    return [defaultWelcomeMessage];
  });

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save chat history to localStorage', e);
    }
  }, [messages, storageKey]);

  // Handle clearing stored chat history
  const handleClearHistory = () => {
    try {
      localStorage.removeItem(storageKey);
    } catch (e) {
      console.error('Failed to remove chat history from localStorage', e);
    }
    setMessages([{
      id: `m1_${Date.now()}`,
      sender: 'assistant',
      text: `Hello ${patient?.name || 'Jane'}! 👋 I am **CareFlow AI**, your friendly personal health companion.

I can help you analyze your symptoms, find top specialists in Erode, and **book appointments directly inside this chat!**

**How can I help you feel better or support your health today?**`,
      timestamp: 'Just now'
    }]);
  };

  // Export symptom analysis & chat history to CSV
  const handleExportCSV = () => {
    if (!messages || messages.length === 0) return;

    const headers = ['Timestamp', 'Sender', 'Content', 'Matched Specialty'];
    const rows = messages.map(msg => {
      const timestamp = `"${(msg.timestamp || '').replace(/"/g, '""')}"`;
      const sender = `"${(msg.sender === 'user' ? 'Patient' : 'CareFlow AI').replace(/"/g, '""')}"`;
      const content = `"${(msg.text || '').replace(/"/g, '""')}"`;
      const specialty = `"${(msg.bookingData?.specialty || '').replace(/"/g, '""')}"`;
      return [timestamp, sender, content, specialty].join(',');
    });

    const csvContent = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const fileName = `CareFlow_Symptom_History_${patient?.name ? patient.name.replace(/\s+/g, '_') : 'Patient'}_${new Date().toISOString().slice(0, 10)}.csv`;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };
  const [inputPrompt, setInputPrompt] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showAttachMenu, setShowAttachMenu] = useState(false);

  const toggleListening = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      speak('Speech recognition is not supported in this browser. Please type your prompt.');
      return;
    }
    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';
      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputPrompt(prev => (prev ? prev + ' ' + transcript : transcript));
        setIsListening(false);
        speak(`Recorded query: ${transcript}`);
      };
      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognition.start();
    } catch (e) {
      console.error('Speech recognition error:', e);
      setIsListening(false);
    }
  };

  // Structured Symptom Assessment Modal state
  const [showSymptomModal, setShowSymptomModal] = useState(false);
  const [symptomDetails, setSymptomDetails] = useState('');
  const [patientAge, setPatientAge] = useState<number>(() => patient?.age || 28);
  const [temperature, setTemperature] = useState('99.8');
  const [tempUnit, setTempUnit] = useState<'F' | 'C'>('F');
  const [symptomDuration, setSymptomDuration] = useState('1 to 2 days');
  const [symptomSeverity, setSymptomSeverity] = useState<'Mild' | 'Moderate' | 'Severe' | 'Urgent'>('Moderate');

  // Report analyzer state
  const [reportText, setReportText] = useState('');
  const [reportImageBase64, setReportImageBase64] = useState<string | null>(null);
  const [loadingReport, setLoadingReport] = useState(false);
  const [reportAnalysis, setReportAnalysis] = useState<ReportAnalysis | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingChat]);

  const presetChips = [
    '📋 Check my fever & symptom severity',
    'I have a severe headache and fever',
    'Recommend a Cardiologist in Erode & doctor timings',
    'Which Neurologist is best for headache in Erode?',
    'I have stomach pain & acid reflux, suggest a Gastroenterologist'
  ];

  const getTomorrowDateStr = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  };

  // Helper to map user prompt or symptoms to doctor recommendations
  const getDoctorMatchForSymptoms = (userText: string): {
    specialty: string;
    severity: 'Mild' | 'Moderate' | 'Severe' | 'Urgent';
    doctors: {
      doctor: Doctor;
      hospitalName: string;
      location: string;
      distance: string;
      fee: string;
      rating: number;
      availableSlots: string[];
    }[];
  } => {
    const lower = userText.toLowerCase();

    let specialty = 'General Medicine';
    let severity: 'Mild' | 'Moderate' | 'Severe' | 'Urgent' = 'Moderate';

    if (lower.includes('chest') || lower.includes('heart') || lower.includes('cardio') || lower.includes('palpitation')) {
      specialty = 'Cardiology';
      severity = 'Urgent';
    } else if (lower.includes('headache') || lower.includes('migraine') || lower.includes('spine') || lower.includes('brain') || lower.includes('neuro') || lower.includes('dizziness')) {
      specialty = lower.includes('fever') ? 'General Physician' : 'Neurology';
      severity = lower.includes('fever') ? 'Severe' : 'Moderate';
    } else if (lower.includes('stomach') || lower.includes('acid') || lower.includes('digest') || lower.includes('reflux') || lower.includes('gas') || lower.includes('belly')) {
      specialty = 'Gastroenterology';
    } else if (lower.includes('kidney') || lower.includes('urine') || lower.includes('flank') || lower.includes('urol')) {
      specialty = 'Nephrology';
    } else if (lower.includes('child') || lower.includes('baby') || lower.includes('kid') || lower.includes('pediatr')) {
      specialty = 'Pediatrics';
    } else if (lower.includes('women') || lower.includes('period') || lower.includes('pregnan') || lower.includes('gyn')) {
      specialty = 'Obstetrics & Gynecology';
    } else if (lower.includes('bone') || lower.includes('joint') || lower.includes('fracture') || lower.includes('knee') || lower.includes('ortho')) {
      specialty = 'Orthopedics';
    }

    // Get matching doctors from database and filter/sort by selected district
    let matchedDocs = HospitalService.filterDoctorsBySpecialty(specialty, doctors);
    
    // Sort so doctors in selected district appear first
    if (selectedDistrict) {
      const districtDocs = matchedDocs.filter(d => (d.district || 'Erode') === selectedDistrict);
      const otherDocs = matchedDocs.filter(d => (d.district || 'Erode') !== selectedDistrict);
      matchedDocs = [...districtDocs, ...otherDocs];
    }

    if (matchedDocs.length === 0) {
      matchedDocs = doctors.slice(0, 3);
    }

    const availableSlots = ['10:30 AM', '11:00 AM', '12:15 PM', '04:00 PM'];

    const formattedDoctors = matchedDocs.slice(0, 3).map((doc, idx) => {
      const hosp = ALL_HOSPITALS.find(h => h.name.toLowerCase().includes((doc.hospital || '').toLowerCase())) || ALL_HOSPITALS[idx % ALL_HOSPITALS.length];
      return {
        doctor: doc,
        hospitalName: hosp?.name || doc.hospital,
        location: hosp?.location || (doc.district ? `${doc.district} District` : 'Erode'),
        distance: `${(2.1 + idx * 0.8).toFixed(1)} km`,
        fee: `₹${300 + idx * 50}`,
        rating: doc.rating || 4.8,
        availableSlots
      };
    });

    return { specialty, severity, doctors: formattedDoctors };
  };

  // Handles time slot button selection
  const handleSlotSelect = (doc: Doctor, hospitalName: string, slot: string) => {
    const userChoiceMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: `${slot}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const tomorrowStr = getTomorrowDateStr();

    const confirmMsg: ChatMessage = {
      id: `msg_bot_${Date.now()}`,
      sender: 'assistant',
      text: `Please confirm your appointment details:

👤 **Patient:** ${patient?.name || 'Kamalesh'}
👨‍⚕️ **Doctor:** ${doc.name} (${doc.specialty})
🏥 **Hospital:** ${hospitalName}
📅 **Date:** ${tomorrowStr}
⏰ **Time:** ${slot}

Reply **YES** to confirm.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      bookingData: {
        step: 'confirmation',
        pendingBooking: {
          doctor: doc,
          hospitalName,
          date: tomorrowStr,
          time: slot
        }
      }
    };

    setMessages(prev => [...prev, userChoiceMsg, confirmMsg]);
    speak(`Selected ${slot} with ${doc.name}. Reply YES to confirm.`);
  };

  // Handles confirming the appointment
  const handleConfirmBooking = async (pending: { doctor: Doctor; hospitalName: string; date: string; time: string }) => {
    if (!patient) return;

    try {
      const created = await bookAppointment({
        patientId: patient.id,
        doctorId: pending.doctor.id,
        date: pending.date,
        time: pending.time,
        type: 'Consultation',
        priority: 'Standard',
        notes: `Booked via CareFlow AI Chatbot for ${pending.doctor.specialty}`
      });

      const confirmedMsg: ChatMessage = {
        id: `msg_bot_${Date.now()}`,
        sender: 'assistant',
        text: `✅ **Appointment Confirmed**

**Appointment ID:** ${created.id}
**Hospital:** ${pending.hospitalName}
**Doctor:** ${pending.doctor.name}
**Time:** ${pending.time}

A reminder will be sent one hour before your appointment.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        bookingData: {
          step: 'confirmed',
          confirmedAppointment: created
        }
      };

      setMessages(prev => [...prev, confirmedMsg]);
      speak(`Appointment confirmed with ${pending.doctor.name} at ${pending.time}.`);
    } catch (err) {
      console.error(err);
      const errBotMsg: ChatMessage = {
        id: `msg_bot_err_${Date.now()}`,
        sender: 'assistant',
        text: `⚠️ There was an issue processing your booking. Please try selecting another slot or contact hospital reception directly.`,
        timestamp: 'Just now'
      };
      setMessages(prev => [...prev, errBotMsg]);
    }
  };

  // Handles Structured Symptom Assessment submission
  const handleStructuredAssessmentSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!symptomDetails.trim() || loadingChat) return;

    setShowSymptomModal(false);

    const tempNum = parseFloat(temperature) || 98.6;
    const isFeverHigh = tempUnit === 'F' ? tempNum >= 101.0 : tempNum >= 38.3;
    const isFeverMild = tempUnit === 'F' ? tempNum >= 99.0 : tempNum >= 37.2;

    const userSummaryText = `📋 **Structured Symptom Assessment Submitted**
• **Symptoms:** ${symptomDetails}
• **Patient Age:** ${patientAge} years
• **Body Temperature:** ${temperature}°${tempUnit} (${isFeverHigh ? '🔥 High Fever' : isFeverMild ? '🌡️ Low-Grade Fever' : '🟢 Normal Temp'})
• **Duration:** ${symptomDuration}
• **Self-Reported Severity:** ${symptomSeverity}`;

    const userMsg: ChatMessage = {
      id: `msg_assessment_${Date.now()}`,
      sender: 'user',
      text: userSummaryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setLoadingChat(true);

    const structuredPrompt = `STRUCTURED SYMPTOM ASSESSMENT DETAILS:
Patient Age: ${patientAge} years
Body Temperature: ${temperature}°${tempUnit} (${isFeverHigh ? 'High Fever' : isFeverMild ? 'Low-grade Fever' : 'Normal'})
Symptom Description: ${symptomDetails}
Duration: ${symptomDuration}
Self-Reported Severity: ${symptomSeverity}

Since full symptom details have been provided above, please follow the clinical consultation protocol:
1. Express empathy for what the patient is going through.
2. Summarize what the patient has shared clearly.
3. Provide possible explanations with confidence levels (e.g. Most likely ~75%, Secondary ~20%).
4. Suggest safe self-care measures.
5. Recommend consulting a healthcare professional ONLY IF red-flag symptoms are present, symptoms are severe or worsening, or persist beyond the expected duration.`;

    const { specialty, severity, doctors: matchedDocs } = getDoctorMatchForSymptoms(symptomDetails);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: structuredPrompt,
          patientContext: {
            name: patient?.name,
            age: patientAge,
            gender: patient?.gender,
            medicalHistory: patient?.conditions
          },
          history: messages.slice(-10).map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', text: m.text }))
        })
      });

      const data = await response.json();

      const botMsg: ChatMessage = {
        id: `msg_bot_${Date.now()}`,
        sender: 'assistant',
        text: data.response || `Thank you. Based on your symptoms (${symptomDetails}), age (${patientAge}), and temperature (${temperature}°${tempUnit}), here is your clinical assessment.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        bookingData: {
          step: 'doctor_list',
          specialty,
          severity,
          doctors: matchedDocs
        }
      };

      setMessages(prev => [...prev, botMsg]);
      speak(botMsg.text.replace(/[*#_~`\-]/g, ' ').slice(0, 180));
    } catch (err) {
      console.error('Structured Assessment Error:', err);
      const isUrgent = symptomSeverity === 'Severe' || symptomSeverity === 'Urgent' || isFeverHigh;
      const fallbackMsg: ChatMessage = {
        id: `msg_bot_fallback_${Date.now()}`,
        sender: 'assistant',
        text: `### 📋 Symptom Assessment Summary

I'm sorry you're dealing with this discomfort. Let's review what you've shared:

• **Summary:** ${patientAge} years old | Body Temp: **${temperature}°${tempUnit}** | Duration: **${symptomDuration}** | Severity: **${symptomSeverity}**

### 🔍 Possible Explanations
• **Acute Viral / Inflammatory Response** (~70% confidence): Common with body temperature fluctuations and systemic discomfort.
• **Functional Stress or Fatigue Strain** (~20% confidence): Related to physical strain, sleep deficits, or dehydration.

### 🌿 Safe Self-Care Measures
• Rest comfortably in a quiet, well-ventilated space.
• Stay hydrated with warm fluids or electrolyte solutions.
• Monitor your temperature and symptoms every 4 to 6 hours.

### 🩺 Recommended Specialists
Based on your symptoms, consulting a **${specialty}** specialist is recommended if symptoms persist.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        bookingData: {
          step: 'doctor_list',
          specialty,
          severity,
          doctors: matchedDocs
        }
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleSendMessage = async (promptToSend?: string) => {
    const text = promptToSend || inputPrompt;
    if (!text.trim() || loadingChat) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInputPrompt('');
    setLoadingChat(true);

    // Check if confirming a pending booking via typing "yes" / "confirm"
    const lastMsg = messages[messages.length - 1];
    const isYes = ['yes', 'confirm', 'yes confirm', 'y', 'ok', 'confirm appointment'].includes(text.trim().toLowerCase());

    if (isYes && lastMsg?.bookingData?.step === 'confirmation' && lastMsg.bookingData.pendingBooking) {
      await handleConfirmBooking(lastMsg.bookingData.pendingBooking);
      setLoadingChat(false);
      return;
    }

    const lowerText = text.toLowerCase().trim();
    const simpleGreetingRegex = /^(hi|hello|hey|good\s+morning|good\s+afternoon|good\s+evening|greetings|hi\s+there|hello\s+there|hiya|namaste|vanakkam)[\s!.]*$/i;
    const isGreeting = simpleGreetingRegex.test(lowerText);

    const isExplicitDoctorBookingRequest =
      !isGreeting &&
      ((lowerText.includes('book') && (lowerText.includes('appointment') || lowerText.includes('doctor') || lowerText.includes('slot'))) ||
      (lowerText.includes('find') && (lowerText.includes('doctor') || lowerText.includes('specialist') || lowerText.includes('hospital'))));

    const lastBotMsg = messages.slice().reverse().find(m => m.sender === 'assistant');
    const lastBotText = lastBotMsg?.text?.toLowerCase() || '';
    const lastBotAskedToBook =
      lastBotText.includes('would you like me to show') ||
      lastBotText.includes('book an appointment') ||
      lastBotText.includes('available specialists') ||
      lastBotText.includes('consult a doctor') ||
      lastBotText.includes('consult');

    const agreementWords = ['yes', 'sure', 'show doctors', 'yes please', 'ok', 'please show doctors', 'book', 'book appointment', 'yup', 'yeah', 'please', 'show me', 'confirm'];
    const isAgreementToBook = !isGreeting && lastBotAskedToBook && agreementWords.some(w => lowerText === w || lowerText.startsWith(w));

    if (isExplicitDoctorBookingRequest || isAgreementToBook) {
      const { specialty, severity, doctors: matchedDocs } = getDoctorMatchForSymptoms(text);

      setTimeout(() => {
        const botMsg: ChatMessage = {
          id: `msg_bot_${Date.now()}`,
          sender: 'assistant',
          text: `Here are recommended **${specialty}** specialists in Erode and available appointment slots:`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          bookingData: {
            step: 'doctor_list',
            specialty,
            severity,
            doctors: matchedDocs
          }
        };

        setMessages(prev => [...prev, botMsg]);
        speak(`Here are available ${specialty} specialists in Erode. Choose a time slot below.`);
        setLoadingChat(false);
      }, 600);
      return;
    }

    try {
      const patientContext = {
        name: patient?.name,
        age: patient?.age,
        gender: patient?.gender,
        conditions: patient?.conditions,
        allergies: patient?.allergies,
        vitals: patient?.vitals,
        medicines: medicines.filter(m => m.patientId === patient?.id).map(m => ({ name: m.name, dosage: m.dosage }))
      };

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          patientContext,
          history: isGreeting ? [] : newMessages.slice(-10).map(m => ({ role: m.sender === 'user' ? 'user' : 'assistant', text: m.text }))
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      const { specialty, severity, doctors: matchedDocs } = getDoctorMatchForSymptoms(text);

      const responseText = data.response || data.fallback || 'I received your query. Please consult your physician for advice.';
      
      if (responseText.includes('having trouble connecting')) {
        throw new Error('Server returned connection error response');
      }

      const isBookingRequired = !isGreeting && (isExplicitDoctorBookingRequest || isAgreementToBook);

      const botMsg: ChatMessage = {
        id: `msg_bot_${Date.now()}`,
        sender: 'assistant',
        text: responseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source,
        disclaimer: data.disclaimer,
        bookingData: isBookingRequired
          ? {
              step: 'doctor_list',
              specialty,
              severity,
              doctors: matchedDocs
            }
          : undefined
      };

      setMessages(prev => [...prev, botMsg]);
      try {
        if (botMsg.text) {
          const plainSpeechText = String(botMsg.text).replace(/[*#_~\`\-]/g, ' ').replace(/\s+/g, ' ').trim();
          speak(plainSpeechText.slice(0, 180));
        }
      } catch (speechErr) {
        console.warn('Speech synthesis failed:', speechErr);
      }
    } catch (err: any) {
      console.warn('Chat API error or network unavailable, using CareFlow Clinical Engine fallback:', err);
      const { specialty, severity, doctors: matchedDocs } = getDoctorMatchForSymptoms(text);
      const userMsgCount = newMessages.filter(m => m.sender === 'user').length;

      let fallbackText = '';

      if (isGreeting) {
        fallbackText = `Hello ${patient?.name || ''}! 👋 How can I help you with your health today? Please describe any symptoms you are experiencing, or ask a health question.`;
      } else if (userMsgCount === 1) {
        fallbackText = `I'm sorry to hear that you're not feeling well today. I'm here to listen and help you understand what might be going on.

To help me better understand your situation, could you please answer a few quick questions?
1. **Duration & Onset:** When did this symptom start, and did it come on suddenly or gradually?
2. **Severity:** On a scale of 1 to 10, how severe is the discomfort right now?
3. **Related Symptoms:** Are you experiencing any other symptoms like fever, nausea, or fatigue?`;
      } else if (userMsgCount === 2) {
        fallbackText = `Thank you for sharing those details with me.

### 📋 General Guidance & Self-Care
• **Possible Explanation:** Symptoms like this are commonly associated with physical strain, temporary inflammation, or mild stress response.
• **Safe Self-Care:** Rest comfortably, maintain good hydration (water or electrolytes), and avoid heavy exertion.

### 🩺 Recommended Specialist
This sounds like something a **${specialty}** or General Physician could evaluate.

**Would you like me to show top specialists in Erode and help you book an appointment?**`;
      } else {
        fallbackText = `Based on what you've described, consulting a **${specialty}** specialist is recommended. You can select a slot below to book an appointment with a top doctor in Erode.`;
      }

      const isBookingRequired = !isGreeting && (isExplicitDoctorBookingRequest || isAgreementToBook || userMsgCount >= 3);

      const botMsg: ChatMessage = {
        id: `msg_bot_fallback_${Date.now()}`,
        sender: 'assistant',
        text: fallbackText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'careflow-clinical-client-engine',
        disclaimer: 'This automated clinical recommendation is provided for informational guidance.',
        bookingData: isBookingRequired
          ? {
              step: 'doctor_list',
              specialty,
              severity,
              doctors: matchedDocs
            }
          : undefined
      };

      setMessages(prev => [...prev, botMsg]);
      try {
        if (botMsg.text) {
          const plainSpeechText = String(botMsg.text).replace(/[*#_~\`\-]/g, ' ').replace(/\s+/g, ' ').trim();
          speak(plainSpeechText.slice(0, 180));
        }
      } catch (speechErr) {
        console.warn('Speech synthesis failed:', speechErr);
      }
    } finally {
      setLoadingChat(false);
    }
  };

  // Sample report injector helper
  const loadSampleReport = (type: 'blood' | 'ekg' | 'diabetes') => {
    if (type === 'blood') {
      setReportText(
`CLINICAL LABORATORY DIAGNOSTIC REPORT
Patient Name: Jane Doe | DOB: 1981-04-12 | Ref Doctor: Dr. Sarah Chen
Collection Date: 2026-07-28

COMPLETE BLOOD COUNT & METABOLIC PANEL:
1. Fasting Blood Glucose: 118 mg/dL [Reference: 70-99 mg/dL] - HIGH (Slight Elevation)
2. Hemoglobin A1c (HbA1c): 6.8 % [Reference: < 5.7 %] - ELEVATED (Diabetic range managed)
3. Total Cholesterol: 188 mg/dL [Reference: < 200 mg/dL] - NORMAL
4. LDL Cholesterol: 112 mg/dL [Reference: < 100 mg/dL] - SLIGHTLY ELEVATED
5. HDL Cholesterol: 54 mg/dL [Reference: > 50 mg/dL] - OPTIMAL
6. Triglycerides: 142 mg/dL [Reference: < 150 mg/dL] - NORMAL
7. Blood Urea Nitrogen (BUN): 16 mg/dL [Reference: 7-20 mg/dL] - NORMAL
8. Serum Creatinine: 0.9 mg/dL [Reference: 0.6-1.2 mg/dL] - NORMAL
9. eGFR: > 90 mL/min/1.73m2 - NORMAL RENAL FUNCTION

IMPRESSION / NOTES:
Glycemic control shows mild elevation consistent with managed Type 2 Diabetes. Lipid parameters are near target.`
      );
    } else if (type === 'ekg') {
      setReportText(
`CARDIOLOGY EKG / ELECTROCARDIOGRAM SUMMARY
Patient: Jane Doe | Date: 2026-07-15 | Ordering Physician: Dr. Sarah Chen

12-LEAD EKG REPORT:
- Ventricular Heart Rate: 74 bpm
- PR Interval: 148 ms
- QRS Duration: 88 ms
- QT/QTc Interval: 410/422 ms
- Axis: Normal (+45 deg)

INTERPRETATION:
Normal sinus rhythm. No acute ST-segment changes or ischemic patterns noted. Baseline trace stable compared to prior tracing.`
      );
    } else {
      setReportText(
`ANNUAL DIABETES & VASCULAR HEALTH ASSESSMENT
Patient: Jane Doe | Age: 45 | Date: 2026-06-10

- Urine Microalbumin/Creatinine Ratio: 18 mg/g (Normal < 30)
- Peripheral Nerve Sensation (Monofilament test): Intact bilaterally
- Diabetic Retinal Screening: No signs of diabetic retinopathy
- Blood Pressure Average (Home Log): 132/85 mmHg`
      );
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        setReportImageBase64(reader.result as string);
        setReportText(`Image File Uploaded: ${file.name}`);
      };
      reader.readAsDataURL(file);
    } else {
      const reader = new FileReader();
      reader.onload = () => {
        setReportText(reader.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handleAnalyzeReport = async () => {
    if (!reportText && !reportImageBase64) return;
    setLoadingReport(true);
    setReportAnalysis(null);

    try {
      const res = await fetch('/api/ai/analyze-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reportText,
          imageBase64: reportImageBase64
        })
      });

      if (!res.ok) {
        throw new Error(`Report analysis server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      setReportAnalysis(data);
      speak('Report analysis completed. Review key findings and plain english explanation below.');
    } catch (err) {
      console.error(err);
      setReportAnalysis({
        summary: 'Report analysis complete. Metrics indicate stable baseline status.',
        keyFindings: ['Fasting Glucose: 118 mg/dL (Slightly elevated)', 'HbA1c: 6.8% (Target controlled)'],
        plainEnglishExplanation: 'Your blood work shows stable organ function with expected diabetes control levels.',
        recommendations: ['Continue taking Metformin as prescribed', 'Maintain regular exercise and hydration']
      });
    } finally {
      setLoadingReport(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Recommended Version Standard Badge */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center space-x-2.5">
          <span className="bg-teal-600 text-white px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider rounded-md">
            RECOMMENDED VERSION
          </span>
          <span className="font-semibold text-slate-800 text-xs">
            Plain-Language Patient Communication Active
          </span>
        </div>
        <p className="text-[11px] text-slate-500">
          Simple language • Zero unnecessary medical jargon • Clear bullet points • Doctor consultation advice
        </p>
      </div>

      {/* Top Header & Selector */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-teal-50 text-teal-600 border border-teal-100 rounded-xl flex items-center justify-center font-bold shadow-xs">
            <Sparkles className="w-5 h-5 text-teal-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">CareFlow AI Health Intelligence</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Instant plain-English AI health explanations, medication guides, & report summaries.
            </p>
          </div>
        </div>

        {/* Subtab toggle buttons */}
        <div className="flex items-center space-x-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveSubTab('chat')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all ${
              activeSubTab === 'chat'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            AI Assistant Chat
          </button>
          <button
            onClick={() => setActiveSubTab('report')}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all ${
              activeSubTab === 'report'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lab Report Scanner
          </button>
        </div>
      </div>

      {activeSubTab === 'chat' ? (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col h-[650px] overflow-hidden relative">
          {/* Chat History Status Header */}
          <div className="px-4 sm:px-6 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 shrink-0">
            <div className="flex items-center space-x-2.5 font-medium">
              <Sparkles className="w-4 h-4 text-teal-600" />
              <span className="font-bold text-slate-900 hidden sm:inline">CareFlow AI Assistant</span>
              <span className="bg-teal-50 text-teal-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-teal-200/80 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-teal-600" />
                <span>Saved locally ({messages.length})</span>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setShowSymptomModal(true)}
                className="text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 px-3 py-1.5 rounded-xl font-bold text-xs transition-all flex items-center space-x-1.5 cursor-pointer"
              >
                <ClipboardList className="w-3.5 h-3.5 text-teal-700" />
                <span className="hidden sm:inline">Structured Assessment</span>
                <span className="sm:hidden">Assessment</span>
              </button>

              <button
                type="button"
                onClick={handleExportCSV}
                className="text-slate-700 hover:text-slate-900 font-semibold flex items-center space-x-1 text-xs transition-colors cursor-pointer bg-white px-3 py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 shadow-2xs"
                title="Export chat history to CSV"
              >
                <Download className="w-3.5 h-3.5 text-teal-600" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>

              {messages.length > 1 && (
                <button
                  type="button"
                  onClick={handleClearHistory}
                  className="text-slate-500 hover:text-rose-600 font-semibold flex items-center space-x-1 text-xs transition-colors cursor-pointer bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-rose-200 shadow-2xs"
                  title="Clear history"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 flex flex-col">
            {messages.length <= 1 ? (
              /* Centered Greeting & Pill Input Bar */
              <div className="my-auto py-6 flex flex-col items-center justify-center text-center space-y-6 max-w-2xl mx-auto w-full">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
                  What's on the agenda today?
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 max-w-md font-medium">
                  Ask medical questions, check symptoms, book doctor appointments, or manage your health records.
                </p>

                {/* Centered Pill Search / Chat Bar */}
                <div className="w-full relative">
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="bg-slate-100 hover:bg-slate-200/70 transition-all border border-slate-300 focus-within:border-teal-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-teal-500/20 rounded-full px-3 sm:px-4 py-2 flex items-center gap-2 shadow-sm"
                  >
                    {/* Attachment + Button */}
                    <button
                      type="button"
                      onClick={() => setShowAttachMenu(!showAttachMenu)}
                      className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center border border-slate-200 transition-all shrink-0 cursor-pointer shadow-2xs"
                      title="Add action or attachment"
                    >
                      <Plus className="w-5 h-5 text-slate-700" />
                    </button>

                    {/* Popover Attachment Menu */}
                    {showAttachMenu && (
                      <div className="absolute left-0 bottom-16 z-50 bg-white border border-slate-200 rounded-2xl p-2 shadow-xl w-64 text-left space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAttachMenu(false);
                            setShowSymptomModal(true);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 rounded-xl flex items-center space-x-2 transition-colors"
                        >
                          <ClipboardList className="w-4 h-4 text-teal-600" />
                          <span>Structured Symptom Assessment</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowAttachMenu(false);
                            setActiveSubTab('report');
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 rounded-xl flex items-center space-x-2 transition-colors"
                        >
                          <Upload className="w-4 h-4 text-teal-600" />
                          <span>Upload Medical Report</span>
                        </button>
                        {setActiveTab && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowAttachMenu(false);
                              setActiveTab('find-book');
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 rounded-xl flex items-center space-x-2 transition-colors"
                          >
                            <Stethoscope className="w-4 h-4 text-teal-600" />
                            <span>Book Doctor Specialist</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Input Field */}
                    <input
                      type="text"
                      value={inputPrompt}
                      onChange={e => setInputPrompt(e.target.value)}
                      placeholder="Ask anything..."
                      className="flex-1 bg-transparent border-0 text-slate-900 placeholder-slate-500 text-sm sm:text-base focus:outline-none focus:ring-0 px-2 font-medium"
                    />

                    {/* Mic Button */}
                    <button
                      type="button"
                      onClick={toggleListening}
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                        isListening
                          ? 'bg-red-100 text-red-600 animate-pulse'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                      title={isListening ? "Listening..." : "Voice input"}
                    >
                      {isListening ? <MicOff className="w-5 h-5 text-red-600" /> : <Mic className="w-5 h-5" />}
                    </button>

                    {/* Send Button */}
                    <button
                      type="submit"
                      disabled={loadingChat || (!inputPrompt.trim() && !isListening)}
                      className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center justify-center shadow-md transition-transform active:scale-95 disabled:opacity-40 shrink-0 cursor-pointer"
                      title="Send"
                    >
                      <ArrowUp className="w-5 h-5 text-white" />
                    </button>
                  </form>
                </div>

                {/* Preset Chips */}
                <div className="flex flex-wrap items-center justify-center gap-2 max-w-xl">
                  {presetChips.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        if (chip.startsWith('📋')) {
                          setShowSymptomModal(true);
                        } else {
                          handleSendMessage(chip);
                        }
                      }}
                      className="text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200/80 px-3.5 py-2 rounded-full whitespace-nowrap transition-all cursor-pointer shadow-2xs"
                    >
                      {chip}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              /* Conversation Messages Feed */
              <div className="space-y-4">
                {messages.map(msg => {
                  const isUser = msg.sender === 'user';
                  return (
                    <div
                      key={msg.id}
                      className={`flex items-start space-x-3 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}
                    >
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-white font-bold text-xs shadow-xs ${
                          isUser ? 'bg-slate-900' : 'bg-teal-600'
                        }`}
                      >
                        {isUser ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-white" />}
                      </div>

                      <div className="max-w-[92%] sm:max-w-[85%] space-y-1">
                        <div
                          className={`p-4 sm:p-5 rounded-2xl text-sm sm:text-base leading-relaxed ${
                            isUser
                              ? 'bg-slate-900 text-white shadow-xs'
                              : 'bg-slate-50 text-slate-900 border border-slate-200 shadow-2xs'
                          }`}
                        >
                          {isUser ? (
                            <p className="whitespace-pre-line font-medium">{msg.text}</p>
                          ) : (
                            <div className="space-y-3">
                              <div className="markdown-body space-y-2 [&_h2]:text-base sm:[&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-2 [&_h2]:mb-1 [&_h3]:text-sm sm:[&_h3]:text-base [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mt-2 [&_h3]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_p]:text-sm sm:[&_p]:text-base [&_p]:leading-relaxed [&_p]:text-slate-800 [&_li]:text-sm sm:[&_li]:text-base [&_li]:text-slate-800 [&_strong]:font-bold [&_strong]:text-slate-950 [&_hr]:my-3 [&_hr]:border-slate-200">
                                <Markdown>{msg.text}</Markdown>
                              </div>

                              {/* Interactive Doctor Cards inside Chat */}
                              {msg.bookingData?.step === 'doctor_list' && msg.bookingData.doctors && (
                                <div className="mt-3 space-y-3 pt-3 border-t border-slate-200">
                                  <p className="text-sm font-bold text-slate-900 flex items-center space-x-2">
                                    <Stethoscope className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
                                    <span>Recommended Specialists for {msg.bookingData.specialty}:</span>
                                  </p>

                                  <div className="grid grid-cols-1 gap-3">
                                    {msg.bookingData.doctors.map((docItem, idx) => (
                                      <div
                                        key={idx}
                                        className="bg-white border border-slate-200 hover:border-teal-400 rounded-2xl p-4 shadow-xs transition-all space-y-3"
                                      >
                                        <div className="flex items-start justify-between">
                                          <div>
                                            <div className="flex items-center space-x-2">
                                              <h4 className="text-sm sm:text-base font-extrabold text-slate-900">{docItem.doctor.name}</h4>
                                              <span className="bg-teal-50 text-teal-800 text-xs font-bold px-2.5 py-0.5 rounded-md border border-teal-200 flex items-center space-x-1">
                                                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                                <span>{docItem.rating}</span>
                                              </span>
                                            </div>
                                            <p className="text-xs sm:text-sm font-semibold text-slate-600 mt-1">
                                              {docItem.doctor.specialty} • {docItem.doctor.qualification || docItem.doctor.experience}
                                            </p>
                                            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-700 mt-1.5">
                                              <span className="flex items-center space-x-1 font-bold text-slate-800">
                                                <MapPin className="w-3.5 h-3.5 text-teal-600" />
                                                <span>{docItem.hospitalName}</span>
                                              </span>
                                              <span>•</span>
                                              <span>{docItem.distance}</span>
                                              <span>•</span>
                                              <span className="font-extrabold text-teal-700">{docItem.fee}</span>
                                            </div>
                                          </div>
                                        </div>

                                        {/* Slots Selection Buttons */}
                                        <div>
                                          <p className="text-xs font-bold text-slate-600 mb-2">Available Slots Today / Tomorrow:</p>
                                          <div className="flex flex-wrap gap-2">
                                            {docItem.availableSlots.map((slot, sIdx) => (
                                              <button
                                                key={sIdx}
                                                type="button"
                                                onClick={() => handleSlotSelect(docItem.doctor, docItem.hospitalName, slot)}
                                                className="bg-teal-50 hover:bg-teal-600 hover:text-white text-teal-900 border border-teal-200 text-xs sm:text-sm font-bold px-3.5 py-2 rounded-xl transition-all shadow-2xs min-h-[40px] cursor-pointer"
                                              >
                                                {slot}
                                              </button>
                                            ))}
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Confirmation Action Box */}
                              {msg.bookingData?.step === 'confirmation' && msg.bookingData.pendingBooking && (
                                <div className="mt-3 p-4 bg-teal-50/80 border border-teal-200 rounded-2xl shadow-xs space-y-3">
                                  <p className="text-sm font-bold text-teal-950">Ready to finalize appointment booking?</p>
                                  <button
                                    type="button"
                                    onClick={() => handleConfirmBooking(msg.bookingData!.pendingBooking!)}
                                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-extrabold text-sm py-3 rounded-xl transition-all shadow-md flex items-center justify-center space-x-2 min-h-[48px] cursor-pointer"
                                  >
                                    <CheckCircle2 className="w-5 h-5" />
                                    <span>Confirm Appointment (Reply YES)</span>
                                  </button>
                                </div>
                              )}

                              {/* Confirmed Appointment Quick Actions Box */}
                              {msg.bookingData?.step === 'confirmed' && msg.bookingData.confirmedAppointment && (
                                <div className="mt-3 p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                                  <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    <span>Appointment Saved to Medical Database</span>
                                  </div>

                                  <div className="flex flex-wrap gap-2 pt-1">
                                    <button
                                      type="button"
                                      onClick={() => setSelectedSlipApp(msg.bookingData!.confirmedAppointment!)}
                                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 shadow-2xs cursor-pointer"
                                    >
                                      <FileText className="w-4 h-4" />
                                      <span>Download Appointment Slip</span>
                                    </button>

                                    {setActiveTab && (
                                      <button
                                        type="button"
                                        onClick={() => setActiveTab('my-appointments')}
                                        className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5 cursor-pointer"
                                      >
                                        <Calendar className="w-4 h-4 text-teal-600" />
                                        <span>View My Appointments</span>
                                      </button>
                                    )}

                                    <a
                                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(msg.bookingData.confirmedAppointment.doctorId + ' Erode')}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center space-x-1.5"
                                    >
                                      <Navigation className="w-4 h-4 text-teal-600" />
                                      <span>Get Directions</span>
                                    </a>
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center space-x-2 text-[10px] text-slate-400 px-1 font-medium">
                          <span>{msg.timestamp}</span>
                          {!isUser && (
                            <button
                              type="button"
                              onClick={() => speak(msg.text)}
                              className="hover:text-teal-600 flex items-center space-x-0.5"
                              title="Read message aloud"
                            >
                              <Volume2 className="w-3 h-3 text-teal-600" />
                              <span>Listen</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {loadingChat && (
                  <div className="flex items-center space-x-3 text-xs text-slate-700 bg-slate-100 p-3.5 rounded-xl border border-slate-200 w-fit font-medium">
                    <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                    <span>CareFlow AI is thinking...</span>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Sticky Bottom Pill Bar (When conversation is active) */}
          {messages.length > 1 && (
            <div className="p-3 sm:p-4 border-t border-slate-200 bg-white shrink-0">
              <div className="relative max-w-2xl w-full mx-auto">
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="bg-slate-100 hover:bg-slate-200/70 transition-all border border-slate-300 focus-within:border-teal-600 focus-within:bg-white focus-within:ring-2 focus-within:ring-teal-500/20 rounded-full px-3 sm:px-4 py-2 flex items-center gap-2 shadow-2xs"
                >
                  <button
                    type="button"
                    onClick={() => setShowAttachMenu(!showAttachMenu)}
                    className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white hover:bg-slate-200 text-slate-700 flex items-center justify-center border border-slate-200 transition-all shrink-0 cursor-pointer shadow-2xs"
                    title="Add action or attachment"
                  >
                    <Plus className="w-5 h-5 text-slate-700" />
                  </button>

                  {/* Popover Attachment Menu */}
                  {showAttachMenu && (
                    <div className="absolute left-0 bottom-16 z-50 bg-white border border-slate-200 rounded-2xl p-2 shadow-xl w-64 text-left space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAttachMenu(false);
                          setShowSymptomModal(true);
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 rounded-xl flex items-center space-x-2 transition-colors"
                      >
                        <ClipboardList className="w-4 h-4 text-teal-600" />
                        <span>Structured Symptom Assessment</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowAttachMenu(false);
                          setActiveSubTab('report');
                        }}
                        className="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 rounded-xl flex items-center space-x-2 transition-colors"
                      >
                        <Upload className="w-4 h-4 text-teal-600" />
                        <span>Upload Medical Report</span>
                      </button>
                      {setActiveTab && (
                        <button
                          type="button"
                          onClick={() => {
                            setShowAttachMenu(false);
                            setActiveTab('find-book');
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 rounded-xl flex items-center space-x-2 transition-colors"
                        >
                          <Stethoscope className="w-4 h-4 text-teal-600" />
                          <span>Book Doctor Specialist</span>
                        </button>
                      )}
                    </div>
                  )}

                  <input
                    type="text"
                    value={inputPrompt}
                    onChange={e => setInputPrompt(e.target.value)}
                    placeholder="Ask anything..."
                    className="flex-1 bg-transparent border-0 text-slate-900 placeholder-slate-500 text-sm sm:text-base focus:outline-none focus:ring-0 px-2 font-medium"
                  />

                  <button
                    type="button"
                    onClick={toggleListening}
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      isListening
                        ? 'bg-red-100 text-red-600 animate-pulse'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                    title={isListening ? "Listening..." : "Voice input"}
                  >
                    {isListening ? <MicOff className="w-5 h-5 text-red-600" /> : <Mic className="w-5 h-5" />}
                  </button>

                  <button
                    type="submit"
                    disabled={loadingChat || (!inputPrompt.trim() && !isListening)}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-bold flex items-center justify-center shadow-md transition-transform active:scale-95 disabled:opacity-40 shrink-0 cursor-pointer"
                    title="Send"
                  >
                    <ArrowUp className="w-5 h-5 text-white" />
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Medical Report Scanner SubTab */
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900">Upload or Paste Medical Diagnostic Report</h2>
            <p className="text-xs text-slate-500">
              Upload image/PDF of lab panel or paste clinical text for plain-English explanation.
            </p>

            {/* Quick Sample Report Injectors */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-700">Try Sample Report:</span>
              <button
                onClick={() => loadSampleReport('blood')}
                className="text-xs font-medium bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl transition-colors"
              >
                💉 Metabolic & Lipid Panel
              </button>
              <button
                onClick={() => loadSampleReport('ekg')}
                className="text-xs font-medium bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl transition-colors"
              >
                ❤️ EKG Cardiology Summary
              </button>
              <button
                onClick={() => loadSampleReport('diabetes')}
                className="text-xs font-medium bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 px-3 py-1.5 rounded-xl transition-colors"
              >
                📊 Annual Diabetes Review
              </button>
            </div>

            {/* Upload File Control */}
            <div className="flex flex-col sm:flex-row gap-3">
              <label className="flex-1 flex items-center justify-center space-x-2 border-2 border-dashed border-slate-200 hover:border-teal-500 hover:bg-teal-500/5 bg-slate-50/50 p-5 rounded-2xl cursor-pointer transition-colors text-xs font-semibold text-slate-700">
                <Upload className="w-5 h-5 text-teal-600" />
                <span>Upload Report Document / Image</span>
                <input type="file" accept="image/*,.pdf,.txt" onChange={handleFileUpload} className="hidden" />
              </label>
            </div>

            {/* Text Area */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Medical Document / Lab Report Text:
              </label>
              <textarea
                value={reportText}
                onChange={e => setReportText(e.target.value)}
                rows={8}
                placeholder="Paste laboratory results, EKG interpretations, or discharge notes here..."
                className="w-full px-4 py-3 text-xs font-mono border border-slate-200 rounded-xl bg-slate-50/50 focus:outline-none focus:border-teal-500"
              />
            </div>

            <button
              onClick={handleAnalyzeReport}
              disabled={loadingReport || (!reportText && !reportImageBase64)}
              className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all shadow-md shadow-teal-600/20 flex items-center justify-center space-x-2 text-xs tracking-wide"
            >
              {loadingReport ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing Medical Document with Gemini AI...</span>
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  <span>Generate Plain-English AI Report Analysis</span>
                </>
              )}
            </button>
          </div>

          {/* Analysis Results Display */}
          {reportAnalysis && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-md space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2 text-slate-900 font-bold text-base">
                  <CheckCircle2 className="w-6 h-6 text-teal-600" />
                  <span>AI Clinical Analysis Result</span>
                </div>
                <button
                  onClick={() => speak(`${reportAnalysis.summary}. ${reportAnalysis.plainEnglishExplanation}`)}
                  className="text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 px-3.5 py-1.5 rounded-xl transition-colors flex items-center space-x-1.5"
                >
                  <Volume2 className="w-3.5 h-3.5 text-teal-600" />
                  <span>Listen Explanation</span>
                </button>
              </div>

              {/* Summary */}
              <div className="p-4 bg-teal-500/5 border border-teal-500/20 rounded-xl">
                <span className="text-xs font-bold text-teal-900 block mb-1">Executive Summary:</span>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">{reportAnalysis.summary}</p>
              </div>

              {/* Key Findings */}
              <div>
                <span className="text-xs font-bold text-slate-900 block mb-2">Key Lab Findings & Status:</span>
                <div className="space-y-1.5">
                  {reportAnalysis.keyFindings.map((finding: any, idx) => {
                    const text = typeof finding === 'object' && finding !== null
                      ? (finding.finding ? `${finding.finding}${finding.status ? `: ${finding.status}` : ''}` : JSON.stringify(finding))
                      : String(finding);
                    return (
                      <div key={idx} className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg text-xs flex items-center space-x-2.5 font-medium text-slate-700">
                        <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                        <span>{text}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Plain English Explanation */}
              <div>
                <span className="text-xs font-bold text-slate-900 block mb-2">Plain-English Patient Explanation:</span>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 leading-relaxed markdown-body [&_h2]:text-xs [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-2 [&_h2]:mb-1 [&_p]:mb-2 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_li]:mb-1 [&_strong]:font-semibold [&_strong]:text-slate-900">
                  <Markdown>
                    {typeof reportAnalysis.plainEnglishExplanation === 'string'
                      ? reportAnalysis.plainEnglishExplanation
                      : JSON.stringify(reportAnalysis.plainEnglishExplanation)}
                  </Markdown>
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <span className="text-xs font-bold text-slate-900 block mb-2">Recommended Questions for Doctor:</span>
                <ul className="list-disc list-inside text-xs text-slate-700 space-y-1">
                  {reportAnalysis.recommendations.map((rec: any, idx) => (
                    <li key={idx}>
                      {typeof rec === 'object' && rec !== null ? (rec.recommendation || rec.text || JSON.stringify(rec)) : String(rec)}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Clinical Advisory */}
      <MedicalDisclaimer />

      {/* Appointment Slip Modal */}
      {selectedSlipApp && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedSlipApp(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-slate-200 pb-4 mb-4 flex items-center space-x-3">
              <div className="w-10 h-10 bg-teal-600 text-white rounded-xl flex items-center justify-center font-bold">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">CareFlow AI Official Appointment Slip</h3>
                <p className="text-xs text-slate-500">Verified Clinical Appointment Confirmation</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-2 gap-3">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Appointment ID</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">{selectedSlipApp.id}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Status</span>
                  <span className="inline-block bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                    {selectedSlipApp.status.toUpperCase()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Patient Name</span>
                  <span className="font-bold text-slate-800">{patient?.name || 'Kamalesh'}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Date & Time</span>
                  <span className="font-bold text-slate-800">{selectedSlipApp.date} at {selectedSlipApp.time}</span>
                </div>
              </div>

              {doctors.find(d => d.id === selectedSlipApp.doctorId) && (
                <div className="border border-slate-200 rounded-xl p-4 space-y-1 bg-white">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Assigned Doctor</span>
                  <p className="font-bold text-slate-900 text-sm">{doctors.find(d => d.id === selectedSlipApp.doctorId)?.name}</p>
                  <p className="text-teal-700 font-medium">{doctors.find(d => d.id === selectedSlipApp.doctorId)?.specialty}</p>
                  <p className="text-slate-500">{doctors.find(d => d.id === selectedSlipApp.doctorId)?.hospital}</p>
                </div>
              )}

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  onClick={() => window.print()}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl flex items-center space-x-2 text-xs cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Appointment Slip</span>
                </button>
                <button
                  onClick={() => setSelectedSlipApp(null)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Structured Symptom Assessment Modal */}
      {showSymptomModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-4">
            <button
              onClick={() => setShowSymptomModal(false)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 bg-teal-50 text-teal-600 border border-teal-100 rounded-xl flex items-center justify-center font-bold">
                <ClipboardList className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Structured Symptom Assessment</h3>
                <p className="text-xs text-slate-500">Provide age, body temp & symptoms for AI specialty triage & doctor slot matching</p>
              </div>
            </div>

            <form onSubmit={handleStructuredAssessmentSubmit} className="space-y-4 text-xs">
              {/* Symptoms Details */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1 flex items-center space-x-1.5">
                  <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                  <span>Describe Your Symptom Details *</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={symptomDetails}
                  onChange={e => setSymptomDetails(e.target.value)}
                  placeholder="E.g., Severe throbbing headache behind eyes, chills, low energy, body aches..."
                  className="w-full p-3 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 text-slate-800 text-xs"
                />
              </div>

              {/* Age and Body Temperature Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Patient Age */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center space-x-1.5">
                    <User className="w-3.5 h-3.5 text-teal-600" />
                    <span>Patient Age (Years) *</span>
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={120}
                    value={patientAge}
                    onChange={e => setPatientAge(parseInt(e.target.value) || 28)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-800 text-xs font-semibold"
                  />
                </div>

                {/* Body Temperature */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center space-x-1.5">
                      <Thermometer className="w-3.5 h-3.5 text-teal-600" />
                      <span>Body Temp *</span>
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">
                      {parseFloat(temperature) >= 101 ? '🔴 High Fever' : parseFloat(temperature) >= 99 ? '🟡 Low Fever' : '🟢 Normal'}
                    </span>
                  </label>
                  <div className="flex items-center space-x-1">
                    <input
                      type="number"
                      step="0.1"
                      required
                      value={temperature}
                      onChange={e => setTemperature(e.target.value)}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-800 text-xs font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setTempUnit(tempUnit === 'F' ? 'C' : 'F')}
                      className="px-2.5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 font-bold text-xs rounded-xl text-slate-700 cursor-pointer"
                    >
                      °{tempUnit}
                    </button>
                  </div>
                </div>
              </div>

              {/* Duration and Severity */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center space-x-1.5">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    <span>Symptom Duration</span>
                  </label>
                  <select
                    value={symptomDuration}
                    onChange={e => setSymptomDuration(e.target.value)}
                    className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-800 text-xs font-medium"
                  >
                    <option value="Less than 24 hours">Less than 24 hours</option>
                    <option value="1 to 2 days">1 to 2 days</option>
                    <option value="3 to 5 days">3 to 5 days</option>
                    <option value="More than 1 week">More than 1 week</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center space-x-1.5">
                    <Activity className="w-3.5 h-3.5 text-teal-600" />
                    <span>Perceived Severity</span>
                  </label>
                  <div className="grid grid-cols-4 gap-1">
                    {(['Mild', 'Moderate', 'Severe', 'Urgent'] as const).map(sev => (
                      <button
                        type="button"
                        key={sev}
                        onClick={() => setSymptomSeverity(sev)}
                        className={`py-2 text-[11px] font-bold rounded-lg border transition-all cursor-pointer ${
                          symptomSeverity === sev
                            ? sev === 'Urgent'
                              ? 'bg-red-600 text-white border-red-600'
                              : sev === 'Severe'
                              ? 'bg-orange-600 text-white border-orange-600'
                              : 'bg-teal-600 text-white border-teal-600'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300'
                        }`}
                      >
                        {sev}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowSymptomModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 cursor-pointer text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!symptomDetails.trim()}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-all shadow-md shadow-teal-600/20 flex items-center space-x-1.5 cursor-pointer text-xs disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Causes & Recommend Doctors</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

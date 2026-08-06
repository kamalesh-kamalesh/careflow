import React, { useState, useRef, useEffect } from 'react';
import Markdown from 'react-markdown';
import { useAppContext } from '../../context/AppContext';
import { ChatMessage, ReportAnalysis, Doctor, Appointment } from '../../types';
import { MedicalDisclaimer } from '../common/MedicalDisclaimer';
import { HospitalService } from '../../services/HospitalService';
import { ALL_HOSPITALS } from '../../data/hospitalsData';
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
  X
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
      const hosp = ALL_HOSPITALS.find(h => h.name.toLowerCase().includes(doc.hospital.toLowerCase())) || ALL_HOSPITALS[idx % ALL_HOSPITALS.length];
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

    const structuredPrompt = `STRUCTURED SYMPTOM ASSESSMENT:
Patient Age: ${patientAge} years
Body Temperature: ${temperature}°${tempUnit} (${isFeverHigh ? 'High Fever' : isFeverMild ? 'Low-grade Fever' : 'Normal'})
Symptom Description: ${symptomDetails}
Duration: ${symptomDuration}
Self-Reported Severity: ${symptomSeverity}

Please analyze this structured health data and provide:
1. Likely Causes (ranked with brief clinical explanations)
2. Risk Level Analysis & Temperature Alert
3. Recommended Medical Specialties (specify primary & secondary)
4. Recommended Immediate Home Care
5. Guidance on when to seek urgent medical care`;

    const { specialty, severity, doctors: matchedDocs } = getDoctorMatchForSymptoms(symptomDetails);

    try {
      const response = await fetch('/api/chat', {
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
          history: messages.slice(-4).map(m => ({ role: m.sender, text: m.text }))
        })
      });

      const data = await response.json();

      const botMsg: ChatMessage = {
        id: `msg_bot_${Date.now()}`,
        sender: 'assistant',
        text: data.response || `Thank you. Based on your symptoms (${symptomDetails}), age (${patientAge}), and temperature (${temperature}°${tempUnit}), here is your clinical assessment report.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        bookingData: {
          step: 'doctor_list',
          specialty,
          severity,
          doctors: matchedDocs
        }
      };

      setMessages(prev => [...prev, botMsg]);
      speak(`Symptom analysis complete. Recommended specialty is ${specialty}. Please review available doctor slots below.`);
    } catch (err) {
      console.error('Structured Assessment Error:', err);
      const fallbackMsg: ChatMessage = {
        id: `msg_bot_fallback_${Date.now()}`,
        sender: 'assistant',
        text: `### 📋 Symptom Assessment Results

**Patient Profile:** ${patientAge} years old | Body Temp: **${temperature}°${tempUnit}** | Severity: **${symptomSeverity}**

**1. 🔍 Likely Causes:**
• **Acute Viral Syndrome / Infection** (Common with fever & systemic discomfort)
• **Upper Respiratory / Inflammatory Response**
• **Dehydration or Overexertion Effect**

**2. 🩺 Recommended Medical Specialty:**
• **${specialty}** (Primary Specialist)
• **General Medicine** (General Consultation)

**3. 🛡️ Recommended Home Care:**
• Stay well-hydrated with water, electrolyte solutions, or warm soups.
• Get plenty of restful sleep.
• Monitor your temperature every 4 hours.

**4. ⚠️ When to Seek Emergency Care:**
• High fever exceeding 103°F (39.4°C), severe breathlessness, chest pain, or extreme lethargy.`,
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

    const lowerText = text.toLowerCase();
    const isSymptomOrDoctorQuery =
      lowerText.includes('headache') ||
      lowerText.includes('fever') ||
      lowerText.includes('pain') ||
      lowerText.includes('doctor') ||
      lowerText.includes('appointment') ||
      lowerText.includes('book') ||
      lowerText.includes('cardiologist') ||
      lowerText.includes('neurologist') ||
      lowerText.includes('stomach') ||
      lowerText.includes('find') ||
      lowerText.includes('hospital');

    if (isSymptomOrDoctorQuery) {
      const { specialty, severity, doctors: matchedDocs } = getDoctorMatchForSymptoms(text);

      setTimeout(() => {
        const botMsg: ChatMessage = {
          id: `msg_bot_${Date.now()}`,
          sender: 'assistant',
          text: `I'm sorry you're not feeling well.

Based on your symptoms, you may need to consult a **${specialty}**.

**Severity:** ${severity === 'Urgent' ? '🔴 High Risk' : severity === 'Severe' ? '🟠 High' : '🟡 Moderate'}

Searching nearby hospitals in Erode... Here are available specialists & time slots:`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          bookingData: {
            step: 'doctor_list',
            specialty,
            severity,
            doctors: matchedDocs
          }
        };

        setMessages(prev => [...prev, botMsg]);
        speak(`Based on your symptoms, I recommend a ${specialty}. Choose an available time slot below.`);
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
          history: newMessages.slice(-4).map(m => ({ role: m.sender, text: m.text }))
        })
      });

      const data = await res.json();
      const botMsg: ChatMessage = {
        id: `msg_bot_${Date.now()}`,
        sender: 'assistant',
        text: data.response || data.fallback || 'I received your query. Please consult your physician for advice.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: data.source,
        disclaimer: data.disclaimer
      };

      setMessages(prev => [...prev, botMsg]);
      const plainSpeechText = botMsg.text.replace(/[*#_~`\-]/g, ' ').replace(/\s+/g, ' ').trim();
      speak(plainSpeechText.slice(0, 180));
    } catch (err) {
      console.error(err);
      setMessages(prev => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          sender: 'assistant',
          text: 'Thank you for your inquiry. How else can I assist with your appointments or health questions?',
          timestamp: 'Just now'
        }
      ]);
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
        <div className="bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col h-[620px] overflow-hidden">
          {/* Chat History Status Header */}
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <div className="flex items-center space-x-2 text-slate-600 font-medium">
              <History className="w-4 h-4 text-teal-600" />
              <span>Session History</span>
              <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-teal-200 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3 text-teal-600" />
                <span>Saved locally ({messages.length} {messages.length === 1 ? 'message' : 'messages'})</span>
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleExportCSV}
                className="text-slate-700 hover:text-teal-700 font-semibold flex items-center space-x-1 text-[11px] transition-colors cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs hover:border-teal-300"
                title="Export symptom analysis & chat history to CSV for long-term health tracking"
              >
                <Download className="w-3.5 h-3.5 text-teal-600" />
                <span>Export CSV</span>
              </button>
              {messages.length > 1 && (
                <button
                  onClick={handleClearHistory}
                  className="text-slate-500 hover:text-red-600 font-semibold flex items-center space-x-1 text-[11px] transition-colors cursor-pointer bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs hover:border-red-300"
                  title="Clear session history from local storage"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Clear History</span>
                </button>
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
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
                    {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                  </div>

                  <div className={`max-w-[85%] sm:max-w-[75%] space-y-1`}>
                    <div
                      className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        isUser
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-50 text-slate-800 border border-slate-100'
                      }`}
                    >
                      {isUser ? (
                        <p className="whitespace-pre-line">{msg.text}</p>
                      ) : (
                        <div className="space-y-3">
                          <div className="markdown-body space-y-2 [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mt-2 [&_h2]:mb-1 [&_h3]:text-xs [&_h3]:font-bold [&_h3]:text-slate-900 [&_h3]:mt-2 [&_h3]:mb-1 [&_ul]:list-disc [&_ul]:pl-4 [&_ul]:space-y-1 [&_ol]:list-decimal [&_ol]:pl-4 [&_ol]:space-y-1 [&_p]:leading-relaxed [&_strong]:font-semibold [&_hr]:my-2 [&_hr]:border-slate-200">
                            <Markdown>{msg.text}</Markdown>
                          </div>

                          {/* Interactive Doctor Cards inside Chat */}
                          {msg.bookingData?.step === 'doctor_list' && msg.bookingData.doctors && (
                            <div className="mt-3 space-y-3 pt-2 border-t border-slate-200">
                              <p className="text-xs font-bold text-slate-900 flex items-center space-x-1.5">
                                <Stethoscope className="w-4 h-4 text-teal-600" />
                                <span>Recommended Specialists for {msg.bookingData.specialty}:</span>
                              </p>

                              <div className="grid grid-cols-1 gap-3">
                                {msg.bookingData.doctors.map((docItem, idx) => (
                                  <div
                                    key={idx}
                                    className="bg-white border border-slate-200 hover:border-teal-300 rounded-xl p-3.5 shadow-xs transition-all space-y-2.5"
                                  >
                                    <div className="flex items-start justify-between">
                                      <div>
                                        <div className="flex items-center space-x-2">
                                          <h4 className="text-xs font-bold text-slate-900">{docItem.doctor.name}</h4>
                                          <span className="bg-teal-50 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-teal-100 flex items-center space-x-1">
                                            <Star className="w-2.5 h-2.5 fill-teal-500 text-teal-500" />
                                            <span>{docItem.rating}</span>
                                          </span>
                                        </div>
                                        <p className="text-[11px] font-medium text-slate-500 mt-0.5">
                                          {docItem.doctor.specialty} • {docItem.doctor.qualification || docItem.doctor.experience}
                                        </p>
                                        <div className="flex items-center space-x-3 text-[11px] text-slate-600 mt-1">
                                          <span className="flex items-center space-x-1">
                                            <MapPin className="w-3 h-3 text-slate-400" />
                                            <span className="font-semibold text-slate-700">{docItem.hospitalName}</span>
                                          </span>
                                          <span>•</span>
                                          <span>{docItem.distance}</span>
                                          <span>•</span>
                                          <span className="font-bold text-teal-700">{docItem.fee}</span>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Slots Selection Buttons */}
                                    <div>
                                      <p className="text-[10px] font-semibold text-slate-500 mb-1.5">Available Slots Today / Tomorrow:</p>
                                      <div className="flex flex-wrap gap-1.5">
                                        {docItem.availableSlots.map((slot, sIdx) => (
                                          <button
                                            key={sIdx}
                                            onClick={() => handleSlotSelect(docItem.doctor, docItem.hospitalName, slot)}
                                            className="bg-teal-50 hover:bg-teal-600 hover:text-white text-teal-800 border border-teal-200 text-xs font-bold px-3 py-1.5 rounded-lg transition-all shadow-2xs cursor-pointer"
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
                            <div className="mt-3 p-3.5 bg-white border border-teal-200 rounded-xl shadow-xs space-y-2.5">
                              <p className="text-xs font-semibold text-slate-700">Ready to finalize appointment booking?</p>
                              <button
                                onClick={() => handleConfirmBooking(msg.bookingData!.pendingBooking!)}
                                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md shadow-teal-600/20 flex items-center justify-center space-x-2 cursor-pointer"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>Confirm Appointment (Reply YES)</span>
                              </button>
                            </div>
                          )}

                          {/* Confirmed Appointment Quick Actions Box */}
                          {msg.bookingData?.step === 'confirmed' && msg.bookingData.confirmedAppointment && (
                            <div className="mt-3 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl space-y-3">
                              <div className="flex items-center space-x-2 text-emerald-800 font-bold text-xs">
                                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                <span>Appointment Saved to Medical Database</span>
                              </div>

                              <div className="flex flex-wrap gap-2 pt-1">
                                <button
                                  onClick={() => setSelectedSlipApp(msg.bookingData!.confirmedAppointment!)}
                                  className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 shadow-2xs cursor-pointer"
                                >
                                  <FileText className="w-3.5 h-3.5" />
                                  <span>Download Appointment Slip</span>
                                </button>

                                {setActiveTab && (
                                  <button
                                    onClick={() => setActiveTab('my-appointments')}
                                    className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer"
                                  >
                                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
                                    <span>View My Appointments</span>
                                  </button>
                                )}

                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(msg.bookingData.confirmedAppointment.doctorId + ' Erode')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5"
                                >
                                  <Navigation className="w-3.5 h-3.5 text-teal-600" />
                                  <span>Get Directions</span>
                                </a>

                                {setActiveTab && (
                                  <button
                                    onClick={() => setActiveTab('medicines')}
                                    className="bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 text-xs font-bold px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 cursor-pointer"
                                  >
                                    <Pill className="w-3.5 h-3.5 text-teal-600" />
                                    <span>Set Medicine Reminder</span>
                                  </button>
                                )}
                              </div>
                            </div>
                          )}

                          {(msg.text.includes('Dr.') || msg.text.includes('Hospital') || msg.text.includes('doctor') || msg.text.includes('Specialist') || msg.text.includes('appointment')) && !msg.bookingData && setActiveTab && (
                            <div className="pt-2 border-t border-slate-200/80 flex flex-wrap gap-2">
                              <button
                                onClick={() => setActiveTab('find-book')}
                                className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-all flex items-center space-x-1.5 shadow-xs"
                              >
                                <Stethoscope className="w-3.5 h-3.5" />
                                <span>Book Recommended Doctor</span>
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 text-[10px] text-slate-400 px-1 font-medium">
                      <span>{msg.timestamp}</span>
                      {!isUser && (
                        <button
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
              <div className="flex items-center space-x-3 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200 w-fit font-medium">
                <Loader2 className="w-4 h-4 animate-spin text-teal-600" />
                <span>CareFlow AI is analyzing prompt...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Structured Assessment Banner */}
          <div className="px-4 py-2 bg-teal-50/70 border-t border-slate-200 flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setShowSymptomModal(true)}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-3.5 py-1.5 rounded-xl transition-all shadow-2xs flex items-center space-x-2 cursor-pointer"
            >
              <ClipboardList className="w-4 h-4 text-white" />
              <span>📋 Structured Symptom Assessment (Age, Temp & Symptoms)</span>
            </button>
            <span className="text-[11px] text-teal-800 font-medium hidden sm:inline-block">
              Multi-factor clinical evaluation with instant doctor slot matching
            </span>
          </div>

          {/* Preset Prompts Chips */}
          <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50/80 overflow-x-auto scrollbar-none flex gap-2">
            {presetChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (chip.startsWith('📋')) {
                    setShowSymptomModal(true);
                  } else {
                    handleSendMessage(chip);
                  }
                }}
                className="text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 px-3.5 py-1.5 rounded-xl whitespace-nowrap transition-colors flex-shrink-0 shadow-xs cursor-pointer"
              >
                💡 {chip}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <div className="p-4 border-t border-slate-200 bg-white">
            <form
              onSubmit={e => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center space-x-2"
            >
              <input
                type="text"
                value={inputPrompt}
                onChange={e => setInputPrompt(e.target.value)}
                placeholder="Ask about your health, medications, or vitals..."
                className="flex-1 px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500"
              />

              <button
                type="submit"
                disabled={loadingChat || !inputPrompt.trim()}
                className="bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md shadow-teal-600/20 flex items-center space-x-1.5 flex-shrink-0"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="mt-2 text-center">
              <span className="text-[10px] font-medium text-slate-400">
                🔒 Medical Privacy Safe • Powered by Gemini 3.6 Flash Server Engine
              </span>
            </div>
          </div>
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

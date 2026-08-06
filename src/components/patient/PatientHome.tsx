import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { useAppContext } from '../../context/AppContext';
import { MedicalDisclaimer } from '../common/MedicalDisclaimer';
import { DoctorRecommendation } from '../common/DoctorRecommendation';
import { generatePatientSummaryPDF } from '../../utils/pdfGenerator';
import { DailyWellnessInsights } from './DailyWellnessInsights';
import {
  Calendar,
  Pill,
  MessageSquareHeart,
  Search,
  Activity,
  Heart,
  Clock,
  CheckCircle2,
  AlertCircle,
  Watch,
  FileSpreadsheet,
  ChevronRight,
  TrendingUp,
  User,
  ShieldAlert,
  Edit3,
  Download,
  FileText
} from 'lucide-react';

interface PatientHomeProps {
  setActiveTab: (tab: string) => void;
}

export const PatientHome: React.FC<PatientHomeProps> = ({ setActiveTab }) => {
  const { getActivePatient, appointments, medicines, doctors, updatePatientVitals, speak } = useAppContext();
  const patient = getActivePatient();

  const [showVitalsModal, setShowVitalsModal] = useState(false);
  const [bp, setBp] = useState(patient?.vitals.bloodPressure || '132/85 mmHg');
  const [hr, setHr] = useState(patient?.vitals.heartRate || 74);
  const [gl, setGl] = useState(patient?.vitals.glucose || 118);
  const [ox, setOx] = useState(patient?.vitals.oxygenLevel || 98);

  if (!patient) return null;

  const today = new Date().toISOString().split('T')[0];

  const todayAppointments = appointments.filter(
    a => a.patientId === patient.id && a.date === today && a.status !== 'cancelled'
  );

  const upcomingAppointments = appointments.filter(
    a => a.patientId === patient.id && a.date >= today && a.status === 'scheduled'
  );

  const userMeds = medicines.filter(m => m.patientId === patient.id);

  // Calculate 7-day adherence
  const calcAdherenceRate = () => {
    if (userMeds.length === 0) return 100;
    let totalDoses = 0;
    let takenDoses = 0;
    userMeds.forEach(m => {
      totalDoses += m.adherenceHistory.length;
      takenDoses += m.adherenceHistory.filter(Boolean).length;
    });
    return Math.round((takenDoses / totalDoses) * 100);
  };

  const adherenceRate = calcAdherenceRate();

  const handleSaveVitals = (e: React.FormEvent) => {
    e.preventDefault();
    updatePatientVitals(patient.id, {
      bloodPressure: bp,
      heartRate: Number(hr),
      glucose: Number(gl),
      oxygenLevel: Number(ox)
    });
    setShowVitalsModal(false);
    speak('Vitals updated successfully.');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 border border-slate-800 p-6 sm:p-8 text-white rounded-2xl shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-2 text-teal-400 text-xs font-semibold mb-2 tracking-wide uppercase">
              <span>Patient Telemetry</span>
              <span>•</span>
              <span className="font-mono bg-teal-500/10 px-2 py-0.5 rounded text-teal-300 border border-teal-500/20">ID: {patient.id.toUpperCase()}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {patient.name}
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-xl leading-relaxed">
              Care Protocol Active. You have{' '}
              <strong className="text-teal-400 font-bold">{todayAppointments.length} appointment(s)</strong> scheduled today.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => {
                generatePatientSummaryPDF(
                  patient,
                  appointments.filter(a => a.patientId === patient.id),
                  medicines.filter(m => m.patientId === patient.id),
                  doctors
                );
                speak('Generating and downloading medical PDF summary report.');
              }}
              className="bg-teal-500/20 hover:bg-teal-500/30 text-teal-200 border border-teal-500/30 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center space-x-2 shadow-sm"
            >
              <Download className="w-4 h-4 text-teal-400" />
              <span>Download PDF Summary</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('ai-assistant');
                speak('Opening AI Care Assistant');
              }}
              className="bg-white text-slate-900 border border-slate-200 text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-slate-100 transition-all flex items-center space-x-2 shadow-sm"
            >
              <MessageSquareHeart className="w-4 h-4 text-teal-600" />
              <span>Ask Care AI</span>
            </button>
            <button
              onClick={() => {
                setActiveTab('find-book');
                speak('Opening Doctor Booking');
              }}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl tracking-wide transition-all flex items-center space-x-2 shadow-md shadow-teal-600/30"
            >
              <Search className="w-4 h-4" />
              <span>Book Doctor</span>
            </button>
          </div>
        </div>

        {/* Patient quick badge row */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-wrap gap-2 text-xs">
          <span className="bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700/60 text-slate-200">
            Blood Group: <strong className="text-teal-400">{patient.bloodType}</strong>
          </span>
          <span className="bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700/60 text-slate-200">
            Conditions: <strong className="text-white">{patient.conditions.join(', ')}</strong>
          </span>
          <span className="bg-rose-500/10 px-3 py-1 rounded-lg border border-rose-500/20 text-rose-300 font-medium">
            Allergies: <strong>{patient.allergies.join(', ')}</strong>
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-700">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Today's Visits</span>
            <div className="w-9 h-9 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-slate-900">{todayAppointments.length}</p>
            <p className="text-xs font-medium text-teal-600 mt-1">
              {todayAppointments.length > 0 ? 'Appointment Scheduled' : 'No Visits Today'}
            </p>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-700">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Upcoming Visits</span>
            <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-slate-900">{upcomingAppointments.length}</p>
            <p className="text-xs font-medium text-slate-500 mt-1">Scheduled Queue</p>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-700">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Adherence Rate</span>
            <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-emerald-600">{adherenceRate}%</p>
            <p className="text-xs font-medium text-slate-500 mt-1">7-Day Compliance</p>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-700">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Prescriptions</span>
            <div className="w-9 h-9 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
              <Pill className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-slate-900">{userMeds.length}</p>
            <p className="text-xs font-medium text-indigo-600 mt-1">Active Scripts</p>
          </div>
        </div>
      </div>

      {/* Daily Wellness Insights Section */}
      <DailyWellnessInsights
        patient={patient}
        medicines={userMeds}
        setActiveTab={setActiveTab}
        speak={speak}
      />

      {/* Patient Recent Vitals Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-teal-50 text-teal-600 rounded-xl">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Current Vital Signs</h2>
              <p className="text-xs text-slate-500">Last Synced: {patient.vitals.lastUpdated}</p>
            </div>
          </div>
          <button
            onClick={() => setShowVitalsModal(true)}
            className="text-xs font-semibold text-teal-700 bg-teal-50 hover:bg-teal-100 px-3.5 py-2 rounded-xl transition-colors flex items-center space-x-1.5"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Update Vitals</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-slate-500 font-medium uppercase text-[10px]">Blood Pressure</p>
            <p className="text-base font-bold text-slate-900 mt-1">{patient.vitals.bloodPressure}</p>
            <span className="text-[10px] text-amber-600 font-semibold">Slightly Elevated</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-slate-500 font-medium uppercase text-[10px]">Heart Rate</p>
            <p className="text-base font-bold text-slate-900 mt-1">{patient.vitals.heartRate} BPM</p>
            <span className="text-[10px] text-emerald-600 font-semibold">Normal Range</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-slate-500 font-medium uppercase text-[10px]">Fasting Glucose</p>
            <p className="text-base font-bold text-slate-900 mt-1">{patient.vitals.glucose} MG/DL</p>
            <span className="text-[10px] text-emerald-600 font-semibold">Target Baseline</span>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-slate-500 font-medium uppercase text-[10px]">Blood Oxygen</p>
            <p className="text-base font-bold text-slate-900 mt-1">{patient.vitals.oxygenLevel}%</p>
            <span className="text-[10px] text-teal-600 font-semibold">Optimal SpO2</span>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button
          onClick={() => {
            setActiveTab('find-book');
            speak('Navigating to Find and Book Appointments');
          }}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-teal-500 hover:shadow-md text-left group transition-all"
        >
          <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center mb-3 group-hover:bg-teal-600 group-hover:text-white transition-colors">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 group-hover:text-teal-900 flex items-center justify-between">
            <span>Find & Book Doctor</span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-transform group-hover:translate-x-1" />
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Search specialists & check live queue wait times before booking.
          </p>
        </button>

        <button
          onClick={() => {
            setActiveTab('medicines');
            speak('Navigating to Medicines Schedule');
          }}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-teal-500 hover:shadow-md text-left group transition-all"
        >
          <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mb-3 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
            <Pill className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 group-hover:text-teal-900 flex items-center justify-between">
            <span>Medicines Tracker</span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-transform group-hover:translate-x-1" />
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Track daily dosages, log compliance, and request refill renewals.
          </p>
        </button>

        <button
          onClick={() => {
            setActiveTab('ai-assistant');
            speak('Navigating to AI Care Assistant');
          }}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-teal-500 hover:shadow-md text-left group transition-all"
        >
          <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
            <MessageSquareHeart className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 group-hover:text-teal-900 flex items-center justify-between">
            <span>AI Care Assistant</span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-transform group-hover:translate-x-1" />
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Ask symptom questions & upload lab reports for AI plain-English analysis.
          </p>
        </button>

        <button
          onClick={() => {
            setActiveTab('appointments');
            speak('Navigating to My Appointments');
          }}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-teal-500 hover:shadow-md text-left group transition-all"
        >
          <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Calendar className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-sm text-slate-900 group-hover:text-teal-900 flex items-center justify-between">
            <span>My Appointments</span>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-transform group-hover:translate-x-1" />
          </h3>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            View appointment status, queue positions, and doctor clinical notes.
          </p>
        </button>
      </div>

      {/* Health Trend Analytics Dashboard */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-600" />
              7-Day Health Analytics
            </h2>
            <p className="text-xs text-slate-500">Track your vital trends and activity levels</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Heart Rate Trend */}
          <div className="h-64">
            <h3 className="text-xs font-bold text-slate-700 mb-4 uppercase tracking-wider text-center">Resting Heart Rate Trend</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={[
                { day: 'Mon', heartRate: 72 },
                { day: 'Tue', heartRate: 75 },
                { day: 'Wed', heartRate: 71 },
                { day: 'Thu', heartRate: 74 },
                { day: 'Fri', heartRate: 78 },
                { day: 'Sat', heartRate: 70 },
                { day: 'Sun', heartRate: Number(hr) || 74 },
              ]}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} domain={['dataMin - 5', 'dataMax + 5']} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                />
                <Line
                  type="monotone"
                  dataKey="heartRate"
                  name="Heart Rate (BPM)"
                  stroke="#0d9488"
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff' }}
                  activeDot={{ r: 6, fill: '#0d9488' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Activity / Steps Trend */}
          <div className="h-64">
            <h3 className="text-xs font-bold text-slate-700 mb-4 uppercase tracking-wider text-center">Daily Activity (Steps)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={[
                { day: 'Mon', steps: 4200 },
                { day: 'Tue', steps: 5100 },
                { day: 'Wed', steps: 6300 },
                { day: 'Thu', steps: 4800 },
                { day: 'Fri', steps: 7100 },
                { day: 'Sat', steps: 8500 },
                { day: 'Sun', steps: 6800 },
              ]}>
                <defs>
                  <linearGradient id="colorSteps" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  labelStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                />
                <Area
                  type="monotone"
                  dataKey="steps"
                  name="Steps Count"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorSteps)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Today's Schedule & Reminders Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Today's Care Schedule</h2>
            <p className="text-xs text-slate-500">Scheduled clinical appointments & medication reminders</p>
          </div>
          <span className="text-xs font-mono font-semibold bg-slate-100 text-slate-700 px-3 py-1 rounded-full border border-slate-200">
            {today}
          </span>
        </div>

        {todayAppointments.length > 0 ? (
          <div className="space-y-3">
            {todayAppointments.map(app => {
              const doc = doctors.find(d => d.id === app.doctorId);
              return (
                <div
                  key={app.id}
                  className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-10 h-10 bg-teal-600 text-white rounded-xl flex items-center justify-center font-bold text-xs shadow-xs">
                      {app.time.split(' ')[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{doc?.name || 'Doctor'}</h4>
                      <p className="text-xs text-slate-500">{doc?.specialty} • {app.type}</p>
                      <p className="text-xs text-teal-700 font-semibold mt-1">Est. Wait: ~{app.estimatedWaitMins} mins (Queue Pos #{app.queuePosition})</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 text-xs font-semibold bg-emerald-100 text-emerald-800 rounded-full">
                      Confirmed
                    </span>
                    <button
                      onClick={() => setActiveTab('appointments')}
                      className="text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-200 px-3 py-1.5 rounded-lg transition-colors shadow-xs"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-6 text-center bg-slate-50/50 border border-slate-100 rounded-xl">
            <CheckCircle2 className="w-8 h-8 text-teal-600 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-900">No Clinic Visits Scheduled for Today</p>
            <p className="text-xs text-slate-500 mt-1">You are all caught up! Browse specialists to schedule your next checkup.</p>
          </div>
        )}
      </div>

      {/* Reusable Specialist Doctor Recommendations */}
      <DoctorRecommendation
        title="Top-Rated Specialist Doctors"
        description="Book appointments with top regional doctors based on your health profile."
        limit={3}
      />

      {/* Connected Health Devices Placeholder */}
      <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-xl flex items-center justify-center flex-shrink-0">
              <Watch className="w-6 h-6 text-teal-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-base text-white">Smart Wearable & Vital Sync</h3>
                <span className="text-[10px] bg-teal-500 text-slate-950 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Upcoming
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-xl leading-relaxed">
                Continuous vital tracking connecting with Apple Watch, Fitbit, and continuous glucose monitors (CGM) for automated caregiver alerts.
              </p>
            </div>
          </div>

          <button
            onClick={() => speak('Wearables integration arriving soon.')}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold px-4 py-2 rounded-xl transition-colors whitespace-nowrap self-start sm:self-auto"
          >
            Learn More
          </button>
        </div>
      </div>

      {/* Clinical Disclaimer */}
      <MedicalDisclaimer />

      {/* Vitals Modal */}
      {showVitalsModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Update Patient Vitals</h3>
            <p className="text-xs text-slate-500 mb-4">Record your latest physiological readings.</p>

            <form onSubmit={handleSaveVitals} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Blood Pressure (mmHg)</label>
                <input
                  type="text"
                  value={bp}
                  onChange={e => setBp(e.target.value)}
                  placeholder="e.g. 120/80 mmHg"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Heart Rate (bpm)</label>
                <input
                  type="number"
                  value={hr}
                  onChange={e => setHr(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fasting Glucose (mg/dL)</label>
                <input
                  type="number"
                  value={gl}
                  onChange={e => setGl(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Blood Oxygen SpO2 (%)</label>
                <input
                  type="number"
                  value={ox}
                  onChange={e => setOx(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500"
                  required
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVitalsModal(false)}
                  className="w-1/2 bg-slate-100 text-slate-700 font-semibold py-2.5 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-teal-600/20"
                >
                  Save Vitals
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Appointment, Patient } from '../../types';
import {
  Users,
  Clock,
  UserCheck,
  CheckCircle2,
  AlertTriangle,
  Play,
  ArrowRight,
  FileText,
  Activity,
  Heart,
  Pill,
  Phone,
  Search,
  ChevronRight
} from 'lucide-react';

export const QueueOverview: React.FC = () => {
  const { appointments, patients, doctors, getActiveDoctor, updateAppointmentStatus, speak } = useAppContext();
  const doctor = getActiveDoctor();

  const [selectedPatientForDrawer, setSelectedPatientForDrawer] = useState<Patient | null>(null);

  if (!doctor) return null;

  const today = new Date().toISOString().split('T')[0];

  // Filter doctor's appointments for today
  const doctorTodayApps = appointments.filter(
    a => a.doctorId === doctor.id && a.date === today && a.status !== 'cancelled'
  );

  const waitingQueue = doctorTodayApps.filter(a => a.status === 'scheduled');
  const inConsultation = doctorTodayApps.filter(a => a.status === 'in-progress');
  const completedQueue = doctorTodayApps.filter(a => a.status === 'completed');

  const handleCallNext = () => {
    if (waitingQueue.length === 0) {
      speak('No waiting patients in queue.');
      return;
    }
    const nextApp = waitingQueue[0];
    updateAppointmentStatus(nextApp.id, 'in-progress');
    const pat = patients.find(p => p.id === nextApp.patientId);
    speak(`Calling patient ${pat?.name || 'next patient'} to consultation room.`);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-slate-900 text-white border border-slate-800 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 text-teal-400 text-xs font-semibold uppercase mb-1">
            <span>Doctor Portal</span>
            <span>•</span>
            <span>{doctor.hospital}</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight">{doctor.name} - Live Clinic Queue</h1>
          <p className="text-xs text-slate-300 mt-1">
            Specialty: {doctor.specialty} • {waitingQueue.length} patient(s) waiting in queue.
          </p>
        </div>

        <button
          onClick={handleCallNext}
          disabled={waitingQueue.length === 0}
          className="bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-bold px-5 py-3 rounded-xl transition-all shadow-md shadow-teal-600/20 flex items-center space-x-2 text-xs flex-shrink-0 self-start md:self-auto tracking-wide"
        >
          <Play className="w-4 h-4 fill-white" />
          <span>Call Next Patient</span>
        </button>
      </div>

      {/* Queue Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Waiting in Queue</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{waitingQueue.length}</p>
          </div>
          <div className="w-10 h-10 bg-teal-50 text-teal-600 border border-teal-100 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 text-teal-600" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">In Consultation</p>
            <p className="text-2xl font-extrabold text-teal-700 mt-1">{inConsultation.length}</p>
          </div>
          <div className="w-10 h-10 bg-teal-500 text-white rounded-xl flex items-center justify-center">
            <Clock className="w-5 h-5 animate-spin" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase">Visits Completed</p>
            <p className="text-2xl font-extrabold text-slate-900 mt-1">{completedQueue.length}</p>
          </div>
          <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-slate-700" />
          </div>
        </div>
      </div>

      {/* Active Consultation Highlight Section */}
      {inConsultation.length > 0 && (
        <div className="bg-teal-500/5 border border-teal-500/20 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-teal-500/20 pb-3">
            <div className="flex items-center space-x-2 text-teal-900 font-bold text-sm">
              <span className="w-2.5 h-2.5 bg-teal-600 rounded-full animate-ping"></span>
              <span>Active Consultation in Progress</span>
            </div>
            <span className="text-xs font-semibold bg-slate-900 text-white px-3 py-1 rounded-full">
              Room #102
            </span>
          </div>

          {inConsultation.map(app => {
            const pat = patients.find(p => p.id === app.patientId);
            if (!pat) return null;
            return (
              <div
                key={app.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs"
              >
                <div>
                  <h3 className="font-bold text-base text-slate-900">{pat.name}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {pat.age} yrs • {pat.gender} • BP: <strong className="text-slate-900 font-semibold">{pat.vitals.bloodPressure}</strong>
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-2 text-[10px] font-semibold">
                    <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-md">
                      Allergies: {pat.allergies.join(', ')}
                    </span>
                    <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-md">
                      Conditions: {pat.conditions.join(', ')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={() => setSelectedPatientForDrawer(pat)}
                    className="text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 px-3.5 py-2 border border-slate-200 rounded-xl transition-colors shadow-xs"
                  >
                    View EHR Profile
                  </button>
                  <button
                    onClick={() => {
                      updateAppointmentStatus(app.id, 'completed', 'Consultation finished. Patient stable.');
                      speak(`Consultation completed for ${pat.name}`);
                    }}
                    className="text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-teal-600/20"
                  >
                    Complete Visit
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Main Queue List */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">Today's Patient Queue ({doctorTodayApps.length})</h2>

        {doctorTodayApps.length > 0 ? (
          <div className="space-y-3">
            {doctorTodayApps.map((app, index) => {
              const pat = patients.find(p => p.id === app.patientId);
              if (!pat) return null;

              return (
                <div
                  key={app.id}
                  className={`p-4 border rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all ${
                    app.status === 'in-progress'
                      ? 'bg-teal-50/50 border-teal-200 shadow-xs'
                      : app.status === 'completed'
                      ? 'bg-slate-50/50 border-slate-200 opacity-60'
                      : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-slate-900 text-white font-bold rounded-xl flex items-center justify-center text-xs flex-shrink-0">
                      #{index + 1}
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-bold text-sm text-slate-900">{pat.name}</h4>
                        <span className="text-[10px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-full">
                          {app.time}
                        </span>
                        {app.priority === 'Urgent' && (
                          <span className="text-[10px] bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded-full">
                            URGENT
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 mt-0.5">
                        {pat.age}y {pat.gender} • Type: {app.type} • Est. Wait: ~{app.estimatedWaitMins}m
                      </p>

                      <div className="flex flex-wrap gap-2 text-[11px] text-slate-600 mt-1 font-medium">
                        <span>Vitals: {pat.vitals.bloodPressure}</span>
                        <span>•</span>
                        <span>Glucose: {pat.vitals.glucose} mg/dL</span>
                      </div>
                    </div>
                  </div>

                  {/* Right actions */}
                  <div className="flex items-center space-x-2 self-end sm:self-auto">
                    <button
                      onClick={() => setSelectedPatientForDrawer(pat)}
                      className="text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 px-3.5 py-1.5 border border-slate-200 rounded-xl transition-colors shadow-xs"
                    >
                      Patient EHR
                    </button>

                    {app.status === 'scheduled' && (
                      <button
                        onClick={() => {
                          updateAppointmentStatus(app.id, 'in-progress');
                          speak(`Started consultation for ${pat.name}`);
                        }}
                        className="text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-1.5 rounded-xl transition-all shadow-xs"
                      >
                        Start Visit
                      </button>
                    )}

                    {app.status === 'in-progress' && (
                      <button
                        onClick={() => {
                          updateAppointmentStatus(app.id, 'completed');
                          speak(`Completed visit for ${pat.name}`);
                        }}
                        className="text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 px-3.5 py-1.5 rounded-xl transition-all shadow-md shadow-teal-600/20"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            <Users className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">Queue is Clear for Today</p>
          </div>
        )}
      </div>

      {/* EHR Summary Drawer */}
      {selectedPatientForDrawer && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-end">
          <div className="bg-white max-w-lg w-full h-full p-6 overflow-y-auto border-l border-slate-200 shadow-2xl flex flex-col justify-between">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">{selectedPatientForDrawer.name}</h3>
                  <p className="text-xs text-slate-500">Electronic Health Record (EHR) Summary</p>
                </div>
                <button
                  onClick={() => setSelectedPatientForDrawer(null)}
                  className="text-slate-400 hover:text-slate-700 font-bold text-xl p-1"
                >
                  ✕
                </button>
              </div>

              {/* Vitals Box */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2 text-xs">
                <span className="font-bold text-slate-900 block mb-1">Recent Vital Measurements</span>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block font-medium text-[11px]">Blood Pressure:</span>
                    <strong className="text-slate-900 text-sm font-bold">{selectedPatientForDrawer.vitals.bloodPressure}</strong>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block font-medium text-[11px]">Heart Rate:</span>
                    <strong className="text-slate-900 text-sm font-bold">{selectedPatientForDrawer.vitals.heartRate} bpm</strong>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block font-medium text-[11px]">Fasting Glucose:</span>
                    <strong className="text-slate-900 text-sm font-bold">{selectedPatientForDrawer.vitals.glucose} mg/dL</strong>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-slate-400 block font-medium text-[11px]">Oxygen SpO2:</span>
                    <strong className="text-slate-900 text-sm font-bold">{selectedPatientForDrawer.vitals.oxygenLevel}%</strong>
                  </div>
                </div>
              </div>

              {/* Conditions & Allergies */}
              <div className="space-y-3 text-xs">
                <div>
                  <span className="font-bold text-slate-900 block mb-1.5">Diagnosed Chronic Conditions:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPatientForDrawer.conditions.map(c => (
                      <span key={c} className="bg-slate-100 text-slate-800 font-semibold px-2.5 py-1 rounded-lg">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="font-bold text-rose-800 block mb-1.5">Severe Allergies:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedPatientForDrawer.allergies.map(a => (
                      <span key={a} className="bg-rose-50 text-rose-800 border border-rose-200 font-semibold px-2.5 py-1 rounded-lg">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="font-bold text-slate-900 block mb-0.5">Emergency Contact:</span>
                  <p className="text-slate-700 font-medium">{selectedPatientForDrawer.emergencyContact.name} ({selectedPatientForDrawer.emergencyContact.relationship})</p>
                  <p className="text-teal-700 font-bold mt-0.5">{selectedPatientForDrawer.emergencyContact.phone}</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setSelectedPatientForDrawer(null)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 rounded-xl text-xs mt-6 transition-all shadow-xs"
            >
              Close EHR Drawer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

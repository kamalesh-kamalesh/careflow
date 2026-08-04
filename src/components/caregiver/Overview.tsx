import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Patient } from '../../types';
import {
  HeartPulse,
  Users,
  AlertCircle,
  Pill,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Phone,
  Mail,
  Activity,
  ShieldAlert
} from 'lucide-react';

interface OverviewProps {
  setActiveTab: (tab: string) => void;
}

export const CaregiverOverview: React.FC<OverviewProps> = ({ setActiveTab }) => {
  const { patients, caregivers, alerts, getActiveCaregiver, speak } = useAppContext();
  const caregiver = getActiveCaregiver();

  if (!caregiver) return null;

  // Patients linked to this caregiver
  const linkedPatients = patients.filter(p => caregiver.patientIds.includes(p.id) || p.caregiverId === caregiver.id);
  const activeAlerts = alerts.filter(a => !a.resolved);

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-slate-500 text-xs font-semibold uppercase mb-1">
              <span>Caregiver Portal</span>
              <span>•</span>
              <span>{caregiver.relationship}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Welcome, {caregiver.name}</h1>
            <p className="text-xs text-slate-500 mt-1">
              Monitoring <span className="font-semibold text-slate-900 underline">{linkedPatients.length} care recipient(s)</span>. You have{' '}
              <span className="font-bold text-rose-600">{activeAlerts.length} active alert(s)</span> requiring attention.
            </p>
          </div>

          <button
            onClick={() => {
              setActiveTab('alerts');
              speak('Opening Real-Time Alerts');
            }}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md shadow-teal-600/20 transition-all flex items-center space-x-2 whitespace-nowrap self-start md:self-auto tracking-wide"
          >
            <AlertCircle className="w-4 h-4 text-white" />
            <span>View Active Alerts ({activeAlerts.length})</span>
          </button>
        </div>
      </div>

      {/* Linked Patients Section */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-slate-900">Assigned Care Recipients ({linkedPatients.length})</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {linkedPatients.map(pat => {
            const patientAlerts = alerts.filter(a => a.patientId === pat.id && !a.resolved);
            return (
              <div
                key={pat.id}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4"
              >
                {/* Top Patient Bar */}
                <div className="flex items-start justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 bg-slate-100 text-slate-700 rounded-2xl flex items-center justify-center font-bold text-base border border-slate-200">
                      {pat.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-slate-900">{pat.name}</h3>
                      <p className="text-xs text-slate-500">
                        {pat.age} yrs • {pat.gender} • Blood: <strong className="font-semibold text-slate-800">{pat.bloodType}</strong>
                      </p>
                    </div>
                  </div>

                  {patientAlerts.length > 0 ? (
                    <span className="bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold px-3 py-1 rounded-full">
                      {patientAlerts.length} Alert(s)
                    </span>
                  ) : (
                    <span className="bg-teal-50 text-teal-700 border border-teal-200 text-xs font-semibold px-3 py-1 rounded-full">
                      ✓ All Clear
                    </span>
                  )}
                </div>

                {/* Vitals Grid */}
                <div>
                  <span className="text-xs font-semibold text-slate-700 block mb-2">Latest Vital Readings ({pat.vitals.lastUpdated}):</span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-slate-400 text-[10px] block font-medium">BP Reading:</span>
                      <strong className="text-slate-900 font-bold">{pat.vitals.bloodPressure}</strong>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-slate-400 text-[10px] block font-medium">Heart Rate:</span>
                      <strong className="text-slate-900 font-bold">{pat.vitals.heartRate} bpm</strong>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-slate-400 text-[10px] block font-medium">Glucose:</span>
                      <strong className="text-slate-900 font-bold">{pat.vitals.glucose} mg/dL</strong>
                    </div>
                    <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl">
                      <span className="text-slate-400 text-[10px] block font-medium">Oxygen:</span>
                      <strong className="text-slate-900 font-bold">{pat.vitals.oxygenLevel}%</strong>
                    </div>
                  </div>
                </div>

                {/* Conditions */}
                <div className="text-xs">
                  <span className="font-semibold text-slate-700 block mb-1">Monitored Conditions:</span>
                  <div className="flex flex-wrap gap-1">
                    {pat.conditions.map(c => (
                      <span key={c} className="bg-slate-100 text-slate-700 font-medium px-2.5 py-0.5 rounded-lg text-[11px]">
                        {c}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Quick actions */}
                <div className="flex items-center space-x-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => {
                      setActiveTab('adherence');
                      speak(`Viewing adherence history for ${pat.name}`);
                    }}
                    className="w-1/2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md shadow-teal-600/20 text-center tracking-wide"
                  >
                    Adherence History
                  </button>
                  <a
                    href={`tel:${pat.phone}`}
                    className="w-1/2 bg-slate-50 hover:bg-slate-100 text-slate-700 font-semibold text-xs py-2.5 border border-slate-200 rounded-xl transition-colors text-center flex items-center justify-center space-x-1.5 shadow-xs"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Patient</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

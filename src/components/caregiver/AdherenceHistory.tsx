import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { BarChart3, Pill, Bell, Send, CheckCircle2, ShieldAlert } from 'lucide-react';

export const AdherenceHistory: React.FC = () => {
  const { patients, medicines, getActiveCaregiver, speak } = useAppContext();
  const caregiver = getActiveCaregiver();

  const [selectedPatientId, setSelectedPatientId] = useState<string>(patients[0]?.id || 'p1');
  const [sentReminderText, setSentReminderText] = useState<string | null>(null);

  if (!caregiver) return null;

  const linkedPatients = patients.filter(p => caregiver.patientIds.includes(p.id) || p.caregiverId === caregiver.id);
  const activePatient = patients.find(p => p.id === selectedPatientId) || linkedPatients[0];
  const patientMeds = medicines.filter(m => m.patientId === activePatient?.id);

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];

  // Construct daily compliance data for selected patient
  const dailyComplianceData = dayLabels.map((day, dayIndex) => {
    let takenCount = 0;
    let totalMeds = patientMeds.length || 1;
    patientMeds.forEach(m => {
      if (m.adherenceHistory[dayIndex]) takenCount++;
    });
    const percentage = Math.round((takenCount / totalMeds) * 100);
    return {
      day,
      percentage,
      dosesTaken: takenCount,
      totalDoses: totalMeds
    };
  });

  const handleSendNudge = () => {
    setSentReminderText(`Push Notification Sent to ${activePatient?.name}: "Reminder from Caregiver ${caregiver.name}: Please log your evening dosage in CareFlow AI."`);
    speak(`Sent medication reminder notification to ${activePatient?.name}`);
    setTimeout(() => {
      setSentReminderText(null);
    }, 5000);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">7-Day Medication Adherence Analytics</h1>
          <p className="text-xs text-slate-500 mt-0.5">Track care recipient compliance trends & issue instant reminder nudges.</p>
        </div>

        {/* Patient selector */}
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-700">Select Patient:</span>
          <select
            value={selectedPatientId}
            onChange={e => setSelectedPatientId(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:border-teal-500"
          >
            {linkedPatients.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Reminder Notification Toast Banner */}
      {sentReminderText && (
        <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-md flex items-center justify-between text-xs transition-all">
          <div className="flex items-center space-x-2">
            <Send className="w-4 h-4 text-teal-400 animate-bounce" />
            <span className="font-medium">{sentReminderText}</span>
          </div>
          <span className="text-[10px] bg-teal-600 px-2.5 py-1 font-bold rounded-full uppercase">DELIVERED</span>
        </div>
      )}

      {/* Main Chart */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="font-bold text-base text-slate-900">{activePatient?.name} - Weekly Compliance Trend</h3>
            <p className="text-xs text-slate-500">Percentage of prescribed daily doses logged on time</p>
          </div>

          <button
            onClick={handleSendNudge}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-teal-600/20 flex items-center space-x-2 self-start sm:self-auto tracking-wide"
          >
            <Bell className="w-4 h-4" />
            <span>Send Reminder Alert</span>
          </button>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dailyComplianceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.4} />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
              <Tooltip />
              <Bar dataKey="percentage" fill="#0f172a" radius={[6, 6, 0, 0]} name="Adherence %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Prescriptions Breakdown Table */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="font-bold text-sm text-slate-900">Medication-by-Medication Breakdown</h3>

        <div className="space-y-3">
          {patientMeds.map(med => {
            const takenDays = med.adherenceHistory.filter(Boolean).length;
            const rate = Math.round((takenDays / med.adherenceHistory.length) * 100);

            return (
              <div
                key={med.id}
                className="p-4 border border-slate-200 rounded-2xl bg-slate-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 bg-teal-50 text-teal-700 rounded-xl flex items-center justify-center font-bold border border-teal-100">
                    <Pill className="w-4 h-4 text-teal-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{med.name} ({med.dosage})</h4>
                    <p className="text-slate-500">{med.frequency} • Prescribed by {med.prescribedBy}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 self-end sm:self-auto">
                  <div className="text-right">
                    <span className="font-extrabold text-slate-900 block text-sm">{rate}%</span>
                    <span className="text-[10px] text-slate-500 font-medium">{takenDays} of 7 days taken</span>
                  </div>

                  <div className="w-24 bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${rate >= 80 ? 'bg-teal-600' : 'bg-rose-500'}`}
                      style={{ width: `${rate}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

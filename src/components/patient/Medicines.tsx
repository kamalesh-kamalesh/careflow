import React from 'react';
import { useAppContext } from '../../context/AppContext';
import { Medicine } from '../../types';
import {
  Pill,
  CheckCircle2,
  AlertTriangle,
  RotateCw,
  Clock,
  Calendar,
  ShieldAlert,
  Sun,
  Sunset,
  Moon,
  HelpCircle,
  TrendingUp
} from 'lucide-react';

export const Medicines: React.FC = () => {
  const { medicines, getActivePatient, toggleMedicationDose, refillRequest, speak } = useAppContext();
  const patient = getActivePatient();

  if (!patient) return null;

  const patientMeds = medicines.filter(m => m.patientId === patient.id);

  const getTimeOfDayIcon = (time: string) => {
    switch (time) {
      case 'Morning':
        return <Sun className="w-4 h-4 text-amber-500" />;
      case 'Afternoon':
        return <Sunset className="w-4 h-4 text-orange-500" />;
      case 'Evening':
        return <Moon className="w-4 h-4 text-indigo-500" />;
      default:
        return <Clock className="w-4 h-4 text-teal-500" />;
    }
  };

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Today'];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Medication & Dosage Tracker</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log daily doses, track 7-day compliance history, & request prescription refills.
          </p>
        </div>

        <div className="bg-slate-900 text-white border border-slate-800 rounded-xl px-4 py-2.5 text-center flex-shrink-0 shadow-xs">
          <span className="text-[10px] uppercase font-semibold text-teal-400 block tracking-wider">Active Prescriptions</span>
          <span className="text-xl font-extrabold">{patientMeds.length} MEDS</span>
        </div>
      </div>

      {/* Allergies Notice Banner */}
      {patient.allergies.length > 0 && (
        <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-4 flex items-center space-x-3 text-xs text-slate-700">
          <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <div>
            <span className="font-semibold uppercase text-rose-900">Recorded Patient Allergies: </span>
            <span className="font-bold text-rose-700">{patient.allergies.join(', ')}</span>
            <p className="text-[11px] text-slate-600 mt-0.5">Always verify new medications with Dr. Sarah Chen before starting.</p>
          </div>
        </div>
      )}

      {/* Medication Cards List */}
      <div className="space-y-4">
        {patientMeds.map(med => {
          return (
            <div
              key={med.id}
              className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4"
            >
              {/* Med Top Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs">
                    <Pill className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h3 className="font-bold text-base text-slate-900">{med.name}</h3>
                      <span className="bg-slate-100 text-slate-700 font-semibold px-2.5 py-0.5 text-xs rounded-full">
                        {med.dosage}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Frequency: {med.frequency} • Prescribed by {med.prescribedBy}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <span className={`text-xs font-semibold px-3 py-1.5 rounded-xl border ${
                    med.refillRemaining === 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-slate-50 text-slate-700 border-slate-200'
                  }`}>
                    Refills Left: <strong>{med.refillRemaining}</strong>
                  </span>

                  <button
                    onClick={() => refillRequest(med.id)}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl transition-all shadow-xs flex items-center space-x-1.5"
                  >
                    <RotateCw className="w-3.5 h-3.5" />
                    <span>Request Refill</span>
                  </button>
                </div>
              </div>

              {/* Instructions Callout */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs text-slate-700 flex items-start space-x-2.5">
                <HelpCircle className="w-4 h-4 text-teal-600 flex-shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-slate-900 mb-0.5">Dosage Instructions:</span>
                  <span className="text-slate-600">{med.instructions}</span>
                </div>
              </div>

              {/* Today's Dosage Checkboxes */}
              <div>
                <span className="text-xs font-bold text-slate-900 block mb-2 uppercase tracking-wide">Today's Dose Compliance:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {med.timeOfDay.map(time => {
                    const isTaken = med.takenToday[time] || false;
                    return (
                      <button
                        key={time}
                        onClick={() => {
                          toggleMedicationDose(med.id, time);
                          speak(`${med.name} ${time} dose marked as ${!isTaken ? 'taken' : 'not taken'}`);
                        }}
                        className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold transition-all ${
                          isTaken
                            ? 'bg-teal-50 border-teal-200 text-teal-900 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          {getTimeOfDayIcon(time)}
                          <span>{time} Dose ({med.dosage})</span>
                        </div>

                        {isTaken ? (
                          <span className="flex items-center space-x-1 text-teal-700 font-bold">
                            <CheckCircle2 className="w-4 h-4 text-teal-600" />
                            <span>Taken</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-600 border border-slate-200 px-2 py-0.5 bg-slate-50 rounded-lg">
                            Mark Taken
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 7-Day History Progress */}
              <div className="pt-3 border-t border-slate-100">
                <div className="flex items-center justify-between text-xs text-slate-600 mb-2">
                  <span className="font-semibold">Last 7-Days Adherence History</span>
                  <span className="font-bold text-teal-700">
                    {Math.round(
                      (med.adherenceHistory.filter(Boolean).length / med.adherenceHistory.length) * 100
                    )}
                    % COMPLIANT
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {med.adherenceHistory.map((status, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center">
                      <div
                        className={`w-full h-3 rounded-full ${
                          status ? 'bg-teal-500' : 'bg-rose-400'
                        }`}
                        title={`${dayLabels[idx]}: ${status ? 'Taken' : 'Missed'}`}
                      />
                      <span className="text-[10px] text-slate-400 font-medium mt-1">{dayLabels[idx]}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { UserRole } from '../types';
import { MedicalDisclaimer } from './common/MedicalDisclaimer';
import {
  HeartPulse,
  User,
  Stethoscope,
  Users,
  Volume2,
  ShieldCheck,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const { switchRole, patients, doctors, caregivers, speak } = useAppContext();
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');

  const handleQuickLogin = (role: UserRole, id?: string) => {
    switchRole(role, id);
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 relative">
      <div className="max-w-xl w-full bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden relative z-10">
        {/* Top Header */}
        <div className="bg-slate-900 p-8 text-white text-center relative border-b border-slate-800">
          <div className="w-12 h-12 bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-sm">
            <HeartPulse className="w-7 h-7 text-teal-400" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">CareFlow <span className="text-teal-400">AI</span></h1>
          <p className="text-xs font-medium text-slate-400 mt-1.5 max-w-sm mx-auto tracking-wide">
            Clinical Telemetry & Multi-Portal Healthcare System
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Role selector buttons */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Select Operating Mode
            </label>
            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setSelectedRole('patient')}
                className={`py-3 px-3 rounded-xl border text-xs font-semibold transition-all flex flex-col items-center space-y-1.5 ${
                  selectedRole === 'patient'
                    ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <User className={`w-4 h-4 ${selectedRole === 'patient' ? 'text-white' : 'text-slate-500'}`} />
                <span>Patient</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('doctor')}
                className={`py-3 px-3 rounded-xl border text-xs font-semibold transition-all flex flex-col items-center space-y-1.5 ${
                  selectedRole === 'doctor'
                    ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Stethoscope className={`w-4 h-4 ${selectedRole === 'doctor' ? 'text-white' : 'text-slate-500'}`} />
                <span>Doctor</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedRole('caregiver')}
                className={`py-3 px-3 rounded-xl border text-xs font-semibold transition-all flex flex-col items-center space-y-1.5 ${
                  selectedRole === 'caregiver'
                    ? 'bg-teal-600 text-white border-teal-600 shadow-md shadow-teal-600/20'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Users className={`w-4 h-4 ${selectedRole === 'caregiver' ? 'text-white' : 'text-slate-500'}`} />
                <span>Caregiver</span>
              </button>
            </div>
          </div>

          {/* User selector list depending on role */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
              Available User Profiles ({selectedRole.toUpperCase()}):
            </span>

            {selectedRole === 'patient' && (
              <div className="space-y-2">
                {patients.map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleQuickLogin('patient', p.id)}
                    className="w-full p-3.5 rounded-xl border border-slate-200 bg-white hover:border-teal-500 hover:bg-teal-50/50 text-left transition-all flex items-center justify-between group shadow-xs"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-teal-900">{p.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {p.age}y • Conditions: {p.conditions.join(', ')}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-transform group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            )}

            {selectedRole === 'doctor' && (
              <div className="space-y-2">
                {doctors.map(d => (
                  <button
                    key={d.id}
                    onClick={() => handleQuickLogin('doctor', d.id)}
                    className="w-full p-3.5 rounded-xl border border-slate-200 bg-white hover:border-teal-500 hover:bg-teal-50/50 text-left transition-all flex items-center justify-between group shadow-xs"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-teal-900">{d.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {d.specialty} • {d.hospital}
                      </p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-transform group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            )}

            {selectedRole === 'caregiver' && (
              <div className="space-y-2">
                {caregivers.map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleQuickLogin('caregiver', c.id)}
                    className="w-full p-3.5 rounded-xl border border-slate-200 bg-white hover:border-teal-500 hover:bg-teal-50/50 text-left transition-all flex items-center justify-between group shadow-xs"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-slate-900 group-hover:text-teal-900">{c.name}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{c.relationship}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-transform group-hover:translate-x-1" />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              onClick={() => handleQuickLogin(selectedRole)}
              className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 rounded-xl transition-all text-xs uppercase tracking-wider shadow-md shadow-teal-600/20"
            >
              Launch {selectedRole.toUpperCase()} Portal
            </button>
          </div>

          {/* Voice Guidance Note */}
          <div className="flex items-center justify-center space-x-2 text-xs font-semibold text-slate-600 pt-2 border-t border-slate-100">
            <Volume2 className="w-4 h-4 text-teal-600" />
            <span>Voice Guidance & Accessibility Active</span>
          </div>

          {/* Clinical Disclaimer compact */}
          <MedicalDisclaimer compact />
        </div>
      </div>
    </div>
  );
};

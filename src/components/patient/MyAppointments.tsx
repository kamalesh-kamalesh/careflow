import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Appointment } from '../../types';
import { generatePatientSummaryPDF } from '../../utils/pdfGenerator';
import {
  Calendar,
  Clock,
  User,
  Stethoscope,
  CheckCircle2,
  XCircle,
  FileText,
  AlertCircle,
  ChevronRight,
  Building2,
  Download
} from 'lucide-react';

export const MyAppointments: React.FC = () => {
  const { appointments, medicines, doctors, getActivePatient, updateAppointmentStatus, speak } = useAppContext();
  const patient = getActivePatient();
  const [statusFilter, setStatusFilter] = useState<string>('all');

  if (!patient) return null;

  const patientAppointments = appointments.filter(a => a.patientId === patient.id);

  const filtered = patientAppointments.filter(a => {
    if (statusFilter === 'all') return true;
    return a.status === statusFilter;
  });

  const getStatusBadge = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-teal-100 text-teal-800 rounded-full">Scheduled</span>;
      case 'in-progress':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-blue-100 text-blue-800 rounded-full animate-pulse">In Consultation</span>;
      case 'completed':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-slate-100 text-slate-700 rounded-full">Completed</span>;
      case 'cancelled':
        return <span className="px-2.5 py-1 text-xs font-semibold bg-rose-100 text-rose-800 rounded-full">Cancelled</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Filter */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">My Appointments Schedule</h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">Track upcoming appointments, wait times, & clinical consultation history.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              generatePatientSummaryPDF(
                patient,
                patientAppointments,
                medicines.filter(m => m.patientId === patient.id),
                doctors
              );
              speak('Downloading appointment and medical summary PDF');
            }}
            className="px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-all flex items-center space-x-2 min-h-[44px] cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Summary PDF</span>
          </button>
          {['all', 'scheduled', 'completed', 'cancelled'].map(st => (
            <button
              key={st}
              onClick={() => {
                setStatusFilter(st);
                speak(`Filtering appointments by ${st}`);
              }}
              className={`px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wide transition-all min-h-[44px] cursor-pointer ${
                statusFilter === st
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Appointment Cards */}
      {filtered.length > 0 ? (
        <div className="space-y-4">
          {filtered.map(app => {
            const doc = doctors.find(d => d.id === app.doctorId);
            return (
              <div
                key={app.id}
                className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-teal-50 text-teal-600 border border-teal-100 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 shadow-xs">
                    <Calendar className="w-5 h-5 text-teal-600" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-base text-slate-900">{doc?.name || 'Dr. Specialist'}</h3>
                      {getStatusBadge(app.status)}
                    </div>

                    <p className="text-xs font-semibold text-teal-600 mt-0.5">
                      {doc?.specialty} • {doc?.hospital}
                    </p>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 mt-2">
                      <span className="flex items-center space-x-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <strong className="font-medium text-slate-800">{app.date}</strong>
                      </span>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <strong className="font-medium text-slate-800">{app.time}</strong>
                      </span>
                      <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-[10px] font-semibold">
                        Type: {app.type}
                      </span>
                    </div>

                    {app.notes && (
                      <p className="text-xs text-slate-600 mt-2.5 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        "{app.notes}"
                      </p>
                    )}

                    {app.doctorNotes && (
                      <div className="mt-3 p-3.5 bg-teal-500/5 border border-teal-500/20 rounded-xl text-xs">
                        <p className="font-bold text-teal-900 flex items-center space-x-1">
                          <FileText className="w-3.5 h-3.5 text-teal-600" />
                          <span>Doctor Clinical Notes:</span>
                        </p>
                        <p className="text-slate-700 mt-1">{app.doctorNotes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Status & Actions Right Column */}
                <div className="flex flex-col md:items-end justify-between self-stretch pt-3 md:pt-0 border-t md:border-t-0 border-slate-100">
                  {app.status === 'scheduled' && (
                    <div className="md:text-right mb-2">
                      <span className="text-[10px] uppercase font-semibold text-slate-400 block tracking-wider">Queue Priority</span>
                      <span className="text-xs font-bold text-teal-700">
                        Pos #{app.queuePosition || 1} • ~{app.estimatedWaitMins || 15} MINS WAIT
                      </span>
                    </div>
                  )}

                  {app.status === 'scheduled' && (
                    <button
                      onClick={() => {
                        updateAppointmentStatus(app.id, 'cancelled');
                        speak('Appointment cancelled');
                      }}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 bg-white px-3.5 py-2 border border-slate-200 rounded-xl transition-colors shadow-xs"
                    >
                      Cancel Appointment
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-xs">
          <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <h3 className="font-bold text-sm text-slate-900">No Appointments Found</h3>
          <p className="text-xs text-slate-500 mt-1">There are no appointments matching the selected category.</p>
        </div>
      )}
    </div>
  );
};

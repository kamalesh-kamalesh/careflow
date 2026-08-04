import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Appointment } from '../../types';
import {
  Calendar,
  Clock,
  User,
  PlusCircle,
  FileText,
  CheckCircle2,
  Pill,
  Check,
  Search
} from 'lucide-react';

export const DoctorAppointments: React.FC = () => {
  const { appointments, patients, getActiveDoctor, addPrescription, updateAppointmentStatus, speak } = useAppContext();
  const doctor = getActiveDoctor();

  const [selectedAppNotes, setSelectedAppNotes] = useState<Appointment | null>(null);
  const [docNotesText, setDocNotesText] = useState('');

  // Prescription modal state
  const [showPrescribeModal, setShowPrescribeModal] = useState(false);
  const [targetPatientId, setTargetPatientId] = useState<string>(patients[0]?.id || '');
  const [medName, setMedName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('Once daily');
  const [timesOfDay, setTimesOfDay] = useState<('Morning' | 'Afternoon' | 'Evening' | 'PRN')[]>(['Morning']);
  const [instructions, setInstructions] = useState('');

  if (!doctor) return null;

  const docAppointments = appointments.filter(a => a.doctorId === doctor.id);

  const handleSaveNotes = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppNotes) return;
    updateAppointmentStatus(selectedAppNotes.id, selectedAppNotes.status, docNotesText);
    setSelectedAppNotes(null);
    setDocNotesText('');
    speak('Clinical consultation notes saved.');
  };

  const handlePrescribeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetPatientId || !medName || !dosage) return;

    addPrescription(targetPatientId, medName, dosage, frequency, timesOfDay, instructions || 'Take as directed.');
    setShowPrescribeModal(false);
    setMedName('');
    setDosage('');
    setInstructions('');
  };

  const toggleTimeSelection = (time: 'Morning' | 'Afternoon' | 'Evening' | 'PRN') => {
    if (timesOfDay.includes(time)) {
      if (timesOfDay.length > 1) {
        setTimesOfDay(timesOfDay.filter(t => t !== time));
      }
    } else {
      setTimesOfDay([...timesOfDay, time]);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Appointments Schedule & Prescriptions</h1>
          <p className="text-xs text-slate-500 mt-0.5">Manage patient consultation appointments & issue digital prescriptions.</p>
        </div>

        <button
          onClick={() => {
            setShowPrescribeModal(true);
            speak('Opening prescription portal');
          }}
          className="bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs px-4 py-2.5 rounded-xl transition-all shadow-md shadow-teal-600/20 flex items-center space-x-2 flex-shrink-0 uppercase tracking-wide"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Prescribe New Medication</span>
        </button>
      </div>

      {/* Appointment Schedule List */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900">Total Consultations ({docAppointments.length})</h2>

        <div className="space-y-3">
          {docAppointments.map(app => {
            const pat = patients.find(p => p.id === app.patientId);
            if (!pat) return null;

            return (
              <div
                key={app.id}
                className="p-4 border border-slate-200 rounded-2xl bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-start space-x-3">
                  <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-xl flex items-center justify-center font-bold text-xs flex-shrink-0 border border-slate-200">
                    <User className="w-5 h-5 text-slate-600" />
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-sm text-slate-900">{pat.name}</h4>
                      <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                        {app.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Date: <strong className="font-medium text-slate-800">{app.date}</strong> at <strong className="font-medium text-slate-800">{app.time}</strong> • Type: {app.type}
                    </p>

                    {app.notes && (
                      <p className="text-xs text-slate-600 italic mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                        Patient Request: "{app.notes}"
                      </p>
                    )}

                    {app.doctorNotes && (
                      <p className="text-xs text-slate-700 mt-2 bg-teal-500/5 p-2.5 rounded-xl border border-teal-500/20">
                        <strong className="text-teal-900">Clinical Notes:</strong> {app.doctorNotes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center space-x-2 self-end sm:self-auto">
                  <button
                    onClick={() => {
                      setSelectedAppNotes(app);
                      setDocNotesText(app.doctorNotes || '');
                    }}
                    className="text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 px-3.5 py-2 border border-slate-200 rounded-xl flex items-center space-x-1.5 transition-colors shadow-xs"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>{app.doctorNotes ? 'Edit Notes' : 'Write Notes'}</span>
                  </button>

                  <button
                    onClick={() => {
                      setTargetPatientId(pat.id);
                      setShowPrescribeModal(true);
                    }}
                    className="text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 px-3.5 py-2 rounded-xl flex items-center space-x-1.5 transition-colors shadow-xs"
                  >
                    <Pill className="w-3.5 h-3.5 text-teal-400" />
                    <span>Prescribe</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Clinical Notes Modal */}
      {selectedAppNotes && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">Clinical Consultation Notes</h3>
            <p className="text-xs text-slate-500 mb-4">Add diagnostic notes & treatment plan for record keeping.</p>

            <form onSubmit={handleSaveNotes} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Physician Assessment Notes:</label>
                <textarea
                  value={docNotesText}
                  onChange={e => setDocNotesText(e.target.value)}
                  rows={5}
                  placeholder="e.g. EKG normal. Advised continuing Lisinopril 10mg..."
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-teal-500 text-slate-800"
                  required
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedAppNotes(null)}
                  className="w-1/2 bg-slate-100 text-slate-700 font-semibold py-2.5 rounded-xl border border-slate-200 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-teal-600/20"
                >
                  Save Notes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Prescribe Medication Modal */}
      {showPrescribeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl">
            <h3 className="text-base font-bold text-slate-900 mb-1">Issue New Digital Prescription</h3>
            <p className="text-xs text-slate-500 mb-4">Prescription will be automatically pushed to patient's tracker.</p>

            <form onSubmit={handlePrescribeSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Patient</label>
                <select
                  value={targetPatientId}
                  onChange={e => setTargetPatientId(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-800"
                >
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.conditions.join(', ')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Medication Name</label>
                <input
                  type="text"
                  value={medName}
                  onChange={e => setMedName(e.target.value)}
                  placeholder="e.g. Atorvastatin, Amlodipine..."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-teal-500 font-medium text-slate-800"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dosage</label>
                  <input
                    type="text"
                    value={dosage}
                    onChange={e => setDosage(e.target.value)}
                    placeholder="e.g. 10 mg, 500 mg"
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-teal-500 font-medium text-slate-800"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Frequency</label>
                  <select
                    value={frequency}
                    onChange={e => setFrequency(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-800"
                  >
                    <option value="Once daily">Once daily</option>
                    <option value="Twice daily">Twice daily</option>
                    <option value="Three times daily">Three times daily</option>
                    <option value="As needed (PRN)">As needed (PRN)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dosing Time Slots</label>
                <div className="flex flex-wrap gap-2">
                  {(['Morning', 'Afternoon', 'Evening', 'PRN'] as const).map(t => {
                    const isSelected = timesOfDay.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleTimeSelection(t)}
                        className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                          isSelected
                            ? 'bg-slate-900 border-slate-900 text-white'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected ? '✓ ' : ''}{t}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Special Instructions</label>
                <input
                  type="text"
                  value={instructions}
                  onChange={e => setInstructions(e.target.value)}
                  placeholder="e.g. Take with morning breakfast."
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:border-teal-500 font-medium text-slate-800"
                />
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPrescribeModal(false)}
                  className="w-1/2 bg-slate-100 text-slate-700 font-semibold py-2.5 rounded-xl border border-slate-200 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-teal-600/20"
                >
                  Issue Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

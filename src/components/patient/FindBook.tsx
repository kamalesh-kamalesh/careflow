import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Doctor } from '../../types';
import {
  Search,
  Calendar,
  Clock,
  MapPin,
  Star,
  UserCheck,
  Building2,
  CheckCircle2,
  Stethoscope,
  ChevronRight,
  Filter
} from 'lucide-react';

export const FindBook: React.FC = () => {
  const { doctors, getActivePatient, bookAppointment, speak } = useAppContext();
  const patient = getActivePatient();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);

  // Booking Form state
  const [bookingDate, setBookingDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [bookingTime, setBookingTime] = useState<string>('10:00 AM');
  const [appointmentType, setAppointmentType] = useState<
    'Follow-up' | 'Consultation' | 'Routine Checkup' | 'Lab Review'
  >('Follow-up');
  const [patientNotes, setPatientNotes] = useState<string>('');

  const specialties = ['All', 'Cardiology & Internal Medicine', 'Pulmonology & Respiratory Care', 'Endocrinology & Diabetes Care'];

  const filteredDoctors = doctors.filter(doc => {
    const matchesSearch =
      doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.hospital.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSpecialty = selectedSpecialty === 'All' || doc.specialty === selectedSpecialty;
    return matchesSearch && matchesSpecialty;
  });

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor || !patient) return;

    await bookAppointment({
      patientId: patient.id,
      doctorId: selectedDoctor.id,
      date: bookingDate,
      time: bookingTime,
      type: appointmentType,
      priority: 'Standard',
      notes: patientNotes || `${appointmentType} requested via CareFlow AI.`
    });

    setSelectedDoctor(null);
    setPatientNotes('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Search Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <h1 className="text-xl font-bold tracking-tight text-slate-900">Find & Book Specialist Doctors</h1>
        <p className="text-xs text-slate-500 mt-1">
          Search qualified healthcare providers with real-time clinic queue wait-time visibility.
        </p>

        <div className="mt-5 flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search doctor, specialty, or clinic..."
              className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
            <select
              value={selectedSpecialty}
              onChange={e => setSelectedSpecialty(e.target.value)}
              className="bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 rounded-xl focus:outline-none focus:border-teal-500"
            >
              {specialties.map(spec => (
                <option key={spec} value={spec}>
                  {spec}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Doctor List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDoctors.map(doc => {
          const estWaitMins = doc.currentQueueCount * doc.avgConsultationTimeMins;
          return (
            <div
              key={doc.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-teal-50 text-teal-700 border border-teal-100 rounded-2xl flex items-center justify-center font-bold text-base shadow-xs">
                      {doc.name.replace('Dr. ', '').charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 group-hover:text-teal-900">{doc.name}</h3>
                      <p className="text-xs font-semibold text-teal-600">{doc.specialty}</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 bg-amber-50 text-amber-800 px-2.5 py-1 text-xs font-bold rounded-lg border border-amber-200">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{doc.rating}</span>
                  </div>
                </div>

                {/* Info Pills */}
                <div className="space-y-2 text-xs text-slate-600 mb-4">
                  <div className="flex items-center space-x-2">
                    <Building2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                    <span className="truncate">{doc.hospital}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>{doc.availability}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <UserCheck className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <span>{doc.experience} EXP • {doc.patientsCount}+ Patients</span>
                  </div>
                </div>

                {/* Live Queue Banner */}
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 mb-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-medium text-slate-400 block tracking-wider">
                      Live Queue Wait-Time
                    </span>
                    <span className="text-xs font-bold text-slate-800">
                      ~{estWaitMins} MINS EST
                    </span>
                  </div>
                  <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2.5 py-1 rounded-full">
                    {doc.currentQueueCount} IN QUEUE
                  </span>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => {
                  setSelectedDoctor(doc);
                  speak(`Booking appointment with ${doc.name}`);
                }}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md shadow-teal-600/20 flex items-center justify-center space-x-2 tracking-wide"
              >
                <Calendar className="w-4 h-4" />
                <span>Book Appointment</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Booking Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Schedule Appointment</h3>
                <p className="text-xs font-semibold text-teal-600">{selectedDoctor.name} ({selectedDoctor.specialty})</p>
              </div>
              <span className="text-xs bg-slate-100 text-slate-700 font-medium px-2.5 py-1 rounded-lg">
                {selectedDoctor.hospital}
              </span>
            </div>

            <form onSubmit={handleBookSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Appointment Date</label>
                <input
                  type="date"
                  value={bookingDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={e => setBookingDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 font-semibold text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Preferred Time Slot</label>
                <select
                  value={bookingTime}
                  onChange={e => setBookingTime(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 font-semibold text-slate-800"
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="11:30 AM">11:30 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="03:30 PM">03:30 PM</option>
                  <option value="04:15 PM">04:15 PM</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Consultation Type</label>
                <select
                  value={appointmentType}
                  onChange={e => setAppointmentType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 font-semibold text-slate-800"
                >
                  <option value="Follow-up">Follow-up Checkup</option>
                  <option value="Consultation">General Consultation</option>
                  <option value="Routine Checkup">Routine Preventive Checkup</option>
                  <option value="Lab Review">Lab & Diagnostic Review</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Symptoms or Notes for Doctor</label>
                <textarea
                  value={patientNotes}
                  onChange={e => setPatientNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Mild chest discomfort, requesting medication refill discussion..."
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 text-slate-800"
                />
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between text-xs text-slate-700">
                  <span>Estimated Queue Position:</span>
                  <span className="font-bold">#{selectedDoctor.currentQueueCount + 1}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-700 mt-1">
                  <span>Estimated Wait Time:</span>
                  <span className="font-bold text-teal-700">~{(selectedDoctor.currentQueueCount + 1) * selectedDoctor.avgConsultationTimeMins} mins</span>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedDoctor(null)}
                  className="w-1/2 bg-slate-100 text-slate-700 font-semibold py-2.5 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-1/2 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 rounded-xl transition-all shadow-md shadow-teal-600/20"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

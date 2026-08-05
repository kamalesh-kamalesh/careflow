import React, { useState } from 'react';
import { Doctor, Appointment } from '../../types';
import { HospitalService } from '../../services/HospitalService';
import { ERODE_HOSPITALS } from '../../data/hospitalsData';
import { useAppContext } from '../../context/AppContext';
import { Star, MapPin, Calendar, Clock, Stethoscope, CheckCircle2, X } from 'lucide-react';

interface DoctorRecommendationProps {
  title?: string;
  description?: string;
  limit?: number;
  specialtyFilter?: string;
  onBookSuccess?: (appointment: Appointment) => void;
}

export const DoctorRecommendation: React.FC<DoctorRecommendationProps> = ({
  title,
  description,
  limit,
  specialtyFilter = '',
  onBookSuccess
}) => {
  const { doctors, getActivePatient, bookAppointment } = useAppContext();
  const patient = getActivePatient();

  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string>('11:00 AM');
  const [bookingDate, setBookingDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  let filteredDoctors = specialtyFilter
    ? HospitalService.filterDoctorsBySpecialty(specialtyFilter, doctors)
    : doctors;

  if (limit && limit > 0) {
    filteredDoctors = filteredDoctors.slice(0, limit);
  }

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor || !patient) return;

    setIsSubmitting(true);
    try {
      const created = await bookAppointment({
        patientId: patient.id,
        doctorId: selectedDoctor.id,
        date: bookingDate,
        time: selectedSlot,
        type: 'Consultation',
        priority: 'Standard',
        notes: `Direct recommendation booking for ${selectedDoctor.specialty}`
      });

      setToastMessage(`Appointment confirmed with ${selectedDoctor.name}!`);
      setTimeout(() => setToastMessage(null), 3500);

      if (onBookSuccess) {
        onBookSuccess(created);
      }
      setSelectedDoctor(null);
    } catch (err) {
      console.error(err);
      setToastMessage('Error booking appointment');
      setTimeout(() => setToastMessage(null), 3500);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      {toastMessage && (
        <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg flex items-center justify-between">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
            <Stethoscope className="w-4 h-4 text-teal-600" />
            <span>{title || `Recommended Doctors ${specialtyFilter ? `(${specialtyFilter})` : ''}`}</span>
          </h3>
          {description && <p className="text-xs text-slate-500 mt-0.5">{description}</p>}
        </div>
        <span className="text-xs text-slate-500 font-medium">
          {filteredDoctors.length} Specialists Available
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDoctors.map(doctor => {
          const hosp = ERODE_HOSPITALS.find(h => h.name.toLowerCase().includes(doctor.hospital.toLowerCase()));
          return (
            <div
              key={doctor.id}
              className="bg-white border border-slate-200 hover:border-teal-400 rounded-2xl p-4 shadow-xs transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{doctor.name}</h4>
                    <p className="text-xs font-semibold text-teal-700">{doctor.specialty}</p>
                    <p className="text-[11px] text-slate-500">{doctor.qualification || doctor.experience}</p>
                  </div>
                  <span className="bg-teal-50 text-teal-800 text-xs font-bold px-2.5 py-1 rounded-lg border border-teal-100 flex items-center space-x-1">
                    <Star className="w-3 h-3 fill-teal-500 text-teal-500" />
                    <span>{doctor.rating || 4.8}</span>
                  </span>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span className="font-semibold text-slate-800">{hosp?.name || doctor.hospital}</span>
                  </div>
                  <div className="flex items-center space-x-1.5 text-slate-500 text-[11px]">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Timings: 10:00 AM - 05:00 PM</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                <span className="text-xs font-bold text-teal-700">₹350 Fee</span>
                <button
                  onClick={() => setSelectedDoctor(doctor)}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs px-4 py-2 rounded-xl transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Book Appointment</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Booking Form Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedDoctor(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-slate-900 mb-1">Book Appointment</h3>
            <p className="text-xs text-slate-500 mb-4">
              {selectedDoctor.name} ({selectedDoctor.specialty})
            </p>

            <form onSubmit={handleBookSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Patient Name</label>
                <input
                  type="text"
                  readOnly
                  value={patient?.name || 'Kamalesh'}
                  className="w-full p-2.5 border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Appointment Date</label>
                <input
                  type="date"
                  value={bookingDate}
                  onChange={e => setBookingDate(e.target.value)}
                  className="w-full p-2.5 border border-slate-200 rounded-xl text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Preferred Time Slot</label>
                <div className="grid grid-cols-2 gap-2">
                  {['10:30 AM', '11:00 AM', '12:15 PM', '04:00 PM'].map(slot => (
                    <button
                      type="button"
                      key={slot}
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        selectedSlot === slot
                          ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-teal-300'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setSelectedDoctor(null)}
                  className="px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-all shadow-md shadow-teal-600/20 flex items-center space-x-1.5 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Booking</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

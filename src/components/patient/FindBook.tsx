import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { Doctor, Hospital } from '../../types';
import { ALL_HOSPITALS, SUPPORTED_DISTRICTS } from '../../data/hospitalsData';
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
  Filter,
  PhoneCall,
  Navigation,
  ShieldAlert,
  Hospital as HospitalIcon,
  X
} from 'lucide-react';

export const FindBook: React.FC = () => {
  const { doctors, getActivePatient, bookAppointment, speak, selectedDistrict, setSelectedDistrict } = useAppContext();
  const patient = getActivePatient();

  const [activeTab, setActiveTab] = useState<'doctors' | 'hospitals'>('doctors');
  const [searchTerm, setSearchTerm] = useState('');
  const [districtFilter, setDistrictFilter] = useState<string>(selectedDistrict || 'All');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('All');
  const [selectedHospitalFilter, setSelectedHospitalFilter] = useState<string>('All');
  const [emergencyOnly, setEmergencyOnly] = useState<boolean>(false);
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [bookedSuccess, setBookedSuccess] = useState<{ doctorName: string; date: string; time: string } | null>(null);

  // Sync local districtFilter when global selectedDistrict changes
  React.useEffect(() => {
    if (selectedDistrict) {
      setDistrictFilter(selectedDistrict);
    }
  }, [selectedDistrict]);

  // Booking Form state
  const [bookingDate, setBookingDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().split('T')[0];
  });
  const [bookingTime, setBookingTime] = useState<string>('10:00 AM');
  const [appointmentType, setAppointmentType] = useState<
    'Follow-up' | 'Consultation' | 'Routine Checkup' | 'Lab Review'
  >('Consultation');
  const [priority, setPriority] = useState<'Standard' | 'Urgent'>('Standard');
  const [patientNotes, setPatientNotes] = useState<string>('');

  const specialties = ['All', ...Array.from(new Set(doctors.map(doc => doc.specialty))).sort()];
  const availableHospitals = ALL_HOSPITALS;

  const filteredDoctors = doctors.filter(doc => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      doc.name.toLowerCase().includes(term) ||
      doc.specialty.toLowerCase().includes(term) ||
      (doc.qualification && doc.qualification.toLowerCase().includes(term)) ||
      doc.hospital.toLowerCase().includes(term) ||
      (doc.district && doc.district.toLowerCase().includes(term));
    const matchesSpecialty = selectedSpecialty === 'All' || doc.specialty === selectedSpecialty;
    const matchesHospital = selectedHospitalFilter === 'All' || doc.hospital.toLowerCase().includes(selectedHospitalFilter.toLowerCase());
    const docDist = doc.district || 'Erode';
    const matchesDistrict = districtFilter === 'All' || docDist === districtFilter;
    return matchesSearch && matchesSpecialty && matchesHospital && matchesDistrict;
  });

  const filteredHospitals = ALL_HOSPITALS.filter(hosp => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      hosp.name.toLowerCase().includes(term) ||
      hosp.location.toLowerCase().includes(term) ||
      hosp.keySpecialties.some(s => s.toLowerCase().includes(term)) ||
      (hosp.district && hosp.district.toLowerCase().includes(term));
    const matchesEmergency = !emergencyOnly || hosp.emergency24x7;
    const hospDist = hosp.district || 'Erode';
    const matchesDistrict = districtFilter === 'All' || hospDist === districtFilter;
    return matchesSearch && matchesEmergency && matchesDistrict;
  });

  const handleBookAtHospital = (hosp: Hospital) => {
    const docsAtHosp = doctors.filter(d => d.hospital.toLowerCase().includes(hosp.name.toLowerCase()));
    if (docsAtHosp.length > 0) {
      setSelectedDoctor(docsAtHosp[0]);
    } else {
      const defaultHospDoc: Doctor = {
        id: `doc_hosp_${hosp.id}`,
        name: `${hosp.name} Specialist Consultant`,
        specialty: hosp.keySpecialties[0] || 'General Medicine',
        hospital: hosp.name,
        rating: hosp.rating,
        currentQueueCount: 2,
        avgConsultationTimeMins: 15,
        availability: '09:00 AM - 08:00 PM',
        experience: '10+ Yrs',
        patientsCount: 350,
        patients: []
      };
      setSelectedDoctor(defaultHospDoc);
    }
    speak(`Selected ${hosp.name} for appointment booking`);
  };

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor || !patient) return;

    await bookAppointment({
      patientId: patient.id,
      doctorId: selectedDoctor.id,
      date: bookingDate,
      time: bookingTime,
      type: appointmentType,
      priority: priority,
      notes: patientNotes || `${appointmentType} requested via CareFlow AI.`
    });

    const confirmInfo = { doctorName: selectedDoctor.name, date: bookingDate, time: bookingTime };
    setBookedSuccess(confirmInfo);
    speak(`Appointment confirmed with ${selectedDoctor.name} on ${bookingDate} at ${bookingTime}`);

    setSelectedDoctor(null);
    setPatientNotes('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Booking Confirmation Success Banner */}
      {bookedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between text-emerald-900 animate-fadeIn">
          <div className="flex items-center space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <div>
              <p className="text-xs font-bold">Appointment Confirmed Successfully!</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Scheduled with <strong>{bookedSuccess.doctorName}</strong> on <strong>{bookedSuccess.date}</strong> at <strong>{bookedSuccess.time}</strong>. Confirmation SMS & Notification generated.
              </p>
            </div>
          </div>
          <button
            onClick={() => setBookedSuccess(null)}
            className="text-xs font-semibold bg-emerald-100 hover:bg-emerald-200 text-emerald-800 px-3 py-1.5 rounded-lg transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-slate-900">
              {activeTab === 'doctors' ? 'Find & Book Specialist Doctors' : 'Erode Hospitals & Emergency Map Directory'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1 font-medium">
              {activeTab === 'doctors'
                ? 'Search 49+ qualified specialist healthcare providers across Erode region with real-time queue visibility.'
                : 'Browse 70+ top hospitals, multi-specialty centers, emergency trauma units & dialysis centers across Erode.'}
            </p>
          </div>

          {/* Tab Switcher */}
          <div className="flex items-center space-x-1.5 bg-slate-100 p-1.5 rounded-xl border border-slate-200">
            <button
              onClick={() => setActiveTab('doctors')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center space-x-2 min-h-[40px] cursor-pointer ${
                activeTab === 'doctors' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <Stethoscope className="w-4 h-4" />
              <span>Specialist Doctors ({doctors.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('hospitals')}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all flex items-center space-x-2 min-h-[40px] cursor-pointer ${
                activeTab === 'hospitals' ? 'bg-slate-900 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
              }`}
            >
              <HospitalIcon className="w-4 h-4" />
              <span>Hospitals Directory ({ALL_HOSPITALS.length})</span>
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-3 pt-3 border-t border-slate-100">
          {/* Location District Selector */}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider hidden sm:flex items-center gap-1">
              <MapPin className="w-4 h-4 text-teal-600" /> Location:
            </span>
            <select
              value={districtFilter}
              onChange={e => {
                setDistrictFilter(e.target.value);
                if (e.target.value !== 'All') setSelectedDistrict(e.target.value);
              }}
              className="bg-teal-50 border border-teal-200 text-teal-950 font-bold px-3.5 py-2.5 text-xs sm:text-sm rounded-xl focus:outline-none focus:border-teal-600 shadow-2xs cursor-pointer min-h-[44px]"
            >
              <option value="All">All Districts ({SUPPORTED_DISTRICTS.length})</option>
              {SUPPORTED_DISTRICTS.map(d => (
                <option key={d} value={d}>
                  📍 {d} District
                </option>
              ))}
            </select>
          </div>

          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder={
                activeTab === 'doctors'
                  ? 'Search doctor, specialty, district or hospital...'
                  : 'Search hospital name, location, district, or specialty...'
              }
              className="w-full pl-10 pr-4 py-2.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-teal-500 transition-colors"
            />
          </div>

          {activeTab === 'doctors' ? (
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center space-x-1">
                <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
                <select
                  value={selectedHospitalFilter}
                  onChange={e => setSelectedHospitalFilter(e.target.value)}
                  className="bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 rounded-xl focus:outline-none focus:border-teal-500 max-w-[180px] sm:max-w-[220px]"
                >
                  <option value="All">All Hospitals ({ALL_HOSPITALS.length})</option>
                  {ALL_HOSPITALS.map(h => (
                    <option key={h.id} value={h.name}>
                      {h.name} ({h.district})
                    </option>
                  ))}
                </select>
              </div>

              <select
                value={selectedSpecialty}
                onChange={e => setSelectedSpecialty(e.target.value)}
                className="bg-slate-50 border border-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700 rounded-xl focus:outline-none focus:border-teal-500 max-w-[160px] sm:max-w-[200px]"
              >
                {specialties.map(spec => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <button
              onClick={() => setEmergencyOnly(!emergencyOnly)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold border transition-colors flex items-center space-x-2 ${
                emergencyOnly
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>24/7 Emergency Care Only</span>
            </button>
          )}
        </div>
      </div>

      {activeTab === 'doctors' ? (
        /* Doctor List */
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
                  <div className="flex items-start justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-teal-50 text-teal-700 border border-teal-100 rounded-2xl flex items-center justify-center font-bold text-base shadow-xs flex-shrink-0">
                        {doc.name.replace('Dr. ', '').charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-slate-900 group-hover:text-teal-900 line-clamp-1">{doc.name}</h3>
                        {doc.qualification && (
                          <p className="text-[11px] font-semibold text-slate-500 line-clamp-1">{doc.qualification}</p>
                        )}
                        <p className="text-xs font-bold text-teal-600 mt-0.5">{doc.specialty}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 bg-amber-50 text-amber-800 px-2 py-0.5 text-xs font-bold rounded-lg border border-amber-200 flex-shrink-0">
                      <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      <span>{doc.rating}</span>
                    </div>
                  </div>

                  {/* Info Pills */}
                  <div className="space-y-2 text-xs text-slate-600 mb-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-2 min-w-0">
                        <Building2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
                        <span className="truncate">{doc.hospital}</span>
                      </div>
                      <span className="text-[10px] bg-teal-50 text-teal-800 font-bold px-2 py-0.5 rounded-full border border-teal-200 shrink-0">
                        📍 {doc.district || 'Erode'}
                      </span>
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
      ) : (
        /* Hospital Directory View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredHospitals.map(hosp => (
            <div
              key={hosp.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-teal-50 text-teal-700 border border-teal-100 rounded-xl flex items-center justify-center font-bold text-sm shadow-xs flex-shrink-0">
                      <HospitalIcon className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{hosp.name}</h3>
                      <div className="flex items-center space-x-1.5 text-[11px] text-slate-500 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-teal-600 flex-shrink-0" />
                        <span className="line-clamp-1">{hosp.location}</span>
                      </div>
                      <span className="inline-block mt-1 text-[10px] bg-teal-50 text-teal-800 font-bold px-2 py-0.5 rounded-full border border-teal-200">
                        📍 {hosp.district || 'Erode'} District
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 bg-amber-50 text-amber-800 px-2 py-0.5 text-xs font-bold rounded-lg border border-amber-200 flex-shrink-0">
                    <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                    <span>{hosp.rating}</span>
                  </div>
                </div>

                {/* Specialties Badges */}
                <div className="space-y-2 mb-4">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Key Specialties & Services
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {hosp.keySpecialties.map((spec, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-semibold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md border border-slate-200"
                      >
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Emergency Status */}
                <div className="mb-4">
                  {hosp.emergency24x7 ? (
                    <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-xl text-xs font-bold flex items-center space-x-2">
                      <ShieldAlert className="w-4 h-4 text-rose-600" />
                      <span>24/7 Emergency & ICU Care Active</span>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-200 text-slate-600 p-2.5 rounded-xl text-xs font-medium flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>Day Care & Outpatient Specialist Services</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Hospital Action Buttons */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <button
                  onClick={() => handleBookAtHospital(hosp)}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md shadow-teal-600/20 flex items-center justify-center space-x-2 tracking-wide"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Select Hospital & Book Appointment</span>
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href={`tel:04242250000`}
                    className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2 rounded-xl transition-colors flex items-center justify-center space-x-1.5"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Emergency</span>
                  </a>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(hosp.name + ' ' + hosp.location + ' Erode')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-teal-50 hover:bg-teal-100 text-teal-800 font-bold text-xs py-2 rounded-xl transition-colors flex items-center justify-center space-x-1.5 border border-teal-200"
                  >
                    <Navigation className="w-3.5 h-3.5 text-teal-600" />
                    <span>Directions</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedDoctor(null)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="mb-4 pb-3 border-b border-slate-100 pr-8">
              <h3 className="text-base font-bold text-slate-900">Schedule Appointment</h3>
              <p className="text-xs font-semibold text-teal-600">{selectedDoctor.name} ({selectedDoctor.specialty})</p>
              <p className="text-[11px] text-slate-500 mt-0.5">{selectedDoctor.hospital}</p>
            </div>

            <form onSubmit={handleBookSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Hospital Location</label>
                <select
                  value={selectedDoctor.hospital}
                  onChange={e => {
                    const newHospName = e.target.value;
                    const docAtNewHosp = doctors.find(d => d.hospital.toLowerCase().includes(newHospName.toLowerCase()));
                    if (docAtNewHosp) {
                      setSelectedDoctor(docAtNewHosp);
                    } else {
                      setSelectedDoctor({ ...selectedDoctor, hospital: newHospName });
                    }
                  }}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 font-semibold text-slate-800"
                >
                  {ALL_HOSPITALS.map(h => (
                    <option key={h.id} value={h.name}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>
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
                  <option value="Consultation">General Consultation</option>
                  <option value="Follow-up">Follow-up Checkup</option>
                  <option value="Routine Checkup">Routine Preventive Checkup</option>
                  <option value="Lab Review">Lab & Diagnostic Review</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Priority Level</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-500 font-semibold text-slate-800"
                >
                  <option value="Standard">Standard Consultation</option>
                  <option value="Urgent">Urgent Priority (Same Day / Fast Track)</option>
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

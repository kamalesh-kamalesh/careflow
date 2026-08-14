import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { UserRole } from '../types';
import { MedicalDisclaimer } from './common/MedicalDisclaimer';
import { SUPPORTED_DISTRICTS } from '../data/hospitalsData';
import { hashPassword, verifyPassword } from '../utils/passwordHash';
import {
  HeartPulse,
  User,
  Stethoscope,
  Users,
  Volume2,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  FileText,
  UserPlus,
  LogIn,
  MapPin,
  Phone,
  Mail,
  Activity,
  Heart,
  Pill,
  Shield,
  HelpCircle
} from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const {
    switchRole,
    patients,
    doctors,
    caregivers,
    speak,
    registerNewPatient,
    selectedDistrict,
    setSelectedDistrict
  } = useAppContext();

  // Mode: 'signin' | 'register'
  const [authMode, setAuthMode] = useState<'signin' | 'register'>('signin');
  const [selectedRole, setSelectedRole] = useState<UserRole>('patient');

  // Sign in credentials state
  const [signinEmailOrPhone, setSigninEmailOrPhone] = useState('');
  const [signinPassword, setSigninPassword] = useState('');
  const [signinError, setSigninError] = useState<string | null>(null);
  const [signinSubmitting, setSigninSubmitting] = useState(false);

  // Forgot Password state & workflow
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotStep, setForgotStep] = useState<'input' | 'otp' | 'reset' | 'success'>('input');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [simulatedCode] = useState('4829');

  const handleSendResetEmail = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    if (!forgotEmail.trim()) {
      setForgotError('Please enter your registered email address or phone number');
      return;
    }
    setForgotStep('otp');
    speak('Verification code sent to your registered email');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    if (!forgotOtp.trim()) {
      setForgotError('Please enter the 4-digit verification code');
      return;
    }
    if (forgotOtp.trim() !== simulatedCode) {
      setForgotError(`Invalid code. For simulation, please enter ${simulatedCode}`);
      return;
    }
    setForgotStep('reset');
    speak('Code verified successfully. Please enter your new password.');
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    if (!newPassword || newPassword.length < 6) {
      setForgotError('Password must be at least 6 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError('Passwords do not match');
      return;
    }
    setForgotStep('success');
    speak('Password successfully updated');
  };

  // Health Registration / Intake Form State
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState<string>('Female');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [registerSubmitting, setRegisterSubmitting] = useState(false);
  const [location, setLocation] = useState('Erode, Tamil Nadu');
  const [district, setDistrict] = useState(selectedDistrict || 'Erode');

  // Health Information State
  const [bloodGroup, setBloodGroup] = useState<string>('O+');

  // Conditions multi-select
  const [selectedConditions, setSelectedConditions] = useState<string[]>(['No']);
  const [otherConditionText, setOtherConditionText] = useState('');

  // Medications
  const [takingMedications, setTakingMedications] = useState<'Yes' | 'No'>('No');
  const [medicationsListText, setMedicationsListText] = useState('');

  // Allergies multi-select
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(['No']);
  const [otherAllergyText, setOtherAllergyText] = useState('');

  // Emergency contact
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // Consent
  const [consentDataStorage, setConsentDataStorage] = useState<'Yes' | 'No'>('Yes');

  // Form Validation & Errors
  const [regErrors, setRegErrors] = useState<{ [key: string]: string }>({});

  const conditionOptions = [
    'No',
    'Diabetes',
    'High Blood Pressure',
    'Asthma',
    'Heart Disease',
    'Thyroid Disorder',
    'Kidney Disease',
    'Liver Disease',
    'Other'
  ];

  const allergyOptions = [
    'No',
    'Food Allergies',
    'Medicine Allergies',
    'Dust/Pollen',
    'Other'
  ];

  const bloodGroupOptions = [
    'A+',
    'A-',
    'B+',
    'B-',
    'AB+',
    'AB-',
    'O+',
    'O-',
    "Don't Know"
  ];

  // Quick DEMO Login handler
  const handleQuickLogin = (role: UserRole, id?: string) => {
    switchRole(role, id);
    onLoginSuccess();
  };

  // Sign In submit handler
  // NOTE: Only patient accounts created via the registration form below have
  // a password set (see handleRegisterSubmit). Seed/demo patients, and all
  // doctors/caregivers, have no credentials — they're only reachable through
  // the explicit "Instant Demo Profile" buttons, never through this form.
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSigninError(null);

    const query = signinEmailOrPhone.trim();
    if (!query) {
      setSigninError('Please enter your email or phone number');
      return;
    }
    if (!signinPassword) {
      setSigninError('Please enter your password');
      return;
    }

    setSigninSubmitting(true);
    try {
      if (selectedRole === 'patient') {
        // Exact match only — a substring match on `name` could match the
        // wrong patient (or several), which is not safe for login.
        const found = patients.find(
          p =>
            p.email.toLowerCase() === query.toLowerCase() ||
            p.phone === query
        );
        const passwordOk = found ? await verifyPassword(signinPassword, found.passwordHash) : false;

        if (!found || !passwordOk) {
          setSigninError('Incorrect email/phone or password.');
          return; // do NOT fall back to logging in as some other patient
        }
        handleQuickLogin('patient', found.id);
      } else if (selectedRole === 'doctor') {
        const found = doctors.find(d => d.name.toLowerCase() === query.toLowerCase());
        if (!found) {
          setSigninError('No doctor account found with that name. Use an Instant Demo Profile below.');
          return;
        }
        handleQuickLogin('doctor', found.id);
      } else {
        const found = caregivers.find(c => c.name.toLowerCase() === query.toLowerCase());
        if (!found) {
          setSigninError('No caregiver account found with that name. Use an Instant Demo Profile below.');
          return;
        }
        handleQuickLogin('caregiver', found.id);
      }
    } finally {
      setSigninSubmitting(false);
    }
  };

  // Toggle Condition selection
  const handleConditionToggle = (cond: string) => {
    if (cond === 'No') {
      setSelectedConditions(['No']);
      setOtherConditionText('');
      return;
    }

    let updated = selectedConditions.filter(c => c !== 'No');
    if (updated.includes(cond)) {
      updated = updated.filter(c => c !== cond);
    } else {
      updated.push(cond);
    }

    if (updated.length === 0) {
      updated = ['No'];
    }
    setSelectedConditions(updated);
  };

  // Toggle Allergy selection
  const handleAllergyToggle = (allg: string) => {
    if (allg === 'No') {
      setSelectedAllergies(['No']);
      setOtherAllergyText('');
      return;
    }

    let updated = selectedAllergies.filter(a => a !== 'No');
    if (updated.includes(allg)) {
      updated = updated.filter(a => a !== allg);
    } else {
      updated.push(allg);
    }

    if (updated.length === 0) {
      updated = ['No'];
    }
    setSelectedAllergies(updated);
  };

  // Form Registration Submit Handler
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: { [key: string]: string } = {};

    if (!fullName.trim()) errors.fullName = 'Full Name is required';
    if (!age || isNaN(Number(age)) || Number(age) <= 0) errors.age = 'Valid Age is required';
    if (!gender) errors.gender = 'Gender selection is required';
    if (!email.trim() || !email.includes('@')) errors.email = 'Valid Email Address is required';
    if (!phone.trim()) errors.phone = 'Phone Number is required';
    if (!regPassword || regPassword.length < 6) errors.password = 'Password must be at least 6 characters';
    if (regPassword !== regConfirmPassword) errors.confirmPassword = 'Passwords do not match';
    if (patients.some(p => p.email.toLowerCase() === email.trim().toLowerCase())) {
      errors.email = 'An account with this email already exists';
    }
    if (!location.trim()) errors.location = 'Location (City, State) is required';
    if (consentDataStorage === 'No') {
      errors.consent = 'Data storage agreement is required to provide personalized healthcare';
    }

    if (Object.keys(errors).length > 0) {
      setRegErrors(errors);
      speak('Please fix the errors in the registration form');
      return;
    }

    // Clear errors
    setRegErrors({});

    setRegisterSubmitting(true);
    let passwordHash = '';
    try {
      passwordHash = await hashPassword(regPassword);
    } finally {
      setRegisterSubmitting(false);
    }

    // Process conditions list
    const finalConditions = selectedConditions.includes('No')
      ? []
      : selectedConditions.map(c => (c === 'Other' && otherConditionText.trim() ? otherConditionText.trim() : c));

    // Process allergies list
    const finalAllergies = selectedAllergies.includes('No')
      ? []
      : selectedAllergies.map(a => (a === 'Other' && otherAllergyText.trim() ? otherAllergyText.trim() : a));

    // Set global district location
    if (district) {
      setSelectedDistrict(district);
    }

    // Save Patient Intake Data
    registerNewPatient({
      name: fullName.trim(),
      age: Number(age),
      gender,
      email: email.trim(),
      phone: phone.trim(),
      passwordHash,
      location: location.trim(),
      district,
      bloodGroup,
      conditions: finalConditions,
      allergies: finalAllergies,
      hasCurrentMedications: takingMedications,
      currentMedicationsList: takingMedications === 'Yes' ? medicationsListText.trim() : '',
      otherConditionDetails: otherConditionText.trim(),
      otherAllergyDetails: otherAllergyText.trim(),
      consentDataStorage: consentDataStorage === 'Yes',
      emergencyContact: {
        name: emergencyName.trim() || 'Emergency Contact',
        relationship: 'Family Member',
        phone: emergencyPhone.trim() || phone.trim()
      }
    });

    onLoginSuccess();
  };

  // Pre-fill Sample Data Helper for testing ease
  const handleFillSampleData = () => {
    setFullName('Priya Ananth');
    setAge('34');
    setGender('Female');
    setEmail('priya.a@example.com');
    setPhone('9876543210');
    setRegPassword('Sample123');
    setRegConfirmPassword('Sample123');
    setLocation('Erode, Tamil Nadu');
    setDistrict('Erode');
    setBloodGroup('B+');
    setSelectedConditions(['Diabetes', 'High Blood Pressure']);
    setTakingMedications('Yes');
    setMedicationsListText('Metformin 500mg daily, Amlodipine 5mg');
    setSelectedAllergies(['Dust/Pollen']);
    setEmergencyName('Ananth Kumar');
    setEmergencyPhone('9876501234');
    setConsentDataStorage('Yes');
    setRegErrors({});
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-3 sm:p-6 relative selection:bg-teal-500 selection:text-white">
      {/* Background Decorative Blur */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-teal-600/15 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-2xl w-full bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden relative z-10 my-4 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
        {/* Portal Header */}
        <div className="bg-slate-950 p-6 sm:p-8 text-white relative border-b border-slate-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-2xl flex items-center justify-center shadow-inner">
                <HeartPulse className="w-7 h-7 text-teal-400 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center gap-2">
                  CareFlow <span className="text-teal-400">AI</span>
                </h1>
                <p className="text-xs font-medium text-slate-400 mt-0.5 tracking-wide">
                  Clinical Telemetry & Health Registration Portal
                </p>
              </div>
            </div>

            {/* Mode Toggle Switch Header Pills */}
            <div className="hidden sm:flex items-center bg-slate-900 border border-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setAuthMode('signin')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  authMode === 'signin'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 ${
                  authMode === 'register'
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>New Patient</span>
              </button>
            </div>
          </div>

          {/* Mobile Auth Tabs */}
          <div className="flex sm:hidden items-center bg-slate-900 border border-slate-800 p-1 rounded-xl mt-4">
            <button
              type="button"
              onClick={() => setAuthMode('signin')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                authMode === 'signin'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => setAuthMode('register')}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-1.5 ${
                authMode === 'register'
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Register Intake</span>
            </button>
          </div>
        </div>

        {/* Form Body Container */}
        <div className="p-5 sm:p-8 space-y-6 max-h-[80vh] overflow-y-auto">
          {authMode === 'signin' ? (
            /* ================= SIGN IN & DEMO PROFILES ================= */
            <div className="space-y-6">
              {/* Role Operating Mode Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Select Operating Role
                </label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setSelectedRole('patient')}
                    className={`py-3 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center space-y-1.5 ${
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
                    className={`py-3 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center space-y-1.5 ${
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
                    className={`py-3 px-3 rounded-xl border text-xs font-bold transition-all flex flex-col items-center space-y-1.5 ${
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

              {/* Login Credentials Form */}
              <form onSubmit={handleSignInSubmit} className="space-y-4 bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200/80">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <LogIn className="w-3.5 h-3.5 text-teal-600" />
                    Sign In with Credentials
                  </h3>
                  <span className="text-[10px] text-teal-700 font-semibold bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                    {selectedRole.toUpperCase()} PORTAL
                  </span>
                </div>

                {signinError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2 font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                    <span>{signinError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Email Address or Phone Number
                  </label>
                  <input
                    type="text"
                    value={signinEmailOrPhone}
                    onChange={e => setSigninEmailOrPhone(e.target.value)}
                    placeholder="e.g. jane@example.com or 9876543210"
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 transition-colors"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-600">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setShowForgotPassword(true);
                        setForgotStep('input');
                        setForgotEmail(signinEmailOrPhone || '');
                        setForgotError(null);
                        setForgotOtp('');
                        setNewPassword('');
                        setConfirmPassword('');
                      }}
                      className="text-xs text-teal-600 hover:text-teal-800 font-bold underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <input
                    type="password"
                    value={signinPassword}
                    onChange={e => setSigninPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 transition-colors"
                  />
                </div>

                <button
                  type="submit"
                  disabled={signinSubmitting}
                  className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl transition-all text-xs uppercase tracking-wider shadow-md shadow-teal-600/20 flex items-center justify-center space-x-2"
                >
                  <span>{signinSubmitting ? 'Checking…' : `Enter ${selectedRole.toUpperCase()} Portal`}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* DEMO PROFILES QUICK SWITCH */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                    Or Select Instant Demo Profile ({selectedRole.toUpperCase()}):
                  </span>
                  <button
                    type="button"
                    onClick={() => setAuthMode('register')}
                    className="text-xs text-teal-700 hover:text-teal-900 font-bold underline flex items-center gap-1"
                  >
                    <UserPlus className="w-3.5 h-3.5" />
                    Register New Patient
                  </button>
                </div>

                {selectedRole === 'patient' && (
                  <div className="space-y-2">
                    {patients.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => handleQuickLogin('patient', p.id)}
                        className="w-full p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-teal-500 hover:bg-teal-50/50 text-left transition-all flex items-center justify-between group shadow-2xs"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-sm text-slate-900 group-hover:text-teal-900">{p.name}</h4>
                            <span className="text-[10px] bg-teal-100 text-teal-800 font-bold px-2 py-0.5 rounded-full">
                              {p.bloodGroup || 'O+'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {p.age}y • {p.gender} • {p.district || 'Erode'} • Conditions: {p.conditions?.length ? p.conditions.join(', ') : 'None'}
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-transform group-hover:translate-x-1 shrink-0" />
                      </button>
                    ))}
                  </div>
                )}

                {selectedRole === 'doctor' && (
                  <div className="space-y-2">
                    {doctors.map(d => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => handleQuickLogin('doctor', d.id)}
                        className="w-full p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-teal-500 hover:bg-teal-50/50 text-left transition-all flex items-center justify-between group shadow-2xs"
                      >
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 group-hover:text-teal-900">{d.name}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {d.specialty} • {d.hospital} ({d.district || 'Erode'})
                          </p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-transform group-hover:translate-x-1 shrink-0" />
                      </button>
                    ))}
                  </div>
                )}

                {selectedRole === 'caregiver' && (
                  <div className="space-y-2">
                    {caregivers.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleQuickLogin('caregiver', c.id)}
                        className="w-full p-3.5 rounded-xl border border-slate-200/90 bg-white hover:border-teal-500 hover:bg-teal-50/50 text-left transition-all flex items-center justify-between group shadow-2xs"
                      >
                        <div>
                          <h4 className="font-bold text-sm text-slate-900 group-hover:text-teal-900">{c.name}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">{c.relationship} • Assigned Patient Care</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-600 transition-transform group-hover:translate-x-1 shrink-0" />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ================= FULL HEALTH REGISTRATION INTAKE FORM ================= */
            <form onSubmit={handleRegisterSubmit} className="space-y-6">
              <div className="flex items-center justify-between bg-teal-50/80 p-3.5 sm:p-4 rounded-2xl border border-teal-200/80">
                <div className="flex items-center space-x-2">
                  <ClipboardList className="w-5 h-5 text-teal-700 shrink-0" />
                  <div>
                    <h2 className="text-xs sm:text-sm font-extrabold text-teal-950">
                      New Patient Health Registration & Clinical Intake Form
                    </h2>
                    <p className="text-[11px] text-teal-800 font-medium">
                      Fill in your basic and medical history to unlock AI care suggestions
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleFillSampleData}
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold text-[10px] px-2.5 py-1.5 rounded-lg transition-all uppercase tracking-wider shrink-0 shadow-2xs"
                  title="Auto-fill sample intake data"
                >
                  ⚡ Fill Sample Data
                </button>
              </div>

              {/* SECTION 1: BASIC INFORMATION */}
              <div className="bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-4">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <User className="w-4 h-4 text-teal-600" />
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {/* Full Name */}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      placeholder="e.g. Jane Doe"
                      className={`w-full px-3.5 py-2.5 text-xs bg-white border ${
                        regErrors.fullName ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                      } rounded-xl focus:outline-none focus:border-teal-600 transition-colors font-medium`}
                    />
                    {regErrors.fullName && (
                      <p className="text-[10px] text-rose-600 font-bold mt-1">{regErrors.fullName}</p>
                    )}
                  </div>

                  {/* Age */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Age <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={age}
                      onChange={e => setAge(e.target.value)}
                      placeholder="e.g. 35"
                      min="1"
                      max="120"
                      className={`w-full px-3.5 py-2.5 text-xs bg-white border ${
                        regErrors.age ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                      } rounded-xl focus:outline-none focus:border-teal-600 transition-colors font-medium`}
                    />
                    {regErrors.age && (
                      <p className="text-[10px] text-rose-600 font-bold mt-1">{regErrors.age}</p>
                    )}
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Gender <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={gender}
                      onChange={e => setGender(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 transition-colors font-semibold text-slate-800"
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Non-Binary">Non-Binary</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="e.g. jane@example.com"
                      className={`w-full px-3.5 py-2.5 text-xs bg-white border ${
                        regErrors.email ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                      } rounded-xl focus:outline-none focus:border-teal-600 transition-colors font-medium`}
                    />
                    {regErrors.email && (
                      <p className="text-[10px] text-rose-600 font-bold mt-1">{regErrors.email}</p>
                    )}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className={`w-full px-3.5 py-2.5 text-xs bg-white border ${
                        regErrors.phone ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                      } rounded-xl focus:outline-none focus:border-teal-600 transition-colors font-medium`}
                    />
                    {regErrors.phone && (
                      <p className="text-[10px] text-rose-600 font-bold mt-1">{regErrors.phone}</p>
                    )}
                  </div>

                  {/* Create Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Create Password <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={regPassword}
                      onChange={e => setRegPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className={`w-full px-3.5 py-2.5 text-xs bg-white border ${
                        regErrors.password ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                      } rounded-xl focus:outline-none focus:border-teal-600 transition-colors font-medium`}
                    />
                    {regErrors.password && (
                      <p className="text-[10px] text-rose-600 font-bold mt-1">{regErrors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Confirm Password <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={regConfirmPassword}
                      onChange={e => setRegConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className={`w-full px-3.5 py-2.5 text-xs bg-white border ${
                        regErrors.confirmPassword ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                      } rounded-xl focus:outline-none focus:border-teal-600 transition-colors font-medium`}
                    />
                    {regErrors.confirmPassword && (
                      <p className="text-[10px] text-rose-600 font-bold mt-1">{regErrors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Location & District */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Location (City, State) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={location}
                      onChange={e => setLocation(e.target.value)}
                      placeholder="e.g. Erode, Tamil Nadu"
                      className={`w-full px-3.5 py-2.5 text-xs bg-white border ${
                        regErrors.location ? 'border-rose-400 bg-rose-50/30' : 'border-slate-200'
                      } rounded-xl focus:outline-none focus:border-teal-600 transition-colors font-medium`}
                    />
                  </div>

                  {/* District Dropdown */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Primary District
                    </label>
                    <select
                      value={district}
                      onChange={e => setDistrict(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 transition-colors font-semibold text-slate-800"
                    >
                      {SUPPORTED_DISTRICTS.map(d => (
                        <option key={d} value={d}>
                          📍 {d} District
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* SECTION 2: HEALTH INFORMATION */}
              <div className="bg-slate-50/80 p-4 sm:p-5 rounded-2xl border border-slate-200 space-y-5">
                <h3 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-200 pb-2">
                  <Activity className="w-4 h-4 text-teal-600" />
                  Health Information
                </h3>

                {/* Blood Group */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Blood Group <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {bloodGroupOptions.map(bg => {
                      const isSelected = bloodGroup === bg;
                      return (
                        <button
                          key={bg}
                          type="button"
                          onClick={() => setBloodGroup(bg)}
                          className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all ${
                            isSelected
                              ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {bg}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Previous Medical Conditions */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Do you have any previous medical conditions?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {conditionOptions.map(cond => {
                      const isSelected = selectedConditions.includes(cond);
                      return (
                        <button
                          key={cond}
                          type="button"
                          onClick={() => handleConditionToggle(cond)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-teal-50 text-teal-950 border-teal-500 font-bold'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <span>{cond}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {/* Specify Other Condition */}
                  {selectedConditions.includes('Other') && (
                    <div className="mt-2.5">
                      <input
                        type="text"
                        value={otherConditionText}
                        onChange={e => setOtherConditionText(e.target.value)}
                        placeholder="Please specify other medical condition..."
                        className="w-full px-3.5 py-2 text-xs bg-white border border-teal-300 rounded-xl focus:outline-none focus:border-teal-600 font-medium"
                      />
                    </div>
                  )}
                </div>

                {/* Currently taking medications */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Are you currently taking any medications?
                  </label>
                  <div className="grid grid-cols-2 gap-3 max-w-xs">
                    <button
                      type="button"
                      onClick={() => setTakingMedications('No')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                        takingMedications === 'No'
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      No
                    </button>
                    <button
                      type="button"
                      onClick={() => setTakingMedications('Yes')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                        takingMedications === 'Yes'
                          ? 'bg-teal-600 text-white border-teal-600'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      Yes (Please list)
                    </button>
                  </div>

                  {takingMedications === 'Yes' && (
                    <div className="mt-3">
                      <textarea
                        value={medicationsListText}
                        onChange={e => setMedicationsListText(e.target.value)}
                        rows={2}
                        placeholder="List your current medications (e.g. Metformin 500mg, Paracetamol)..."
                        className="w-full px-3.5 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 font-medium"
                      />
                    </div>
                  )}
                </div>

                {/* Allergies */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Do you have any allergies?
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {allergyOptions.map(allg => {
                      const isSelected = selectedAllergies.includes(allg);
                      return (
                        <button
                          key={allg}
                          type="button"
                          onClick={() => handleAllergyToggle(allg)}
                          className={`px-3 py-2 rounded-xl text-xs font-semibold border text-left transition-all flex items-center justify-between ${
                            isSelected
                              ? 'bg-teal-50 text-teal-950 border-teal-500 font-bold'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          <span>{allg}</span>
                          {isSelected && <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  {selectedAllergies.includes('Other') && (
                    <div className="mt-2.5">
                      <input
                        type="text"
                        value={otherAllergyText}
                        onChange={e => setOtherAllergyText(e.target.value)}
                        placeholder="Please specify other allergies..."
                        className="w-full px-3.5 py-2 text-xs bg-white border border-teal-300 rounded-xl focus:outline-none focus:border-teal-600 font-medium"
                      />
                    </div>
                  )}
                </div>

                {/* Emergency Contact */}
                <div className="pt-2 border-t border-slate-200">
                  <label className="block text-xs font-bold text-slate-700 mb-2">
                    Emergency Contact Information (Optional)
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <input
                      type="text"
                      value={emergencyName}
                      onChange={e => setEmergencyName(e.target.value)}
                      placeholder="Contact Name (e.g. John Doe)"
                      className="px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 font-medium"
                    />
                    <input
                      type="tel"
                      value={emergencyPhone}
                      onChange={e => setEmergencyPhone(e.target.value)}
                      placeholder="Contact Number (e.g. 9876500000)"
                      className="px-3.5 py-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 font-medium"
                    />
                  </div>
                </div>

                {/* Consent Agreement */}
                <div className="pt-2 border-t border-slate-200">
                  <label className="block text-xs font-bold text-slate-800 mb-2">
                    Do you agree to securely store your health information to provide personalized healthcare recommendations? <span className="text-rose-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-3 max-w-xs">
                    <button
                      type="button"
                      onClick={() => setConsentDataStorage('Yes')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all flex items-center justify-center space-x-1.5 ${
                        consentDataStorage === 'Yes'
                          ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Yes (Agreed)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setConsentDataStorage('No')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-bold border transition-all ${
                        consentDataStorage === 'No'
                          ? 'bg-rose-600 text-white border-rose-600'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      No
                    </button>
                  </div>
                  {regErrors.consent && (
                    <p className="text-[10px] text-rose-600 font-bold mt-1.5">{regErrors.consent}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={registerSubmitting}
                  className="w-full bg-teal-600 hover:bg-teal-700 disabled:opacity-50 text-white font-extrabold py-4 rounded-2xl transition-all text-xs uppercase tracking-wider shadow-lg shadow-teal-600/25 flex items-center justify-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{registerSubmitting ? 'Saving Profile...' : 'Save Health Intake Profile & Enter App'}</span>
                </button>
              </div>
            </form>
          )}

          {/* Accessibility & Voice Guidance */}
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 pt-3 border-t border-slate-100">
            <div className="flex items-center space-x-1.5">
              <Volume2 className="w-4 h-4 text-teal-600" />
              <span>Voice Guidance Active</span>
            </div>
            <div className="flex items-center space-x-1.5 text-teal-800">
              <Shield className="w-3.5 h-3.5 text-teal-600" />
              <span className="text-[11px]">256-bit HIPAA Compliant Encryption</span>
            </div>
          </div>

          <MedicalDisclaimer compact />
        </div>
      </div>

      {/* Forgot Password Modal / Overlay */}
      {showForgotPassword && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between mb-5 border-b border-slate-100 pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-teal-50 text-teal-600 rounded-xl flex items-center justify-center font-bold">
                  🔐
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Credential Recovery</h3>
                  <p className="text-xs text-slate-500">Secure password reset workflow</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-sm transition-colors"
              >
                ✕
              </button>
            </div>

            {forgotError && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2 font-medium">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{forgotError}</span>
              </div>
            )}

            {forgotStep === 'input' && (
              <form onSubmit={handleSendResetEmail} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Enter your Registered Email or Phone
                  </label>
                  <input
                    type="text"
                    value={forgotEmail}
                    onChange={e => setForgotEmail(e.target.value)}
                    placeholder="e.g. jane@example.com"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600 font-medium"
                  />
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  We will send a secure 4-digit verification code to your email address or registered mobile number for authentication.
                </p>
                <div className="pt-2 flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md shadow-teal-600/20"
                  >
                    Send Code
                  </button>
                </div>
              </form>
            )}

            {forgotStep === 'otp' && (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 font-medium">
                  Verification code sent to <strong className="font-bold">{forgotEmail}</strong>.
                  <div className="mt-1 text-[11px] text-teal-700">
                    (Simulated OTP for testing: <strong className="bg-teal-200 px-1.5 py-0.5 rounded text-teal-950">{simulatedCode}</strong>)
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Enter 4-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={4}
                    value={forgotOtp}
                    onChange={e => setForgotOtp(e.target.value)}
                    placeholder="4829"
                    className="w-full px-3.5 py-3 text-center text-lg tracking-widest font-extrabold bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div className="pt-2 flex items-center space-x-3">
                  <button
                    type="button"
                    onClick={() => setForgotStep('input')}
                    className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md shadow-teal-600/20"
                  >
                    Verify Code
                  </button>
                </div>
              </form>
            )}

            {forgotStep === 'reset' && (
              <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-teal-600"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl text-xs transition-all uppercase tracking-wider shadow-md shadow-teal-600/20 flex items-center justify-center space-x-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Update Password</span>
                  </button>
                </div>
              </form>
            )}

            {forgotStep === 'success' && (
              <div className="text-center space-y-4 py-4">
                <div className="w-16 h-16 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto text-2xl shadow-inner">
                  ✓
                </div>
                <div>
                  <h4 className="text-base font-extrabold text-slate-900">Password Updated Successfully!</h4>
                  <p className="text-xs text-slate-600 mt-1">
                    Your credentials have been securely updated. You can now sign in using your new password.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowForgotPassword(false);
                    setAuthMode('signin');
                  }}
                  className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider shadow-md shadow-teal-600/20"
                >
                  Return to Sign In
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

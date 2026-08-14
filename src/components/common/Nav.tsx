import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { UserRole } from '../../types';
import { SUPPORTED_DISTRICTS } from '../../data/hospitalsData';
import {
  HeartPulse,
  Volume2,
  VolumeX,
  Bell,
  User,
  LogOut,
  AlertTriangle,
  Stethoscope,
  Users,
  Calendar,
  Pill,
  MessageSquareHeart,
  Activity,
  BarChart3,
  Search,
  GitBranch,
  MapPin,
  Sun,
  Moon
} from 'lucide-react';

interface NavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout?: () => void;
}

export const Nav: React.FC<NavProps> = ({ activeTab, setActiveTab, onLogout }) => {
  const {
    activeRole,
    switchRole,
    currentUser,
    voiceGuidanceEnabled,
    setVoiceGuidanceEnabled,
    alerts,
    speak,
    patients,
    doctors,
    caregivers,
    selectedDistrict,
    setSelectedDistrict,
    theme,
    toggleTheme
  } = useAppContext();

  const [showRoleMenu, setShowRoleMenu] = useState(false);
  const [showDistrictMenu, setShowDistrictMenu] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  const unreadAlertsCount = alerts.filter(a => !a.resolved).length;

  const handleRoleChange = (role: UserRole) => {
    switchRole(role);
    setShowRoleMenu(false);
    // Set default active tab per role
    if (role === 'patient') setActiveTab('home');
    if (role === 'doctor') setActiveTab('queue');
    if (role === 'caregiver') setActiveTab('overview');
  };

  interface TabItem {
    id: string;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }

  const patientTabs: TabItem[] = [
    { id: 'home', label: 'Summary', icon: Activity },
    { id: 'find-book', label: 'Find & Book', icon: Search },
    { id: 'appointments', label: 'My Appointments', icon: Calendar },
    { id: 'medicines', label: 'Medicines', icon: Pill },
    { id: 'ai-assistant', label: 'AI Assistant & Reports', icon: MessageSquareHeart },
    { id: 'sdlc', label: '9-Phase SDLC', icon: GitBranch }
  ];

  const doctorTabs: TabItem[] = [
    { id: 'queue', label: 'Live Queue', icon: Users },
    { id: 'appointments', label: 'Schedule & Prescribe', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'sdlc', label: '9-Phase SDLC', icon: GitBranch }
  ];

  const caregiverTabs: TabItem[] = [
    { id: 'overview', label: 'Overview', icon: HeartPulse },
    { id: 'alerts', label: 'Real-Time Alerts', icon: Bell, badge: unreadAlertsCount },
    { id: 'adherence', label: 'Adherence History', icon: BarChart3 },
    { id: 'sdlc', label: '9-Phase SDLC', icon: GitBranch }
  ];

  const currentTabs =
    activeRole === 'patient'
      ? patientTabs
      : activeRole === 'doctor'
      ? doctorTabs
      : caregiverTabs;

  return (
    <>
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-xs transition-colors">
        {/* Top bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            
            {/* Logo & Role Badge */}
            <div className="flex items-center space-x-3">
              <div className="w-11 h-11 sm:w-12 sm:h-12 bg-teal-600 text-white rounded-xl flex items-center justify-center font-bold shadow-sm shadow-teal-600/20">
                <HeartPulse className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-black text-xl sm:text-2xl text-slate-900 dark:text-slate-100 tracking-tight">CareFlow <span className="text-teal-600 dark:text-teal-400">AI</span></span>
                  <span className="text-xs font-mono font-bold tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded-full uppercase">
                    SYS-0.8.5
                  </span>
                </div>
                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 hidden sm:block tracking-wide">Clinical Telemetry & Health Platform</p>
              </div>
            </div>

            {/* Middle Controls & Location & Role Selectors */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {/* Location / District Dropdown Selector */}
              <div className="relative">
                <button
                  id="district-selector-button"
                  onClick={() => {
                    setShowDistrictMenu(!showDistrictMenu);
                    if (showRoleMenu) setShowRoleMenu(false);
                  }}
                  className="flex items-center space-x-1.5 bg-teal-50 dark:bg-teal-950/60 hover:bg-teal-100/80 dark:hover:bg-teal-900/60 px-3 sm:px-4 py-2 border border-teal-200/80 dark:border-teal-800/80 rounded-xl text-xs sm:text-sm font-bold text-teal-900 dark:text-teal-200 transition-all shadow-xs min-h-[40px]"
                  title="Select Active Location / District"
                >
                  <MapPin className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 animate-bounce" />
                  <span className="font-extrabold">{selectedDistrict}</span>
                  <span className="text-xs text-teal-600 dark:text-teal-400 font-medium hidden sm:inline">District</span>
                  <span className="text-teal-600 dark:text-teal-400 text-xs ml-0.5">▼</span>
                </button>

                {showDistrictMenu && (
                  <div className="absolute left-0 sm:left-auto right-0 mt-2 w-64 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 z-50 shadow-xl ring-1 ring-slate-900/5">
                    <div className="px-3.5 py-2 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between">
                      <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                        Select District Location
                      </span>
                      <span className="text-[10px] text-teal-600 dark:text-teal-300 font-semibold bg-teal-50 dark:bg-teal-900/50 px-2 py-0.5 rounded-full">
                        {SUPPORTED_DISTRICTS.length} Districts
                      </span>
                    </div>

                    <div className="max-h-64 overflow-y-auto py-1">
                      {SUPPORTED_DISTRICTS.map((dist) => {
                        const isSelected = selectedDistrict === dist;
                        return (
                          <button
                            key={dist}
                            onClick={() => {
                              setSelectedDistrict(dist);
                              setShowDistrictMenu(false);
                            }}
                            className={`w-full px-3.5 py-2 text-left flex items-center justify-between text-xs transition-colors ${
                              isSelected
                                ? 'bg-teal-50/80 dark:bg-teal-900/40 text-teal-900 dark:text-teal-200 font-bold border-l-3 border-teal-600 dark:border-teal-400'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60 font-medium'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              <span className={`w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-teal-600 dark:bg-teal-400' : 'bg-slate-300 dark:bg-slate-600'}`}></span>
                              <span>{dist} District</span>
                            </div>
                            {isSelected && (
                              <span className="text-teal-600 dark:text-teal-400 text-xs font-bold">Selected ✓</span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-900/60 text-[10px] text-slate-500 dark:text-slate-400 text-center font-medium">
                      Filters hospitals, doctors & AI recommendations
                    </div>
                  </div>
                )}
              </div>

              {/* Role selector dropdown */}
              <div className="relative">
                <button
                  id="role-selector-button"
                  onClick={() => setShowRoleMenu(!showRoleMenu)}
                  className="flex items-center space-x-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 px-3 sm:px-3.5 py-1.5 sm:py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-800 dark:text-slate-200 transition-all shadow-xs"
                >
                  <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
                  <span className="capitalize">{activeRole} Mode</span>
                  <span className="text-slate-400 text-[10px]">▼</span>
                </button>

                {showRoleMenu && (
                  <div className="absolute right-0 mt-2 w-70 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2 z-50 shadow-xl ring-1 ring-slate-900/5">
                    <div className="px-3 py-1.5 border-b border-slate-100 dark:border-slate-700 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                      Switch Active Portal
                    </div>

                    <button
                      onClick={() => handleRoleChange('patient')}
                      className={`w-full px-4 py-2.5 text-left flex items-center justify-between text-xs transition-colors ${
                        activeRole === 'patient' ? 'bg-teal-50 dark:bg-teal-900/40 text-teal-900 dark:text-teal-200 font-semibold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="p-1.5 bg-teal-100 dark:bg-teal-900/80 text-teal-700 dark:text-teal-300 rounded-lg">
                          <User className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100">Patient Portal</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">Jane Doe ({patients[0].conditions.join(', ')})</div>
                        </div>
                      </div>
                      {activeRole === 'patient' && <span className="text-teal-600 dark:text-teal-400 font-bold">✓</span>}
                    </button>

                    <button
                      onClick={() => handleRoleChange('doctor')}
                      className={`w-full px-4 py-2.5 text-left flex items-center justify-between text-xs transition-colors ${
                        activeRole === 'doctor' ? 'bg-teal-50 dark:bg-teal-900/40 text-teal-900 dark:text-teal-200 font-semibold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/80 text-blue-700 dark:text-blue-300 rounded-lg">
                          <Stethoscope className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100">Doctor Portal</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">{doctors[0].name} ({doctors[0].specialty})</div>
                        </div>
                      </div>
                      {activeRole === 'doctor' && <span className="text-teal-600 dark:text-teal-400 font-bold">✓</span>}
                    </button>

                    <button
                      onClick={() => handleRoleChange('caregiver')}
                      className={`w-full px-4 py-2.5 text-left flex items-center justify-between text-xs transition-colors ${
                        activeRole === 'caregiver' ? 'bg-teal-50 dark:bg-teal-900/40 text-teal-900 dark:text-teal-200 font-semibold' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/60'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-300 rounded-lg">
                          <HeartPulse className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-slate-100">Caregiver Portal</div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">{caregivers[0].name} ({caregivers[0].relationship})</div>
                        </div>
                      </div>
                      {activeRole === 'caregiver' && <span className="text-teal-600 dark:text-teal-400 font-bold">✓</span>}
                    </button>
                  </div>
                )}
              </div>

              {/* Theme Toggle Button (Light/Dark mode for clinical/hospital low-light comfort) */}
              <button
                id="theme-toggle-button"
                onClick={() => {
                  toggleTheme();
                  if (speak) speak(`Switched to ${theme === 'light' ? 'dark' : 'light'} mode`);
                }}
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                title={theme === 'light' ? 'Switch to Dark Mode (Hospital Low-Light Comfort)' : 'Switch to Light Mode'}
                className="flex items-center space-x-1.5 px-3 py-1.5 sm:py-2 rounded-lg text-xs font-semibold transition-all bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer min-h-[36px]"
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-600" />
                )}
                <span className="hidden md:inline font-bold">
                  {theme === 'dark' ? 'Dark' : 'Light'}
                </span>
              </button>

              {/* Voice Guidance Toggle */}
              <button
                id="voice-guidance-button"
                onClick={() => {
                  const nextState = !voiceGuidanceEnabled;
                  setVoiceGuidanceEnabled(nextState);
                  if (nextState) speak('Voice guidance enabled.');
                }}
                title={voiceGuidanceEnabled ? 'Voice Guidance Active' : 'Enable Voice Guidance'}
                className={`flex items-center space-x-1.5 px-3 py-1.5 sm:py-2 rounded-lg text-xs font-semibold transition-all ${
                  voiceGuidanceEnabled
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {voiceGuidanceEnabled ? (
                  <Volume2 className="w-4 h-4 text-white" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                )}
                <span className="hidden md:inline">{voiceGuidanceEnabled ? 'Audio: On' : 'Audio'}</span>
              </button>

              {/* Emergency SOS Button */}
              <button
                id="emergency-sos-button"
                onClick={() => setShowEmergencyModal(true)}
                className="flex items-center space-x-1.5 bg-rose-600 hover:bg-rose-700 text-white px-3 sm:px-3.5 py-1.5 sm:py-2 rounded-lg text-xs font-bold tracking-wide transition-all shadow-xs"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>SOS</span>
              </button>

              {/* Active User Avatar & Logout */}
              <div className="flex items-center space-x-2 pl-2 border-l border-slate-200 dark:border-slate-700">
                <div className="w-8 h-8 sm:w-9 sm:h-9 bg-slate-900 dark:bg-slate-700 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-xs">
                  {currentUser?.name.charAt(0)}
                </div>
                <div className="hidden lg:block text-left">
                  <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-none">{currentUser?.name}</p>
                  <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 leading-tight uppercase mt-0.5">{currentUser?.title}</p>
                </div>
                {onLogout && (
                  <button
                    onClick={() => {
                      onLogout();
                      if (speak) speak('Logged out successfully');
                    }}
                    title="Sign Out / Change Account"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-all border border-transparent hover:border-rose-200 dark:hover:border-rose-800 ml-1"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                )}
              </div>

            </div>
          </div>
        </div>

        {/* Top Tab Navigation Bar */}
        <div className="bg-slate-50/90 dark:bg-slate-950/90 border-t border-slate-200 dark:border-slate-800 transition-colors">
          <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
            <nav className="flex space-x-1 sm:space-x-2 overflow-x-auto py-2.5 scrollbar-none" aria-label="Tabs">
              {currentTabs.map(tab => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    id={`nav-tab-${tab.id}`}
                    onClick={() => {
                      setActiveTab(tab.id);
                      speak(`Opened ${tab.label}`);
                    }}
                    className={`flex items-center space-x-2 px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base font-bold transition-all whitespace-nowrap min-h-[44px] ${
                      isActive
                        ? 'bg-teal-600 text-white shadow-md shadow-teal-600/20'
                        : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-white dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                    <span>{tab.label}</span>
                    {tab.badge !== undefined && tab.badge > 0 && (
                      <span className={`ml-1 text-xs px-2 py-0.5 rounded-full font-extrabold ${isActive ? 'bg-white text-teal-800' : 'bg-rose-500 text-white'}`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Mobile Sticky Bottom Navigation Dock */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 px-1 py-1.5 flex items-center justify-around shadow-2xl">
        {currentTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={`mobile-dock-${tab.id}`}
              onClick={() => {
                setActiveTab(tab.id);
                speak(`Opened ${tab.label}`);
              }}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-xl text-[11px] font-bold transition-all min-w-[56px] min-h-[48px] relative ${
                isActive
                  ? 'text-teal-600 dark:text-teal-400 bg-teal-50/80 dark:bg-teal-950/60 font-black'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? 'text-teal-600 dark:text-teal-400 scale-110' : 'text-slate-500 dark:text-slate-400'}`} />
              <span className="truncate max-w-[64px]">{tab.label.split(' ')[0]}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="absolute top-1 right-2 bg-rose-500 text-white text-[9px] font-extrabold px-1.5 py-0.2 rounded-full">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Emergency Modal */}
      {showEmergencyModal && (
        <div className="fixed inset-0 z-50 bg-[#1A1A1A]/80 flex items-center justify-center p-4">
          <div className="bg-white border-4 border-[#1A1A1A] max-w-md w-full p-6 shadow-[8px_8px_0px_0px_#1A1A1A]">
            <div className="flex items-center space-x-3 text-[#BC544B] mb-4 pb-3 border-b-2 border-[#1A1A1A]">
              <div className="w-10 h-10 bg-[#BC544B] text-white flex items-center justify-center border-2 border-[#1A1A1A]">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black uppercase text-[#1A1A1A] tracking-tight">Emergency Protocol</h3>
                <p className="text-xs font-mono font-bold text-[#BC544B] uppercase">Immediate Clinical Assistance</p>
              </div>
            </div>

            <p className="text-xs text-[#1A1A1A] font-medium mb-4">
              If you or the patient are experiencing chest pain, severe breathlessness, stroke symptoms, or acute severe injury, call emergency service immediately.
            </p>

            <div className="space-y-3 mb-6">
              <a
                href="tel:911"
                className="w-full bg-[#BC544B] hover:bg-[#a3443c] text-white font-black py-3 border-2 border-[#1A1A1A] flex items-center justify-center space-x-2 text-sm uppercase tracking-wider"
              >
                <span>📞 Call Emergency (911 / 112)</span>
              </a>

              <div className="p-3 bg-[#F8F7F4] border-2 border-[#1A1A1A]">
                <p className="text-xs font-mono font-bold text-[#1A1A1A] uppercase mb-1">Assigned Emergency Contact:</p>
                <p className="text-xs font-bold text-[#1A1A1A]">{patients[0].emergencyContact.name} ({patients[0].emergencyContact.relationship})</p>
                <p className="text-xs font-mono text-[#BC544B] font-black mt-1">{patients[0].emergencyContact.phone}</p>
              </div>
            </div>

            <button
              onClick={() => setShowEmergencyModal(false)}
              className="w-full bg-[#1A1A1A] hover:bg-black text-white font-mono font-bold py-2 border-2 border-[#1A1A1A] text-xs uppercase tracking-wider"
            >
              Close Window
            </button>
          </div>
        </div>
      )}
    </>
  );
};

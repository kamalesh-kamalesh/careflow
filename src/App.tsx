import React, { useState } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import { Nav } from './components/common/Nav';
import { Login } from './components/Login';
import { PatientHome } from './components/patient/PatientHome';
import { FindBook } from './components/patient/FindBook';
import { MyAppointments } from './components/patient/MyAppointments';
import { Medicines } from './components/patient/Medicines';
import { AICareAssistant } from './components/patient/AICareAssistant';
import { QueueOverview } from './components/doctor/QueueOverview';
import { DoctorAppointments } from './components/doctor/Appointments';
import { Analytics } from './components/doctor/Analytics';
import { CaregiverOverview } from './components/caregiver/Overview';
import { CaregiverAlerts } from './components/caregiver/Alerts';
import { AdherenceHistory } from './components/caregiver/AdherenceHistory';
import { SDLCProcessHub } from './components/sdlc/SDLCProcessHub';
import { OfflineStatusBanner } from './components/common/OfflineStatusBanner';

const MainAppContent: React.FC = () => {
  const { activeRole, toastMessage } = useAppContext();
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [activeTab, setActiveTab] = useState('home');

  if (!isLoggedIn) {
    return <Login onLoginSuccess={() => setIsLoggedIn(true)} />;
  }

  const renderActiveView = () => {
    if (activeTab === 'sdlc') {
      return <SDLCProcessHub />;
    }

    if (activeRole === 'patient') {
      switch (activeTab) {
        case 'home':
          return <PatientHome setActiveTab={setActiveTab} />;
        case 'find-book':
          return <FindBook />;
        case 'appointments':
          return <MyAppointments />;
        case 'medicines':
          return <Medicines />;
        case 'ai-assistant':
          return <AICareAssistant />;
        default:
          return <PatientHome setActiveTab={setActiveTab} />;
      }
    }

    if (activeRole === 'doctor') {
      switch (activeTab) {
        case 'queue':
          return <QueueOverview />;
        case 'appointments':
          return <DoctorAppointments />;
        case 'analytics':
          return <Analytics />;
        default:
          return <QueueOverview />;
      }
    }

    if (activeRole === 'caregiver') {
      switch (activeTab) {
        case 'overview':
          return <CaregiverOverview setActiveTab={setActiveTab} />;
        case 'alerts':
          return <CaregiverAlerts />;
        case 'adherence':
          return <AdherenceHistory />;
        default:
          return <CaregiverOverview setActiveTab={setActiveTab} />;
      }
    }

    return <PatientHome setActiveTab={setActiveTab} />;
  };

  return (
    <div className="min-h-screen bg-[#F8F7F4] text-[#1A1A1A] font-sans selection:bg-[#BC544B] selection:text-white">
      <Nav activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <OfflineStatusBanner />
        {renderActiveView()}
      </main>

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-[#1A1A1A] text-white px-5 py-3 border-2 border-[#1A1A1A] text-xs font-mono uppercase tracking-wider flex items-center space-x-3 shadow-lg">
          <span className="w-2 h-2 bg-[#BC544B]"></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}

export default App;

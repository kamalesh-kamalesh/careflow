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
import { NotificationManager } from './components/common/NotificationManager';

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
          return <AICareAssistant setActiveTab={setActiveTab} />;
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
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-teal-500 selection:text-white">
      <NotificationManager />
      <Nav activeTab={activeTab} setActiveTab={setActiveTab} onLogout={() => setIsLoggedIn(false)} />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-8 pb-24 sm:pb-12">
        <OfflineStatusBanner />
        {renderActiveView()}
      </main>

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 sm:bottom-5 right-4 sm:right-5 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl text-xs sm:text-sm font-semibold tracking-wide flex items-center space-x-3 shadow-xl border border-slate-800">
          <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse"></span>
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

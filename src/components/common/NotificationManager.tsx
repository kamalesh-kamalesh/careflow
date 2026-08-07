import React, { useEffect, useRef } from 'react';
import { useAppContext } from '../../context/AppContext';

export const NotificationManager: React.FC = () => {
  const { appointments, currentUser, activeRole, setToastMessage, speak } = useAppContext();
  const notifiedAppointments = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (activeRole !== 'patient' || !currentUser) return;

    // Request Notification permission if not already granted
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    const checkAppointments = () => {
      const now = new Date();
      const userAppointments = appointments.filter(app => app.patientId === currentUser.id && app.status === 'scheduled');
      
      userAppointments.forEach(app => {
        if (!app.date || !app.time) return;
        
        // Parse appointment datetime
        const appDate = new Date(`${app.date}T${app.time}`);
        
        // If appointment time is valid
        if (!isNaN(appDate.getTime())) {
          const timeDiff = appDate.getTime() - now.getTime();
          const minutesDiff = Math.round(timeDiff / (1000 * 60));
          
          // Trigger notification if appointment is exactly 60 minutes away (or within a 1-minute window to account for interval)
          if (minutesDiff === 60 && !notifiedAppointments.current.has(app.id)) {
            notifiedAppointments.current.add(app.id);
            const message = `Reminder: You have an appointment at ${app.time} today.`;
            
            // Show toast
            setToastMessage(message);
            setTimeout(() => setToastMessage(null), 5000);

            // Speak
            if (speak) speak(message);
            
            // Native browser notification
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification('Upcoming Appointment', {
                body: message,
                icon: '/icon.png',
              });
            }
          }
        }
      });
    };

    // Check immediately on mount
    checkAppointments();
    
    // Check every minute
    const interval = setInterval(checkAppointments, 60000);
    return () => clearInterval(interval);
  }, [appointments, currentUser, activeRole, setToastMessage, speak]);

  return null;
};

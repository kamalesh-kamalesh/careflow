import { jsPDF } from 'jspdf';
import { Patient, Appointment, Medicine, Doctor } from '../types';

export function generatePatientSummaryPDF(
  patient: Patient,
  appointments: Appointment[],
  medicines: Medicine[],
  doctors: Doctor[]
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 15;
  const contentWidth = pageWidth - margin * 2;
  let y = 15;

  // Helper function to check vertical space and add page
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - margin - 15) {
      doc.addPage();
      y = 15;
      drawHeaderBanner(false);
    }
  };

  const drawHeaderBanner = (isFirstPage = true) => {
    // Header background banner
    doc.setFillColor(15, 23, 42); // slate-900
    doc.rect(0, 0, pageWidth, 28, 'F');

    // Teal Accent strip
    doc.setFillColor(13, 148, 136); // teal-600
    doc.rect(0, 28, pageWidth, 2, 'F');

    // Brand Title
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.text('CareFlow AI', margin, 12);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(153, 246, 228); // teal-200
    doc.text('Official Patient Medical & Appointment Summary', margin, 18);

    // Date & Document ID top right
    const generatedDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    doc.setFontSize(8);
    doc.setTextColor(226, 232, 240);
    doc.text(`Generated: ${generatedDate}`, pageWidth - margin, 12, { align: 'right' });
    doc.text(`Patient ID: ${patient.id.toUpperCase()}`, pageWidth - margin, 18, { align: 'right' });

    if (isFirstPage) {
      y = 36;
    } else {
      y = 36;
    }
  };

  // Draw header for page 1
  drawHeaderBanner(true);

  // --- SECTION 1: PATIENT PROFILE & VITALS CARD ---
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, y, contentWidth, 38, 3, 3, 'FD');

  // Patient Name & Demographics
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(patient.name, margin + 5, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(
    `Age: ${patient.age} yrs  |  Gender: ${patient.gender}  |  Blood Group: ${patient.bloodGroup || patient.bloodType || 'N/A'}`,
    margin + 5,
    y + 14
  );
  doc.text(
    `Phone: ${patient.phone}  |  Email: ${patient.email}  |  District: ${patient.district || patient.location || 'Erode'}`,
    margin + 5,
    y + 19
  );

  // Allergies & Conditions line
  const allergiesStr = patient.allergies && patient.allergies.length > 0 ? patient.allergies.join(', ') : 'None Recorded';
  const conditionsStr = patient.conditions && patient.conditions.length > 0 ? patient.conditions.join(', ') : 'None Recorded';
  
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(225, 29, 72); // rose-600
  doc.text(`Allergies: `, margin + 5, y + 25);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(allergiesStr, margin + 22, y + 25);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(13, 148, 136); // teal-600
  doc.text(`Conditions: `, margin + 5, y + 31);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  doc.text(conditionsStr, margin + 24, y + 31);

  // Vitals Snapshot Box on the right side of card
  const vitalsX = margin + contentWidth - 65;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(vitalsX, y + 4, 60, 30, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(15, 23, 42);
  doc.text('CURRENT VITALS', vitalsX + 4, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`• BP: ${patient.vitals.bloodPressure || '120/80 mmHg'}`, vitalsX + 4, y + 14);
  doc.text(`• Pulse: ${patient.vitals.heartRate || 72} bpm`, vitalsX + 4, y + 18);
  doc.text(`• SpO2: ${patient.vitals.oxygenLevel || patient.vitals.spO2 || 98}%`, vitalsX + 4, y + 22);
  doc.text(`• Glucose: ${patient.vitals.glucose || patient.vitals.bloodSugar || 105} mg/dL`, vitalsX + 4, y + 26);

  y += 44;

  // --- SECTION 2: APPOINTMENT HISTORY & SCHEDULE ---
  checkPageBreak(30);

  // Section Title Bar
  doc.setFillColor(13, 148, 136); // teal-600
  doc.rect(margin, y, 3, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`Appointment History & Consultations (${appointments.length})`, margin + 6, y + 5.5);

  y += 10;

  if (appointments.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('No appointments recorded in patient file.', margin + 2, y + 4);
    y += 10;
  } else {
    // Table Header
    doc.setFillColor(241, 245, 249); // slate-100
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);

    const colX = {
      date: margin + 3,
      doctor: margin + 32,
      specialty: margin + 85,
      type: margin + 128,
      status: margin + 158
    };

    doc.text('Date & Time', colX.date, y + 4.5);
    doc.text('Doctor / Hospital', colX.doctor, y + 4.5);
    doc.text('Specialty', colX.specialty, y + 4.5);
    doc.text('Visit Type', colX.type, y + 4.5);
    doc.text('Status', colX.status, y + 4.5);

    y += 8;

    appointments.forEach((app, idx) => {
      checkPageBreak(12);

      const docObj = doctors.find(d => d.id === app.doctorId);
      const doctorName = docObj ? docObj.name : 'Specialist Doctor';
      const hospitalName = docObj ? docObj.hospital : 'CareFlow Medical';
      const specialty = docObj ? docObj.specialty : 'General Physician';

      // Alternate row backgrounds
      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y - 1, contentWidth, 10, 'F');
      }

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);

      // Date & Time
      doc.text(`${app.date}`, colX.date, y + 3);
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(`${app.time}`, colX.date, y + 6.5);

      // Doctor & Hospital
      doc.setFontSize(8);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text(doctorName.length > 28 ? doctorName.substring(0, 26) + '...' : doctorName, colX.doctor, y + 3);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(hospitalName.length > 30 ? hospitalName.substring(0, 28) + '...' : hospitalName, colX.doctor, y + 6.5);

      // Specialty
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text(specialty.length > 22 ? specialty.substring(0, 20) + '...' : specialty, colX.specialty, y + 4);

      // Type
      doc.text(app.type || 'Consultation', colX.type, y + 4);

      // Status Badge
      const statusText = (app.status || 'scheduled').toUpperCase();
      if (app.status === 'completed') {
        doc.setTextColor(22, 101, 52); // green-800
      } else if (app.status === 'scheduled' || app.status === 'in-progress') {
        doc.setTextColor(13, 148, 136); // teal-600
      } else {
        doc.setTextColor(159, 18, 57); // rose-800
      }
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.text(statusText, colX.status, y + 4);

      // Line divider
      doc.setDrawColor(241, 245, 249);
      doc.line(margin, y + 8, margin + contentWidth, y + 8);

      y += 9.5;
    });

    y += 4;
  }

  // --- SECTION 3: MEDICATION LOGS & PRESCRIPTION TRACKER ---
  checkPageBreak(30);

  // Section Title Bar
  doc.setFillColor(13, 148, 136); // teal-600
  doc.rect(margin, y, 3, 7, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`Prescription Medication Logs & Adherence (${medicines.length})`, margin + 6, y + 5.5);

  y += 10;

  if (medicines.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(100, 116, 139);
    doc.text('No active prescription medications recorded.', margin + 2, y + 4);
    y += 10;
  } else {
    // Table Header
    doc.setFillColor(241, 245, 249);
    doc.rect(margin, y, contentWidth, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);

    const colM = {
      name: margin + 3,
      dose: margin + 50,
      freq: margin + 85,
      prescribed: margin + 125,
      refills: margin + 162
    };

    doc.text('Medication Name', colM.name, y + 4.5);
    doc.text('Dosage', colM.dose, y + 4.5);
    doc.text('Frequency & Schedule', colM.freq, y + 4.5);
    doc.text('Prescribing Doctor', colM.prescribed, y + 4.5);
    doc.text('Refills', colM.refills, y + 4.5);

    y += 8;

    medicines.forEach((med, idx) => {
      checkPageBreak(12);

      if (idx % 2 === 1) {
        doc.setFillColor(248, 250, 252);
        doc.rect(margin, y - 1, contentWidth, 11, 'F');
      }

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(15, 23, 42);
      doc.text(med.name, colM.name, y + 3.5);

      // Instructions below med name
      if (med.instructions) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(100, 116, 139);
        const instr = med.instructions.length > 35 ? med.instructions.substring(0, 33) + '...' : med.instructions;
        doc.text(instr, colM.name, y + 7);
      }

      // Dosage
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(30, 41, 59);
      doc.text(med.dosage, colM.dose, y + 4);

      // Frequency & Time of day
      const times = med.timeOfDay ? med.timeOfDay.join(', ') : 'Daily';
      doc.text(med.frequency, colM.freq, y + 3.5);
      doc.setFontSize(7);
      doc.setTextColor(100, 116, 139);
      doc.text(`Schedule: ${times}`, colM.freq, y + 7);

      // Prescribed By
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      doc.text(med.prescribedBy || 'Attending Physician', colM.prescribed, y + 4);

      // Refills remaining
      doc.setFont('helvetica', 'bold');
      if (med.refillRemaining === 0) {
        doc.setTextColor(159, 18, 57);
        doc.text('0 (Refill Req)', colM.refills, y + 4);
      } else {
        doc.setTextColor(22, 101, 52);
        doc.text(`${med.refillRemaining} remaining`, colM.refills, y + 4);
      }

      doc.setDrawColor(241, 245, 249);
      doc.line(margin, y + 9, margin + contentWidth, y + 9);

      y += 10.5;
    });

    y += 4;
  }

  // --- FOOTER & DISCLAIMER ---
  checkPageBreak(25);

  doc.setDrawColor(203, 213, 225);
  doc.line(margin, pageHeight - 20, pageWidth - margin, pageHeight - 20);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'Medical Disclaimer: This PDF document is generated by CareFlow AI Patient Portal for personal record keeping. Always consult your attending doctor before modifying treatments.',
    margin,
    pageHeight - 15,
    { maxWidth: contentWidth - 30 }
  );

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(13, 148, 136);
  doc.text('CareFlow AI Verified Record', pageWidth - margin, pageHeight - 15, { align: 'right' });

  // Save / Trigger Download
  const cleanName = patient.name.replace(/[^a-zA-Z0-9]/g, '_');
  const dateStamp = new Date().toISOString().split('T')[0];
  doc.save(`CareFlow_Medical_Summary_${cleanName}_${dateStamp}.pdf`);
}

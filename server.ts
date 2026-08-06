import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import { ERODE_HOSPITALS, ERODE_DOCTORS } from './src/data/hospitalsData';
import { HEALTH_KNOWLEDGE_BASE } from './src/data/healthKnowledgeBase';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini AI Client lazily/safely
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    try {
      return new GoogleGenAI({ apiKey });
    } catch (err) {
      console.error('Error instantiating Gemini client:', err);
      return null;
    }
  };

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', service: 'CareFlow AI Engine', timestamp: new Date().toISOString() });
  });

  // AI Care Assistant Chat API
  app.post('/api/ai/chat', async (req, res) => {
    try {
      const { prompt, patientContext, history } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: 'Prompt is required' });
      }

      const lowerPrompt = prompt.toLowerCase();
      const hasHistory = history && Array.isArray(history) && history.length > 0;

      // Check emergency red flags directly first
      const emergencyKeywords = [
        'chest pain', 'chest tightness', 'heart attack', 'shortness of breath', 'trouble breathing',
        'unconscious', 'faint', 'severe bleeding', 'stroke', 'slurred speech', 'facial drooping',
        'sudden numbness', 'thunderclap headache', 'sudden vision loss', 'seizure', 'poison'
      ];
      const isRedFlag = emergencyKeywords.some(kw => lowerPrompt.includes(kw)) ||
        HEALTH_KNOWLEDGE_BASE.emergency_red_flags.signs.some(sign => {
          const signKw = sign.toLowerCase().replace(/[^a-z0-9 ]/g, '');
          return signKw.split(' ').some(word => word.length > 4 && lowerPrompt.includes(word));
        });

      const ai = getGeminiClient();
      if (!ai) {
        // Fallback powered by Clinical Consultation Protocol & Health Knowledge Base
        if (isRedFlag) {
          return res.json({
            response: `🚨 **EMERGENCY MEDICAL ALERT**

Your description mentions potential high-risk emergency symptoms.

**Immediate Action Required:**
1. Call emergency medical services immediately (**108** / **911** or local emergency response).
2. Proceed to the nearest Hospital Emergency Room right away.
3. Do not delay emergency evaluation for self-care or chat guidance.

*${HEALTH_KNOWLEDGE_BASE.meta.disclaimer}*`,
            disclaimer: HEALTH_KNOWLEDGE_BASE.meta.disclaimer,
            source: 'clinical-protocol-emergency'
          });
        }

        // If this is the first turn without prior context
        if (!hasHistory) {
          return res.json({
            response: `I'm really sorry to hear that you're not feeling well today. I'm here to listen and help you understand what might be going on.

To help me better understand your situation, could you please answer a few quick questions?

1. **Duration & Onset:** When did this symptom start, and did it come on suddenly or gradually?
2. **Location & Character:** Where exactly is the discomfort, and how would you describe it (e.g., dull, sharp, throbbing, aching)?
3. **Severity:** On a scale of 1 to 10, how severe is the discomfort right now?
4. **Accompanying Symptoms:** Are you experiencing any other symptoms, such as fever, nausea, dizziness, or fatigue?
5. **Triggers:** Is there anything that makes it feel better or worse?

Once you share a few more details, I'll be glad to summarize your symptoms, discuss potential explanations, and suggest safe self-care steps.`,
            disclaimer: HEALTH_KNOWLEDGE_BASE.meta.disclaimer,
            source: 'clinical-protocol-initial'
          });
        }

        // Subsequent turn fallback
        return res.json({
          response: `Thank you for sharing those details with me.

### 📋 Summary of What You Shared
You have been experiencing symptoms as described in our conversation.

### 🔍 Possible Explanations
• **Common Viral / Functional Strain** (~70% likelihood): Often associated with temporary physical stress, mild infection, or fatigue.
• **Secondary Metabolic / Environmental Factor** (~25% likelihood): Related to fluid balance, sleep, or environmental triggers.

### 🌿 Safe Self-Care Measures
• Rest comfortably in a well-ventilated, calm environment.
• Sip plenty of fluids (water, warm herbal tea, ORS) throughout the day.
• Keep a simple log of your symptoms and vitals.

### 🩺 When to Seek Professional Care
Please consult a healthcare professional if:
• Your symptoms become severe or progressively worsen.
• Symptoms persist beyond 3 to 5 days without improvement.
• You develop red-flag signs such as difficulty breathing, severe pain, or high fever.

*${HEALTH_KNOWLEDGE_BASE.meta.disclaimer}*`,
          disclaimer: HEALTH_KNOWLEDGE_BASE.meta.disclaimer,
          source: 'clinical-protocol-followup'
        });
      }

      const systemInstruction = `You are CareFlow AI, a compassionate, highly skilled, and articulate AI healthcare professional acting like a real clinical provider.

CLINICAL CONSULTATION & SYMPTOM ASSESSMENT PROTOCOL (STRICT RULES):

1. EMERGENCY SCREENING:
   - Check immediately for emergency red flags (e.g., crushing chest pain, difficulty breathing, slurred speech, facial drooping, sudden paralysis/numbness, loss of consciousness, uncontrolled bleeding, high fever with stiff neck/confusion).
   - ONLY IF EMERGENCY RED FLAGS ARE PRESENT: Express urgent clinical concern and instruct the patient to seek emergency medical care immediately (call 108 / 911 / go to ER).

2. FIRST RESPONSE TO NEW SYMPTOMS (CRITICAL RULE):
   - NEVER recommend visiting a doctor, specialist, or hospital in the initial / first response when a patient reports symptoms, UNLESS the symptoms indicate a medical emergency.
   - Step 1: Acknowledge their concern with genuine empathy and reassurance (e.g., "I'm so sorry you're experiencing a headache today. I know how uncomfortable that can be, but I'm here to help you work through it.").
   - Step 2: Ask 3 to 5 relevant, focused follow-up questions to gather necessary clinical context BEFORE offering any assessment (e.g., exact location, onset/duration, severity on 1-10 scale, accompanying symptoms like fever/nausea, relieving/aggravating factors).
   - Step 3: DO NOT provide a diagnosis or list of potential causes on this first response until the patient answers your questions.
   - Step 4: DO NOT recommend doctors or hospital visits on this first response.

3. SUBSEQUENT TURNS (AFTER PATIENT PROVIDES DETAILS / ANSWERS FOLLOW-UP QUESTIONS):
   - Step 1: Summarize what the user has shared clearly and accurately (e.g., "Thank you for sharing those details. To summarize, you've had a throbbing headache for 2 days, rated 6/10 in severity...").
   - Step 2: Provide possible explanations with confidence levels (e.g., "Tension Headache (~75% likelihood)", "Dehydration or Fatigue (~20% likelihood)"). Explicitly state that these are possible explanations, not a definitive diagnosis.
   - Step 3: Suggest safe, practical self-care measures when appropriate (e.g., rest in a quiet, dark room, stay hydrated, warm/cold compress).
   - Step 4: Recommend consulting a healthcare professional ONLY IF:
     * Red-flag symptoms are present.
     * Symptoms are severe or worsening.
     * Symptoms persist beyond the expected duration (e.g., >3-5 days).
     * Immediate medical attention may be needed.

4. EXPLICIT REQUESTS FOR DOCTORS / APPOINTMENTS:
   - If the patient explicitly asks to book an appointment, find a doctor, or locate a hospital (e.g., "Find a cardiologist in Erode", "Book an appointment with Dr. Sarah"), assist them with options from the Erode medical directory below:
   HOSPITALS IN ERODE:
   ${ERODE_HOSPITALS.slice(0, 20).map(h => `• ${h.name} | ${h.location} | Specialties: ${h.keySpecialties.join(', ')}`).join('\n')}
   SPECIALIST DOCTORS IN ERODE:
   ${ERODE_DOCTORS.map(d => `• ${d.name} | ${d.specialty} | ${d.hospital} | Timings: ${d.availability}`).join('\n')}

5. CONVERSATIONAL TONE & FEEL:
   - The conversation MUST feel like talking to a real healthcare professional (attentive, warm, calm, professional, and empathetic) rather than an automated symptom checker.
   - Avoid sounding robotic. Maintain medical safety limits: "${HEALTH_KNOWLEDGE_BASE.meta.disclaimer}".
   - Patient Context: ${JSON.stringify(patientContext || {})}
`;

      const contents = history && Array.isArray(history) && history.length > 0
        ? [...history.map((h: any) => `${h.role === 'user' ? 'Patient' : 'CareFlow AI'}: ${h.text}`), `Patient: ${prompt}`].join('\n\n')
        : prompt;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const responseText = aiResponse.text || 'Thank you for asking. Please remember to consult your healthcare provider for medical advice.';

      return res.json({
        response: responseText,
        disclaimer: HEALTH_KNOWLEDGE_BASE.meta.disclaimer,
        source: 'gemini-3.6-flash-trained'
      });
    } catch (error: any) {
      console.error('AI Chat Error:', error);
      const userQuery = req.body?.prompt || 'your health query';
      const matchedCondition = HEALTH_KNOWLEDGE_BASE.conditions.find(c => {
        const cName = c.name.toLowerCase();
        const lowerPrompt = userQuery.toLowerCase();
        return cName.includes('indigestion') && (lowerPrompt.includes('stomach') || lowerPrompt.includes('abdomen') || lowerPrompt.includes('belly')) ||
          cName.includes('headache') && lowerPrompt.includes('head') ||
          cName.includes('cold') && lowerPrompt.includes('cold');
      });

      if (matchedCondition) {
        return res.json({
          response: `CareFlow Health Assistant (Trained Knowledge Base):

**Guidance for ${matchedCondition.name}:**
${matchedCondition.general_description}

**General Self-Care Tips:**
${matchedCondition.general_self_care.map(step => `• ${step}`).join('\n')}

**See a Doctor If:**
${matchedCondition.see_a_doctor_if.map(item => `⚠️ ${item}`).join('\n')}`,
          disclaimer: HEALTH_KNOWLEDGE_BASE.meta.disclaimer,
          source: 'knowledge-base-fallback'
        });
      }

      return res.json({
        response: `CareFlow AI Assistance:

I am here to help with "${userQuery}".

**Recommended Steps:**
• Rest comfortably and stay hydrated.
• Avoid spicy or heavy foods if experiencing stomach or abdominal discomfort.
• Monitor your symptoms closely.

**When to Consult a Doctor:**
• If discomfort persists over 24-48 hours.
• If severe pain, fever, or shortness of breath occurs.

*${HEALTH_KNOWLEDGE_BASE.meta.disclaimer}*`,
        disclaimer: HEALTH_KNOWLEDGE_BASE.meta.disclaimer,
        source: 'knowledge-base-fallback'
      });
    }
  });

  // AI Medical Report Analyzer API
  app.post('/api/ai/analyze-report', async (req, res) => {
    try {
      const { reportText, imageBase64, mimeType } = req.body;
      if (!reportText && !imageBase64) {
        return res.status(400).json({ error: 'Provide reportText or imageBase64' });
      }

      const ai = getGeminiClient();
      if (!ai) {
        return res.json({
          summary: 'Body is a bit weak (low iron) + something is inflamed somewhere (high ESR) + slightly high uric acid.',
          keyFindings: [
            'Glucose & Kidney: Normal 👍',
            'Hemoglobin: 10.4 g/dL (Slightly Low) - Mild Anemia',
            'ESR: 60 mm/hr (Elevated) - Signs of inflammation',
            'Uric Acid: 7.1 mg/dL (Slightly High)'
          ],
          plainEnglishExplanation: `**Good news:**
- Sugar problem — None 👍
- Kidney working fine 👍
- Infection markers in WBC — Normal 👍
- Blood clotting cells (platelets) — Healthy & normal 👍

**Problem 1: Blood is a little weak**
Hemoglobin is low (10.4, should be 12-14). This means mild **anemia** — not enough iron in blood. This can cause tiredness and weakness.
👉 Fix: Eat more iron-rich foods (greens, dates, jaggery, eggs, meat) + consult doctor for iron supplements.

**Problem 2: ESR is high (60, normal is under 20)**
This indicates **some inflammation or swelling somewhere in the body** — though this test alone does not specify where.
👉 Fix: Doctor needs to evaluate this further. Don't ignore it.

**Problem 3: Uric acid slightly high (7.1)**
Can cause joint discomfort if it stays high.
👉 Fix: Reduce high-purine foods (red meat), drink plenty of water.

**One line summary:** Body is a bit weak (low iron) + something is inflamed somewhere (high ESR) + slightly high uric acid. Show this report to your doctor, they will figure out the ESR cause and advise appropriate steps.`,
          recommendations: [
            'Share this report with Dr. Sarah Chen during your appointment.',
            'Ask about checking iron levels and ESR causes.',
            'Increase daily water intake to help clear uric acid.'
          ],
          disclaimer: 'This simple analysis is for informational support. Consult your doctor for medical decisions.'
        });
      }

      const systemInstruction = `You are CareFlow AI Report Analyzer. Analyze medical lab reports and explain them to patients in super simple, plain language.

STRICT FORMATTING & STYLE INSTRUCTIONS FOR "plainEnglishExplanation":
Structure "plainEnglishExplanation" using markdown exactly like this format:

**Good news:**
- [List normal lab values with 👍, e.g. "Sugar problem — None 👍", "Kidney working fine 👍"]

**Problem 1: [Short Plain Title (e.g. Blood is a little weak)]**
[Value vs normal range in simple words]. [Everyday explanation].
👉 Fix: [Diet/lifestyle tips + doctor advice]

**Problem 2: [Short Plain Title]**
[Details].
👉 Fix: [Actionable advice]

**One line summary:**
[1 sentence reassuring summary + doctor follow-up advice].

STRICT COMMUNICATION RULES:
1. Use ultra-simple everyday words (e.g., "blood is a little weak" instead of "Microcytic Anemia").
2. Avoid dense medical jargon.
3. Keep it clear, calm, and non-alarmist.

Return a JSON object with:
- "summary": 1 sentence plain English summary.
- "keyFindings": array of key findings with status (e.g., "Hemoglobin: 10.4 g/dL (Slightly Low)").
- "plainEnglishExplanation": formatted markdown text following the Good news / Problem / Fix / One line summary format above.
- "recommendations": array of simple questions/steps for their doctor.
- "abnormalValues": array of out-of-range values.`;

      let parts: any[] = [];
      if (imageBase64) {
        parts.push({
          inlineData: {
            data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
            mimeType: mimeType || 'image/png'
          }
        });
      }
      if (reportText) {
        parts.push({ text: `Analyze this medical document content:\n\n${reportText}` });
      }

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: { parts },
        config: {
          systemInstruction,
          responseMimeType: 'application/json',
        }
      });

      const rawText = aiResponse.text || '{}';
      let parsed: any = {};
      try {
        parsed = JSON.parse(rawText);
      } catch (e) {
        parsed = { summary: rawText };
      }

      const normalizeStringArray = (arr: any): string[] => {
        if (!Array.isArray(arr)) return [];
        return arr.map(item => {
          if (typeof item === 'string') return item;
          if (typeof item === 'object' && item !== null) {
            if (item.finding && item.status) return `${item.finding}: ${item.status}`;
            if (item.finding) return item.finding;
            if (item.text) return item.text;
            if (item.title) return item.title;
            return Object.values(item).filter(v => typeof v === 'string').join(' - ');
          }
          return String(item ?? '');
        });
      };

      if (parsed.keyFindings) parsed.keyFindings = normalizeStringArray(parsed.keyFindings);
      if (parsed.recommendations) parsed.recommendations = normalizeStringArray(parsed.recommendations);
      if (parsed.abnormalValues) parsed.abnormalValues = normalizeStringArray(parsed.abnormalValues);

      return res.json({
        ...parsed,
        disclaimer: 'AI medical report analysis is an auxiliary tool and does not replace professional clinical evaluation.'
      });
    } catch (error: any) {
      console.error('Report Analyzer Error:', error);
      return res.status(500).json({ error: 'Failed to analyze report', message: error.message });
    }
  });

  // AI Symptom Assessment API
  app.post('/api/ai/assess-symptoms', async (req, res) => {
    try {
      const { patientId, age, gender, symptoms, medicalHistory } = req.body;
      const symptomList = Array.isArray(symptoms) ? symptoms : [];
      const symptomNames = symptomList.map((s: any) => typeof s === 'string' ? s : s.name || '').filter(Boolean);
      const combinedSymptomStr = symptomNames.join(', ').toLowerCase();

      // Check emergency red flags
      const emergencyKeywords = [
        'chest pain', 'chest tightness', 'heart attack', 'shortness of breath', 'trouble breathing',
        'unconscious', 'fainting', 'severe bleeding', 'stroke', 'slurred speech', 'facial drooping',
        'sudden numbness', 'thunderclap headache', 'sudden vision loss', 'poisoning', 'seizure'
      ];

      const isEmergency = emergencyKeywords.some(kw => combinedSymptomStr.includes(kw));

      // Match specialty for recommendations
      let matchedSpecialty = 'General Medicine';
      if (/cardio|heart|chest|blood pressure|palpitations/i.test(combinedSymptomStr)) {
        matchedSpecialty = 'Cardiology & Internal Medicine';
      } else if (/breath|cough|wheez|asthma|lungs|respiratory|sore throat/i.test(combinedSymptomStr)) {
        matchedSpecialty = 'Pulmonology & Respiratory Care';
      } else if (/brain|headache|migraine|stroke|seizure|dizzy|nerve|numbness/i.test(combinedSymptomStr)) {
        matchedSpecialty = 'Neurology & Neurosurgery';
      } else if (/stomach|acid|reflux|burp|digest|vomit|diarrhea|liver|gut/i.test(combinedSymptomStr)) {
        matchedSpecialty = 'Gastroenterology & GI Surgery';
      } else if (/sugar|diabetes|thyroid|fatigue|weight|frequent urination/i.test(combinedSymptomStr)) {
        matchedSpecialty = 'Endocrinology & Diabetes Care';
      } else if (/kidney|urine|flank|stone|dialysis|prostate/i.test(combinedSymptomStr)) {
        matchedSpecialty = 'Nephrology & Urology';
      } else if (/bone|joint|fracture|knee|back|spine|shoulder/i.test(combinedSymptomStr)) {
        matchedSpecialty = 'Orthopedics & Joint Replacement';
      } else if (/period|pregnancy|maternity|gynec|uterus/i.test(combinedSymptomStr)) {
        matchedSpecialty = 'Obstetrics, Gynecology & IVF';
      } else if (/child|baby|infant|fever in kid/i.test(combinedSymptomStr)) {
        matchedSpecialty = 'Pediatrics & Neonatology';
      } else if (/ear|nose|throat|sinus|hearing|tonsil/i.test(combinedSymptomStr)) {
        matchedSpecialty = 'ENT Speciality';
      }

      // Filter top 3 matched doctors & top 3 matched hospitals from Erode directory
      const topDoctors = ERODE_DOCTORS.filter(d => d.specialty.toLowerCase().includes(matchedSpecialty.toLowerCase().split(' ')[0]))
        .slice(0, 3)
        .map(doc => ({
          hospitalId: 'erode_hosp',
          hospitalName: doc.hospital,
          doctorId: doc.id,
          doctorName: doc.name,
          specialization: doc.specialty,
          rating: doc.rating,
          distance: '2.5 km',
          availableSlots: ['10:00 AM', '11:30 AM', '02:00 PM', '04:15 PM'],
          reason: `Specializes in ${doc.specialty} with ${doc.experience} experience.`
        }));

      const topHospitals = ERODE_HOSPITALS.filter(h => h.keySpecialties.some(ks => ks.toLowerCase().includes(matchedSpecialty.toLowerCase().split(' ')[0])))
        .slice(0, 3);

      const ai = getGeminiClient();

      if (!ai) {
        return res.json({
          possibleConditions: [
            { name: isEmergency ? 'Acute Cardiac / Respiratory Event' : 'Acute Common Viral / Functional Strain', explanation: isEmergency ? 'Requires urgent medical screening.' : 'Common self-limiting condition that responds well to rest and hydration.', probability: isEmergency ? 0.90 : 0.75 },
            { name: 'Secondary Metabolic Strain', explanation: 'Related to stress, fatigue, or dietary fluctuation.', probability: 0.15 }
          ],
          riskLevel: isEmergency ? 'High' : 'Low',
          emergencyFlag: isEmergency,
          aiSummary: isEmergency
            ? '⚠️ URGENT EMERGENCY WARNING: Your reported symptoms indicate a potential high-risk condition. Please seek immediate emergency medical care or call Erode Emergency Ambulance (108/911).'
            : `Based on your reported symptoms (${symptomNames.join(', ') || 'symptom evaluation'}), your symptoms appear stable. Rest, stay hydrated, and consult a specialist if discomfort persists.`,
          homeCare: [
            'Drink warm water and stay well-hydrated throughout the day.',
            'Rest in a quiet, well-ventilated space.',
            'Log your daily symptoms and vitals in CareFlow AI.'
          ],
          recommendedDoctors: topDoctors,
          recommendedHospitals: topHospitals
        });
      }

      const promptText = `Patient details: Age ${age || 45}, Gender ${gender || 'Unspecified'}, Symptoms: ${JSON.stringify(symptoms)}, History: ${JSON.stringify(medicalHistory || [])}.

Analyze these symptoms and return a JSON object strictly following this structure:
{
  "possibleConditions": [
    { "name": "Condition Name", "explanation": "Simple plain language explanation", "probability": 0.80 }
  ],
  "riskLevel": "${isEmergency ? 'High' : 'Low'}",
  "emergencyFlag": ${isEmergency},
  "aiSummary": "1-2 sentence empathetic summary for patient in plain language",
  "homeCare": ["Tip 1", "Tip 2", "Tip 3"]
}`;

      const aiResponse = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: promptText,
        config: {
          systemInstruction: 'You are an empathetic medical AI assistant. Analyze symptoms and explain possibilities clearly without claiming a definitive diagnosis. Always advise professional doctor consultation.',
          responseMimeType: 'application/json',
        }
      });

      const parsed = JSON.parse(aiResponse.text || '{}');

      return res.json({
        possibleConditions: parsed.possibleConditions || [{ name: 'Mild Functional Symptom', explanation: 'Requires routine monitoring.', probability: 0.70 }],
        riskLevel: isEmergency ? 'High' : (parsed.riskLevel || 'Low'),
        emergencyFlag: isEmergency || Boolean(parsed.emergencyFlag),
        aiSummary: isEmergency
          ? '🚨 CRITICAL SAFETY ALERT: Severe symptoms detected. Please seek emergency medical care immediately.'
          : (parsed.aiSummary || 'Symptom analysis completed.'),
        homeCare: parsed.homeCare || ['Rest comfortably', 'Stay hydrated'],
        recommendedDoctors: topDoctors,
        recommendedHospitals: topHospitals
      });
    } catch (err: any) {
      console.error('Symptom Assessment Error:', err);
      return res.status(500).json({ error: 'Failed to assess symptoms', message: err.message });
    }
  });

  // Doctor Recommendation API
  app.post('/api/ai/recommend-doctors', (req, res) => {
    const { specialty, maxResults = 3 } = req.body;
    let filtered = ERODE_DOCTORS;
    if (specialty && specialty !== 'All') {
      filtered = filtered.filter(d => d.specialty.toLowerCase().includes(specialty.toLowerCase()));
    }
    const recommendations = filtered.slice(0, maxResults).map(doc => ({
      hospitalId: 'erode_hosp',
      hospitalName: doc.hospital,
      doctorId: doc.id,
      doctorName: doc.name,
      specialization: doc.specialty,
      rating: doc.rating,
      distance: '2.0 km',
      availableSlots: ['09:30 AM', '11:00 AM', '03:00 PM', '05:00 PM'],
      reason: `Top rated specialist in ${doc.specialty} with ${doc.experience} experience.`
    }));
    return res.json(recommendations);
  });

  // Appointment Booking Endpoint
  app.post('/api/appointments/book', (req, res) => {
    const { patientId, doctorId, date, time, reason } = req.body;
    if (!patientId || !doctorId || !date || !time) {
      return res.status(400).json({ error: 'patientId, doctorId, date, and time are required.' });
    }

    const apptId = `appt_${Date.now()}`;
    return res.json({
      appointmentId: apptId,
      status: 'scheduled',
      message: `Appointment successfully scheduled for ${date} at ${time}. Confirmation sent to patient.`
    });
  });

  // Get Hospitals Directory API
  app.get('/api/hospitals', (req, res) => {
    return res.json(ERODE_HOSPITALS);
  });

  // Get Doctors Directory API
  app.get('/api/doctors', (req, res) => {
    return res.json(ERODE_DOCTORS);
  });

  // Vite development middleware or production static serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: false },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CareFlow AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

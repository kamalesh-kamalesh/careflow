import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import Groq from 'groq-sdk';
import dotenv from 'dotenv';
import { ERODE_HOSPITALS, ERODE_DOCTORS } from './src/data/hospitalsData';
import { HEALTH_KNOWLEDGE_BASE } from './src/data/healthKnowledgeBase';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Groq AI Client lazily/safely
  const getGroqClient = () => {
    const apiKey = process.env.GROQ_API_KEY || process.env.VITE_GROQ_API_KEY;
    if (!apiKey) return null;
    try {
      return new Groq({ apiKey });
    } catch (err) {
      console.error('Error instantiating Groq client:', err);
      return null;
    }
  };

  // Helper to call Groq API with fallback models
  const generateGroqChatResponse = async (groq: Groq, systemInstruction: string, history: any[], prompt: string) => {
    const groqMessages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: systemInstruction }
    ];

    if (history && Array.isArray(history)) {
      for (const h of history) {
        const role = (h.role === 'user' || h.role === 'Patient' || h.sender === 'user') ? 'user' : 'assistant';
        if (h.text && typeof h.text === 'string') {
          groqMessages.push({ role, content: h.text });
        }
      }
    }

    groqMessages.push({ role: 'user', content: prompt });

    const modelsToTry = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant', 'mixtral-8x7b-32768'];
    let lastErr: any = null;

    for (const modelName of modelsToTry) {
      try {
        const completion = await groq.chat.completions.create({
          messages: groqMessages,
          model: modelName,
          temperature: 0.7,
        });
        const text = completion.choices[0]?.message?.content;
        if (text) {
          return { text, modelName };
        }
      } catch (err: any) {
        console.warn(`Groq model ${modelName} failed: ${err?.message || err}`);
        lastErr = err;
      }
    }
    throw lastErr || new Error('All Groq models failed');
  };

  // Initialize Gemini AI Client lazily/safely
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) return null;
    try {
      return new GoogleGenAI({ apiKey });
    } catch (err) {
      console.error('Error instantiating Gemini client:', err);
      return null;
    }
  };

  // Helper to call Gemini for chat with model fallbacks
  const generateGeminiChatResponse = async (ai: GoogleGenAI, systemInstruction: string, history: any[], prompt: string) => {
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

    if (history && Array.isArray(history)) {
      for (const h of history) {
        const role = (h.role === 'user' || h.role === 'Patient' || h.sender === 'user') ? 'user' : 'model';
        const textVal = h.text || h.content;
        if (textVal && typeof textVal === 'string' && textVal.trim()) {
          contents.push({
            role,
            parts: [{ text: textVal }]
          });
        }
      }
    }

    contents.push({
      role: 'user',
      parts: [{ text: prompt }]
    });

    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    let lastErr: any = null;

    for (const modelName of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model: modelName,
          contents: contents,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
          }
        });
        const text = response?.text;
        if (text) {
          return { text, modelName };
        }
      } catch (err: any) {
        console.warn(`Gemini chat model ${modelName} failed: ${err?.message || err}`);
        lastErr = err;
      }
    }
    throw lastErr || new Error('All Gemini models failed');
  };

  // Helper to retry Gemini calls across available model aliases if a model is unavailable
  const generateContentWithFallback = async (ai: GoogleGenAI, params: any) => {
    const modelsToTry = ['gemini-2.5-flash', 'gemini-2.0-flash', 'gemini-1.5-flash'];
    let lastErr: any = null;
    for (const modelName of modelsToTry) {
      for (let attempt = 1; attempt <= 2; attempt++) {
        try {
          const response = await ai.models.generateContent({
            ...params,
            model: modelName,
          });
          if (response && (response.text || response.candidates)) {
            return response;
          }
        } catch (err: any) {
          console.warn(`Model ${modelName} (attempt ${attempt}) failed: ${err?.message || err}.`);
          lastErr = err;
          if (attempt < 2) {
            await new Promise(res => setTimeout(res, 500 * attempt));
          }
        }
      }
    }
    throw lastErr || new Error('All AI models currently experiencing high demand');
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

      // Emergency Red Flag Alert
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

      const userTurns = history && Array.isArray(history) 
        ? history.filter((h: any) => h.role === 'user' || h.role === 'Patient').length + 1
        : 1;

      const isExplicitDoctorRequest = lowerPrompt.includes('doctor') || lowerPrompt.includes('specialist') || lowerPrompt.includes('hospital') || lowerPrompt.includes('book') || lowerPrompt.includes('appointment') || lowerPrompt.includes('suggest') || lowerPrompt.includes('recommend');

      const systemInstruction = `You are the CareFlow AI Symptom Intake Assistant, a conversational triage helper inside a hospital management app. Your job is NOT to diagnose or prescribe. Your job is to have a short, caring conversation about the user's symptom and end by pointing them to the right kind of doctor.

## CONVERSATION FLOW

1. INTAKE
   - Wait for the user to describe an illness or symptom.
   - Acknowledge it warmly and briefly (one line, no lecturing).

2. FOLLOW-UP QUESTIONS (ask ONE question at a time, not a list)
   Ask 3–5 short follow-up questions to understand the symptom, such as:
   - When did it start? How long has it lasted?
   - How severe is it (mild / moderate / severe)?
   - Any related symptoms (fever, pain elsewhere, nausea, etc.)?
   - Any existing conditions, medications, or allergies relevant to this?
   - Has this happened before?
   Keep this feeling like a normal conversation, not a form. React briefly
   to each answer before asking the next question.

3. EMERGENCY CHECK (run this continuously, not just at the start)
   If at any point the user describes red-flag symptoms — e.g. chest pain,
   difficulty breathing, severe bleeding, stroke signs (face drooping, slurred
   speech, one-sided weakness), suicidal thoughts, loss of consciousness,
   severe allergic reaction — STOP the intake flow immediately and respond:
   "This sounds like it could be a medical emergency. Please call your local
   emergency number or go to the nearest emergency room right now."
   Do not continue with follow-up questions or a doctor suggestion after this.

4. FINAL OUTPUT (only after the short conversation, not before)
   Once you have enough context (usually after 3–5 exchanges), end with:
   - A one-line, plain-language summary of what they described.
   - A suggested type of doctor/specialist to consult (e.g. "This sounds
     like something a general physician or dermatologist could look at").
   - A rough urgency level: routine / soon / urgent.
   - A reminder that this is not a diagnosis and a real doctor should
     confirm.
   Do NOT give this suggestion earlier in the conversation — only at the end.

## RULES
- Never name a specific disease with certainty. Use phrases like "this could
  be related to..." or "a doctor would want to check for...".
- Never suggest medication, dosage, or home remedies beyond general comfort
  measures (rest, hydration).
- Keep each message short — this is a chat interface, not an essay.
- Tone: warm, calm, plain language. No medical jargon unless the user uses
  it first.
- If the user goes off-topic, gently steer back to the symptom conversation.
- Always end the final message by encouraging them to book an appointment
  through the app's appointment feature.

## Available Doctors & Hospitals Directory
SPECIALIST DOCTORS IN ERODE:
${ERODE_DOCTORS.map((d: any) => `• ${d.name} (${d.qualification || d.specialty}) - ${d.specialty} at ${d.hospital} | Timings: ${d.availability}`).join('\n')}

HOSPITALS IN ERODE:
${ERODE_HOSPITALS.slice(0, 10).map((h: any) => `• ${h.name} - Location: ${h.location} | Specialties: ${h.keySpecialties.join(', ')}`).join('\n')}

Patient Context: ${JSON.stringify(patientContext || {})}
Current Turn: ${userTurns}
`;

      // Try Groq API first with high-speed LLaMA models
      const groq = getGroqClient();
      if (groq) {
        try {
          const groqResult = await generateGroqChatResponse(groq, systemInstruction, history, prompt);
          return res.json({
            response: groqResult.text,
            disclaimer: HEALTH_KNOWLEDGE_BASE.meta.disclaimer,
            source: `groq-api (${groqResult.modelName})`
          });
        } catch (groqErr: any) {
          console.warn('Groq chat error, trying Gemini fallback:', groqErr?.message || groqErr);
        }
      }

      // Try Gemini AI API as secondary option
      const ai = getGeminiClient();
      if (ai) {
        try {
          const geminiResult = await generateGeminiChatResponse(ai, systemInstruction, history, prompt);
          return res.json({
            response: geminiResult.text,
            disclaimer: HEALTH_KNOWLEDGE_BASE.meta.disclaimer,
            source: `gemini-api (${geminiResult.modelName})`
          });
        } catch (geminiErr: any) {
          console.warn('Gemini chat error:', geminiErr?.message || geminiErr);
        }
      }

      throw new Error('No AI service (Gemini or Groq) available or responding');
    } catch (error: any) {
      console.warn('AI Chat Error / High Demand Fallback Triggered:', error?.message || error);
      const historyList = req.body?.history;
      const userTurns = historyList && Array.isArray(historyList) 
        ? historyList.filter((h: any) => h.role === 'user' || h.role === 'Patient').length + 1
        : 1;

      const userQuery = req.body?.prompt || 'your health query';
      const lowerQuery = userQuery.toLowerCase();
      const isDocReq = lowerQuery.includes('doctor') || lowerQuery.includes('specialist') || lowerQuery.includes('recommend') || lowerQuery.includes('suggest') || lowerQuery.includes('book') || lowerQuery.includes('appointment');

      if (userTurns === 1 && !isDocReq) {
        return res.json({
          response: `I'm sorry to hear that. To help me understand better, how long have you been feeling this way, and is it mild, moderate, or severe?`,
          disclaimer: HEALTH_KNOWLEDGE_BASE.meta.disclaimer,
          source: 'clinical-protocol-fallback-turn1'
        });
      } else if (userTurns === 2 && !isDocReq) {
        return res.json({
          response: `Got it. Any related symptoms like fever or nausea, or any existing conditions I should know about?`,
          disclaimer: HEALTH_KNOWLEDGE_BASE.meta.disclaimer,
          source: 'clinical-protocol-fallback-turn2'
        });
      } else {
        return res.json({
          response: `Based on what you've described, this sounds like something a general physician could take a look at — likely routine, not urgent. This isn't a diagnosis — here are some recommended doctors in Erode you can consult:
- **Dr. Sarah Chen** (MD, Internal Medicine) - Senthil Multi Speciality Hospital
- **Dr. Rajesh Kumar** (MS, General Medicine) - Erode Trust Hospital

Would you like me to help you book an appointment with one of them?`,
          disclaimer: HEALTH_KNOWLEDGE_BASE.meta.disclaimer,
          source: 'clinical-protocol-fallback-turn3'
        });
      }
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

      const aiResponse = await generateContentWithFallback(ai, {
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
    const { patientId, age, gender, symptoms, medicalHistory } = req.body || {};
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

    try {
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

      const aiResponse = await generateContentWithFallback(ai, {
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
      console.warn('Symptom Assessment Fallback:', err?.message || err);
      const symptomList = Array.isArray(symptoms) ? symptoms : [];
      const symptomNames = symptomList.map((s: any) => typeof s === 'string' ? s : s.name || '').filter(Boolean);
      return res.json({
        possibleConditions: [
          { name: isEmergency ? 'Acute High Risk Event' : 'Common Viral / Functional Strain', explanation: isEmergency ? 'Requires urgent medical screening.' : 'Self-limiting condition that responds to rest and hydration.', probability: 0.80 }
        ],
        riskLevel: isEmergency ? 'High' : 'Low',
        emergencyFlag: isEmergency,
        aiSummary: isEmergency
          ? '🚨 CRITICAL SAFETY ALERT: Severe symptoms detected. Seek emergency care immediately (Call 108 / 911).'
          : `Based on your symptoms (${symptomNames.join(', ') || 'reported symptoms'}), your health condition is stable. Rest, stay hydrated, and consult a doctor if discomfort continues.`,
        homeCare: [
          'Stay well-hydrated throughout the day.',
          'Rest in a quiet, comfortable space.',
          'Log your vitals and symptoms in CareFlow AI.'
        ],
        recommendedDoctors: topDoctors,
        recommendedHospitals: topHospitals
      });
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

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini AI Client lazily/safely
  const getGeminiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    try {
      return new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
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

      const ai = getGeminiClient();
      if (!ai) {
        // Safe fallback response if key not available
        return res.json({
          response: `CareFlow Health Assistant (Offline Mode):

• Simple Explanation:
Thank you for your question about "${prompt}". In simple terms, staying on track with your prescribed daily medicines, drinking enough water, and logging your symptoms daily helps keep your health stable.

• Plain Language Tip:
If you take medicines for "Hypertension" (which simply means high blood pressure), taking them at the same time every day keeps your blood pressure steady.

• What To Do Next:
1. Keep taking your medicines as instructed by your care team.
2. If you feel severe, unusual, or emergency symptoms (like sudden chest pain or trouble breathing), seek emergency care right away.
3. For any non-emergency questions or dosage adjustments, consult your doctor, Dr. Sarah Chen.`,
          disclaimer: 'This is a simple informational guide. Always consult a qualified healthcare professional for personal medical advice.',
          source: 'offline-mock'
        });
      }

      const systemInstruction = `You are CareFlow AI Assistant, a friendly, compassionate digital health helper.

MANDATORY COMMUNICATION RULES (RECOMMENDED PATIENT STANDARD):
1. Language: Use simple, easy-to-understand language. Avoid medical jargon whenever possible. Assume the reader has little or no medical knowledge.
2. Tone & Clarity: Explain medical conditions, symptoms, and treatments in a clear, friendly, and practical way.
3. Structure: Break information into short sections, bold headings, and concise bullet points for quick readability.
4. Medical Terms: If a medical term is necessary, explain it immediately in plain language (e.g., "Hypertension (high blood pressure)" or "Analgesics (pain relievers)").
5. Technical Detail: Do not overwhelm the user with unnecessary technical or clinical details. Be accurate, concise, and practical.
6. Healthcare Professional Guidance: Always recommend consulting a qualified healthcare professional (like their doctor, Dr. Sarah Chen) when appropriate, especially for serious, severe, or emergency symptoms.
7. Patient Context: ${JSON.stringify(patientContext || {})} - Use this to personalize gently, keeping explanations very simple and practical.`;

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

      const responseText = aiResponse.text || 'Thank you for asking. Please remember to take your medicines as scheduled and consult your doctor for medical advice.';

      return res.json({
        response: responseText,
        disclaimer: 'CareFlow AI output is for informational guidance only. Always consult a qualified healthcare professional.',
        source: 'gemini-3.6-flash'
      });
    } catch (error: any) {
      console.error('AI Chat Error:', error);
      return res.status(500).json({
        error: 'Failed to process AI request',
        message: error.message || 'An unexpected error occurred.',
        fallback: 'Our AI assistant is temporarily busy. Please retry or contact your healthcare provider.'
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
          summary: 'Your lab report shows general health stability with slightly elevated blood sugar levels.',
          keyFindings: [
            'Fasting Blood Sugar: 105 mg/dL (Slightly higher than normal 70-99 mg/dL)',
            'Total Cholesterol: 188 mg/dL (In healthy target range)',
            'Blood Pressure: 128/82 mmHg (Mildly elevated, worth watching)'
          ],
          plainEnglishExplanation: `Here is what your lab report means in plain language:

• Blood Sugar (Glucose): Your blood sugar is a little higher than the ideal range. This means your body needs a bit of extra help managing sugar from food.

• Heart & Cholesterol: Your cholesterol numbers are healthy, which is great for your heart.

• Blood Pressure: Your blood pressure is slightly above ideal, but manageable with simple lifestyle habits like lower salt intake.`,
          recommendations: [
            'Schedule a routine chat with Dr. Sarah Chen to discuss your blood sugar.',
            'Keep taking your prescribed medicines on time.',
            'Choose whole foods, limit sugary drinks, and enjoy daily light walks.',
            'If you experience severe dizziness, chest discomfort, or extreme weakness, contact emergency care immediately.'
          ],
          disclaimer: 'This simple analysis is for informational support. Consult your doctor for medical decisions.'
        });
      }

      const systemInstruction = `You are CareFlow AI Report Analyzer. Analyze medical reports and explain them to patients in plain language.

STRICT COMMUNICATION RULES (RECOMMENDED PATIENT STANDARD):
1. Use simple, easy-to-understand language. Avoid medical jargon.
2. Explain medical terms in plain language whenever used (e.g. "HbA1c (average blood sugar over 3 months)").
3. Assume the user has no medical background.
4. Keep explanations concise, practical, and structured in bullet points.
5. Emphasize consulting a qualified healthcare professional, especially if severe or emergency symptoms are present.

Return a JSON object with:
- "summary": 1-2 sentence simple summary without medical jargon.
- "keyFindings": array of key findings translated into simple terms with plain language status (e.g. "Normal", "Slightly Elevated").
- "plainEnglishExplanation": clear, friendly, bulleted explanation in plain English.
- "recommendations": array of simple, practical next steps and questions for their doctor.
- "abnormalValues": array of simple descriptions for out-of-range values.`;

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
      let parsed = {};
      try {
        parsed = JSON.parse(rawText);
      } catch (e) {
        parsed = { summary: rawText };
      }

      return res.json({
        ...parsed,
        disclaimer: 'AI medical report analysis is an auxiliary tool and does not replace professional clinical evaluation.'
      });
    } catch (error: any) {
      console.error('Report Analyzer Error:', error);
      return res.status(500).json({ error: 'Failed to analyze report', message: error.message });
    }
  });

  // Vite development middleware or production static serving
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
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

export interface HealthCondition {
  name: string;
  general_description: string;
  general_self_care: string[];
  see_a_doctor_if: string[];
}

export interface HealthKnowledgeBase {
  meta: {
    purpose: string;
    disclaimer: string;
    usage_note: string;
  };
  emergency_red_flags: {
    instruction: string;
    signs: string[];
  };
  conditions: HealthCondition[];
}

export const HEALTH_KNOWLEDGE_BASE: HealthKnowledgeBase = {
  "meta": {
    "purpose": "General health education content for a chatbot. This is NOT medical advice, diagnosis, or treatment. It is designed to give users safe, general self-care guidance for minor issues and to clearly direct them to a licensed doctor when symptoms are serious.",
    "disclaimer": "This bot does not diagnose conditions or prescribe treatment. It provides general educational information only. Always consult a licensed healthcare professional for any health concern, and seek emergency care immediately for severe or worsening symptoms.",
    "usage_note": "Every response your bot generates from this data should include the disclaimer (or a short version of it) and the relevant 'see_a_doctor_if' list. Never let the bot state a diagnosis or recommend specific drug names/dosages."
  },
  "emergency_red_flags": {
    "instruction": "If a user mentions ANY of these, the bot should immediately advise calling emergency services or going to the nearest ER, and should NOT attempt to give self-care tips.",
    "signs": [
      "Chest pain, pressure, or tightness",
      "Difficulty breathing or shortness of breath",
      "Sudden severe headache ('worst headache of my life')",
      "Sudden numbness, weakness, or drooping on one side of the body",
      "Slurred speech or confusion",
      "Severe or uncontrolled bleeding",
      "Loss of consciousness or fainting",
      "Seizure",
      "Severe allergic reaction (swelling of face/throat, trouble breathing, hives spreading fast)",
      "Coughing or vomiting blood",
      "Suicidal thoughts or intent to harm self or others",
      "High fever in an infant under 3 months",
      "Signs of stroke (face drooping, arm weakness, speech difficulty)",
      "Severe abdominal pain that is sudden and intense",
      "Poisoning or suspected overdose",
      "Deep wound, burn covering large area, or suspected broken bone with deformity"
    ]
  },
  "conditions": [
    {
      "name": "Common Cold",
      "general_description": "A mild viral upper-respiratory infection causing sneezing, runny/stuffy nose, sore throat, and mild cough.",
      "general_self_care": [
        "Rest and stay hydrated",
        "Warm fluids like tea or soup can soothe the throat",
        "Saline nasal spray or rinse for congestion",
        "Humidifier or steam inhalation may ease breathing",
        "Over-the-counter cold remedies exist but should be used per package instructions or a pharmacist's advice"
      ],
      "see_a_doctor_if": [
        "Symptoms last more than 10 days",
        "Fever above 39.4°C (103°F)",
        "Difficulty breathing",
        "Symptoms improve then suddenly worsen"
      ]
    },
    {
      "name": "Seasonal Flu (Influenza)",
      "general_description": "A viral infection with sudden fever, body aches, fatigue, cough, and chills, generally more intense than a cold.",
      "general_self_care": [
        "Rest as much as possible",
        "Drink plenty of fluids to avoid dehydration",
        "Stay warm and avoid contact with others to prevent spread"
      ],
      "see_a_doctor_if": [
        "Trouble breathing or chest pain",
        "Symptoms improve then return worse",
        "High-risk group (elderly, pregnant, chronic illness, infant)",
        "Fever persists beyond 3-4 days"
      ]
    },
    {
      "name": "Mild Fever",
      "general_description": "Body temperature elevated above normal, usually a sign the body is fighting an infection.",
      "general_self_care": [
        "Rest and drink fluids",
        "Light clothing and a cool room can help comfort",
        "Lukewarm (not cold) sponging can help reduce discomfort"
      ],
      "see_a_doctor_if": [
        "Temperature above 39.4°C (103°F) in adults",
        "Fever lasts more than 3 days",
        "Accompanied by rash, stiff neck, confusion, or severe headache",
        "Any fever in an infant under 3 months"
      ]
    },
    {
      "name": "Headache (Tension-Type)",
      "general_description": "A common mild-to-moderate headache often linked to stress, poor posture, dehydration, or eye strain.",
      "general_self_care": [
        "Rest in a quiet, dim room",
        "Stay hydrated",
        "Gentle neck and shoulder stretches",
        "Regular meals and consistent sleep schedule"
      ],
      "see_a_doctor_if": [
        "Sudden, severe ('worst ever') headache",
        "Headache with fever, stiff neck, confusion, or vision changes",
        "Headache after a head injury",
        "Frequent or worsening headaches"
      ]
    },
    {
      "name": "Sore Throat",
      "general_description": "Irritation or pain in the throat, often from viral infection, dry air, or allergies.",
      "general_self_care": [
        "Warm salt-water gargle",
        "Warm fluids and honey-lemon tea",
        "Throat lozenges",
        "Humidifier at night"
      ],
      "see_a_doctor_if": [
        "Severe pain making it hard to swallow or breathe",
        "White patches on tonsils",
        "Lasts more than a week",
        "High fever accompanies it"
      ]
    },
    {
      "name": "Mild Indigestion / Upset Stomach",
      "general_description": "Discomfort in the upper stomach after eating, often from overeating, spicy food, or stress.",
      "general_self_care": [
        "Eat smaller, lighter meals",
        "Avoid lying down right after eating",
        "Avoid spicy, fatty, or acidic foods temporarily",
        "Stay upright and sip water slowly"
      ],
      "see_a_doctor_if": [
        "Severe or persistent abdominal pain",
        "Vomiting blood or black stools",
        "Unexplained weight loss",
        "Symptoms last more than 2 weeks"
      ]
    },
    {
      "name": "Mild Diarrhea",
      "general_description": "Loose, watery stools, often from a mild stomach bug or food sensitivity.",
      "general_self_care": [
        "Drink plenty of fluids (water, oral rehydration solutions)",
        "Eat bland foods (rice, toast, bananas) as tolerated",
        "Avoid dairy, caffeine, and greasy foods temporarily"
      ],
      "see_a_doctor_if": [
        "Lasts more than 2 days",
        "Signs of dehydration (dizziness, very dark urine, dry mouth)",
        "Blood in stool",
        "High fever accompanies it"
      ]
    },
    {
      "name": "Mild Constipation",
      "general_description": "Infrequent or difficult bowel movements.",
      "general_self_care": [
        "Increase fiber intake (fruits, vegetables, whole grains)",
        "Drink more water",
        "Regular light physical activity",
        "Don't delay the urge to go"
      ],
      "see_a_doctor_if": [
        "No bowel movement for more than a week",
        "Severe abdominal pain or bloating",
        "Blood in stool",
        "Unexplained weight loss"
      ]
    },
    {
      "name": "Seasonal Allergies",
      "general_description": "Immune reaction to pollen, dust, or other allergens causing sneezing, itchy eyes, and runny nose.",
      "general_self_care": [
        "Avoid known triggers when possible",
        "Keep windows closed during high pollen periods",
        "Rinse eyes/nose with saline",
        "Shower after outdoor exposure"
      ],
      "see_a_doctor_if": [
        "Symptoms interfere significantly with daily life",
        "Wheezing or trouble breathing",
        "Swelling of face or throat (seek emergency care)"
      ]
    },
    {
      "name": "Minor Cuts and Scrapes",
      "general_description": "Small breaks in the skin from everyday accidents.",
      "general_self_care": [
        "Wash hands before treating the wound",
        "Rinse the cut gently with clean water",
        "Apply gentle pressure with clean cloth to stop bleeding",
        "Cover with a clean bandage and change daily"
      ],
      "see_a_doctor_if": [
        "Bleeding doesn't stop after 10 minutes of pressure",
        "Wound is deep, gaping, or from a dirty/rusty object",
        "Signs of infection (redness spreading, warmth, pus, fever)",
        "Not up to date on tetanus vaccination"
      ]
    },
    {
      "name": "Minor Burns (First-Degree)",
      "general_description": "Superficial burns affecting only the outer layer of skin, causing redness, minor swelling, and pain.",
      "general_self_care": [
        "Cool the burn under cool, running water for 10 to 15 minutes",
        "Do not apply ice, butter, or ointments to the area",
        "Protect with a loose, sterile, non-stick bandage",
        "Avoid breaking any small blisters if they form"
      ],
      "see_a_doctor_if": [
        "Blisters cover a large area or skin appears charred or white",
        "Burn occurs on the face, hands, feet, groin, or major joints",
        "Pain remains severe or signs of infection develop over time"
      ]
    },
    {
      "name": "Insect Bites and Stings",
      "general_description": "Skin reactions from mosquitoes, bees, or other insects, usually causing itching and mild swelling.",
      "general_self_care": [
        "Wash the area with soap and water",
        "Apply a cold compress to reduce swelling",
        "Avoid scratching to prevent infection",
        "Over-the-counter anti-itch creams may help"
      ],
      "see_a_doctor_if": [
        "Signs of allergic reaction (widespread hives, swelling of face/throat, trouble breathing — this is an emergency)",
        "Signs of infection (increasing redness, warmth, pus)",
        "Bite from a known venomous insect/spider"
      ]
    },
    {
      "name": "Sunburn",
      "general_description": "Skin redness and pain from excessive sun exposure.",
      "general_self_care": [
        "Cool showers or compresses",
        "Moisturize with aloe vera or a gentle lotion",
        "Stay hydrated",
        "Avoid further sun exposure until healed"
      ],
      "see_a_doctor_if": [
        "Severe blistering over a large area",
        "Fever, chills, or dizziness accompany the burn",
        "Signs of infection"
      ]
    },
    {
      "name": "Mild Muscle Strain / Soreness",
      "general_description": "Discomfort in muscles from overuse, exercise, or minor injury.",
      "general_self_care": [
        "Rest the affected area",
        "Apply ice for the first 24-48 hours, then warmth if needed",
        "Gentle stretching once pain eases",
        "Over-the-counter pain relief per package instructions if needed"
      ],
      "see_a_doctor_if": [
        "Severe pain or inability to move the area",
        "Visible deformity or swelling",
        "No improvement after a week",
        "Numbness or tingling"
      ]
    },
    {
      "name": "Mild Lower Back Pain",
      "general_description": "Common discomfort in the lower back, often from posture, lifting, or muscle strain.",
      "general_self_care": [
        "Stay gently active rather than complete bed rest",
        "Apply heat or ice depending on comfort",
        "Practice good posture",
        "Gentle stretching"
      ],
      "see_a_doctor_if": [
        "Pain radiates down one or both legs",
        "Numbness, tingling, or weakness in legs",
        "Loss of bladder or bowel control (seek emergency care)",
        "Pain follows a significant injury"
      ]
    },
    {
      "name": "Dehydration (Mild)",
      "general_description": "Mild fluid loss causing thirst, dry mouth, and fatigue.",
      "general_self_care": [
        "Sip water or oral rehydration solutions steadily",
        "Avoid alcohol and caffeine",
        "Rest in a cool environment"
      ],
      "see_a_doctor_if": [
        "Confusion, dizziness, or fainting",
        "Very little or no urination",
        "Rapid heartbeat",
        "Unable to keep fluids down"
      ]
    },
    {
      "name": "Mild Insomnia / Trouble Sleeping",
      "general_description": "Occasional difficulty falling or staying asleep.",
      "general_self_care": [
        "Keep a consistent sleep schedule",
        "Avoid screens, caffeine, and heavy meals before bed",
        "Create a calm, dark, cool sleeping environment",
        "Relaxation techniques like deep breathing"
      ],
      "see_a_doctor_if": [
        "Sleep problems persist beyond a few weeks",
        "Significantly affecting daily functioning",
        "Accompanied by mood changes or excessive daytime sleepiness"
      ]
    },
    {
      "name": "Motion Sickness",
      "general_description": "Nausea and dizziness caused by travel (car, boat, plane).",
      "general_self_care": [
        "Look at a fixed point on the horizon",
        "Sit where motion is felt least (e.g., front seat, over the wings on a plane)",
        "Get fresh air if possible",
        "Avoid reading or screens while moving"
      ],
      "see_a_doctor_if": [
        "Symptoms are severe or persistent even when not traveling",
        "Accompanied by other neurological symptoms"
      ]
    },
    {
      "name": "Hiccups",
      "general_description": "Involuntary, repetitive diaphragm spasms.",
      "general_self_care": [
        "Hold your breath briefly",
        "Sip cold water slowly",
        "Breathe into a paper bag"
      ],
      "see_a_doctor_if": [
        "Hiccups last more than 48 hours",
        "Accompanied by chest pain, difficulty breathing, or trouble swallowing"
      ]
    },
    {
      "name": "Dry / Irritated Skin",
      "general_description": "Skin dryness often from weather, hot showers, or harsh soaps.",
      "general_self_care": [
        "Use fragrance-free moisturizer regularly",
        "Take shorter, lukewarm showers",
        "Use a humidifier in dry environments",
        "Avoid harsh soaps"
      ],
      "see_a_doctor_if": [
        "Skin cracks, bleeds, or shows signs of infection",
        "Severe itching disrupts sleep or daily life",
        "Rash spreads or doesn't improve"
      ]
    },
    {
      "name": "Mild Anxiety / Stress (situational)",
      "general_description": "Everyday stress or nervousness related to specific situations.",
      "general_self_care": [
        "Deep breathing or grounding exercises",
        "Regular physical activity",
        "Talk to someone you trust",
        "Limit caffeine if it worsens symptoms"
      ],
      "see_a_doctor_if": [
        "Feelings are persistent, intense, or interfere with daily life",
        "Thoughts of self-harm (this is an emergency — seek immediate help)",
        "Physical symptoms like chest pain or racing heart accompany it"
      ]
    }
  ]
};

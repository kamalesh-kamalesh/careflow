import React, { useState, useEffect } from 'react';
import { Patient, Medicine } from '../../types';
import {
  Sparkles,
  Apple,
  Pill,
  HeartPulse,
  Activity,
  CheckCircle2,
  RefreshCw,
  MessageSquareHeart,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
  Lightbulb,
  Flame,
  Award
} from 'lucide-react';

interface DailyWellnessInsightsProps {
  patient: Patient;
  medicines: Medicine[];
  setActiveTab: (tab: string) => void;
  speak?: (text: string) => void;
}

interface InsightCard {
  id: string;
  category: 'diet' | 'medication' | 'lifestyle' | 'vitals';
  title: string;
  summary: string;
  details: string;
  conditionOrMedTag: string;
  actionableStep: string;
  importance: 'high' | 'medium' | 'general';
}

export const DailyWellnessInsights: React.FC<DailyWellnessInsightsProps> = ({
  patient,
  medicines,
  setActiveTab,
  speak
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'diet' | 'medication' | 'lifestyle' | 'vitals'>('all');
  const [completedInsightIds, setCompletedInsightIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`completed_insights_${patient.id}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [streakCount, setStreakCount] = useState<number>(() => {
    try {
      const saved = localStorage.getItem(`wellness_streak_${patient.id}`);
      return saved ? parseInt(saved, 10) : 3;
    } catch {
      return 3;
    }
  });

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [randomSeed, setRandomSeed] = useState(0);

  // Generate customized insights based on patient conditions and medications
  const generateInsights = (): InsightCard[] => {
    const cards: InsightCard[] = [];
    const conditionsLower = patient.conditions.map(c => c.toLowerCase());
    const medNamesLower = medicines.map(m => m.name.toLowerCase());

    // 1. DIET & NUTRITION INSIGHTS
    if (conditionsLower.some(c => c.includes('hypertension') || c.includes('high blood pressure') || c.includes('bp'))) {
      cards.push({
        id: 'diet_bp_1',
        category: 'diet',
        title: 'Sodium Balance & DASH Diet Guidance',
        summary: 'Target sodium intake under 1,500 mg daily to reduce arterial pressure.',
        details: 'High sodium leads to fluid retention and elevated systemic vascular resistance. Emphasize potassium-rich whole foods like bananas, spinach, and coconut water to help relax blood vessel walls naturally.',
        conditionOrMedTag: 'Hypertension',
        actionableStep: 'Swap table salt with lemon juice or herb seasonings for lunch and dinner.',
        importance: 'high'
      });
    }

    if (conditionsLower.some(c => c.includes('diabet') || c.includes('sugar'))) {
      cards.push({
        id: 'diet_diab_1',
        category: 'diet',
        title: 'Glycemic Index & Fiber Pairing',
        summary: 'Pair carbohydrates with healthy protein or fiber to prevent blood glucose spikes.',
        details: 'Soluble fiber slows down glucose absorption in the small intestine. Combining lentils, beans, or vegetables with whole grains stabilizes postprandial blood sugar curve.',
        conditionOrMedTag: 'Type 2 Diabetes',
        actionableStep: 'Eat fiber-rich vegetables or salad first before consuming rice or chapatis.',
        importance: 'high'
      });
    }

    if (conditionsLower.some(c => c.includes('asthma') || c.includes('respiratory'))) {
      cards.push({
        id: 'diet_asthma_1',
        category: 'diet',
        title: 'Antioxidant & Omega-3 Protection',
        summary: 'Boost intake of Vitamin C, Vitamin E, and Omega-3 fatty acids for airway health.',
        details: 'Antioxidants minimize oxidative stress in bronchial tissues, while omega-3 fatty acids help reduce systemic leukotriene inflammation.',
        conditionOrMedTag: 'Asthma',
        actionableStep: 'Include citrus fruits, walnuts, or flaxseeds in your morning meal.',
        importance: 'medium'
      });
    }

    if (conditionsLower.some(c => c.includes('acid') || c.includes('reflux') || c.includes('gerd') || c.includes('gastritis'))) {
      cards.push({
        id: 'diet_gerd_1',
        category: 'diet',
        title: 'Acid Reflux Prevention Protocol',
        summary: 'Avoid large meals 3 hours before lying down and limit acidic or deep-fried triggers.',
        details: 'Heavy or late-night meals exert upward pressure on the lower esophageal sphincter (LES), causing nocturnal acid regurgitation.',
        conditionOrMedTag: 'Acid Reflux / GERD',
        actionableStep: 'Remain seated or take a gentle 10-minute walk after dinner instead of lying down immediately.',
        importance: 'high'
      });
    }

    // Default Diet card if no specific match
    if (cards.filter(c => c.category === 'diet').length === 0) {
      cards.push({
        id: 'diet_gen_1',
        category: 'diet',
        title: 'Hydration & Micro-Nutrient Balance',
        summary: 'Aim for 2.5 to 3 Liters of fluid daily to maintain renal perfusion.',
        details: 'Optimal hydration prevents electrolyte imbalances, supports joint lubrication, and aids in flushing out metabolic waste products.',
        conditionOrMedTag: 'General Wellness',
        actionableStep: 'Drink 2 glasses of fresh water within 30 minutes of waking up.',
        importance: 'general'
      });
    }

    // 2. MEDICATION TIMING & INTERACTION INSIGHTS
    medicines.forEach(med => {
      const name = med.name.toLowerCase();
      if (name.includes('metformin')) {
        cards.push({
          id: `med_metformin_${med.id}`,
          category: 'medication',
          title: `Optimizing ${med.name} Administration`,
          summary: `Take ${med.name} (${med.dosage}) with or immediately after meals to reduce stomach upset.`,
          details: 'Metformin increases insulin sensitivity in tissue. Administering it during or right after a meal significantly decreases gastrointestinal side effects like nausea or cramping.',
          conditionOrMedTag: `Medication: ${med.name}`,
          actionableStep: 'Ensure you take your dose during breakfast/dinner rather than on an empty stomach.',
          importance: 'high'
        });
      }

      if (name.includes('amlodipine') || name.includes('nifedipine')) {
        cards.push({
          id: `med_amlodipine_${med.id}`,
          category: 'medication',
          title: `Calcium Channel Blocker Safety (${med.name})`,
          summary: 'Monitor for mild lower leg swelling and maintain steady daily timing.',
          details: 'Amlodipine relaxes vascular smooth muscle. Avoid grapefruit juice as it inhibits CYP3A4 enzymes, potentially increasing medication blood concentrations.',
          conditionOrMedTag: `Medication: ${med.name}`,
          actionableStep: 'Elevate feet for 15 minutes in the evening if mild ankle puffiness occurs.',
          importance: 'high'
        });
      }

      if (name.includes('omeprazole') || name.includes('pantoprazole') || name.includes('ranitidine')) {
        cards.push({
          id: `med_ppi_${med.id}`,
          category: 'medication',
          title: `Proton Pump Inhibitor Timing (${med.name})`,
          summary: `Administer ${med.name} 30 to 60 minutes before your first meal of the day.`,
          details: 'PPIs require active parietal cell acid pumps during food intake to achieve maximum acid suppression efficiency.',
          conditionOrMedTag: `Medication: ${med.name}`,
          actionableStep: 'Take your dose with a glass of water right when you wake up, then wait 30 mins before breakfast.',
          importance: 'high'
        });
      }

      if (name.includes('atorvastatin') || name.includes('simvastatin')) {
        cards.push({
          id: `med_statin_${med.id}`,
          category: 'medication',
          title: `Statin Lipid Protection (${med.name})`,
          summary: 'Consistent evening administration provides optimal nocturnal cholesterol synthesis inhibition.',
          details: 'Hepatic cholesterol synthesis peaks during early morning hours. Taking your statin at bedtime aligns peak drug concentration with natural enzyme activity.',
          conditionOrMedTag: `Medication: ${med.name}`,
          actionableStep: 'Keep your statin pill box on your bedside table as a bedtime reminder.',
          importance: 'medium'
        });
      }
    });

    if (cards.filter(c => c.category === 'medication').length === 0) {
      cards.push({
        id: 'med_gen_1',
        category: 'medication',
        title: 'Medication Adherence & Pill Box Routine',
        summary: 'Maintain consistent daily dosing intervals for steady plasma concentration.',
        details: 'Missing doses leads to therapeutic gaps where chronic conditions are less controlled. Use automated pill reminders or CareFlow AI notifications.',
        conditionOrMedTag: 'Active Prescriptions',
        actionableStep: 'Set a daily alarm or check off your doses on the CareFlow Medicines tab.',
        importance: 'general'
      });
    }

    // 3. EXERCISE & LIFESTYLE INSIGHTS
    if (conditionsLower.some(c => c.includes('hypertension') || c.includes('heart') || c.includes('cardio'))) {
      cards.push({
        id: 'life_cardio_1',
        category: 'lifestyle',
        title: 'Moderate Aerobic Exercise & Vasodilation',
        summary: 'Engage in 20-30 minutes of brisk walking or light exercise 5 days a week.',
        details: 'Regular aerobic activity stimulates nitric oxide production in endothelium, reducing systemic vascular resistance and lowering resting BP by 5-8 mmHg.',
        conditionOrMedTag: 'Cardiovascular Health',
        actionableStep: 'Take a calm 20-minute morning or evening walk at a conversational pace.',
        importance: 'high'
      });
    }

    if (conditionsLower.some(c => c.includes('back') || c.includes('joint') || c.includes('arthritis'))) {
      cards.push({
        id: 'life_joint_1',
        category: 'lifestyle',
        title: 'Low-Impact Core & Postural Support',
        summary: 'Practice gentle hamstring stretches and core stabilization movements.',
        details: 'Strengthening lumbar and abdominal stabilizer muscles distributes mechanical load away from spinal discs and arthritic joints.',
        conditionOrMedTag: 'Joint & Back Care',
        actionableStep: 'Perform 5 minutes of cat-cow and knee-to-chest gentle stretches.',
        importance: 'medium'
      });
    }

    cards.push({
      id: 'life_stress_1',
      category: 'lifestyle',
      title: 'Diaphragmatic Breathing for Vagal Tone',
      summary: 'Practice 4-7-8 deep breathing for 5 minutes to activate parasympathetic relaxation.',
      details: 'Deep belly breathing lowers cortisol levels, reduces sympathetic nerve firing, and promotes lower arterial pressure and heart rate variability.',
      conditionOrMedTag: 'Stress & Autonomic Balance',
      actionableStep: 'Inhale for 4 seconds, hold for 7 seconds, exhale slowly through mouth for 8 seconds.',
      importance: 'medium'
    });

    // 4. VITALS GUIDANCE INSIGHTS
    cards.push({
      id: 'vitals_bp_1',
      category: 'vitals',
      title: 'Target Vitals Threshold Check',
      summary: `Current BP: ${patient.vitals.bloodPressure || '120/80'} | Pulse: ${patient.vitals.heartRate || 72} bpm`,
      details: 'Rest for 5 minutes in a comfortable chair with feet flat on the floor before recording blood pressure. Avoid caffeine or exercise 30 minutes prior.',
      conditionOrMedTag: 'Clinical Telemetry',
      actionableStep: 'Log your latest vitals using the "Update Vitals" button above to keep your doctor updated.',
      importance: 'medium'
    });

    if (patient.vitals.glucose || patient.vitals.bloodSugar) {
      const sugar = patient.vitals.glucose || patient.vitals.bloodSugar;
      cards.push({
        id: 'vitals_glucose_1',
        category: 'vitals',
        title: 'Glycemic Monitoring & Targets',
        summary: `Last Blood Glucose: ${sugar} mg/dL (${sugar! > 130 ? 'Mild Elevation' : 'In Target Range'})`,
        details: 'Fasting blood glucose target for most adults is 70-130 mg/dL, and 2-hour post-meal target is under 180 mg/dL.',
        conditionOrMedTag: 'Glucose Management',
        actionableStep: 'Keep a quick note of food consumed when sugar levels vary beyond target range.',
        importance: 'high'
      });
    }

    // Apply seed rotation for variety if refreshed
    if (randomSeed > 0) {
      return [...cards].reverse();
    }

    return cards;
  };

  const insights = generateInsights();

  const filteredInsights = selectedCategory === 'all'
    ? insights
    : insights.filter(i => i.category === selectedCategory);

  const toggleInsightComplete = (id: string) => {
    let updated: string[];
    if (completedInsightIds.includes(id)) {
      updated = completedInsightIds.filter(item => item !== id);
    } else {
      updated = [...completedInsightIds, id];
      // Increment streak if first completion of the day
      if (completedInsightIds.length === 0) {
        const newStreak = streakCount + 1;
        setStreakCount(newStreak);
        try {
          localStorage.setItem(`wellness_streak_${patient.id}`, newStreak.toString());
        } catch {}
      }
      if (speak) speak('Great job! Wellness insight marked as completed today.');
    }
    setCompletedInsightIds(updated);
    try {
      localStorage.setItem(`completed_insights_${patient.id}`, JSON.stringify(updated));
    } catch {}
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setRandomSeed(prev => prev + 1);
    if (speak) speak('Refreshing custom daily wellness insights.');
    setTimeout(() => {
      setIsRefreshing(false);
    }, 400);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-5">
      {/* Header & Streak Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-amber-500/10 text-amber-600 rounded-xl flex items-center justify-center font-bold border border-amber-500/20 shadow-xs">
            <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">Daily Wellness Insights</h2>
              <span className="bg-teal-50 text-teal-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-teal-200/60 uppercase">
                AI Personal Protocol
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Personalized health guidance based on your profile, chronic conditions ({patient.conditions.join(', ')}), and {medicines.length} prescription(s).
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 self-start sm:self-auto">
          {/* Daily Streak Badge */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 px-3 py-1.5 rounded-xl flex items-center space-x-2 shadow-2xs">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-bounce" />
            <div>
              <span className="text-[10px] font-bold text-amber-900 uppercase block leading-none">Daily Streak</span>
              <span className="text-xs font-black text-amber-700 leading-tight">{streakCount} Days Active</span>
            </div>
          </div>

          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all border border-slate-200 flex items-center justify-center"
            title="Refresh Insights"
          >
            <RefreshCw className={`w-4 h-4 text-slate-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: `All Insights (${insights.length})`, icon: Lightbulb },
          { id: 'diet', label: 'Diet & Nutrition', icon: Apple },
          { id: 'medication', label: 'Medication Tips', icon: Pill },
          { id: 'lifestyle', label: 'Exercise & Routine', icon: HeartPulse },
          { id: 'vitals', label: 'Vitals Targets', icon: Activity }
        ].map(tab => {
          const Icon = tab.icon;
          const isActive = selectedCategory === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id as any)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/80 border border-slate-200/60'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-teal-400' : 'text-slate-500'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Insights Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredInsights.map(insight => {
          const isDone = completedInsightIds.includes(insight.id);

          return (
            <div
              key={insight.id}
              className={`rounded-2xl border p-4.5 transition-all flex flex-col justify-between space-y-3 relative ${
                isDone
                  ? 'bg-emerald-50/40 border-emerald-200/80 shadow-2xs'
                  : insight.importance === 'high'
                  ? 'bg-gradient-to-br from-white to-teal-50/30 border-teal-200/80 shadow-sm hover:border-teal-300'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div>
                {/* Header Tag & Category */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md border ${
                    insight.importance === 'high'
                      ? 'bg-teal-100 text-teal-800 border-teal-200'
                      : 'bg-slate-100 text-slate-700 border-slate-200'
                  }`}>
                    {insight.conditionOrMedTag}
                  </span>

                  <button
                    onClick={() => toggleInsightComplete(insight.id)}
                    className={`flex items-center space-x-1 text-xs font-bold px-2.5 py-1 rounded-lg transition-all ${
                      isDone
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-emerald-100 hover:text-emerald-800 border border-slate-200'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{isDone ? 'Completed Today ✓' : 'Mark Done'}</span>
                  </button>
                </div>

                {/* Title & Summary */}
                <h3 className={`text-sm font-bold tracking-tight ${isDone ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                  {insight.title}
                </h3>
                <p className="text-xs text-slate-600 font-medium mt-1 leading-relaxed">
                  {insight.summary}
                </p>

                {/* Details Callout */}
                <div className="mt-3 bg-slate-50 border border-slate-200/80 rounded-xl p-3 text-[11px] text-slate-700 leading-normal">
                  <p className="font-normal text-slate-600">{insight.details}</p>
                  <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-start space-x-1.5 text-teal-900 font-bold">
                    <span className="text-teal-600 font-black">👉 Action:</span>
                    <span>{insight.actionableStep}</span>
                  </div>
                </div>
              </div>

              {/* Bottom Quick Action: Ask Care AI */}
              <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-[11px]">
                <span className="text-slate-400 font-medium">CareFlow Clinical Guidance</span>
                <button
                  onClick={() => {
                    setActiveTab('ai-assistant');
                    if (speak) speak(`Opening Care AI to discuss ${insight.title}`);
                  }}
                  className="text-teal-700 font-bold hover:text-teal-900 flex items-center space-x-1 transition-colors"
                >
                  <MessageSquareHeart className="w-3.5 h-3.5 text-teal-600" />
                  <span>Ask AI Assistant</span>
                  <ChevronRight className="w-3 h-3 text-teal-600" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

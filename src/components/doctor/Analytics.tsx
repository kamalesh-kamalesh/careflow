import React from 'react';
import { useAppContext } from '../../context/AppContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { BarChart3, TrendingUp, Users, Clock, Award, ShieldCheck } from 'lucide-react';

export const Analytics: React.FC = () => {
  const { doctors, appointments, patients, medicines, getActiveDoctor } = useAppContext();
  const doctor = getActiveDoctor();

  // Weekly patient volume data
  const volumeData = [
    { day: 'Mon', visits: 18, avgWaitMins: 12 },
    { day: 'Tue', visits: 24, avgWaitMins: 15 },
    { day: 'Wed', visits: 20, avgWaitMins: 10 },
    { day: 'Thu', visits: 26, avgWaitMins: 18 },
    { day: 'Fri', visits: 22, avgWaitMins: 14 },
    { day: 'Sat', visits: 12, avgWaitMins: 8 }
  ];

  // Diagnoses breakdown data
  const diagnosisData = [
    { name: 'Hypertension', value: 42, color: '#0f172a' },
    { name: 'Type 2 Diabetes', value: 35, color: '#0d9488' },
    { name: 'COPD / Asthma', value: 24, color: '#14b8a6' },
    { name: 'Arrhythmia', value: 16, color: '#64748b' },
    { name: 'General Routine', value: 25, color: '#94a3b8' }
  ];

  // Adherence compliance data by medication
  const adherenceData = [
    { med: 'Lisinopril', rate: 92 },
    { med: 'Metformin', rate: 84 },
    { med: 'Warfarin', rate: 78 },
    { med: 'Spiriva', rate: 95 },
    { med: 'Albuterol', rate: 100 }
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Clinical Analytics & Performance</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time patient throughput, queue wait benchmarks, & medication adherence insights.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold bg-slate-900 text-white px-3.5 py-2 rounded-xl shadow-xs">
          <Award className="w-4 h-4 text-teal-400" />
          <span>Clinic Rating: 4.9 ★ (Top 5%)</span>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase block">Weekly Patients</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">122</p>
          <span className="text-[10px] text-teal-600 font-bold mt-1 block uppercase">↑ +8.5% vs last week</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase block">Avg Queue Wait</span>
          <p className="text-2xl font-extrabold text-teal-700 mt-1">13.2 Mins</p>
          <span className="text-[10px] text-slate-700 font-semibold mt-1 block uppercase">✓ 18% under SLA</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase block">Adherence Rate</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">89.4%</p>
          <span className="text-[10px] text-slate-500 font-semibold mt-1 block uppercase">High compliance</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase block">Prescription Refills</span>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">48 Refills</p>
          <span className="text-[10px] text-teal-600 font-bold mt-1 block uppercase">100% Digital</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Daily Patient Volume */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Daily Patient Volume & Avg Wait</h3>
              <p className="text-xs text-slate-500">Consultation volume vs queue wait mins</p>
            </div>
            <BarChart3 className="w-5 h-5 text-teal-600" />
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={volumeData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.4} />
                <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip />
                <Bar dataKey="visits" fill="#0f172a" radius={[6, 6, 0, 0]} name="Patients Consulted" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Common Diagnoses Pie */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Patient Diagnoses Distribution</h3>
              <p className="text-xs text-slate-500">Breakdown across care specialties</p>
            </div>
            <TrendingUp className="w-5 h-5 text-teal-600" />
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={diagnosisData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  {diagnosisData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px', color: '#475569' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Medication Adherence Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Medication Compliance Rate by Prescription</h3>
              <p className="text-xs text-slate-500">Patient 7-day adherence tracking</p>
            </div>
            <ShieldCheck className="w-5 h-5 text-teal-600" />
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={adherenceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" strokeOpacity={0.4} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis type="category" dataKey="med" tick={{ fontSize: 11, fill: '#64748b' }} width={100} />
                <Tooltip />
                <Bar dataKey="rate" fill="#0d9488" radius={[0, 6, 6, 0]} name="Compliance %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

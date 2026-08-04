import React, { useState } from 'react';
import { useAppContext } from '../../context/AppContext';
import { HealthAlert } from '../../types';
import {
  Bell,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  PhoneCall,
  Check,
  Filter
} from 'lucide-react';

export const CaregiverAlerts: React.FC = () => {
  const { alerts, resolveAlert, speak } = useAppContext();
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [showResolved, setShowResolved] = useState<boolean>(false);

  const filteredAlerts = alerts.filter(a => {
    if (!showResolved && a.resolved) return false;
    if (filterSeverity === 'all') return true;
    return a.severity === filterSeverity;
  });

  const getSeverityBadge = (severity: HealthAlert['severity']) => {
    switch (severity) {
      case 'critical':
        return <span className="bg-rose-100 text-rose-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">CRITICAL</span>;
      case 'high':
        return <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full">HIGH SEVERITY</span>;
      case 'medium':
        return <span className="bg-slate-100 text-slate-700 text-[10px] font-semibold px-2.5 py-0.5 rounded-full">MEDIUM</span>;
      case 'low':
        return <span className="bg-slate-50 text-slate-600 border border-slate-200 text-[10px] font-medium px-2 py-0.5 rounded-full">INFO</span>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Real-Time Health & Medication Alerts</h1>
          <p className="text-xs text-slate-500 mt-0.5">Automated alert feed for missed doses, abnormal vitals, & refill requests.</p>
        </div>

        <div className="flex items-center space-x-3 overflow-x-auto scrollbar-none">
          <label className="flex items-center space-x-2 text-xs font-semibold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={showResolved}
              onChange={e => setShowResolved(e.target.checked)}
              className="rounded border-slate-300 text-teal-600 focus:ring-teal-500"
            />
            <span>Show Resolved</span>
          </label>

          <select
            value={filterSeverity}
            onChange={e => setFilterSeverity(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Info / Low</option>
          </select>
        </div>
      </div>

      {/* Alert Feed List */}
      <div className="space-y-4">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map(alt => (
            <div
              key={alt.id}
              className={`p-5 border rounded-2xl transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs ${
                alt.resolved
                  ? 'opacity-60 bg-slate-50/80 border-slate-200'
                  : alt.severity === 'high' || alt.severity === 'critical'
                  ? 'bg-white border-rose-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex items-start space-x-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                    alt.resolved
                      ? 'bg-slate-100 text-slate-500'
                      : alt.severity === 'high' || alt.severity === 'critical'
                      ? 'bg-rose-50 text-rose-600 border border-rose-100'
                      : 'bg-slate-900 text-white'
                  }`}
                >
                  <AlertTriangle className="w-5 h-5" />
                </div>

                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-sm text-slate-900">{alt.title}</h3>
                    {getSeverityBadge(alt.severity)}
                  </div>

                  <p className="text-xs text-rose-700 font-semibold mt-0.5">
                    Patient: {alt.patientName} • {alt.timestamp}
                  </p>

                  <p className="text-xs text-slate-700 mt-1.5 leading-relaxed font-medium">{alt.description}</p>

                  {alt.resolved && alt.actionTaken && (
                    <p className="text-xs text-slate-600 font-medium mt-2 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      ✓ Resolved: {alt.actionTaken}
                    </p>
                  )}
                </div>
              </div>

              {/* Resolution Buttons */}
              {!alt.resolved && (
                <div className="flex items-center space-x-2 self-end sm:self-auto flex-shrink-0">
                  <a
                    href="tel:+15552345678"
                    className="text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 px-3.5 py-2 border border-slate-200 rounded-xl flex items-center space-x-1.5 transition-colors shadow-xs"
                  >
                    <PhoneCall className="w-3 h-3.5" />
                    <span>Call</span>
                  </a>

                  <button
                    onClick={() => {
                      resolveAlert(alt.id, 'Acknowledged & Contacted Patient by Caregiver');
                      speak(`Alert resolved for ${alt.patientName}`);
                    }}
                    className="text-xs font-bold bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl transition-all shadow-md shadow-teal-600/20 flex items-center space-x-1.5 tracking-wide"
                  >
                    <Check className="w-4 h-4" />
                    <span>Acknowledge</span>
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center shadow-xs">
            <CheckCircle2 className="w-10 h-10 text-teal-600 mx-auto mb-2" />
            <h3 className="font-bold text-sm text-slate-900">No Active Alerts</h3>
            <p className="text-xs text-slate-500 mt-1">All patient vital signs and medication compliance are up to date.</p>
          </div>
        )}
      </div>
    </div>
  );
};

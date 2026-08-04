import React from 'react';
import { Wifi, WifiOff, RefreshCw, Database, ShieldCheck, Cpu, HardDrive } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

export const OfflineStatusBanner: React.FC = () => {
  const {
    isOffline,
    simulatedOffline,
    setSimulatedOffline,
    lastCacheSyncedAt,
    pendingOfflineQueue,
    syncOfflineQueue,
    clearAndResetCache
  } = useAppContext();

  const isActuallyOffline = isOffline || simulatedOffline;

  return (
    <div className="bg-slate-900 text-white rounded-xl p-3 shadow-sm border border-slate-800 text-xs mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left Status Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Online/Offline Status Indicator */}
          <div
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-md font-bold text-[11px] ${
              isActuallyOffline ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
            }`}
          >
            {isActuallyOffline ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
            <span>{isActuallyOffline ? 'Offline Cache Mode' : 'Online (Live Sync Active)'}</span>
          </div>

          {/* Service Worker Status */}
          <div className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 border border-slate-700/80 rounded-md text-[10px] font-medium text-slate-300">
            <ShieldCheck className="w-3 h-3 text-emerald-400" />
            <span>Service Worker Caching</span>
          </div>

          {/* Last Synced Timestamp */}
          <div className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 border border-slate-700/80 rounded-md text-[10px] text-slate-300">
            <HardDrive className="w-3 h-3 text-teal-400" />
            <span>Cached: {lastCacheSyncedAt ? new Date(lastCacheSyncedAt).toLocaleTimeString() : 'Just now'}</span>
          </div>

          {/* Pending Queue Count */}
          {pendingOfflineQueue.length > 0 && (
            <div className="flex items-center space-x-1 px-2.5 py-1 bg-amber-500 text-slate-950 font-bold text-[10px] rounded-md">
              <span>{pendingOfflineQueue.length} Queued Action(s)</span>
            </div>
          )}
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center space-x-2 self-end sm:self-auto">
          {/* Manual Queue Sync Button */}
          {pendingOfflineQueue.length > 0 && !isActuallyOffline && (
            <button
              onClick={syncOfflineQueue}
              className="bg-teal-500 hover:bg-teal-600 text-slate-950 font-bold text-[10px] px-2.5 py-1 rounded-md transition-colors flex items-center space-x-1 shadow-xs"
            >
              <RefreshCw className="w-3 h-3 animate-spin" />
              <span>Sync {pendingOfflineQueue.length} Actions</span>
            </button>
          )}

          {/* Simulate Offline Toggle */}
          <button
            onClick={() => setSimulatedOffline(!simulatedOffline)}
            className={`px-2.5 py-1 font-semibold text-[10px] rounded-md border transition-all ${
              simulatedOffline
                ? 'bg-amber-400 text-slate-950 border-amber-500 font-bold'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
          >
            {simulatedOffline ? 'Disable Offline Test' : 'Test Offline Mode'}
          </button>

          {/* Reset Cache */}
          <button
            onClick={clearAndResetCache}
            title="Reset local storage cache to initial seeds"
            className="p-1.5 text-slate-400 hover:text-white transition-colors rounded-md hover:bg-slate-800"
          >
            <Database className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {isActuallyOffline && (
        <div className="mt-2 pt-2 border-t border-slate-800 text-[11px] text-slate-300 flex items-center justify-between">
          <p>
            ⚡ Essential patient records, active prescriptions & appointments are cached locally. Actions taken offline will auto-sync when network reconnects.
          </p>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff, Sparkles } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2.5 rounded-2xl bg-amber-500/95 backdrop-blur-md px-3.5 py-2 text-xs font-bold text-white shadow-lg border border-amber-300 animate-bounce">
      <WifiOff className="w-4 h-4 text-amber-100" />
      <div>
        <span>Mode Offline Aktif</span>
        <span className="hidden sm:inline font-normal text-amber-100 ml-1.5">— Game, suara & data tersimpan di HP!</span>
      </div>
      <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
    </div>
  );
};

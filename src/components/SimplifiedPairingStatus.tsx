import { useEffect } from 'react';
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useSimplifiedWinePairing } from '@/hooks/useSimplifiedWinePairing';

// Simple status indicator component with clear error boundaries
export const SimplifiedPairingStatus = () => {
  const { pairingState, checkPairingReadiness } = useSimplifiedWinePairing();

  useEffect(() => {
    // Check readiness on mount and periodically
    checkPairingReadiness();
    
    const interval = setInterval(checkPairingReadiness, 2000);
    return () => clearInterval(interval);
  }, [checkPairingReadiness]);

  const getStatusColor = () => {
    if (pairingState.isReady) return 'text-green-600';
    if (pairingState.hasDishes && !pairingState.hasWines) return 'text-yellow-600';
    return 'text-gray-400';
  };

  const getStatusIcon = () => {
    if (pairingState.isReady) return <CheckCircle className="w-4 h-4" />;
    if (pairingState.hasDishes && !pairingState.hasWines) return <Loader2 className="w-4 h-4 animate-spin" />;
    return <AlertCircle className="w-4 h-4" />;
  };

  const getStatusText = () => {
    if (pairingState.isReady) {
      return `Ready for pairing (${pairingState.dishCount} dishes, ${pairingState.wineCount} wines)`;
    }
    if (pairingState.hasDishes && !pairingState.hasWines) {
      return `Menu processed (${pairingState.dishCount} dishes) - Processing wine list...`;
    }
    if (!pairingState.hasDishes && !pairingState.hasWines) {
      return 'Waiting for menu and wine list upload';
    }
    if (!pairingState.hasDishes && pairingState.hasWines) {
      return `Wine list ready (${pairingState.wineCount} wines) - Waiting for menu`;
    }
    return 'Processing...';
  };

  return (
    <div className={`flex items-center gap-2 text-sm ${getStatusColor()}`}>
      {getStatusIcon()}
      <span>{getStatusText()}</span>
    </div>
  );
};
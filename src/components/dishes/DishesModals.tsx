
import React from 'react';
import NoMenuDataModal from '@/components/NoMenuDataModal';
import UnifiedProcessingModal from '@/components/UnifiedProcessingModal';
import UpgradePrompt from '@/components/subscription/UpgradePrompt';
import { UsageStats } from '@/types/dishes';

interface DishesModalsProps {
  showNoDataModal: boolean;
  onCloseNoDataModal: () => void;
  restaurantName: string;
  showWinePairingModal: boolean;
  wineProcessingProgress: number;
  showUpgradePrompt: boolean;
  onCloseUpgradePrompt: () => void;
  usageStats: UsageStats;
}

export const DishesModals = ({
  showNoDataModal,
  onCloseNoDataModal,
  restaurantName,
  showWinePairingModal,
  wineProcessingProgress,
  showUpgradePrompt,
  onCloseUpgradePrompt,
  usageStats
}: DishesModalsProps) => {
  const handleWinePairingClose = () => {
    // Reset states without reloading
    console.log('Wine pairing modal cancelled by user');
    // Allow the modal to close naturally without forcing reload
  };

  return (
    <>
      {/* No Session Data Modal */}
      <NoMenuDataModal
        isOpen={showNoDataModal}
        onClose={onCloseNoDataModal}
        restaurantName={restaurantName}
      />

      {/* Wine Processing Modal */}
      <UnifiedProcessingModal
        isOpen={showWinePairingModal}
        onClose={handleWinePairingClose}
        currentStep="wine-pairing"
        progress={wineProcessingProgress}
        showTips={true}
      />

      {/* Upgrade Prompt */}
      <UpgradePrompt
        isOpen={showUpgradePrompt}
        onClose={onCloseUpgradePrompt}
        currentTier={usageStats.subscriptionTier}
        pairingsUsed={usageStats.pairingsUsed}
        pairingsLimit={usageStats.pairingsLimit}
      />
    </>
  );
};

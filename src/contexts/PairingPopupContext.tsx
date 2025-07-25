
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface PairingPopupContextType {
  isVisible: boolean;
  showPopup: () => void;
  hidePopup: () => void;
}

const PairingPopupContext = createContext<PairingPopupContextType | undefined>(undefined);

export const usePairingPopup = () => {
  const context = useContext(PairingPopupContext);
  if (!context) {
    throw new Error('usePairingPopup must be used within a PairingPopupProvider');
  }
  return context;
};

interface PairingPopupProviderProps {
  children: ReactNode;
}

export const PairingPopupProvider = ({ children }: PairingPopupProviderProps) => {
  const [isVisible, setIsVisible] = useState(false);

  const showPopup = () => setIsVisible(true);
  const hidePopup = () => setIsVisible(false);

  return (
    <PairingPopupContext.Provider value={{ isVisible, showPopup, hidePopup }}>
      {children}
    </PairingPopupContext.Provider>
  );
};

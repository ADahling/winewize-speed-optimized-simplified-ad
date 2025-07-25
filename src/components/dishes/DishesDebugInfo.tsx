import { useEffect } from 'react';
import { MenuItem, SessionResults, SessionRestaurant } from '@/types/dishes';

interface DishesDebugInfoProps {
  isImportFlow: boolean;
  hasValidSession: boolean;
  menuItems: MenuItem[];
  sessionRestaurant: SessionRestaurant | null;
  sessionResults: SessionResults | null;
}

export const DishesDebugInfo = ({
  isImportFlow,
  hasValidSession,
  menuItems,
  sessionRestaurant,
  sessionResults
}: DishesDebugInfoProps) => {
  // Simple wine processing monitor
  useEffect(() => {
    // Monitor wine processing completion via toast notifications
    const checkWineProcessing = () => {
      try {
        const results = JSON.parse(sessionStorage.getItem('currentSessionResults') || 'null');
        if (results?.wines?.length > 0) {
          // Ensure wines are available in all storage locations
          sessionStorage.setItem('sessionWines', JSON.stringify(results.wines));
          localStorage.setItem('wineBackup', JSON.stringify(results.wines));
        }
      } catch (e) {}
    };

    checkWineProcessing();
  }, []);

  // Flow state monitoring (production-ready)
  useEffect(() => {
    // Silent monitoring for error tracking only
    if (menuItems.length === 0 && sessionResults) {
      console.warn('Menu items missing despite session results');
    }
  }, [isImportFlow, hasValidSession, menuItems.length, sessionRestaurant, sessionResults]);

  return null; // This component only handles side effects
};
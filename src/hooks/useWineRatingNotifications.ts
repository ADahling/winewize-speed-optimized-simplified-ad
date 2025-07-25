
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface RatingReminder {
  id: string;
  wine_library_id: string;
  scheduled_for: string;
  sent: boolean;
  created_at: string;
  user_id: string;
  // Wine details from joined table
  wine_name?: string;
  dish_paired_with?: string;
  wine_description?: string;
  wine_style?: string;
  wine_rating?: number | null;
}

export const useWineRatingNotifications = (userId?: string) => {
  const { user } = useAuth();
  const [reminders, setReminders] = useState<RatingReminder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const effectiveUserId = userId || user?.id;

  useEffect(() => {
    if (effectiveUserId) {
      fetchReminders();
    }
  }, [effectiveUserId]);

  const fetchReminders = async () => {
    if (!effectiveUserId) return;

    setIsLoading(true);
    try {
      // Fetch reminders with wine library data joined
      const { data, error } = await supabase
        .from('wine_rating_reminders')
        .select(`
          *,
          user_wine_library:wine_library_id (
            wine_name,
            dish_paired_with,
            wine_description,
            wine_style,
            rating
          )
        `)
        .eq('user_id', effectiveUserId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching reminders:', error);
        return;
      }

      if (data) {
        const processedReminders: RatingReminder[] = data.map(reminder => ({
          id: reminder.id,
          wine_library_id: reminder.wine_library_id,
          scheduled_for: reminder.scheduled_for,
          sent: reminder.sent || false,
          created_at: reminder.created_at,
          user_id: reminder.user_id,
          // Extract wine details from joined table
          wine_name: reminder.user_wine_library?.wine_name || 'Unknown Wine',
          dish_paired_with: reminder.user_wine_library?.dish_paired_with || 'Unknown Dish',
          wine_description: reminder.user_wine_library?.wine_description || '',
          wine_style: reminder.user_wine_library?.wine_style || '',
          wine_rating: reminder.user_wine_library?.rating || null
        }));

        setReminders(processedReminders);
      }
    } catch (error) {
      console.error('Error in fetchReminders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const markReminderAsSent = async (reminderId: string) => {
    try {
      const { error } = await supabase
        .from('wine_rating_reminders')
        .update({ sent: true })
        .eq('id', reminderId);

      if (error) {
        console.error('Error marking reminder as sent:', error);
        return;
      }

      await fetchReminders();
    } catch (error) {
      console.error('Error in markReminderAsSent:', error);
    }
  };

  const deleteReminder = async (reminderId: string) => {
    try {
      const { error } = await supabase
        .from('wine_rating_reminders')
        .delete()
        .eq('id', reminderId);

      if (error) {
        console.error('Error deleting reminder:', error);
        return;
      }

      await fetchReminders();
    } catch (error) {
      console.error('Error in deleteReminder:', error);
    }
  };

  const createReminder = async (wineLibraryId: string, reminderDate: Date) => {
    if (!effectiveUserId) return;

    try {
      const { error } = await supabase
        .from('wine_rating_reminders')
        .insert({
          user_id: effectiveUserId,
          wine_library_id: wineLibraryId,
          scheduled_for: reminderDate.toISOString(),
          sent: false
        });

      if (error) {
        console.error('Error creating reminder:', error);
        return;
      }

      await fetchReminders();
    } catch (error) {
      console.error('Error in createReminder:', error);
    }
  };

  // Calculate pending reminders - wines that are NOT rated AND scheduled for now or past AND not marked as sent
  const pendingReminders = reminders.filter(reminder => 
    !reminder.sent && 
    reminder.wine_rating === null &&
    reminder.scheduled_for && 
    new Date(reminder.scheduled_for) <= new Date()
  );

  return {
    reminders,
    pendingReminders,
    isLoading,
    fetchReminders,
    markReminderAsSent,
    deleteReminder,
    createReminder,
    refetch: fetchReminders
  };
};

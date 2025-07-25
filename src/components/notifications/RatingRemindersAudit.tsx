
import React, { useState } from 'react';
import { Calendar, Clock, Wine, CheckCircle, XCircle, Trash2, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useWineRatingNotifications } from '@/hooks/useWineRatingNotifications';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import WineRatingModal from '@/components/modals/WineRatingModal';

const RatingRemindersAudit: React.FC = () => {
  const { user } = useAuth();
  const { 
    reminders, 
    pendingReminders, 
    isLoading, 
    markReminderAsSent, 
    deleteReminder,
    refetch
  } = useWineRatingNotifications(user?.id);
  
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [selectedReminder, setSelectedReminder] = useState<any>(null);
  const { toast } = useToast();

  const handleRateWine = (reminder: any) => {
    setSelectedReminder(reminder);
    setRatingModalOpen(true);
  };

  const handleRatingSubmit = async (rating: number, notes?: string) => {
    if (!selectedReminder || !user) return;

    try {
      // Update the wine library with the rating
      const { error: updateError } = await supabase
        .from('user_wine_library')
        .update({ rating })
        .eq('id', selectedReminder.wine_library_id);

      if (updateError) throw updateError;

      // Track the rating interaction
      await supabase
        .from('wine_interactions')
        .insert({
          user_id: user.id,
          interaction_type: 'rate',
          wine_name: selectedReminder.wine_name || 'Unknown Wine',
          wine_style: selectedReminder.wine_style || '',
          dish_name: selectedReminder.dish_paired_with || null,
          rating
        });

      // Mark the reminder as sent
      await markReminderAsSent(selectedReminder.id);

      toast({
        title: "Wine rated successfully!",
        description: `You rated ${selectedReminder.wine_name || 'the wine'} ${rating} star${rating !== 1 ? 's' : ''}`,
      });

      // Refresh the data
      await refetch();

    } catch (error) {
      console.error('Error saving wine rating:', error);
      toast({
        title: "Error",
        description: "Failed to save wine rating",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
        <div className="text-center">
          <p className="text-slate-600">Loading rating reminders...</p>
        </div>
      </div>
    );
  }

  // Filter reminders for "All Reminders" section - only show reminders that are either sent OR have ratings
  const completedReminders = reminders.filter(reminder => 
    reminder.sent || (reminder as any).wine_rating !== null
  );

  return (
    <>
      <div className="bg-white rounded-2xl p-6 shadow-lg border border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Wine Rating Reminders
          </h3>
          <Badge variant="outline" className="bg-purple-50 text-purple-700">
            {pendingReminders.length} pending
          </Badge>
        </div>

        {reminders.length === 0 ? (
          <div className="text-center text-slate-500 py-8">
            <Wine className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No rating reminders found</p>
            <p className="text-sm mt-2">Wine rating reminders will appear here when you add wines to your library</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Pending Reminders - Only unrated wines */}
            {pendingReminders.length > 0 && (
              <div className="mb-6">
                <h4 className="text-md font-medium text-slate-700 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Ready to Rate ({pendingReminders.length})
                </h4>
                <div className="space-y-3">
                  {pendingReminders.map((reminder) => (
                    <div key={reminder.id} className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-slate-800">{reminder.wine_name || 'Unknown Wine'}</p>
                          <p className="text-sm text-slate-600">Paired with: {reminder.dish_paired_with || 'Unknown Dish'}</p>
                          <p className="text-sm text-amber-700">
                            Scheduled: {format(new Date(reminder.scheduled_for), 'MMM dd, yyyy')}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleRateWine(reminder)}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                          >
                            <Star className="w-4 h-4 mr-1" />
                            Rate Wine
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => markReminderAsSent(reminder.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteReminder(reminder.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Reminders - Only show completed ones */}
            {completedReminders.length > 0 && (
              <div>
                <h4 className="text-md font-medium text-slate-700 mb-3">Completed Reminders</h4>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {completedReminders.map((reminder) => (
                    <div key={reminder.id} className="p-4 bg-slate-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium text-slate-800">{reminder.wine_name || 'Unknown Wine'}</p>
                          <p className="text-sm text-slate-600">Paired with: {reminder.dish_paired_with || 'Unknown Dish'}</p>
                          <p className="text-sm text-slate-500">
                            Scheduled: {format(new Date(reminder.scheduled_for), 'MMM dd, yyyy')}
                          </p>
                          {(reminder as any).wine_rating && (
                            <p className="text-sm text-green-700">
                              Rated: {(reminder as any).wine_rating} star{(reminder as any).wine_rating !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteReminder(reminder.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Wine Rating Modal */}
      {selectedReminder && (
        <WineRatingModal
          isOpen={ratingModalOpen}
          onClose={() => setRatingModalOpen(false)}
          onSubmit={handleRatingSubmit}
          wineName={selectedReminder.wine_name || 'Unknown Wine'}
          dishPairedWith={selectedReminder.dish_paired_with || 'Unknown Dish'}
        />
      )}
    </>
  );
};

export default RatingRemindersAudit;

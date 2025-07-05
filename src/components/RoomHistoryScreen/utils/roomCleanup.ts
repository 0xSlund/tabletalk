import { supabase } from '../../../lib/supabase';
import { isRoomOlderThan90Days } from '../utils';

/**
 * Automatically deletes expired rooms that are older than 90 days
 * unless they are specifically archived by the user
 */
export const cleanupOldExpiredRooms = async (userId: string): Promise<number> => {
  try {
    // Get all rooms for the user that are expired and older than 90 days
    const { data: userRooms, error: roomsError } = await supabase
      .from('room_participants')
      .select(`
        room_id,
        rooms (
          id,
          created_at,
          expires_at,
          is_archived
        )
      `)
      .eq('profile_id', userId);

    if (roomsError) {
      console.error('Error fetching user rooms for cleanup:', roomsError);
      return 0;
    }

    if (!userRooms || userRooms.length === 0) {
      return 0;
    }

    // Filter rooms that should be deleted
    const roomsToDelete = userRooms.filter(item => {
      const room = item.rooms;
      if (!room) return false;

      const isExpired = new Date(room.expires_at) < new Date();
      const isOld = isRoomOlderThan90Days(room.created_at);
      const isArchived = room.is_archived || false;

      // Delete if expired, old, and not archived
      return isExpired && isOld && !isArchived;
    });

    if (roomsToDelete.length === 0) {
      return 0;
    }

    const roomIds = roomsToDelete.map(item => item.room_id);

    // Delete room participants first (due to foreign key constraints)
    const { error: participantsError } = await supabase
      .from('room_participants')
      .delete()
      .in('room_id', roomIds);

    if (participantsError) {
      console.error('Error deleting room participants during cleanup:', participantsError);
      return 0;
    }

    // Delete food suggestions
    const { error: suggestionsError } = await supabase
      .from('food_suggestions')
      .delete()
      .in('room_id', roomIds);

    if (suggestionsError) {
      console.error('Error deleting food suggestions during cleanup:', suggestionsError);
      // Continue anyway, suggestions are not critical
    }

    // Delete voting results
    const { error: votingError } = await supabase
      .from('voting_results')
      .delete()
      .in('room_id', roomIds);

    if (votingError) {
      console.error('Error deleting voting results during cleanup:', votingError);
      // Continue anyway, voting results are not critical
    }

    // Delete messages
    const { error: messagesError } = await supabase
      .from('messages')
      .delete()
      .in('room_id', roomIds);

    if (messagesError) {
      console.error('Error deleting messages during cleanup:', messagesError);
      // Continue anyway, messages are not critical
    }

    // Finally delete the rooms themselves
    const { error: roomsDeleteError } = await supabase
      .from('rooms')
      .delete()
      .in('id', roomIds);

    if (roomsDeleteError) {
      console.error('Error deleting rooms during cleanup:', roomsDeleteError);
      return 0;
    }

    console.log(`Successfully cleaned up ${roomsToDelete.length} old expired rooms`);
    return roomsToDelete.length;
  } catch (error) {
    console.error('Unexpected error during room cleanup:', error);
    return 0;
  }
};

/**
 * Archives a room to prevent it from being auto-deleted
 */
export const archiveRoom = async (roomId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('rooms')
      .update({ is_archived: true })
      .eq('id', roomId);

    if (error) {
      console.error('Error archiving room:', error);
      return false;
    }

    console.log(`Successfully archived room ${roomId}`);
    return true;
  } catch (error) {
    console.error('Unexpected error archiving room:', error);
    return false;
  }
};

/**
 * Unarchives a room
 */
export const unarchiveRoom = async (roomId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('rooms')
      .update({ is_archived: false })
      .eq('id', roomId);

    if (error) {
      console.error('Error unarchiving room:', error);
      return false;
    }

    console.log(`Successfully unarchived room ${roomId}`);
    return true;
  } catch (error) {
    console.error('Unexpected error unarchiving room:', error);
    return false;
  }
}; 
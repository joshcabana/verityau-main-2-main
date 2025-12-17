/**
 * Example usage of the notification system
 * 
 * This file demonstrates how to trigger different types of notifications
 * throughout the app. Copy these examples into your code where appropriate.
 */

import { createNotification } from "@/utils/notifications";

// Example 1: Trigger a like notification when someone likes your profile
export async function onProfileLiked(likedUserId: string) {
  await createNotification({
    userId: likedUserId,
    type: "like",
    title: "Someone liked you! 💕",
    message: "You have a new like. Check out who's interested!",
  });
}

// Example 2: Trigger a match notification when mutual like occurs
export async function onMatchCreated(user1Id: string, user2Id: string, matchId: string) {
  // Notify both users
  await Promise.all([
    createNotification({
      userId: user1Id,
      type: "match",
      title: "🎉 It's a Match!",
      message: "You and your match both liked each other. Start chatting now!",
      relatedId: matchId,
    }),
    createNotification({
      userId: user2Id,
      type: "match",
      title: "🎉 It's a Match!",
      message: "You and your match both liked each other. Start chatting now!",
      relatedId: matchId,
    }),
  ]);
}

// Example 3: Trigger a Verity Date request notification
export async function onVerityDateRequested(recipientId: string, requesterId: string, requesterName: string, verityDateId: string) {
  await createNotification({
    userId: recipientId,
    type: "verity_date_request",
    title: "📅 Verity Date Request",
    message: `${requesterName} wants to schedule a Verity Date with you!`,
    relatedId: verityDateId,
  });
  
  // Email will be automatically sent (currently console.log stub)
}

// Example 4: Trigger a Verity Date acceptance notification
export async function onVerityDateAccepted(requesterId: string, accepterName: string, verityDateId: string) {
  await createNotification({
    userId: requesterId,
    type: "verity_date_accepted",
    title: "✅ Verity Date Accepted!",
    message: `${accepterName} accepted your Verity Date request. Get ready!`,
    relatedId: verityDateId,
  });
  
  // Email will be automatically sent (currently console.log stub)
}

// Example 5: Trigger a new message notification
export async function onNewMessage(recipientId: string, senderName: string, matchId: string) {
  await createNotification({
    userId: recipientId,
    type: "message",
    title: `💬 New message from ${senderName}`,
    message: "Tap to view and reply",
    relatedId: matchId,
  });
  
  // Push notification will be automatically sent if enabled
}

/**
 * Integration Points:
 * 
 * 1. In /src/utils/matchmaking.ts - likeProfile() function:
 *    - Add onProfileLiked(targetUserId) when like is created
 *    - Add onMatchCreated(userId, targetUserId, matchId) when mutual match occurs
 * 
 * 2. In Verity Date acceptance handler:
 *    - Add onVerityDateRequested() when date is requested
 *    - Add onVerityDateAccepted() when date is accepted
 * 
 * 3. In chat message handler:
 *    - Add onNewMessage() when new chat message is sent
 */

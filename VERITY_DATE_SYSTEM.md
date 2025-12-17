# Verity Date Video Call System

## Overview
The Verity Date system enables users to have 10-minute video calls when they mutually like each other, using Daily.co for video infrastructure.

## Architecture

### Database Tables
- **likes**: Stores user likes (from_user → to_user)
- **matches**: Created when users mutually like each other
- **verity_dates**: Tracks video call sessions linked to matches

### Edge Functions
- **create-daily-room**: Creates Daily.co video rooms with specific settings

### Components
- **VerityDateNotification**: Shows pending date requests as floating notifications
- **VerityDateWaiting**: Waiting room before video call starts
- **VerityDateCall**: Video call interface with Daily.co iframe
- **VerityDateFeedback**: Post-call feedback collection

### Utilities
- **verityDateHelpers.ts**: Helper functions for creating and managing Verity Dates
- **likeHandler.example.ts**: Example implementation for like functionality

## User Flow

### 1. Mutual Like Detection
```typescript
// When User A likes User B
await supabase.from("likes").insert({
  from_user: userA_id,
  to_user: userB_id,
});

// Check if User B already liked User A
const verityDateRequest = await checkAndCreateVerityDate(userA_id, userB_id);

if (verityDateRequest) {
  // It's a match! verity_date record created
  // VerityDateNotification component automatically shows notification
}
```

### 2. Starting a Verity Date
- User clicks "Start Verity Date" in notification
- Redirected to `/verity-date/waiting?id={verityDateId}`
- Waiting room loads, shows countdown (60s)
- Edge function `create-daily-room` is called
- Daily.co room created with settings:
  - 10-minute expiration
  - Recording disabled
  - Screen sharing disabled
  - Chat disabled
  - Max 2 participants

### 3. Video Call
- Both users redirected to `/verity-date/call?id={verityDateId}`
- Daily.co iframe loads with room URL
- Timer shows 10:00 countdown
- Random icebreaker prompt displayed as overlay
- Decorative UI elements (heart icons, coral accents)

### 4. Call Ends
- After 10 minutes, both users auto-redirected to feedback screen
- Route: `/verity-date/feedback?id={verityDateId}`

### 5. Feedback Collection
Users select one of three options:
- **Yes! 💕** - "I felt a real connection"
- **Maybe later** - "Not sure yet, want to think about it"
- **No connection** - "Didn't feel the spark"

### 6. Match Decision Logic
```typescript
// Both users submit feedback
if (user1_feedback === "yes" && user2_feedback === "yes") {
  // It's a match! Update match record
  await supabase.from("matches")
    .update({ both_interested: true })
    .eq("id", matchId);
  
  // Show celebration (confetti)
  // Unlock chat feature
  // Redirect to /matches
} else {
  // No match
  // Show polite message
  // Redirect to /main
}
```

## Daily.co Configuration

### Room Settings
```javascript
{
  properties: {
    exp: Math.floor(Date.now() / 1000) + 600, // 10 minutes
    enable_recording: false,
    enable_screenshare: false,
    enable_chat: false,
    enable_knocking: false,
    enable_prejoin_ui: true,
    max_participants: 2,
    eject_at_room_exp: true,
  }
}
```

## Secrets Required
- **DAILY_API_KEY**: Daily.co API key for creating rooms

## Integration Guide

### Adding Like Functionality
See `src/utils/likeHandler.example.ts` for complete example.

```typescript
import { handleLikeUser } from "@/utils/likeHandler.example";

// In your profile/match component
<Button onClick={() => handleLikeUser(profileUserId)}>
  <Heart /> Like
</Button>
```

### Monitoring Pending Dates
```typescript
import { getPendingVerityDates } from "@/utils/verityDateHelpers";

const dates = await getPendingVerityDates(currentUserId);
// Returns array of pending verity dates for this user
```

## Icebreaker Prompts
20 warm conversation starters are randomly selected and displayed during calls:
- "What's the best adventure you've been on recently?"
- "If you could have dinner with anyone, living or historical, who would it be?"
- "What's something that always makes you smile?"
- [17 more prompts...]

## UI/UX Details

### Design Elements
- **Colors**: Coral/pink primary, warm secondary tones
- **Icons**: Hearts, sparkles, video camera
- **Animations**: Pulse, fade-in, confetti on match
- **Gradients**: Subtle background gradients throughout

### Responsive Behavior
- Mobile-first design
- Floating notifications stack on small screens
- Full-screen video interface on all devices

## Security Considerations

### RLS Policies
- Users can only access their own verity_dates
- Room URLs are private, only visible to matched users
- Feedback is private until both users submit

### Room Expiration
- Rooms automatically expire after 10 minutes
- Users ejected at expiration
- No recording to protect privacy

## Future Enhancements
- [ ] Add chat unlock after successful match
- [ ] Enable rescheduling for "maybe later" responses
- [ ] Add video quality selection
- [ ] Implement report/block during calls
- [ ] Add call quality feedback
- [ ] Support for audio-only calls

## Testing Checklist
- [ ] Mutual like triggers Verity Date creation
- [ ] Notification appears for both users
- [ ] Waiting room countdown works
- [ ] Daily.co room created successfully
- [ ] Video call loads and displays correctly
- [ ] Timer counts down from 10:00
- [ ] Icebreaker prompt displays
- [ ] Auto-redirect to feedback after 10 minutes
- [ ] Feedback submission updates database
- [ ] Match created when both say "yes"
- [ ] Confetti shows on successful match
- [ ] Proper redirect after feedback
- [ ] "Parted ways" message for no match

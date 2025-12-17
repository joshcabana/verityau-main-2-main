# Verity - AI-Facilitated Video Dating

## Project Info

**Live URL**: https://getverity.com.au
**Built with**: React, TypeScript, Supabase (in Canberra, Australia)

## About Verity

Verity is a revolutionary dating app that prioritizes authentic connections through AI-facilitated 10-minute video dates before unlocking chat. No endless swiping, no ghosting - just real conversations with real people.

## Local Development

Clone the repository and start developing:

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

```sh
# Clone the repository
git clone https://github.com/joshcabana/verityau-main-2.git

# Navigate to the project directory
cd verityau-main-2

# Install dependencies
npm install

# Start the development server
npm run dev
```

## Environment Variables

Create a `.env` file with:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **UI**: Tailwind CSS, shadcn/ui components
- **Backend**: Supabase (PostgreSQL, Auth, Realtime, Storage)
- **Video**: Daily.co API for video calls
- **Moderation**: AWS Rekognition for photo safety
- **Payments**: Stripe (premium features)
- **Deployment**: Vercel

## Deployment

Verity is deployed on Vercel with automatic deployments from the main branch.

```sh
# Deploy to production
vercel --prod
```

## Features

- ✅ Email verification required
- ✅ AI-facilitated 10-minute video dates
- ✅ Real-time chat (unlocked after successful date)
- ✅ Photo moderation with AWS Rekognition
- ✅ Rate limiting (5 likes/messages per minute)
- ✅ Admin panel for content moderation
- ✅ Swipeable profile cards with animations
- ✅ Real-time notifications
- ✅ Location-based matching (PostGIS)

## License

© 2025 Verity Australia. All rights reserved.

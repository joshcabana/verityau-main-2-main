// AWS Rekognition Edge Function for Photo Moderation
// Detects inappropriate content in uploaded photos

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import {
  RekognitionClient,
  DetectModerationLabelsCommand,
} from 'npm:@aws-sdk/client-rekognition@3.423.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ModerationRequest {
  imageUrl: string
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { imageUrl }: ModerationRequest = await req.json()

    if (!imageUrl) {
      throw new Error('Missing imageUrl')
    }

    // Initialize AWS Rekognition client
    const rekognitionClient = new RekognitionClient({
      region: Deno.env.get('AWS_REGION') || 'us-east-1',
      credentials: {
        accessKeyId: Deno.env.get('AWS_ACCESS_KEY_ID') ?? '',
        secretAccessKey: Deno.env.get('AWS_SECRET_ACCESS_KEY') ?? '',
      },
    })

    // Fetch image from URL
    const imageResponse = await fetch(imageUrl)
    const imageBuffer = await imageResponse.arrayBuffer()

    // Detect moderation labels
    const command = new DetectModerationLabelsCommand({
      Image: {
        Bytes: new Uint8Array(imageBuffer),
      },
      MinConfidence: 60, // 60% confidence threshold
    })

    const response = await rekognitionClient.send(command)

    // Check for inappropriate content
    const moderationLabels = response.ModerationLabels || []
    const inappropriate = moderationLabels.filter((label) => {
      // Flag these categories
      const blockedCategories = [
        'Explicit Nudity',
        'Suggestive',
        'Violence',
        'Visually Disturbing',
        'Rude Gestures',
        'Drugs',
        'Tobacco',
        'Alcohol',
        'Gambling',
        'Hate Symbols',
      ]

      return (
        label.Confidence! >= 60 &&
        blockedCategories.some((cat) => label.Name?.includes(cat))
      )
    })

    const isAppropriate = inappropriate.length === 0

    return new Response(
      JSON.stringify({
        appropriate: isAppropriate,
        labels: inappropriate.map((l) => ({
          name: l.Name,
          confidence: l.Confidence,
          parentName: l.ParentName,
        })),
        message: isAppropriate
          ? 'Image passed moderation'
          : 'Image contains inappropriate content',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: isAppropriate ? 200 : 400,
      }
    )
  } catch (error) {
    console.error('Moderation error:', error)
    
    // For development/beta: fail open (allow image) if moderation fails
    // For production: change this to fail closed (reject image)
    return new Response(
      JSON.stringify({
        appropriate: true, // CHANGE TO false FOR PRODUCTION
        error: error.message,
        fallback: true,
        message: 'Moderation service unavailable - image allowed',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // CHANGE TO 503 FOR PRODUCTION
      }
    )
  }
})

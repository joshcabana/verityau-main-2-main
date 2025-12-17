import * as Sentry from "@sentry/react";

/**
 * Initialize Sentry for error tracking
 * Set VITE_SENTRY_DSN environment variable in production
 */
export function initSentry() {
  const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
  const environment = import.meta.env.MODE || "development";
  const isProduction = environment === "production";

  // Only initialize Sentry if DSN is configured
  if (!sentryDsn) {
    if (isProduction) {
      console.warn("Sentry DSN not configured. Error tracking disabled.");
    }
    return;
  }

  Sentry.init({
    dsn: sentryDsn,
    environment,
    
    // Set sample rate for production (30% of errors)
    // In development, capture all errors
    sampleRate: isProduction ? 0.3 : 1.0,
    
    // Performance monitoring
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        // Mask all text and images for privacy
        maskAllText: true,
        blockAllMedia: true,
      }),
    ],

    // Performance tracing
    tracesSampleRate: isProduction ? 0.1 : 1.0,

    // Capture unhandled promise rejections
    beforeSend(event, hint) {
      // Filter out development errors
      if (!isProduction && event.exception) {
        console.error("Sentry captured error:", event.exception);
      }

      // Don't send certain errors
      const error = hint.originalException;
      if (error instanceof Error) {
        // Filter out network errors (user offline)
        if (error.message.includes("Failed to fetch") || 
            error.message.includes("Network request failed")) {
          return null;
        }

        // Filter out Supabase auth session errors (expected in some cases)
        if (error.message.includes("Auth session missing")) {
          return null;
        }
      }

      return event;
    },

    // Tag with app version
    release: `verity@${import.meta.env.VITE_APP_VERSION || "0.1.0"}`,

    // Additional tags
    initialScope: {
      tags: {
        app: "verity-dating",
        platform: "web",
      },
    },
  });

  // Set user context when available
  if (isProduction) {
    console.info("Sentry initialized successfully");
  }
}

/**
 * Set user context for Sentry
 */
export function setSentryUser(user: { id: string; email?: string } | null) {
  if (user) {
    Sentry.setUser({
      id: user.id,
      email: user.email,
    });
  } else {
    Sentry.setUser(null);
  }
}

/**
 * Capture exception manually
 */
export function captureException(error: Error, context?: Record<string, unknown>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Capture message manually
 */
export function captureMessage(message: string, level: Sentry.SeverityLevel = "info") {
  Sentry.captureMessage(message, level);
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(message: string, data?: Record<string, unknown>) {
  Sentry.addBreadcrumb({
    message,
    data,
    timestamp: Date.now() / 1000,
  });
}

/**
 * Haptic feedback utility for mobile devices
 * Provides tactile feedback for user interactions
 */

type HapticType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

const hapticPatterns: Record<HapticType, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 30,
  success: [10, 50, 10],  // Double tap for success
  warning: [20, 30, 20],  // Slight warning pattern
  error: [30, 50, 30, 50, 30], // Triple buzz for error
};

/**
 * Trigger haptic feedback if the device supports it
 * @param type - The type/intensity of haptic feedback
 * @returns boolean - Whether haptic feedback was triggered
 */
export function hapticFeedback(type: HapticType = 'light'): boolean {
  // Check if the Vibration API is supported
  if (!('vibrate' in navigator)) {
    return false;
  }

  try {
    const pattern = hapticPatterns[type];
    navigator.vibrate(pattern);
    return true;
  } catch (error) {
    // Silently fail if vibration is not allowed
    console.debug('Haptic feedback not available:', error);
    return false;
  }
}

/**
 * Cancel any ongoing haptic feedback
 */
export function cancelHaptic(): void {
  if ('vibrate' in navigator) {
    navigator.vibrate(0);
  }
}

/**
 * Check if haptic feedback is supported
 */
export function isHapticSupported(): boolean {
  return 'vibrate' in navigator;
}

/**
 * Hook-style function to use haptics in components
 */
export function useHaptics() {
  return {
    trigger: hapticFeedback,
    cancel: cancelHaptic,
    isSupported: isHapticSupported(),
  };
}

export default hapticFeedback;


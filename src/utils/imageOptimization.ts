import { supabase } from "@/integrations/supabase/client";

/**
 * Get optimized image URL from Supabase Storage with automatic transforms
 * Uses Supabase image transformation API to resize, compress, and convert to WebP
 * 
 * @param publicUrl - The original public URL from Supabase Storage
 * @param options - Transform options
 * @returns Optimized image URL with transforms applied
 */
export function getOptimizedImageUrl(
  publicUrl: string,
  options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: "webp" | "origin";
  } = {}
): string {
  // Default to 800px width for profile photos, 80 quality, webp format
  const {
    width = 800,
    height,
    quality = 80,
    format = "webp",
  } = options;

  // Check if URL is from Supabase storage
  if (!publicUrl.includes('/storage/v1/object/public/')) {
    return publicUrl;
  }

  // Build transform parameters
  const params = new URLSearchParams();
  
  if (width) params.append('width', width.toString());
  if (height) params.append('height', height.toString());
  if (quality) params.append('quality', quality.toString());
  if (format) params.append('format', format);

  // Add transform parameters to URL
  // Supabase format: /storage/v1/render/image/public/{bucket}/{path}?{transforms}
  const url = publicUrl.replace(
    '/storage/v1/object/public/',
    '/storage/v1/render/image/public/'
  );

  return `${url}?${params.toString()}`;
}

/**
 * Get thumbnail URL (smaller, optimized for lists)
 */
export function getThumbnailUrl(publicUrl: string): string {
  return getOptimizedImageUrl(publicUrl, {
    width: 400,
    quality: 75,
    format: "webp",
  });
}

/**
 * Get full-size optimized URL (for profile detail views)
 */
export function getFullSizeUrl(publicUrl: string): string {
  return getOptimizedImageUrl(publicUrl, {
    width: 1200,
    quality: 85,
    format: "webp",
  });
}

/**
 * Get avatar URL (small circular avatars)
 */
export function getAvatarUrl(publicUrl: string): string {
  return getOptimizedImageUrl(publicUrl, {
    width: 200,
    height: 200,
    quality: 75,
    format: "webp",
  });
}

/**
 * Preload critical images for performance
 */
export function preloadImages(urls: string[]): void {
  if (typeof window === 'undefined') return;

  urls.forEach((url) => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = url;
    document.head.appendChild(link);
  });
}

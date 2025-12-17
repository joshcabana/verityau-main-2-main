import { useState, useCallback, memo, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface OptimizedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src: string;
  alt: string;
  fallback?: string;
  className?: string;
  containerClassName?: string;
  showLoadingState?: boolean;
  // Responsive image props
  srcSet?: string;
  sizes?: string;
  // Modern format props
  webpSrc?: string;
  avifSrc?: string;
  // Lazy loading props
  priority?: boolean; // For above-the-fold images
}

/**
 * OptimizedImage component with:
 * - Native lazy loading
 * - Loading skeleton state
 * - Error fallback handling
 * - Automatic decoding optimization
 */
export const OptimizedImage = memo(function OptimizedImage({
  src,
  alt,
  fallback = "/placeholder.svg",
  className,
  containerClassName,
  showLoadingState = true,
  srcSet,
  sizes,
  webpSrc,
  avifSrc,
  priority = false,
  ...props
}: OptimizedImageProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
  }, []);

  const handleError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  // For priority images, use eager loading
  const loading = priority ? "eager" : "lazy";

  return (
    <div className={cn("relative overflow-hidden", containerClassName)}>
      {/* Loading skeleton */}
      {showLoadingState && isLoading && !hasError && (
        <div className="absolute inset-0 bg-muted animate-pulse rounded-md" />
      )}

      {/* Modern picture element for multiple formats */}
      {(webpSrc || avifSrc) ? (
        <picture>
          {avifSrc && <source srcSet={avifSrc} type="image/avif" />}
          {webpSrc && <source srcSet={webpSrc} type="image/webp" />}
          <img
            src={hasError ? fallback : src}
            srcSet={srcSet}
            sizes={sizes}
            alt={alt}
            loading={loading}
            decoding="async"
            fetchPriority={priority ? "high" : "auto"}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              "transition-opacity duration-300",
              isLoading ? "opacity-0" : "opacity-100",
              className
            )}
            {...props}
          />
        </picture>
      ) : (
        <img
          src={hasError ? fallback : src}
          srcSet={srcSet}
          sizes={sizes}
          alt={alt}
          loading={loading}
          decoding="async"
          fetchPriority={priority ? "high" : "auto"}
          onLoad={handleLoad}
          onError={handleError}
          className={cn(
            "transition-opacity duration-300",
            isLoading ? "opacity-0" : "opacity-100",
            className
          )}
          {...props}
        />
      )}
    </div>
  );
});

/**
 * Preload critical images for better LCP
 */
export function preloadImage(src: string): void {
  const link = document.createElement("link");
  link.rel = "preload";
  link.as = "image";
  link.href = src;
  document.head.appendChild(link);
}

/**
 * Check if native lazy loading is supported
 */
export function supportsLazyLoading(): boolean {
  return "loading" in HTMLImageElement.prototype;
}


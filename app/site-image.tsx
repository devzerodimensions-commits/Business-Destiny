import type { ImgHTMLAttributes } from 'react';
import images from '@/content/optimized-images.json';

/** Keep CMS URLs intact while serving responsive versions of bundled images. */
export function SiteImage({src, sizes = '(max-width: 700px) 100vw, 50vw', loading = 'lazy', ...props}: ImgHTMLAttributes<HTMLImageElement>) {
  const optimized = images[src as keyof typeof images];
  return <img {...props} src={optimized?.src || src} srcSet={optimized?.srcSet} sizes={optimized ? sizes : undefined} width={props.width || optimized?.width} height={props.height || optimized?.height} loading={loading} decoding="async" />;
}

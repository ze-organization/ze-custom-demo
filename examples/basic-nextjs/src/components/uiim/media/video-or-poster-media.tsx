import React, { JSX } from 'react';
import type { Field, ImageField } from '@sitecore-content-sdk/nextjs';
import { NextImage as ContentSdkImage } from '@sitecore-content-sdk/nextjs';

function inferVideoMimeType(url: string): string {
  const u = url.toLowerCase();
  if (u.endsWith('.webm')) return 'video/webm';
  if (u.endsWith('.ogg') || u.endsWith('.ogv')) return 'video/ogg';
  return 'video/mp4';
}

/** Returns a safe https embed URL for known video hosts, or null. */
export function getAllowedVideoEmbedUrl(raw: string | undefined | null): string | null {
  if (!raw?.trim()) return null;
  let parsed: URL;
  try {
    parsed = new URL(raw.trim());
  } catch {
    return null;
  }
  if (parsed.protocol !== 'https:') return null;
  const host = parsed.hostname.toLowerCase();
  if (host === 'play.vidyard.com') return parsed.href;
  if (host === 'player.vimeo.com' || host === 'www.vimeo.com') return parsed.href;
  if (host === 'www.youtube.com' || host === 'youtube.com' || host === 'www.youtube-nocookie.com') {
    if (parsed.pathname.startsWith('/embed/')) return parsed.href;
    return null;
  }
  return null;
}

export type VideoOrPosterMediaProps = {
  videoSourceUrl?: Field<string>;
  videoEmbedUrl?: Field<string>;
  /** Rendering parameters fallback (Sitecore param names) */
  videoSourceUrlParam?: string;
  videoEmbedUrlParam?: string;
  /** Used as `<video poster>` and as fallback image when no video is configured */
  imageField: ImageField;
  isEditing?: boolean;
  /** Wrapper class (e.g. rounded overflow) */
  className?: string;
  /** Class on `<img>` / `<video>` / iframe */
  mediaClassName?: string;
};

/**
 * Renders an optional embed (Vidyard / YouTube / Vimeo), else optional HTML5 video (MP4 etc.),
 * else Sitecore Image from `imageField`.
 */
export function VideoOrPosterMedia({
  videoSourceUrl,
  videoEmbedUrl,
  videoSourceUrlParam,
  videoEmbedUrlParam,
  imageField,
  isEditing,
  className,
  mediaClassName,
}: VideoOrPosterMediaProps): JSX.Element | null {
  const embedHref = getAllowedVideoEmbedUrl(videoEmbedUrl?.value ?? videoEmbedUrlParam);
  const fileSrc = (videoSourceUrl?.value ?? videoSourceUrlParam)?.trim();
  const imageAlt = imageField?.value?.alt;
  const altLabel = typeof imageAlt === 'string' && imageAlt.trim() ? imageAlt : 'Video';

  if (embedHref) {
    return (
      <div className={className}>
        <iframe
          title={altLabel}
          src={embedHref}
          className={mediaClassName}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
    );
  }

  if (fileSrc) {
    const poster = imageField?.value?.src;
    return (
      <div className={className}>
        <video
          className={mediaClassName}
          controls
          playsInline
          preload="metadata"
          poster={poster || undefined}
          aria-label={altLabel}
        >
          <source src={fileSrc} type={inferVideoMimeType(fileSrc)} />
        </video>
      </div>
    );
  }

  if (imageField?.value?.src || isEditing) {
    return (
      <div className={className}>
        <ContentSdkImage field={imageField} className={mediaClassName} />
      </div>
    );
  }

  return null;
}

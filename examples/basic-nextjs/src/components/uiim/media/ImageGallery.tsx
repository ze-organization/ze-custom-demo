import React, { JSX } from 'react';
import {
  Field,
  ImageField,
  NextImage as ContentSdkImage,
  Text,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';
import { VideoOrPosterMedia } from '@/components/uiim/media/video-or-poster-media';

interface ImageGalleryFields {
  GalleryImage: ImageField;
  VideoSourceUrl?: Field<string>;
  VideoEmbedUrl?: Field<string>;
  Caption: Field<string>;
  AltText: Field<string>;
}

type ImageGalleryProps = ComponentProps & {
  fields: ImageGalleryFields;
};

function videoParamOverrides(rendering: ImageGalleryProps['rendering']): {
  videoSourceUrlParam?: string;
  videoEmbedUrlParam?: string;
} {
  const raw = rendering?.params as Record<string, string | undefined> | undefined;
  if (!raw) return {};
  return {
    videoSourceUrlParam: raw.VideoSourceUrl || raw.videoSourceUrl,
    videoEmbedUrlParam: raw.VideoEmbedUrl || raw.videoEmbedUrl,
  };
}

const ImageGalleryDefaultComponent = (): JSX.Element => (
  <div className="component image-gallery">
    <div className="component-content">
      <span className="is-empty-hint">ImageGallery</span>
    </div>
  </div>
);

/* ────────────────────────────────────────────
   Default — full-width image, no max-width constraint
   ──────────────────────────────────────────── */
export const Default = ({ fields, params, page, rendering }: ImageGalleryProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  if (!fields) return <ImageGalleryDefaultComponent />;
  const vParams = videoParamOverrides(rendering);

  return (
    <div className={cn('component image-gallery', styles)} id={RenderingIdentifier}>
      <figure className="w-full">
        <VideoOrPosterMedia
          videoSourceUrl={fields.VideoSourceUrl}
          videoEmbedUrl={fields.VideoEmbedUrl}
          videoSourceUrlParam={vParams.videoSourceUrlParam}
          videoEmbedUrlParam={vParams.videoEmbedUrlParam}
          imageField={fields.GalleryImage}
          isEditing={isEditing}
          mediaClassName="aspect-video w-full max-h-[70vh] object-cover [&:is(iframe)]:max-h-[70vh] [&:is(iframe)]:min-h-[320px] [&:is(iframe)]:border-0"
        />
        {(fields.Caption?.value || isEditing) && (
          <figcaption
            className="px-4 py-3 text-center text-sm font-[var(--brand-body-font,inherit)]"
            style={{ color: 'var(--brand-muted-foreground, #6b7280)' }}
          >
            <Text field={fields.Caption} />
          </figcaption>
        )}
      </figure>
    </div>
  );
};

/* ────────────────────────────────────────────
   Gallery — container-constrained with rounded corners
   ──────────────────────────────────────────── */
export const Gallery = ({ fields, params, page, rendering }: ImageGalleryProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  if (!fields) return <ImageGalleryDefaultComponent />;
  const vParams = videoParamOverrides(rendering);

  return (
    <div className={cn('component image-gallery', styles)} id={RenderingIdentifier}>
      <figure className="mx-auto max-w-7xl px-4 py-8">
        <div className="overflow-hidden rounded-[var(--brand-card-radius,0.75rem)]">
          <VideoOrPosterMedia
            videoSourceUrl={fields.VideoSourceUrl}
            videoEmbedUrl={fields.VideoEmbedUrl}
            videoSourceUrlParam={vParams.videoSourceUrlParam}
            videoEmbedUrlParam={vParams.videoEmbedUrlParam}
            imageField={fields.GalleryImage}
            isEditing={isEditing}
            mediaClassName="aspect-video w-full max-h-[60vh] object-cover [&:is(iframe)]:min-h-[360px] [&:is(iframe)]:border-0"
          />
        </div>
        {(fields.Caption?.value || isEditing) && (
          <figcaption
            className="mt-3 text-center text-sm font-[var(--brand-body-font,inherit)]"
            style={{ color: 'var(--brand-muted-foreground, #6b7280)' }}
          >
            <Text field={fields.Caption} />
          </figcaption>
        )}
      </figure>
    </div>
  );
};

/* ────────────────────────────────────────────
   Parallax — full-width with fixed background effect
   ──────────────────────────────────────────── */
export const Parallax = ({ fields, params, page, rendering }: ImageGalleryProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  if (!fields) return <ImageGalleryDefaultComponent />;

  const imageSrc = fields.GalleryImage?.value?.src;
  const vParams = videoParamOverrides(rendering);
  const hasVideo = Boolean(
    fields.VideoEmbedUrl?.value?.trim() ||
      fields.VideoSourceUrl?.value?.trim() ||
      vParams.videoEmbedUrlParam?.trim() ||
      vParams.videoSourceUrlParam?.trim()
  );

  return (
    <div className={cn('component image-gallery', styles)} id={RenderingIdentifier}>
      <figure className="w-full">
        {hasVideo ? (
          <div className="h-[60vh] w-full overflow-hidden">
            <VideoOrPosterMedia
              videoSourceUrl={fields.VideoSourceUrl}
              videoEmbedUrl={fields.VideoEmbedUrl}
              videoSourceUrlParam={vParams.videoSourceUrlParam}
              videoEmbedUrlParam={vParams.videoEmbedUrlParam}
              imageField={fields.GalleryImage}
              isEditing={isEditing}
              mediaClassName="h-full w-full object-cover [&:is(iframe)]:min-h-full [&:is(iframe)]:border-0"
            />
          </div>
        ) : (
          <>
            {(imageSrc || isEditing) && (
              <div
                className="h-[60vh] w-full bg-cover bg-center bg-fixed"
                style={{
                  backgroundImage: imageSrc ? `url(${imageSrc})` : undefined,
                }}
              >
                {isEditing && (
                  <div className="flex h-full items-center justify-center">
                    <ContentSdkImage
                      field={fields.GalleryImage}
                      className="max-h-full max-w-full object-contain opacity-50"
                    />
                  </div>
                )}
              </div>
            )}
          </>
        )}
        {(fields.Caption?.value || isEditing) && (
          <figcaption
            className="px-4 py-3 text-center text-sm font-[var(--brand-body-font,inherit)]"
            style={{
              backgroundColor: 'var(--brand-bg, #ffffff)',
              color: 'var(--brand-muted-foreground, #6b7280)',
            }}
          >
            <Text field={fields.Caption} />
          </figcaption>
        )}
      </figure>
    </div>
  );
};

/* GlobalPayments demo variant — layout via theme tokens; extend for pixel tweaks */
export const GlobalPayments = Default;

'use client';

import React, { JSX, useState } from 'react';
import {
  Field,
  ImageField,
  Text,
  NextImage as ContentSdkImage,
  DateField,
} from '@sitecore-content-sdk/nextjs';
import { Facebook, Linkedin, Link2, Mail } from 'lucide-react';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';
import { PersonReference } from 'src/Layout';
import { SmartMedia } from '@/components/uiim/media/SmartMedia';

interface ArticleHeroRouteFields {
  Title?: Field<string>;
  pageSummary?: Field<string>;
  metadataKeywords?: Field<string>;
  ArticleImage?: ImageField;
  ArticleAuthor?: PersonReference;
  ArticlePublicationDate?: Field<string>;
  ArticleReadTime?: Field<string>;
}

const ArticleHeroDefaultComponent = (): JSX.Element => (
  <div className="component article-hero">
    <div className="component-content">
      <span className="is-empty-hint">ArticleHero</span>
    </div>
  </div>
);

function getRouteFields(page: ComponentProps['page']): ArticleHeroRouteFields | null {
  const fields = page?.layout?.sitecore?.route?.fields;
  return fields ? (fields as unknown as ArticleHeroRouteFields) : null;
}

function CoveoShareButtons() {
  const [copied, setCopied] = useState(false);

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'email':
        window.location.href = `mailto:?subject=${title}&body=${url}`;
        return;
      case 'copy':
        navigator.clipboard.writeText(window.location.href).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
        return;
    }
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  const iconButtonClass =
    'rounded-full border border-[var(--brand-border,#E5E7EB)] p-2.5 transition-colors hover:bg-[var(--brand-muted,#F4F5F7)]';

  return (
    <div className="flex items-center gap-2" data-testid="coveo-share-buttons">
      <button
        type="button"
        onClick={() => handleShare('facebook')}
        className={iconButtonClass}
        aria-label="Share on Facebook"
        data-testid="share-facebook"
      >
        <Facebook className="h-4 w-4" style={{ color: 'var(--brand-fg, #0E0F12)' }} />
      </button>
      <button
        type="button"
        onClick={() => handleShare('twitter')}
        className={iconButtonClass}
        aria-label="Share on X"
        data-testid="share-twitter"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      </button>
      <button
        type="button"
        onClick={() => handleShare('linkedin')}
        className={iconButtonClass}
        aria-label="Share on LinkedIn"
        data-testid="share-linkedin"
      >
        <Linkedin className="h-4 w-4" style={{ color: 'var(--brand-fg, #0E0F12)' }} />
      </button>
      <button
        type="button"
        onClick={() => handleShare('email')}
        className={iconButtonClass}
        aria-label="Share by email"
        data-testid="share-email"
      >
        <Mail className="h-4 w-4" style={{ color: 'var(--brand-fg, #0E0F12)' }} />
      </button>
      <button
        type="button"
        onClick={() => handleShare('copy')}
        className={iconButtonClass}
        aria-label={copied ? 'Link copied' : 'Copy link'}
        data-testid="share-copy"
      >
        <Link2 className="h-4 w-4" style={{ color: 'var(--brand-fg, #0E0F12)' }} />
      </button>
    </div>
  );
}

function ShareButtons() {
  const [copied, setCopied] = useState(false);

  const handleShare = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(document.title);
    let shareUrl = '';

    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
        break;
      case 'email':
        window.location.href = `mailto:?subject=${title}&body=${url}`;
        return;
      case 'copy':
        navigator.clipboard.writeText(window.location.href).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        });
        return;
    }
    window.open(shareUrl, '_blank', 'width=600,height=400');
  };

  return (
    <div className="flex items-center gap-3" data-testid="share-buttons">
      <span className="text-sm font-medium opacity-70">Share</span>
      {['facebook', 'twitter', 'linkedin', 'email'].map((platform) => (
        <button
          key={platform}
          onClick={() => handleShare(platform)}
          className="rounded-full p-2 transition-colors hover:bg-white/10"
          aria-label={`Share on ${platform}`}
          data-testid={`share-${platform}`}
        >
          <span className="text-sm capitalize">{platform}</span>
        </button>
      ))}
      <button
        onClick={() => handleShare('copy')}
        className="rounded-full p-2 transition-colors hover:bg-white/10"
        aria-label={copied ? 'Link copied' : 'Copy link'}
        data-testid="share-copy"
      >
        <span className="text-sm">{copied ? 'Copied!' : 'Copy'}</span>
      </button>
    </div>
  );
}

function AuthorMeta({
  author,
  isEditing,
}: {
  author?: PersonReference;
  isEditing?: boolean;
}) {
  if (!author?.fields && !isEditing) return null;
  const fields = author?.fields;

  return (
    <div className="flex items-center gap-3" data-testid="author-meta">
      {fields?.personProfileImage?.value?.src && (
        <div className="h-10 w-10 overflow-hidden rounded-full">
          <ContentSdkImage
            field={fields.personProfileImage}
            className="h-full w-full object-cover"
            width={40}
            height={40}
          />
        </div>
      )}
      <div>
        {(fields?.personFirstName?.value || fields?.personLastName?.value || isEditing) && (
          <p className="text-sm font-medium" data-testid="author-name">
            {fields?.personFirstName?.value} {fields?.personLastName?.value}
          </p>
        )}
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Default — full-bleed image with dark overlay, centered title
   ──────────────────────────────────────────── */
export const Default = ({ params, page }: ComponentProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const routeFields = getRouteFields(page);

  if (!routeFields) return <ArticleHeroDefaultComponent />;

  const { Title: title, ArticleImage, ArticleAuthor, ArticlePublicationDate, ArticleReadTime } =
    routeFields;

  return (
    <div className={cn('component article-hero', styles)} id={RenderingIdentifier}>
      <header className="relative overflow-hidden" data-testid="article-hero-header">
        {/* Background image with overlay */}
        <div className="relative min-h-[60vh] bg-gray-900">
          {(ArticleImage?.value?.src || isEditing) && (
            <div className="absolute inset-0 opacity-40">
              <SmartMedia
                field={ArticleImage}
                fill
                sizes="100vw"
                className="object-cover"
              />
            </div>
          )}

          {/* Content overlay */}
          <div className="relative z-10 flex min-h-[60vh] flex-col items-center justify-center px-4 py-20 text-center text-white">
            {/* Title */}
            {(title?.value || isEditing) && (
              <Text
                field={title}
                tag="h1"
                className="mx-auto max-w-4xl text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl"
                data-testid="article-title"
              />
            )}

            {/* Metadata row */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm opacity-90">
              <AuthorMeta author={ArticleAuthor} isEditing={isEditing} />
              {(ArticlePublicationDate?.value || isEditing) && ArticlePublicationDate && (
                <time data-testid="article-date">
                  <DateField
                    field={ArticlePublicationDate}
                    tag="span"
                    render={(date) =>
                      new Date(String(date)).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    }
                  />
                </time>
              )}
              {(ArticleReadTime?.value || isEditing) && ArticleReadTime && (
                <Text
                  field={ArticleReadTime}
                  tag="span"
                  data-testid="article-read-time"
                />
              )}
            </div>

            {/* Share buttons */}
            <div className="mt-8">
              <ShareButtons />
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

/* ────────────────────────────────────────────
   Minimal — no image, clean background, large title
   ──────────────────────────────────────────── */
export const Minimal = ({ params, page }: ComponentProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const routeFields = getRouteFields(page);

  if (!routeFields) return <ArticleHeroDefaultComponent />;

  const { Title: title, ArticleAuthor, ArticlePublicationDate, ArticleReadTime } = routeFields;

  return (
    <div className={cn('component article-hero', styles)} id={RenderingIdentifier}>
      <header className="bg-white" data-testid="article-hero-header">
        <div className="mx-auto max-w-4xl px-4 py-16 md:py-24">
          {(title?.value || isEditing) && (
            <Text
              field={title}
              tag="h1"
              className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl lg:text-6xl"
              data-testid="article-title"
            />
          )}

          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-600">
            <AuthorMeta author={ArticleAuthor} isEditing={isEditing} />
            {(ArticlePublicationDate?.value || isEditing) && ArticlePublicationDate && (
              <time data-testid="article-date">
                <DateField
                  field={ArticlePublicationDate}
                  tag="span"
                  render={(date) =>
                    new Date(String(date)).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })
                  }
                />
              </time>
            )}
            {(ArticleReadTime?.value || isEditing) && ArticleReadTime && (
              <Text field={ArticleReadTime} tag="span" data-testid="article-read-time" />
            )}
          </div>

          <div className="mt-6">
            <ShareButtons />
          </div>
        </div>
      </header>
    </div>
  );
};

/* ────────────────────────────────────────────
   SplitImage — two-column: image right, title + metadata left
   ──────────────────────────────────────────── */
export const SplitImage = ({ params, page }: ComponentProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const routeFields = getRouteFields(page);

  if (!routeFields) return <ArticleHeroDefaultComponent />;

  const { Title: title, ArticleImage, ArticleAuthor, ArticlePublicationDate, ArticleReadTime } =
    routeFields;

  return (
    <div className={cn('component article-hero', styles)} id={RenderingIdentifier}>
      <header data-testid="article-hero-header">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 md:grid-cols-2 md:py-20">
          {/* Left column — text */}
          <div className="flex flex-col justify-center">
            {(title?.value || isEditing) && (
              <Text
                field={title}
                tag="h1"
                className="text-4xl font-bold tracking-tight text-gray-900 md:text-5xl"
                data-testid="article-title"
              />
            )}

            <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-gray-600">
              <AuthorMeta author={ArticleAuthor} isEditing={isEditing} />
              {(ArticlePublicationDate?.value || isEditing) && ArticlePublicationDate && (
                <time data-testid="article-date">
                  <DateField
                    field={ArticlePublicationDate}
                    tag="span"
                    render={(date) =>
                      new Date(String(date)).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })
                    }
                  />
                </time>
              )}
              {(ArticleReadTime?.value || isEditing) && ArticleReadTime && (
                <Text field={ArticleReadTime} tag="span" data-testid="article-read-time" />
              )}
            </div>

            <div className="mt-8">
              <ShareButtons />
            </div>
          </div>

          {/* Right column — image */}
          {(ArticleImage?.value?.src || isEditing) && (
            <div
              className="relative aspect-[4/3] overflow-hidden rounded-lg"
              data-testid="split-image"
            >
              <SmartMedia
                field={ArticleImage}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          )}
        </div>
      </header>
    </div>
  );
};

/* ────────────────────────────────────────────
   Coveo — blog hero: category pill, subtitle, meta row, image below
   ──────────────────────────────────────────── */
export const Coveo = ({ params, page }: ComponentProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const routeFields = getRouteFields(page);

  if (!routeFields) return <ArticleHeroDefaultComponent />;

  const {
    Title: title,
    pageSummary,
    metadataKeywords,
    ArticleImage,
    ArticleAuthor,
    ArticlePublicationDate,
    ArticleReadTime,
  } = routeFields;

  const hasMeta =
    ArticleAuthor?.fields ||
    ArticlePublicationDate?.value ||
    ArticleReadTime?.value ||
    isEditing;

  return (
    <div className={cn('component article-hero', styles)} id={RenderingIdentifier}>
      <header
        className="w-full"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
        data-testid="article-hero-header"
      >
        <div className="mx-auto max-w-4xl px-4 pb-8 pt-12 md:pb-10 md:pt-16">
          {(metadataKeywords?.value || isEditing) && metadataKeywords && (
            <Text
              field={metadataKeywords}
              tag="span"
              className="mb-6 inline-block rounded-full px-4 py-1.5 text-sm font-medium"
              style={{
                backgroundColor: 'var(--brand-accent-muted, #E8F7FA)',
                color: 'var(--brand-accent, #00A5B5)',
              }}
              data-testid="article-category"
            />
          )}

          {(title?.value || isEditing) && (
            <Text
              field={title}
              tag="h1"
              className="text-3xl font-medium leading-tight tracking-tight md:text-4xl lg:text-5xl font-[var(--brand-heading-font,inherit)]"
              style={{ color: 'var(--brand-fg, #0E0F12)' }}
              data-testid="article-title"
            />
          )}

          {(pageSummary?.value || isEditing) && pageSummary && (
            <Text
              field={pageSummary}
              tag="p"
              className="mt-5 text-lg font-light leading-relaxed md:text-xl font-[var(--brand-body-font,inherit)]"
              style={{ color: 'var(--brand-muted-fg, #5C6370)' }}
              data-testid="article-subtitle"
            />
          )}

          {hasMeta && (
            <div
              className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm"
              style={{ color: 'var(--brand-muted-fg, #5C6370)' }}
              data-testid="article-meta-row"
            >
              {(ArticleAuthor?.fields || isEditing) && (
                <span className="font-medium" style={{ color: 'var(--brand-fg, #0E0F12)' }}>
                  By
                </span>
              )}
              <AuthorMeta author={ArticleAuthor} isEditing={isEditing} />
              {(ArticlePublicationDate?.value || isEditing) && ArticlePublicationDate && (
                <>
                  <span aria-hidden="true">|</span>
                  <time data-testid="article-date">
                    <DateField
                      field={ArticlePublicationDate}
                      tag="span"
                      render={(date) =>
                        new Date(String(date)).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })
                      }
                    />
                  </time>
                </>
              )}
              {(ArticleReadTime?.value || isEditing) && ArticleReadTime && (
                <>
                  <span aria-hidden="true">|</span>
                  <Text field={ArticleReadTime} tag="span" data-testid="article-read-time" />
                </>
              )}
            </div>
          )}

          <div className="mt-6">
            <CoveoShareButtons />
          </div>
        </div>

        {(ArticleImage?.value?.src || isEditing) && (
          <div className="mx-auto max-w-6xl px-4 pb-10 md:pb-14" data-testid="coveo-hero-image">
            <div className="relative aspect-[16/9] overflow-hidden rounded-2xl">
              <SmartMedia
                field={ArticleImage}
                fill
                sizes="(max-width: 768px) 100vw, 1152px"
                className="object-cover"
              />
            </div>
          </div>
        )}
      </header>
    </div>
  );
};

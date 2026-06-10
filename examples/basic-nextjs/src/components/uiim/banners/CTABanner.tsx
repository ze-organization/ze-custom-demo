import React, { JSX } from 'react';
import {
  Field,
  ImageField,
  LinkField,
  Link as ContentSdkLink,
  RichText as ContentSdkRichText,
  Text,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';
import { SmartMedia } from '@/components/uiim/media/SmartMedia';

interface CTABannerFields {
  Title: Field<string>;
  Description: Field<string>;
  PrimaryLink: LinkField;
  SecondaryLink: LinkField;
  BackgroundImage: ImageField;
}

type CTABannerProps = ComponentProps & {
  fields: CTABannerFields;
};

const CTABannerDefaultComponent = (): JSX.Element => (
  <div className="component cta-banner">
    <div className="component-content">
      <span className="is-empty-hint">CTABanner</span>
    </div>
  </div>
);

const PrimaryButton = ({ field, isEditing, className }: { field: LinkField; isEditing?: boolean; className?: string }) => {
  if (!field?.value?.href && !isEditing) return null;
  return (
    <ContentSdkLink
      field={field}
      className={cn(
        'inline-flex items-center justify-center px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90 rounded-[var(--brand-button-radius,0.375rem)]',
        className
      )}
    />
  );
};

const SecondaryButton = ({ field, isEditing }: { field: LinkField; isEditing?: boolean }) => {
  if (!field?.value?.href && !isEditing) return null;
  return (
    <ContentSdkLink
      field={field}
      className="inline-flex items-center justify-center px-6 py-3 text-sm font-semibold border border-current bg-transparent transition-opacity hover:opacity-70 rounded-[var(--brand-button-radius,0.375rem)]"
    />
  );
};

/* ────────────────────────────────────────────
   Default — centered, --brand-primary background
   ──────────────────────────────────────────── */
export const Default = ({ fields, params, page }: CTABannerProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  if (!fields) return <CTABannerDefaultComponent />;

  return (
    <div className={cn('component cta-banner', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-16 md:py-24"
        style={{
          backgroundColor: 'var(--brand-primary)',
          color: 'var(--brand-primary-foreground)',
        }}
      >
        <div className="mx-auto max-w-3xl text-center">
          {(fields.Title?.value || isEditing) && (
            <Text
              field={fields.Title}
              tag="h2"
              className="text-3xl font-bold tracking-tight sm:text-4xl font-[var(--brand-heading-font,inherit)]"
            />
          )}
          {(fields.Description?.value || isEditing) && (
            <ContentSdkRichText
              field={fields.Description}
              className="mt-4 text-lg opacity-90 font-[var(--brand-body-font,inherit)]"
            />
          )}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <PrimaryButton
              field={fields.PrimaryLink}
              isEditing={isEditing}
              className="bg-[var(--brand-primary-foreground)] text-[var(--brand-primary)]"
            />
            <SecondaryButton field={fields.SecondaryLink} isEditing={isEditing} />
          </div>
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   WithImage — full-bleed background with overlay
   ──────────────────────────────────────────── */
export const WithImage = ({ fields, params, page }: CTABannerProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  if (!fields) return <CTABannerDefaultComponent />;

  return (
    <div className={cn('component cta-banner', styles)} id={RenderingIdentifier}>
      <section className="relative w-full overflow-hidden">
        {(fields.BackgroundImage?.value?.src || isEditing) && (
          <div className="absolute inset-0">
            <SmartMedia
              field={fields.BackgroundImage}
              fill
              sizes="100vw"
              className="object-cover"
            />
          </div>
        )}
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative z-10 px-4 py-16 md:py-24 text-white">
          <div className="mx-auto max-w-3xl text-center">
            {(fields.Title?.value || isEditing) && (
              <Text
                field={fields.Title}
                tag="h2"
                className="text-3xl font-bold tracking-tight sm:text-4xl font-[var(--brand-heading-font,inherit)]"
              />
            )}
            {(fields.Description?.value || isEditing) && (
              <ContentSdkRichText
                field={fields.Description}
                className="mt-4 text-lg opacity-90 font-[var(--brand-body-font,inherit)]"
              />
            )}
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <PrimaryButton
                field={fields.PrimaryLink}
                isEditing={isEditing}
                className="bg-[var(--brand-primary)] text-[var(--brand-primary-foreground)]"
              />
              <SecondaryButton field={fields.SecondaryLink} isEditing={isEditing} />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   Split — text left, buttons right
   ──────────────────────────────────────────── */
export const Split = ({ fields, params, page }: CTABannerProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  if (!fields) return <CTABannerDefaultComponent />;

  return (
    <div className={cn('component cta-banner', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-16 md:py-20"
        style={{ backgroundColor: 'var(--brand-muted, #f5f5f5)' }}
      >
        <div className="mx-auto grid max-w-7xl items-center gap-8 md:grid-cols-2 md:px-6">
          <div>
            {(fields.Title?.value || isEditing) && (
              <Text
                field={fields.Title}
                tag="h2"
                className="text-3xl font-bold tracking-tight sm:text-4xl font-[var(--brand-heading-font,inherit)]"
                style={{ color: 'var(--brand-fg, #111111)' }}
              />
            )}
            {(fields.Description?.value || isEditing) && (
              <ContentSdkRichText
                field={fields.Description}
                className="mt-4 text-base font-[var(--brand-body-font,inherit)]"
                style={{ color: 'var(--brand-muted-foreground, #6b7280)' }}
              />
            )}
          </div>
          <div className="flex flex-wrap items-center gap-4 md:justify-end">
            <PrimaryButton
              field={fields.PrimaryLink}
              isEditing={isEditing}
              className="bg-[var(--brand-primary)] text-[var(--brand-primary-foreground)]"
            />
            <SecondaryButton field={fields.SecondaryLink} isEditing={isEditing} />
          </div>
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   Minimal — subtle background, inline text + link
   ──────────────────────────────────────────── */
/* Coveo variant — dark navy conversion band with optional split image */
export const Coveo = ({ fields, params, page }: CTABannerProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  if (!fields) return <CTABannerDefaultComponent />;

  const hasBgImage = fields.BackgroundImage?.value?.src || isEditing;

  if (hasBgImage) {
    return (
      <div className={cn('component cta-banner', styles)} id={RenderingIdentifier}>
        <section
          className="relative w-full overflow-hidden"
          style={{ backgroundColor: 'var(--brand-secondary, #1A0F3D)' }}
        >
          <div className="mx-auto grid max-w-7xl items-center gap-8 px-4 py-12 md:grid-cols-2 md:px-6 md:py-16">
            <div className="text-left" style={{ color: 'var(--brand-secondary-foreground, #ffffff)' }}>
              {(fields.Title?.value || isEditing) && (
                <Text
                  field={fields.Title}
                  tag="h2"
                  className="text-2xl font-medium leading-tight sm:text-3xl md:text-4xl font-[var(--brand-heading-font,inherit)]"
                />
              )}
              {(fields.Description?.value || isEditing) && (
                <ContentSdkRichText
                  field={fields.Description}
                  className="mt-4 text-base font-light opacity-90 font-[var(--brand-body-font,inherit)]"
                />
              )}
              <div className="mt-8">
                <PrimaryButton
                  field={fields.PrimaryLink}
                  isEditing={isEditing}
                  className="rounded-[var(--brand-button-radius,9999px)] bg-[var(--brand-primary)] px-8 text-[var(--brand-primary-foreground)]"
                />
              </div>
            </div>
            <div className="relative aspect-video overflow-hidden rounded-[var(--brand-card-radius,0.5rem)]">
              <SmartMedia
                field={fields.BackgroundImage}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className={cn('component cta-banner', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-16 md:py-20"
        style={{
          backgroundColor: 'var(--brand-secondary, #1A0F3D)',
          color: 'var(--brand-secondary-foreground, #ffffff)',
        }}
      >
        <div className="mx-auto max-w-4xl text-center">
          {(fields.Title?.value || isEditing) && (
            <Text
              field={fields.Title}
              tag="h2"
              className="text-3xl font-medium leading-tight sm:text-4xl md:text-5xl font-[var(--brand-heading-font,inherit)]"
            />
          )}
          {(fields.Description?.value || isEditing) && (
            <ContentSdkRichText
              field={fields.Description}
              className="mt-4 text-lg font-light opacity-90 font-[var(--brand-body-font,inherit)]"
            />
          )}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <PrimaryButton
              field={fields.PrimaryLink}
              isEditing={isEditing}
              className="rounded-[var(--brand-button-radius,9999px)] bg-[var(--brand-primary)] px-8 py-3.5 text-[var(--brand-primary-foreground)]"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export const Minimal = ({ fields, params, page }: CTABannerProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  if (!fields) return <CTABannerDefaultComponent />;

  return (
    <div className={cn('component cta-banner', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-10"
        style={{ backgroundColor: 'var(--brand-muted, #f5f5f5)' }}
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 sm:flex-row sm:justify-between sm:px-6">
          <div className="flex-1">
            {(fields.Title?.value || isEditing) && (
              <Text
                field={fields.Title}
                tag="p"
                className="text-lg font-semibold font-[var(--brand-heading-font,inherit)]"
                style={{ color: 'var(--brand-fg, #111111)' }}
              />
            )}
            {(fields.Description?.value || isEditing) && (
              <ContentSdkRichText
                field={fields.Description}
                className="mt-1 text-sm font-[var(--brand-body-font,inherit)]"
                style={{ color: 'var(--brand-muted-foreground, #6b7280)' }}
              />
            )}
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <PrimaryButton
              field={fields.PrimaryLink}
              isEditing={isEditing}
              className="bg-[var(--brand-primary)] text-[var(--brand-primary-foreground)]"
            />
            {(fields.SecondaryLink?.value?.href || isEditing) && (
              <ContentSdkLink
                field={fields.SecondaryLink}
                className="text-sm font-medium underline underline-offset-4 transition-opacity hover:opacity-70"
                style={{ color: 'var(--brand-primary)' }}
              />
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

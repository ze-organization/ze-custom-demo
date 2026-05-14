import React, { JSX } from 'react';
import {
  Field,
  RichText as ContentSdkRichText,
  Text,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';

interface RichTextBlockFields {
  Title: Field<string>;
  Body: Field<string>;
}

type RichTextBlockProps = ComponentProps & {
  fields: RichTextBlockFields;
};

const RichTextBlockDefaultComponent = (): JSX.Element => (
  <div className="component rich-text-block">
    <div className="component-content">
      <span className="is-empty-hint">RichTextBlock</span>
    </div>
  </div>
);

/* ────────────────────────────────────────────
   Default — left-aligned, full container width
   ──────────────────────────────────────────── */
export const Default = ({ fields, params, page }: RichTextBlockProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  if (!fields) return <RichTextBlockDefaultComponent />;

  return (
    <div className={cn('component rich-text-block', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-12 md:py-16"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div className="mx-auto max-w-7xl">
          {(fields.Title?.value || isEditing) && (
            <Text
              field={fields.Title}
              tag="h2"
              className="mb-6 text-2xl font-bold md:text-3xl font-[var(--brand-heading-font,inherit)]"
              style={{ color: 'var(--brand-fg, #111111)' }}
            />
          )}
          {(fields.Body?.value || isEditing) && (
            <ContentSdkRichText
              field={fields.Body}
              className="prose prose-neutral max-w-none font-[var(--brand-body-font,inherit)]"
              style={{ color: 'var(--brand-fg, #111111)' }}
            />
          )}
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   Centered — centered text
   ──────────────────────────────────────────── */
export const Centered = ({ fields, params, page }: RichTextBlockProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  if (!fields) return <RichTextBlockDefaultComponent />;

  return (
    <div className={cn('component rich-text-block', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-12 md:py-16"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div className="mx-auto max-w-3xl text-center">
          {(fields.Title?.value || isEditing) && (
            <Text
              field={fields.Title}
              tag="h2"
              className="mb-6 text-2xl font-bold md:text-3xl font-[var(--brand-heading-font,inherit)]"
              style={{ color: 'var(--brand-fg, #111111)' }}
            />
          )}
          {(fields.Body?.value || isEditing) && (
            <ContentSdkRichText
              field={fields.Body}
              className="prose prose-neutral mx-auto max-w-none font-[var(--brand-body-font,inherit)]"
              style={{ color: 'var(--brand-fg, #111111)' }}
            />
          )}
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   Narrow — constrained width for long-form readability
   ──────────────────────────────────────────── */
export const Narrow = ({ fields, params, page }: RichTextBlockProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  if (!fields) return <RichTextBlockDefaultComponent />;

  return (
    <div className={cn('component rich-text-block', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-12 md:py-16"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div className="mx-auto max-w-2xl">
          {(fields.Title?.value || isEditing) && (
            <Text
              field={fields.Title}
              tag="h2"
              className="mb-6 text-2xl font-bold md:text-3xl font-[var(--brand-heading-font,inherit)]"
              style={{ color: 'var(--brand-fg, #111111)' }}
            />
          )}
          {(fields.Body?.value || isEditing) && (
            <ContentSdkRichText
              field={fields.Body}
              className="prose prose-neutral max-w-none font-[var(--brand-body-font,inherit)]"
              style={{ color: 'var(--brand-fg, #111111)' }}
            />
          )}
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   GlobalPayments — typography + layout aligned to globalpayments.com
   (theme scale: body 1.125rem / 1.625 lh, h2 2rem; value-prop band when title empty)
   ──────────────────────────────────────────── */
export const GlobalPayments = ({ fields, params, page }: RichTextBlockProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  if (!fields) return <RichTextBlockDefaultComponent />;

  const titleText = fields.Title?.value?.trim();
  const isValuePropBand = !titleText && Boolean(fields.Body?.value || isEditing);

  return (
    <div className={cn('component rich-text-block', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-[var(--gp-container-px,1rem)] py-[var(--gp-section-py,3rem)] sm:px-5 md:px-6 md:py-[var(--gp-section-py-md,4.5rem)]"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div
          className={cn(
            'mx-auto font-[var(--brand-body-font,inherit)]',
            isValuePropBand
              ? 'max-w-[47rem] text-center'
              : 'max-w-[52rem] text-left'
          )}
        >
          {(titleText || isEditing) && (
            <Text
              field={fields.Title}
              tag="h2"
              className="mb-6 text-[2rem] font-bold leading-[1.2] tracking-[-0.02em] text-[var(--brand-fg,#0a0a0a)] md:text-[2.25rem] md:leading-[1.15] font-[var(--brand-heading-font,inherit)]"
            />
          )}
          {(fields.Body?.value || isEditing) && (
            <ContentSdkRichText
              field={fields.Body}
              className={cn(
                'text-[1.125rem] leading-[1.625] text-[var(--brand-fg,#0a0a0a)]',
                '[&_p]:mb-4 [&_p:last-child]:mb-0',
                '[&_ul]:my-5 [&_ul]:list-disc [&_ul]:pl-[1.375rem] [&_ul]:marker:text-[var(--brand-fg,#0a0a0a)]',
                '[&_ol]:my-5 [&_ol]:list-decimal [&_ol]:pl-[1.375rem]',
                '[&_li]:mb-2 [&_li]:pl-1 [&_li]:text-[1.125rem] [&_li]:leading-[1.625]',
                '[&_strong]:font-semibold [&_b]:font-semibold',
                '[&_a]:font-medium [&_a]:text-[var(--brand-primary,#262aff)] [&_a]:underline [&_a]:underline-offset-[3px] hover:[&_a]:opacity-90',
                isValuePropBand &&
                  'text-[clamp(1.125rem,2.15vw,1.375rem)] leading-[1.55] font-medium tracking-[-0.01em]'
              )}
            />
          )}
        </div>
      </section>
    </div>
  );
};

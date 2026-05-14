import React, { JSX } from 'react';
import {
  Field,
  ImageField,
  NextImage as ContentSdkImage,
  RichText as ContentSdkRichText,
  Text,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';

interface StatItemFields {
  id: string;
  statValue: { jsonValue: Field<string> };
  statLabel: { jsonValue: Field<string> };
  statDescription: { jsonValue: Field<string> };
  statIcon: { jsonValue: ImageField };
}

interface TrustStatsRowDatasource {
  title: { jsonValue: Field<string> };
  eyebrowText: { jsonValue: Field<string> };
  children: {
    results: StatItemFields[];
  };
}

interface TrustStatsRowFields {
  data: {
    datasource: TrustStatsRowDatasource;
  };
}

type TrustStatsRowProps = ComponentProps & {
  fields: TrustStatsRowFields;
};

const TrustStatsRowDefaultComponent = (): JSX.Element => (
  <div className="component trust-stats-row">
    <div className="component-content">
      <span className="is-empty-hint">TrustStatsRow</span>
    </div>
  </div>
);

const SectionHeader = ({
  datasource,
  isEditing,
}: {
  datasource: TrustStatsRowDatasource;
  isEditing?: boolean;
}) => {
  const hasEyebrow = datasource.eyebrowText?.jsonValue?.value || isEditing;
  const hasTitle = datasource.title?.jsonValue?.value || isEditing;
  if (!hasEyebrow && !hasTitle) return null;
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center">
      {hasEyebrow && (
        <Text
          field={datasource.eyebrowText?.jsonValue}
          tag="span"
          className="mb-2 inline-block text-xs font-semibold uppercase tracking-wider"
          style={{ color: 'var(--brand-primary)' }}
        />
      )}
      {hasTitle && (
        <Text
          field={datasource.title?.jsonValue}
          tag="h2"
          className="text-3xl font-bold tracking-tight sm:text-4xl font-[var(--brand-heading-font,inherit)]"
          style={{ color: 'var(--brand-fg, #111111)' }}
        />
      )}
    </div>
  );
};

/* ────────────────────────────────────────────
   Default — big centered numbers, 4-column grid
   ──────────────────────────────────────────── */
export const Default = ({ fields, params, page }: TrustStatsRowProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <TrustStatsRowDefaultComponent />;
  const items = datasource.children?.results || [];

  return (
    <div className={cn('component trust-stats-row', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-16 md:py-24"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeader datasource={datasource} isEditing={isEditing} />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <div key={item.id} className="text-center">
                {(item.statValue?.jsonValue?.value || isEditing) && (
                  <Text
                    field={item.statValue?.jsonValue}
                    tag="p"
                    className="text-4xl font-bold md:text-5xl font-[var(--brand-heading-font,inherit)]"
                    style={{ color: 'var(--brand-primary)' }}
                  />
                )}
                {(item.statLabel?.jsonValue?.value || isEditing) && (
                  <Text
                    field={item.statLabel?.jsonValue}
                    tag="p"
                    className="mt-2 text-sm font-medium font-[var(--brand-body-font,inherit)]"
                    style={{ color: 'var(--brand-fg, #111111)' }}
                  />
                )}
                {(item.statDescription?.jsonValue?.value || isEditing) && (
                  <ContentSdkRichText
                    field={item.statDescription?.jsonValue}
                    className="mt-1 text-xs opacity-60 font-[var(--brand-body-font,inherit)]"
                    style={{ color: 'var(--brand-fg, #111111)' }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   WithIcons — icon above each stat number
   ──────────────────────────────────────────── */
export const WithIcons = ({ fields, params, page }: TrustStatsRowProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <TrustStatsRowDefaultComponent />;
  const items = datasource.children?.results || [];

  return (
    <div className={cn('component trust-stats-row', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-16 md:py-24"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeader datasource={datasource} isEditing={isEditing} />
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col items-center text-center">
                {(item.statIcon?.jsonValue?.value?.src || isEditing) && (
                  <div className="mb-3 h-12 w-12 overflow-hidden">
                    <ContentSdkImage
                      field={item.statIcon?.jsonValue}
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
                {(item.statValue?.jsonValue?.value || isEditing) && (
                  <Text
                    field={item.statValue?.jsonValue}
                    tag="p"
                    className="text-4xl font-bold md:text-5xl font-[var(--brand-heading-font,inherit)]"
                    style={{ color: 'var(--brand-primary)' }}
                  />
                )}
                {(item.statLabel?.jsonValue?.value || isEditing) && (
                  <Text
                    field={item.statLabel?.jsonValue}
                    tag="p"
                    className="mt-2 text-sm font-medium font-[var(--brand-body-font,inherit)]"
                    style={{ color: 'var(--brand-fg, #111111)' }}
                  />
                )}
                {(item.statDescription?.jsonValue?.value || isEditing) && (
                  <ContentSdkRichText
                    field={item.statDescription?.jsonValue}
                    className="mt-1 text-xs opacity-60 font-[var(--brand-body-font,inherit)]"
                    style={{ color: 'var(--brand-fg, #111111)' }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

/* ────────────────────────────────────────────
   LogoRow — images/logos as primary visual, StatValue hidden
   ──────────────────────────────────────────── */
export const LogoRow = ({ fields, params, page }: TrustStatsRowProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <TrustStatsRowDefaultComponent />;
  const items = datasource.children?.results || [];

  return (
    <div className={cn('component trust-stats-row', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-4 py-12 md:py-16"
        style={{ backgroundColor: 'var(--brand-muted, #f5f5f5)' }}
      >
        <div className="mx-auto max-w-7xl">
          <SectionHeader datasource={datasource} isEditing={isEditing} />
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
            {items.map((item) => (
              <div key={item.id} className="flex flex-col items-center">
                {(item.statIcon?.jsonValue?.value?.src || isEditing) && (
                  <div className="h-12 w-auto overflow-hidden opacity-60 grayscale transition-all hover:opacity-100 hover:grayscale-0">
                    <ContentSdkImage
                      field={item.statIcon?.jsonValue}
                      className="h-full w-auto object-contain"
                    />
                  </div>
                )}
                {(item.statLabel?.jsonValue?.value || isEditing) && (
                  <Text
                    field={item.statLabel?.jsonValue}
                    tag="p"
                    className="mt-2 text-xs font-medium opacity-50 font-[var(--brand-body-font,inherit)]"
                    style={{ color: 'var(--brand-fg, #111111)' }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

/* GlobalPayments — stat band on royal panel (globalpayments.com trust strip) */
export const GlobalPayments = ({ fields, params, page }: TrustStatsRowProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const datasource = fields?.data?.datasource;
  if (!datasource) return <TrustStatsRowDefaultComponent />;
  const items = datasource.children?.results || [];

  const bandBg = 'var(--gp-stat-band-bg, var(--brand-dark, #0033a0))';
  const bandFg = 'var(--gp-stat-band-fg, #ffffff)';
  const bandMuted = 'var(--gp-stat-band-muted, rgba(255,255,255,0.78))';

  return (
    <div className={cn('component trust-stats-row', styles)} id={RenderingIdentifier}>
      <section
        className="w-full px-[var(--gp-container-px,1.5rem)] py-12 md:py-[4.5rem]"
        style={{ backgroundColor: bandBg, color: bandFg }}
      >
        <div className="mx-auto max-w-[var(--gp-container-max,84rem)]">
          {(datasource.eyebrowText?.jsonValue?.value ||
            datasource.title?.jsonValue?.value ||
            isEditing) && (
            <div className="mx-auto mb-10 max-w-[48rem] text-center md:mb-14">
              {(datasource.eyebrowText?.jsonValue?.value || isEditing) && (
                <Text
                  field={datasource.eyebrowText?.jsonValue}
                  tag="span"
                  className="mb-3 inline-block text-[0.6875rem] font-semibold uppercase tracking-[0.22em] text-white/85 sm:text-xs"
                />
              )}
              {(datasource.title?.jsonValue?.value || isEditing) && (
                <Text
                  field={datasource.title?.jsonValue}
                  tag="h2"
                  className="text-[1.75rem] font-bold leading-[1.15] tracking-[-0.02em] text-white sm:text-[2rem] md:text-[2.25rem] font-[var(--brand-heading-font,inherit)]"
                />
              )}
            </div>
          )}
          <div className="grid grid-cols-2 gap-x-4 gap-y-12 lg:grid-cols-4 lg:gap-x-0 lg:gap-y-0">
            {items.map((item, index) => (
              <div
                key={item.id}
                className={cn(
                  'px-2 text-center sm:px-3 lg:px-6',
                  index > 0 && 'lg:border-l lg:border-white/20'
                )}
              >
                {(item.statValue?.jsonValue?.value || isEditing) && (
                  <Text
                    field={item.statValue?.jsonValue}
                    tag="p"
                    className="text-[clamp(2.125rem,4vw,3.25rem)] font-extrabold leading-none tracking-[-0.035em] text-white font-[var(--brand-heading-font,inherit)]"
                  />
                )}
                {(item.statLabel?.jsonValue?.value || isEditing) && (
                  <Text
                    field={item.statLabel?.jsonValue}
                    tag="p"
                    className="mt-3 text-[0.6875rem] font-semibold uppercase leading-snug tracking-[0.2em] text-white/95 sm:text-xs"
                  />
                )}
                {(item.statDescription?.jsonValue?.value || isEditing) && (
                  <ContentSdkRichText
                    field={item.statDescription?.jsonValue}
                    className="mt-2 text-[0.9375rem] leading-[1.45] font-[var(--brand-body-font,inherit)] [&_p]:mb-0"
                    style={{ color: bandMuted }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

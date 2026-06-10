import React, { JSX } from 'react';
import {
  Field,
  ImageField,
  LinkField,
  RichText as ContentSdkRichText,
  RichTextField,
  NextImage as ContentSdkImage,
  Link as ContentSdkLink,
  Text,
} from '@sitecore-content-sdk/nextjs';
import { ComponentProps } from 'lib/component-props';
import { cn } from '@/lib/utils';
import { PersonReference } from 'src/Layout';

interface ArticleBodyRouteFields {
  ArticleContent?: RichTextField;
  ArticleKeyTakeaways?: RichTextField;
  ArticleAuthor?: PersonReference;
}

const ArticleBodyDefaultComponent = (): JSX.Element => (
  <div className="component article-body">
    <div className="component-content">
      <span className="is-empty-hint">ArticleBody</span>
    </div>
  </div>
);

function getRouteFields(page: ComponentProps['page']): ArticleBodyRouteFields | null {
  const fields = page?.layout?.sitecore?.route?.fields;
  return fields ? (fields as unknown as ArticleBodyRouteFields) : null;
}

function KeyTakeaways({
  field,
  isEditing,
}: {
  field?: RichTextField;
  isEditing?: boolean;
}) {
  if (!field?.value && !isEditing) return null;

  return (
    <aside
      className="mb-10 rounded-lg border-l-4 border-blue-500 bg-blue-50 p-6"
      data-testid="key-takeaways"
    >
      <h2 className="mb-3 text-lg font-semibold text-blue-900">Key Takeaways</h2>
      <ContentSdkRichText
        field={field}
        className="prose prose-sm max-w-none text-blue-800"
      />
    </aside>
  );
}

function CoveoArticleSidebar({
  field,
  isEditing,
}: {
  field?: RichTextField;
  isEditing?: boolean;
}) {
  if (!field?.value && !isEditing) return null;

  return (
    <aside
      className="rounded-xl border p-5 md:sticky md:top-8 md:self-start"
      style={{
        borderColor: 'var(--brand-border, #E5E7EB)',
        backgroundColor: 'var(--brand-bg, #ffffff)',
      }}
      data-testid="coveo-article-sidebar"
    >
      <h2
        className="mb-4 text-sm font-semibold uppercase tracking-wide"
        style={{ color: 'var(--brand-fg, #0E0F12)' }}
      >
        Inside this article:
      </h2>
      <ContentSdkRichText
        field={field}
        className="coveo-article-toc prose prose-sm max-w-none font-[var(--brand-body-font,inherit)] [&_a]:font-medium [&_a]:no-underline [&_a]:hover:underline [&_li]:my-1.5 [&_ul]:list-none [&_ul]:space-y-1 [&_ul]:pl-0"
        style={{ color: 'var(--brand-muted-fg, #5C6370)' }}
      />
    </aside>
  );
}

const coveoProseClassName =
  'coveo-article-prose prose prose-lg max-w-none font-[var(--brand-body-font,inherit)] prose-headings:font-medium prose-headings:tracking-tight prose-h2:mt-12 prose-h2:mb-4 prose-h2:text-2xl prose-h2:md:text-3xl prose-h3:mt-8 prose-h3:mb-3 prose-h3:text-xl prose-p:leading-relaxed prose-p:text-[var(--brand-fg,#0E0F12)] prose-a:font-medium prose-a:no-underline prose-a:hover:underline prose-blockquote:border-l-4 prose-blockquote:border-[var(--brand-accent,#00A5B5)] prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:text-[var(--brand-muted-fg,#5C6370)] prose-strong:font-semibold prose-strong:text-[var(--brand-fg,#0E0F12)] prose-li:marker:text-[var(--brand-accent,#00A5B5)]';

function AuthorBio({
  author,
  isEditing,
}: {
  author?: PersonReference;
  isEditing?: boolean;
}) {
  if (!author?.fields && !isEditing) return null;
  const fields = author?.fields;

  return (
    <div
      className="mt-12 border-t pt-8"
      data-testid="author-bio"
    >
      <div className="flex items-start gap-5">
        {(fields?.personProfileImage?.value?.src || isEditing) && (
          <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full">
            <ContentSdkImage
              field={fields?.personProfileImage as ImageField}
              className="h-full w-full object-cover"
              width={64}
              height={64}
            />
          </div>
        )}
        <div className="flex-1">
          {(fields?.personFirstName?.value || fields?.personLastName?.value || isEditing) && (
            <p className="text-lg font-semibold" data-testid="author-bio-name">
              {fields?.personFirstName?.value} {fields?.personLastName?.value}
            </p>
          )}
          {(fields?.personJobTitle?.value || isEditing) && (
            <Text
              field={fields?.personJobTitle as Field<string>}
              tag="p"
              className="text-sm text-gray-500"
              data-testid="author-bio-title"
            />
          )}
          {(fields?.personBio?.value || isEditing) && (
            <ContentSdkRichText
              field={fields?.personBio as RichTextField}
              className="mt-2 text-sm text-gray-600"
              data-testid="author-bio-text"
            />
          )}
          {(fields?.personLinkedIn?.value?.href || isEditing) && (
            <ContentSdkLink
              field={fields?.personLinkedIn as LinkField}
              className="mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-800"
              data-testid="author-bio-linkedin"
            />
          )}
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────
   Default — narrow centered column, takeaways above, bio below
   ──────────────────────────────────────────── */
export const Default = ({ params, page }: ComponentProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const routeFields = getRouteFields(page);

  if (!routeFields) return <ArticleBodyDefaultComponent />;

  const { ArticleContent, ArticleKeyTakeaways, ArticleAuthor } = routeFields;

  return (
    <div className={cn('component article-body', styles)} id={RenderingIdentifier}>
      <article className="mx-auto max-w-3xl px-4 py-12 md:py-16">
        <KeyTakeaways field={ArticleKeyTakeaways} isEditing={isEditing} />

        {(ArticleContent?.value || isEditing) && (
          <ContentSdkRichText
            field={ArticleContent}
            className="prose prose-lg max-w-none"
            data-testid="article-content"
          />
        )}

        <AuthorBio author={ArticleAuthor} isEditing={isEditing} />
      </article>
    </div>
  );
};

/* ────────────────────────────────────────────
   WithSidebar — body left (~65%), sticky sidebar right
   ──────────────────────────────────────────── */
export const WithSidebar = ({ params, page }: ComponentProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const routeFields = getRouteFields(page);

  if (!routeFields) return <ArticleBodyDefaultComponent />;

  const { ArticleContent, ArticleKeyTakeaways, ArticleAuthor } = routeFields;

  return (
    <div className={cn('component article-body', styles)} id={RenderingIdentifier}>
      <div className="mx-auto max-w-7xl px-4 py-12 md:py-16">
        <div className="grid gap-10 md:grid-cols-[1fr_340px]">
          {/* Main content */}
          <article>
            {(ArticleContent?.value || isEditing) && (
              <ContentSdkRichText
                field={ArticleContent}
                className="prose prose-lg max-w-none"
                data-testid="article-content"
              />
            )}
          </article>

          {/* Sidebar */}
          <aside className="md:sticky md:top-8 md:self-start" data-testid="article-sidebar">
            <KeyTakeaways field={ArticleKeyTakeaways} isEditing={isEditing} />
            <AuthorBio author={ArticleAuthor} isEditing={isEditing} />
          </aside>
        </div>
      </div>
    </div>
  );
};

/* ────────────────────────────────────────────
   Wide — full-width body, inline takeaways, full-width author bio
   ──────────────────────────────────────────── */
export const Wide = ({ params, page }: ComponentProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const routeFields = getRouteFields(page);

  if (!routeFields) return <ArticleBodyDefaultComponent />;

  const { ArticleContent, ArticleKeyTakeaways, ArticleAuthor } = routeFields;

  return (
    <div className={cn('component article-body', styles)} id={RenderingIdentifier}>
      <article className="px-4 py-12 md:py-16">
        <div className="mx-auto max-w-7xl">
          <KeyTakeaways field={ArticleKeyTakeaways} isEditing={isEditing} />

          {(ArticleContent?.value || isEditing) && (
            <ContentSdkRichText
              field={ArticleContent}
              className="prose prose-lg max-w-none"
              data-testid="article-content"
            />
          )}
        </div>

        {/* Full-width author bio band */}
        {(ArticleAuthor?.fields || isEditing) && (
          <div className="mt-12 bg-gray-50 px-4 py-10" data-testid="author-bio-band">
            <div className="mx-auto max-w-3xl">
              <AuthorBio author={ArticleAuthor} isEditing={isEditing} />
            </div>
          </div>
        )}
      </article>
    </div>
  );
};

/* ────────────────────────────────────────────
   Coveo — blog body: prose column + sticky "Inside this article" sidebar
   ──────────────────────────────────────────── */
export const Coveo = ({ params, page }: ComponentProps): JSX.Element => {
  const { styles, RenderingIdentifier } = params;
  const isEditing = page?.mode?.isEditing;
  const routeFields = getRouteFields(page);

  if (!routeFields) return <ArticleBodyDefaultComponent />;

  const { ArticleContent, ArticleKeyTakeaways, ArticleAuthor } = routeFields;
  const hasSidebar = Boolean(ArticleKeyTakeaways?.value || isEditing);

  return (
    <div className={cn('component article-body', styles)} id={RenderingIdentifier}>
      <div
        className="w-full px-4 py-10 md:py-14"
        style={{ backgroundColor: 'var(--brand-bg, #ffffff)' }}
      >
        <div
          className={cn(
            'mx-auto max-w-7xl',
            hasSidebar ? 'grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]' : 'max-w-3xl'
          )}
        >
          <article>
            {(ArticleContent?.value || isEditing) && (
              <ContentSdkRichText
                field={ArticleContent}
                className={coveoProseClassName}
                style={{ color: 'var(--brand-fg, #0E0F12)' }}
                data-testid="article-content"
              />
            )}

            {(ArticleAuthor?.fields || isEditing) && (
              <div
                className="mt-14 border-t pt-10"
                style={{ borderColor: 'var(--brand-border, #E5E7EB)' }}
              >
                <AuthorBio author={ArticleAuthor} isEditing={isEditing} />
              </div>
            )}
          </article>

          {hasSidebar && (
            <CoveoArticleSidebar field={ArticleKeyTakeaways} isEditing={isEditing} />
          )}
        </div>
      </div>
    </div>
  );
};

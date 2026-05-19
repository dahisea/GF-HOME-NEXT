import { i18nConfig, type Lang } from '$i18n';
import { siteConfig, siteUrl, ogImageUrl } from '$lib/config';

export interface PageMeta {
	title: string;
	description: string;
	keywords?: string;
	canonical?: string;
	og?: {
		title?: string;
		description?: string;
		type?: string;
		image?: string;
		url?: string;
	};
	twitter?: {
		card?: string;
		title?: string;
		description?: string;
		image?: string;
	};
	jsonLd?: Record<string, unknown>;
}

export function generateMeta(
	lang: Lang,
	pageMeta: PageMeta,
	origin: string,
	pathname: string
): Record<string, string | null> {
	const canonical = pageMeta.canonical || `${origin}${pathname}`;
	const ogTitle = pageMeta.og?.title || pageMeta.title;
	const ogDesc = pageMeta.og?.description || pageMeta.description;

	return {
		title: pageMeta.title,
		'description': pageMeta.description,
		'keywords': pageMeta.keywords || siteConfig.keywords.join(', '),
		'canonical': canonical,
		'generator': 'SvelteKit',
		'og:title': ogTitle,
		'og:description': ogDesc,
		'og:type': pageMeta.og?.type || 'website',
		'og:url': pageMeta.og?.url || canonical,
		'og:image': pageMeta.og?.image || ogImageUrl(),
		'og:site_name': siteConfig.name,
		'twitter:card': pageMeta.twitter?.card || 'summary',
		'twitter:title': pageMeta.twitter?.title || ogTitle,
		'twitter:description': pageMeta.twitter?.description || ogDesc,
		'twitter:image': pageMeta.twitter?.image || ogImageUrl(),
		'twitter:site': siteConfig.seo.twitterHandle
	};
}

/**
 * Generate hreflang alternates including x-default pointing to default lang.
 */
export function generateHreflang(origin: string, pathname: string): Array<{ lang: string; url: string }> {
	const cleanPath = pathname.replace(/^\/[^/]+/, '') || '/';
	const entries: Array<{ lang: string; url: string }> = [];

	// Per-language alternates
	for (const lang of i18nConfig.supportedLangs) {
		entries.push({
			lang: i18nConfig.langNames[lang],
			url: `${origin}/${lang}${cleanPath}`
		});
	}

	// x-default pointing to default language
	entries.push({
		lang: 'x-default',
		url: `${origin}/${i18nConfig.defaultLang}${cleanPath}`
	});

	return entries;
}

/**
 * JSON-LD Organization schema using siteConfig values.
 */
export function generateOrganizationJsonLd(origin: string): Record<string, unknown> {
	return {
		'@context': 'https://schema.org',
		'@type': 'Organization',
		name: siteConfig.name,
		url: origin,
		logo: ogImageUrl(),
		description: siteConfig.tagline,
		sameAs: [
			siteConfig.github.repo,
			siteConfig.github.gfHomeSvelteKit
		]
	};
}

/**
 * JSON-LD WebSite schema for the root site entity.
 */
export function generateWebSiteJsonLd(origin: string): Record<string, unknown> {
	return {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name: siteConfig.name,
		url: origin,
		description: siteConfig.tagline,
		inLanguage: i18nConfig.supportedLangs.map(l => i18nConfig.langNames[l]),
		potentialAction: {
			'@type': 'SearchAction',
			target: {
				'@type': 'EntryPoint',
				urlTemplate: `${origin}/{lang}/search?q={search_term_string}`
			},
			'query-input': 'required name=search_term_string'
		}
	};
}

/**
 * JSON-LD WebPage schema with breadcrumb when relevant.
 */
export function generateWebPageJsonLd(
	origin: string,
	pathname: string,
	title: string,
	description: string
): Record<string, unknown> {
	const breadcrumb = buildBreadcrumb(origin, pathname, title);

	const result: Record<string, unknown> = {
		'@context': 'https://schema.org',
		'@type': 'WebPage',
		name: title,
		description,
		url: `${origin}${pathname}`,
		isPartOf: {
			'@type': 'WebSite',
			name: siteConfig.name,
			url: origin
		}
	};

	if (breadcrumb) {
		result['breadcrumb'] = breadcrumb;
	}

	return result;
}

/**
 * Build breadcrumb JSON-LD from pathname.
 * Returns null for the homepage (no breadcrumb).
 */
function buildBreadcrumb(origin: string, pathname: string, title: string): Record<string, unknown> | null {
	const cleanPath = pathname.replace(/^\/[^/]+/, '');
	if (!cleanPath || cleanPath === '/') return null;

	const segments = cleanPath.split('/').filter(Boolean);
	if (segments.length === 0) return null;

	const itemListElement = [
		{
			'@type': 'ListItem',
			position: 1,
			name: 'Home',
			item: origin
		}
	];

	// Build chain: each segment adds a position
	let pathSoFar = origin;
	for (let i = 0; i < segments.length; i++) {
		pathSoFar = `${pathSoFar}/${segments[i]}`;
		itemListElement.push({
			'@type': 'ListItem',
			position: i + 2,
			name: i === segments.length - 1 ? title : capitalize(segments[i]),
			item: pathSoFar
		});
	}

	return {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		itemListElement
	};
}

function capitalize(s: string): string {
	return s.charAt(0).toUpperCase() + s.slice(1);
}

/**
 * DNS prefetch & preconnect hints for CDN domains.
 * Returns empty array when cdn.enabled=false.
 */
export function generateCdnHints(): string[] {
	if (!siteConfig.cdn.enabled) return [];
	const hints = [
		siteConfig.cdn.static,
		siteConfig.cdn.siteProxy
	];
	return hints.filter(Boolean);
}
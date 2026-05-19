import { i18nConfig, type Lang } from '$i18n';
import { siteConfig, shouldShowAds } from '$lib/config';
import {
	generateMeta,
	generateHreflang,
	generateOrganizationJsonLd,
	generateWebSiteJsonLd
} from '$utils/seo';
import type { LayoutServerLoad } from './$types';

export const prerender = true;

export const load: LayoutServerLoad = ({ url, params }) => {
	const lang = (params.lang as Lang) || i18nConfig.defaultLang;
	const origin = url.origin;
	const pathname = url.pathname;

	const pageTitle = siteConfig.name;
	const pageDesc = siteConfig.description[lang] || siteConfig.description['en'];

	const meta = generateMeta(
		lang,
		{
			title: pageTitle,
			description: pageDesc,
			keywords: siteConfig.keywords.join(', ')
		},
		origin,
		pathname
	);

	const hreflang = generateHreflang(origin, pathname);
	const orgJsonLd = generateOrganizationJsonLd(origin);
	const siteJsonLd = generateWebSiteJsonLd(origin);

	return {
		lang,
		showAds: shouldShowAds(lang),
		meta,
		hreflang,
		jsonLd: [orgJsonLd, siteJsonLd]
	};
};
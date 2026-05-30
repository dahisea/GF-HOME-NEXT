import { t } from '$i18n';
import { siteConfig } from '$lib/config';
import { generateMeta, generateHreflang, generateWebPageJsonLd } from '$utils/seo';
import type { PageServerLoad } from './$types';

export const prerender = true;

export const load: PageServerLoad = ({ url, params }) => {
	const lang = params.lang;
	const origin = siteConfig.url;
	const pathname = url.pathname;

	const pageDesc = siteConfig.description[lang as keyof typeof siteConfig.description] || siteConfig.description['en'];

	return {
		lang,
		meta: generateMeta(
			lang,
			{
				title: `${siteConfig.name} - ${siteConfig.tagline}`,
				description: pageDesc,
				keywords: siteConfig.keywords.join(', ')
			},
			origin,
			pathname
		),
		hreflang: generateHreflang(origin, pathname),
		jsonLd: generateWebPageJsonLd(origin, pathname, `${siteConfig.name} - ${siteConfig.tagline}`, pageDesc)
	};
};
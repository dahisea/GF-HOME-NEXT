import { t } from '$i18n';
import { siteConfig } from '$lib/config';
import { generateMeta, generateHreflang, generateWebPageJsonLd } from '$utils/seo';
import type { PageServerLoad } from './$types';

export const prerender = true;

export const load: PageServerLoad = ({ url, params }) => {
	const lang = params.lang;
	const origin = siteConfig.url;
	const pathname = url.pathname;

	return {
		lang,
		meta: generateMeta(
			lang,
			{
				title: `${t(lang, 'meta.applist_title') as string} — ${siteConfig.name}`,
				description: t(lang, 'meta.applist_desc') as string,
				keywords: 'applist, userscript, manager, tampermonkey, violentmonkey, greasemonkey, scriptcat'
			},
			origin,
			pathname
		),
		hreflang: generateHreflang(origin, pathname),
		jsonLd: generateWebPageJsonLd(origin, pathname, t(lang, 'meta.applist_title') as string, t(lang, 'meta.applist_desc') as string)
	};
};
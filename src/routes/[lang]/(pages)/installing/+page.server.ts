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
				title: `${t(lang, 'meta.installing_title') as string} — ${siteConfig.name}`,
				description: t(lang, 'meta.installing_desc') as string,
				keywords: 'install, userscript, tampermonkey, violentmonkey, greasemonkey, scriptcat, setup'
			},
			origin,
			pathname
		),
		hreflang: generateHreflang(origin, pathname),
		jsonLd: generateWebPageJsonLd(origin, pathname, t(lang, 'meta.installing_title') as string, t(lang, 'meta.installing_desc') as string)
	};
};
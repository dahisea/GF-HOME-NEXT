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
				title: `${t(lang, 'meta.about_title')} — ${siteConfig.name}`,
				description: t(lang, 'meta.about_desc'),
				keywords: 'about, gfork, proxy, greasyfork, userscript, accelerator, CDN'
			},
			origin,
			pathname
		),
		hreflang: generateHreflang(origin, pathname),
		jsonLd: generateWebPageJsonLd(origin, pathname, t(lang, 'meta.about_title'), t(lang, 'meta.about_desc'))
	};
};
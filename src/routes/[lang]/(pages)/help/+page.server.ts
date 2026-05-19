import { t } from '$i18n';
import { siteConfig } from '$lib/config';
import { generateMeta, generateHreflang, generateWebPageJsonLd } from '$utils/seo';
import type { PageServerLoad } from './$types';

export const prerender = true;

export const load: PageServerLoad = ({ url, params }) => {
	const lang = params.lang;
	const origin = url.origin;
	const pathname = url.pathname;

	return {
		lang,
		meta: generateMeta(
			lang,
			{
				title: `${t(lang, 'meta.help_title')} — ${siteConfig.name}`,
				description: t(lang, 'meta.help_desc'),
				keywords: 'help, userscript, tampermonkey, greasyfork, install, guide, tutorial'
			},
			origin,
			pathname
		),
		hreflang: generateHreflang(origin, pathname),
		jsonLd: generateWebPageJsonLd(origin, pathname, t(lang, 'meta.help_title'), t(lang, 'meta.help_desc'))
	};
};
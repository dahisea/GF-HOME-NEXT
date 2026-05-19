<script lang="ts">
	import { t, type Lang } from '$i18n';
	import { siteConfig } from '$lib/config';
	import AdSense from '$components/AdSense.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let lang: Lang = $derived(data.lang);
	let showAds = $derived(data.showAds);
</script>

<svelte:head>
	<title>{t(lang, 'meta.help_title')}</title>
	<meta name="description" content={t(lang, 'meta.help_desc')} />
</svelte:head>

<div class="width-constraint" style="padding-top:32px;padding-bottom:32px">
	<section class="text-content">
		<h3>Usage</h3>
		<ul>
			<li><a href="/{lang}/installing">{t(lang, 'help.install_guide')}</a></li>
			<li><a href="/{lang}/feedback">{t(lang, 'help.feedback')}</a></li>
			<li><a href="https://doc.greasyfork.org.cn" target="_blank" rel="noopener noreferrer">{t(lang, 'help.docs')}</a></li>
			<li><a href="https://www.tampermonkey.net/faq.php" target="_blank" rel="noopener noreferrer">{t(lang, 'help.tampermonkey')}</a></li>
			<li><a href="https://wiki.greasemonkey.net/Troubleshooting_(Users)" target="_blank" rel="noopener noreferrer">{t(lang, 'help.greasemonkey')}</a></li>
		</ul>
		<p>
			{t(lang, 'help.opensource')}
			<a href="https://github.com/greasfork-org/greasyfork" target="_blank" rel="noopener noreferrer">
				{t(lang, 'help.opensource_link')}
			</a>。
		</p>
	</section>

	{#if showAds}
		<div style="margin-top:24px">
			<AdSense slot={siteConfig.adsense.slots.autoRelaxed} format="autorelaxed" />
		</div>
	{/if}
</div>

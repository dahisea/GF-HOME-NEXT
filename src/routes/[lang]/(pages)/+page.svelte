<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { t, type Lang } from '$i18n';
	import AdSense from '$components/AdSense.svelte';
	import { siteConfig, siteUrl, staticUrl, shouldShowAds } from '$lib/config';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let lang: Lang = $derived(data.lang);

	let inputUrl = $state('');
	let outputUrl = $state('');
	let urlError = $state('');

	function replaceUrl() {
		const url = inputUrl.trim();
		urlError = '';
		outputUrl = '';

		if (!/greasyfork\.org|sleazyfork\.org/.test(url)) {
			urlError = t(lang, 'home.url_tool.error');
			return;
		}

		let result = url;
		siteConfig.urlRewriteRules.forEach(({ from, to }) => {
			result = result.replace(from, to);
		});
		outputUrl = result;
	}

	// ─── Page section enter animation (IntersectionObserver) ──────────
	import { onMount } from 'svelte';
	let sectionRefs: HTMLElement[] = [];

	function observeSections(node: HTMLElement) {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add('md3-animate-enter');
						observer.unobserve(entry.target);
					}
				});
			},
			{ threshold: 0.1 }
		);
		node.querySelectorAll('.page-section--centered, .text-content').forEach((el) => {
			(el as HTMLElement).style.opacity = '0';
			(el as HTMLElement).style.transform = 'translateY(24px)';
			observer.observe(el);
		});
		return { destroy: () => observer.disconnect() };
	}
</script>

<svelte:head>
	<title>{t(lang, 'meta.home_title')}</title>
	<meta name="description" content={t(lang, 'meta.home_desc')} />
</svelte:head>

<div class="width-constraint" use:observeSections>
	<!-- Hero Search Section -->
	<section class="page-section--centered" style="margin-top:48px;margin-bottom:32px">
		<h2 class="headline-medium" style="text-align:center;margin-bottom:24px">{t(lang, 'home.super_title')}</h2>
		<form class="home-search" action="/{lang}/s" accept-charset="UTF-8" method="get" style="display:flex;justify-content:center" onsubmit={e => { e.preventDefault(); const fd = new FormData(e.currentTarget as HTMLFormElement); const q = fd.get('q') as string || ''; const sort = fd.get('sort') as string || ''; const fl = fd.get('filter_locale') as string || '0'; let url = `/${lang}/s?q=${encodeURIComponent(q)}`; if (sort) url += `&sort=${encodeURIComponent(sort)}`; if (fl) url += `&filter_locale=${encodeURIComponent(fl)}`; goto(url); }}>
			<div class="md3-search-bar" style="max-width:560px">
				<input type="search" name="q" placeholder={t(lang, 'search.placeholder')} required />
				<input type="hidden" name="sort" value="" />
				<input type="hidden" name="filter_locale" value="0" />
				<button type="submit" class="search-icon-btn md3-ripple" aria-label={t(lang, 'search.button')}>
					<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
					</svg>
				</button>
			</div>
		</form>

		{#if shouldShowAds(lang)}
			<div style="margin-top:24px">
				<AdSense slot={siteConfig.adsense.slots.homepageAuto} format="autorelaxed" />
			</div>
		{/if}
	</section>

	<!-- Intro Section -->
	<section class="text-content" style="text-align:center">
		<img src="/img/gforkg.svg" alt="site-logo" loading="lazy" style="height:180px;user-select:none;pointer-events:none" />
		<p style="margin-top:16px;color:var(--md-sys-color-on-surface-variant)">{t(lang, 'home.intro')}</p>
	</section>

	<!-- ScriptCat Recommend Section (Chinese only) -->
	{#if lang === 'zh-hans' || lang === 'zh-hant'}
		<section class="text-content" style="text-align:center;font-size:0.8em;color:var(--md-sys-color-on-surface-variant)">
			<p>
				{t(lang, 'home.recommend')}
				<a href="https://www.coolapk.com/link/?url=https://bbs.tampermonkey.net.cn/forum.php" target="_blank" rel="noopener noreferrer">{t(lang, 'home.recommend.link1')}</a>
				{t(lang, 'home.recommend.link2')}
			</p>
		</section>
	{/if}

	<!-- Fluid Ad (en/ja only, below ScriptCat section area) -->
	{#if shouldShowAds(lang)}
		<section class="text-content" style="text-align:center">
			<AdSense slot={siteConfig.adsense.slots.homepageFluid} format="fluid" layoutKey={siteConfig.adsense.fluidLayoutKey} />
		</section>
	{/if}

	<!-- URL Tool Section -->
	<section class="text-content" style="text-align:center">
		<p style="margin-bottom:12px;font-weight:500">{t(lang, 'home.url_tool.title')}</p>
		<div style="display:flex;flex-direction:column;gap:8px;max-width:560px;margin:0 auto 16px">
			<input type="search" id="inputUrl" bind:value={inputUrl} placeholder={t(lang, 'home.url_tool.placeholder')}
				style="padding:10px 16px;border:1px solid var(--md-sys-color-outline-variant);border-radius:var(--md-sys-shape-corner-full);font-family:inherit;font-size:14px;background:var(--md-sys-color-surface-container-highest);outline:none;color:var(--md-sys-color-on-surface)" />
			<button onclick={replaceUrl} class="md3-button md3-ripple">{t(lang, 'home.url_tool.button')}</button>
		</div>
		<p class="text-gf-muted">{t(lang, 'home.url_tool.result')}</p>
		{#if outputUrl}
			<p id="outputUrl" style="word-break:break-all;font-family:monospace;background:var(--md-sys-color-surface-container-highest);padding:10px 16px;border-radius:var(--md-sys-shape-corner-small);margin-top:8px;font-size:13px">{outputUrl}</p>
		{/if}
		{#if urlError}
			<p id="errorMessage" style="color:var(--md-sys-color-error);margin-top:8px">{urlError}</p>
		{/if}
	</section>

	<!-- TOS & Installing Links -->
	<section class="text-content" style="text-align:center">
		<div style="display:flex;align-items:center;justify-content:center;gap:16px;flex-wrap:wrap">
			<span>{t(lang, 'home.tos_agree')}</span>
			<a href="/{lang}/tos" class="md3-tonal-button md3-ripple" data-sveltekit-preload-data="hover">{t(lang, 'home.tos_link')}</a>
		</div>
		<div style="margin-top:16px">
			<a href="/{lang}/installing" class="md3-tonal-button md3-ripple" data-sveltekit-preload-data="hover">{t(lang, 'home.installing_link')}</a>
		</div>
	</section>
</div>

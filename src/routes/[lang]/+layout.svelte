<script lang="ts">
	import { page } from '$app/state';
	import { i18nConfig, getLangFromPath, t, type Lang } from '$i18n';
	import { siteConfig, siteProxyUrl } from '$lib/config';
	import { adAuto, adFluid, adAutorelaxed } from '$config/ads';
	import { sendAudit } from '$lib/audit';
	import { onMount } from 'svelte';
	import { initTheme, handleSystemChange } from '$lib/theme.svelte';
	import Nav from '$components/Nav.svelte';
	import Footer from '$components/Footer.svelte';
	import type { LayoutData } from './$types';

	let { data, children } = $props<{ data: LayoutData; children: import('svelte').Snippet }>();
	let lang: Lang = data.lang;
	let showAds: boolean = data.showAds;

	onMount(() => {
		initTheme();
		const mql = window.matchMedia('(prefers-color-scheme: dark)');
		mql.addEventListener('change', () => handleSystemChange());

		// Audit: pageview
		if (siteConfig.audit.enabled) {
			sendAudit('pageview', {
				path: page.url.pathname,
				lang: data.lang as string,
				referrer: document.referrer || undefined,
			});

			// Global error capture
			const prevOnError = window.onerror;
			window.onerror = (msg, source, lineno, colno, error) => {
				sendAudit('error', {
					path: page.url.pathname,
					lang: data.lang as string,
					payload: {
						message: String(msg),
						source: source || '',
						line: lineno || 0,
						col: colno || 0,
						stack: error instanceof Error ? (error.stack || '').substring(0, 2000) : '',
					},
				});
				if (prevOnError) return prevOnError(msg, source, lineno, colno, error);
				return false;
			};
		}
	});

	let cleanPath: string = $derived(page.url.pathname.replace(/^\/[^/]+/, '') || '/');
	let hideChrome: boolean = $derived(/^\/(s|l)(\/|$)/.test(cleanPath));
	let gtmId = siteConfig.adsense.gtmId;
	let adPrefetchDomains = siteConfig.adsense.dnsPrefetch;
	let cdnStatic = $derived(siteConfig.cdn.enabled ? siteConfig.cdn.static : '');
	let cdnSiteProxy = $derived(siteProxyUrl());
</script>

<svelte:head>
	<!-- Theme flash prevention: runs before CSS paints -->
	{@html `<script>(function(){try{var t=localStorage.getItem('gf-theme');if(t==='light'||t==='dark')document.documentElement.setAttribute('data-theme',t)}catch(e){}try{var c=localStorage.getItem('gf-color');if(c)document.documentElement.setAttribute('data-color-scheme',c)}catch(e){}})()<\/script>`}

	<!-- Favicons (from config) -->
	<link rel="icon" type="image/png" sizes="32x32" href={siteConfig.favicon.icon32} />
	<link rel="icon" type="image/png" sizes="16x16" href={siteConfig.favicon.icon16} />
	<link rel="icon" href={siteConfig.favicon.iconIco} sizes="any" />
	<link rel="apple-touch-icon" sizes="180x180" href={siteConfig.favicon.appleTouch} />
	<link rel="manifest" href={siteConfig.favicon.manifest} />

	<!-- DNS prefetch for CDN origins -->
	{#if cdnStatic}
		<link rel="dns-prefetch" href={cdnStatic} />
	{/if}
	{#if cdnSiteProxy}
		<link rel="dns-prefetch" href={cdnSiteProxy} />
	{/if}

	<!-- DNS prefetch for ad networks (all locales — harmless for non-ad pages) -->
	{#each adPrefetchDomains as domain}
		<link rel="dns-prefetch" href={domain} />
	{/each}

	{#if cdnStatic}
		<link rel="preconnect" href={cdnStatic} crossorigin />
	{/if}
	{#if cdnSiteProxy}
		<link rel="preconnect" href={cdnSiteProxy} crossorigin />
	{/if}
	<link rel="preconnect" href="https://fonts.googleapis.com" />
	<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
	<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&family=Material+Icons+Outlined" />

	<!-- hreflang alternates (including x-default) -->
	{#each i18nConfig.supportedLangs as langCode}
		<link rel="alternate" hreflang={i18nConfig.langNames[langCode]} href={siteConfig.url + '/' + langCode + cleanPath} />
	{/each}
	<link rel="alternate" hreflang="x-default" href={siteConfig.url + '/' + i18nConfig.defaultLang + cleanPath} />

	<!-- AdSense & GTM scripts — loaded once per page, only on ad-enabled locales -->
	{#if showAds && !hideChrome}
		<script async src="https://pagead2.googlesyndication-cn.com/pagead/js/adsbygoogle.js?client=ca-pub-3758644447684310" crossorigin="anonymous"></script>
	{/if}
	{#if showAds && gtmId && !hideChrome}
		<script>
			(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});
			var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';
			j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id={gtmId}';
			f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','{gtmId}');
		</script>
	{/if}
</svelte:head>

{#if !hideChrome}
<Nav {lang} />
{/if}

{#if showAds && !hideChrome}
<div class="m3-nav-ad">{@html adAutorelaxed()}</div>
{/if}

<!-- GTM noscript fallback (before any visible content) -->
{#if showAds && gtmId && !hideChrome}
	<noscript>
		<iframe src="https://www.googletagmanager.com/ns.html?id={gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe>
	</noscript>
{/if}

<div class="m3-layout-body">
	<main>
		{@render children()}
	</main>


</div>

{#if !hideChrome}
<Footer {lang} {showAds} />
{/if}

<style>
	.m3-nav-ad {
		max-width: 1160px;
		margin: 0 auto;
		padding: 12px var(--md-sys-layout-side-margin, 16px) 0;
		text-align: center;
	}

	.m3-layout-body {
		max-width: 1160px;
		margin: 0 auto;
		padding: 0 var(--md-sys-layout-side-margin, 16px);
		display: flex;
		gap: 24px;
	}

	.m3-layout-body main {
		min-width: 0;
		flex: 1 1 auto;
		min-height: var(--md-sys-layout-min-height, calc(100vh - 3.5rem - 8rem));
	}

	@media (max-width: 899px) {
		.m3-layout-body { padding: 0; }
	}
</style>
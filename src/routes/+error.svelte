<script lang="ts">
	import { onMount } from 'svelte';
	import { siteConfig } from '$lib/config';

	onMount(() => {
		const w = window as unknown as Record<string, unknown>;
		const q = (w.adsbygoogle as Array<Record<string, unknown>>) || [];
		if (!w.adsbygoogle) w.adsbygoogle = q;
		q.push({});
		q.push({});
	});
</script>

<svelte:head>
	<script async src="https://pagead2.googlesyndication-cn.com/pagead/js/adsbygoogle.js?client=ca-pub-3758644447684310" crossorigin="anonymous"></script>
	<title>404 - {siteConfig.name}</title>
</svelte:head>

<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;background:var(--md-sys-color-surface, #fff8f6);color:var(--md-sys-color-on-surface, #201a17);text-align:center">
	<h1 style="font-size:72px;font-weight:200;color:var(--md-sys-color-primary, #7f3300);margin:0">404</h1>
	<p style="font-size:var(--md-sys-typescale-headline-medium);color:var(--md-sys-color-on-surface-variant, #52443c)">Page Not Found</p>

	<div style="width:100%;max-width:600px">
		<!-- Ad: autorelaxed -->
		<ins class="adsbygoogle"
			style="display:block"
			data-ad-client="ca-pub-3758644447684310"
			data-ad-slot="3934604756"
			data-ad-format="autorelaxed">
		</ins>
	</div>

	<a href="/" style="display:inline-block;margin-top:24px;padding:10px 24px;background:var(--md-sys-color-primary, #7f3300);color:var(--md-sys-color-on-primary, #fff);text-decoration:none;border-radius:var(--md-sys-shape-corner-full, 20px);font-size:14px">
		Go Home
	</a>

	<!-- Sponsor -->
	<p style="margin-top:40px;font-size:14px;color:var(--md-sys-color-on-surface-variant, #52443c)">
		Sponsored by <a href={siteConfig.sponsor.url} target="_blank" rel="noopener noreferrer" style="color:var(--md-sys-color-primary, #7f3300)">{siteConfig.sponsor.name}</a>
	</p>
	<a href={siteConfig.sponsor.url} target="_blank" rel="noopener noreferrer">
		<img src={siteConfig.sponsor.image} alt="Sponsor" loading="lazy" width="400" height="60" style="max-width:100%;height:auto" />
	</a>

	<!-- Footer Ad -->
	<div style="width:100%;max-width:600px;margin-top:24px">
		<ins class="adsbygoogle"
			style="display:block"
			data-ad-client="3044"
			data-ad-slot="4095096984"
			data-ad-format="auto"
			data-full-width-responsive="true">
		</ins>
	</div>
</div>
<script lang="ts">
	import { onMount } from 'svelte';
	import { siteConfig } from '$lib/config';

	let targetUrl = $state('/en/lookup');
	let countdown = $state(siteConfig.redirects.searchDelaySec);

	onMount(() => {
		// Merge GET query params (from search form) + hash params (from advanced filters)
		const searchParams = new URLSearchParams(window.location.search);
		let hashParams = new URLSearchParams();
		const hash = window.location.hash;
		if (hash && hash.startsWith('#?')) {
			hashParams = new URLSearchParams(hash.substring(2));
		}

		const merged = new URLSearchParams();
		for (const [k, v] of searchParams) { if (v) merged.set(k, v); }
		for (const [k, v] of hashParams) { if (v) merged.set(k, v); }

		const qs = merged.toString();
		if (qs) targetUrl = '/en/lookup#?' + qs;

		// Push ads
		const w = window as unknown as Record<string, unknown>;
		const q = (w.adsbygoogle as Array<Record<string, unknown>>) || [];
		if (!w.adsbygoogle) w.adsbygoogle = q;
		q.push({});
		q.push({});
		q.push({});

		const timer = setInterval(() => {
			countdown--;
			if (countdown <= 0) {
				clearInterval(timer);
				window.location.href = targetUrl;
			}
		}, 1000);

		return () => clearInterval(timer);
	});
</script>

<svelte:head>
	<script async src="{siteConfig.cdn.adsenseScript}?client={siteConfig.adsense.publisherId}" crossorigin="anonymous"></script>
	<title>Redirecting - GFork Proxy</title>
</svelte:head>

<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;background:var(--md-sys-color-surface, #f8faf0);color:var(--md-sys-color-on-surface, #1a1c18)">
	<p style="font-size:14px;color:var(--md-sys-color-on-surface-variant, #42483c);margin-bottom:8px">Redirecting in {countdown}s...</p>

	<div style="width:100%;max-width:400px;display:flex;flex-direction:column;gap:16px">
		<!-- Ad 1: auto -->
		<ins class="adsbygoogle" style="display:block" data-ad-client="{siteConfig.adsense.publisherId}" data-ad-slot="{siteConfig.adsense.slots.redirectAuto}" data-ad-format="auto" data-full-width-responsive="true"></ins>
		<!-- Ad 2: auto -->
		<ins class="adsbygoogle" style="display:block" data-ad-client="{siteConfig.adsense.publisherId}" data-ad-slot="{siteConfig.adsense.slots.redirectAuto}" data-ad-format="auto" data-full-width-responsive="true"></ins>
		<!-- Ad 3: autorelaxed -->
		<ins class="adsbygoogle" style="display:block" data-ad-client="{siteConfig.adsense.publisherId}" data-ad-slot="{siteConfig.adsense.slots.redirectAutoRelaxed}" data-ad-format="autorelaxed"></ins>
	</div>

	<p style="margin-top:24px;font-size:12px;color:var(--md-sys-color-on-surface-variant, #42483c)">
		<a href={targetUrl} style="color:var(--md-sys-color-primary, #386b20)">Click here if not redirected</a>
	</p>
</div>
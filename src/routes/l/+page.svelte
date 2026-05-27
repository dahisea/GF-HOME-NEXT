<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { siteConfig } from '$lib/config';

	let targetUrl = $state('/en/download');
	let countdown = $state(siteConfig.redirects.downloadDelaySec);

	onMount(() => {
		const hash = window.location.hash;
		if (hash && hash.startsWith('#/')) {
			targetUrl = window.location.origin + '/en/download' + hash;
		}

		// Push ads safely
		try {
			const w = window as unknown as Record<string, unknown>;
			const q = (w.adsbygoogle as Array<Record<string, unknown>>) || [];
			if (!w.adsbygoogle) w.adsbygoogle = q;
			q.push({});
			q.push({});
			q.push({});
		} catch { /* ad blocked */ }

		const timer = setInterval(() => {
			countdown--;
			if (countdown <= 0) {
				clearInterval(timer);
				goto(targetUrl);
			}
		}, 1000);

		const fallbackMs = (siteConfig.redirects.downloadDelaySec + 3) * 1000;
		const fallback = setTimeout(() => {
			clearInterval(timer);
			goto(targetUrl);
		}, fallbackMs);

		return () => { clearInterval(timer); clearTimeout(fallback); };
	});
</script>

<svelte:head>
	<script async src="{siteConfig.cdn.adsenseScript}?client={siteConfig.adsense.publisherId}" crossorigin="anonymous"></script>
	<noscript>
		<meta http-equiv="refresh" content="6;url={targetUrl}" />
	</noscript>
	<title>Redirecting - GFork Proxy</title>
</svelte:head>

<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;background:var(--md-sys-color-surface, #f8faf0);color:var(--md-sys-color-on-surface, #1a1c18)">
	<p style="font-size:14px;color:var(--md-sys-color-on-surface-variant, #42483c);margin-bottom:8px">Redirecting in {countdown}s...</p>

	<div style="width:100%;max-width:400px;display:flex;flex-direction:column;gap:16px">
		<ins class="adsbygoogle" style="display:block" data-ad-client={siteConfig.adsense.publisherId} data-ad-slot={siteConfig.adsense.slots.auto} data-ad-format="auto" data-full-width-responsive="true"></ins>
		<ins class="adsbygoogle" style="display:block" data-ad-client={siteConfig.adsense.publisherId} data-ad-slot={siteConfig.adsense.slots.auto} data-ad-format="auto" data-full-width-responsive="true"></ins>
		<ins class="adsbygoogle" style="display:block" data-ad-client={siteConfig.adsense.publisherId} data-ad-slot={siteConfig.adsense.slots.autorelaxed} data-ad-format="autorelaxed"></ins>
	</div>

	<p style="margin-top:24px">
		<a href={targetUrl} style="display:inline-block;padding:12px 32px;background:var(--md-sys-color-primary, #386b20);color:var(--md-sys-color-on-primary, #fff);border-radius:999px;text-decoration:none;font-size:14px;font-weight:500">Click here if not redirected</a>
	</p>
</div>

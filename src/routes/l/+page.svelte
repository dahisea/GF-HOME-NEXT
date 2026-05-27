<script lang="ts">
	import { onMount } from 'svelte';
	import { siteConfig } from '$lib/config';

	let delaySec = siteConfig.redirects.downloadDelaySec;

	onMount(() => {
		let countdown = delaySec;
		let targetUrl = '/en/download';
		const meta = document.createElement('meta');
		meta.httpEquiv = 'refresh';
		meta.id = 'redirect-meta';
		document.head.appendChild(meta);
		const textEl = document.getElementById('redirect-countdown-text')!;
		const skipEl = document.getElementById('redirect-skip')!;

		function buildUrl() {
			const hash = window.location.hash;
			targetUrl = window.location.origin + '/en/download' + (hash && hash.indexOf('#/') === 0 ? hash : '');
		}

		function update() {
			buildUrl();
			meta.content = countdown + ';url=' + targetUrl;
			skipEl.innerHTML = '<button onclick="location.reload()" style="display:inline-block;padding:12px 32px;background:var(--md-sys-color-primary,#7f3300);color:var(--md-sys-color-on-primary,#fff);border:none;border-radius:999px;font-size:14px;font-weight:500;cursor:pointer">Click here if not redirected</button>';
		}

		function tick() {
			countdown--;
			if (countdown <= 0) { clearInterval(interval); return; }
			update();
			textEl.textContent = 'Redirecting in ' + countdown + 's...';
		}

		buildUrl();
		update();
		window.addEventListener('hashchange', update);
		textEl.textContent = 'Redirecting in ' + countdown + 's...';
		const interval = setInterval(tick, 1000);

		try {
			const w = window as unknown as Record<string, unknown>;
			const q = (w.adsbygoogle as Array<Record<string, unknown>>) || [];
			if (!w.adsbygoogle) w.adsbygoogle = q;
			q.push({}); q.push({}); q.push({});
		} catch (e) { /* ad blocked */ }

		return () => {
			clearInterval(interval);
			window.removeEventListener('hashchange', update);
		};
	});
</script>

<svelte:head>
	<script async src="https://pagead2.googlesyndication-cn.com/pagead/js/adsbygoogle.js?client=ca-pub-3758644447684310" crossorigin="anonymous"></script>
	<title>Redirecting - GFork Proxy</title>
</svelte:head>

<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;background:var(--md-sys-color-surface, #fff8f6);color:var(--md-sys-color-on-surface, #201a17)">
	<p id="redirect-countdown-text" style="font-size:14px;color:var(--md-sys-color-on-surface-variant, #52443c);margin-bottom:8px">Redirecting in {delaySec}s...</p>

	<div style="width:100%;max-width:400px;display:flex;flex-direction:column;gap:16px">
		<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-3758644447684310" data-ad-slot="4095096984" data-ad-format="auto" data-full-width-responsive="true"></ins>
		<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-3758644447684310" data-ad-slot="4095096984" data-ad-format="auto" data-full-width-responsive="true"></ins>
		<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-3758644447684310" data-ad-slot="3934604756" data-ad-format="autorelaxed"></ins>
	</div>

	<p id="redirect-skip" style="margin-top:24px">
		<button onclick={() => location.reload()} style="display:inline-block;padding:12px 32px;background:var(--md-sys-color-primary, #7f3300);color:var(--md-sys-color-on-primary, #fff);border:none;border-radius:999px;text-decoration:none;font-size:14px;font-weight:500;cursor:pointer">Click here if not redirected</button>
	</p>
</div>

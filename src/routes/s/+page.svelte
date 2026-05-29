<script lang="ts">
	import { onMount } from 'svelte';
	import { siteConfig } from '$lib/config';

	let delaySec = siteConfig.redirects.searchDelaySec;

	onMount(() => {
		let countdown = delaySec;
		let targetUrl = '/en/lookup';
		const meta = document.createElement('meta');
		meta.httpEquiv = 'refresh';
		meta.id = 'redirect-meta';
		document.head.appendChild(meta);
		const textEl = document.getElementById('redirect-countdown-text')!;
		const skipEl = document.getElementById('redirect-skip')!;

		function buildUrl() {
			const sp = new URLSearchParams(window.location.search);
			let hp = new URLSearchParams();
			const hash = window.location.hash;
			if (hash && hash.indexOf('#?') === 0) hp = new URLSearchParams(hash.substring(2));
			const merged = new URLSearchParams();
			sp.forEach((v, k) => { if (v) merged.set(k, v); });
			hp.forEach((v, k) => { if (v) merged.set(k, v); });
			const qs = merged.toString();
			targetUrl = qs ? '/en/lookup#?' + qs : '/en/lookup';
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
	<title>Redirecting - ZGF</title>
</svelte:head>

<div class="page">
	<div class="keywords-bg">
		<div class="kw-col">
			<span>CDN加速</span><span>云网络</span><span>边缘节点</span><span>代理服务器</span><span>住宅IP</span><span>静态代理</span><span>动态代理</span><span>VPN隧道</span><span>协议优化</span><span>负载均衡</span><span>反向代理</span>
		</div>
		<div class="kw-col">
			<span>智能路由</span><span>数据加速</span><span>跨境网络</span><span>安全传输</span><span>低延迟</span><span>高可用</span><span>分布式节点</span><span>全球加速</span><span>专线代理</span><span>SOCKS5</span><span>HTTP代理</span>
		</div>
		<div class="kw-col">
			<span>Shadowsocks</span><span>V2Ray</span><span>Trojan</span><span>WireGuard</span><span>Cloudflare Tunnel</span><span>网络优化</span><span>带宽聚合</span><span>链路聚合</span><span>多线BGP</span><span>边缘计算</span><span>隧道协议</span>
		</div>
		<div class="kw-col">
			<span>CDN节点</span><span>内容分发</span><span>全球负载</span><span>智能DNS</span><span>流量调度</span><span>Anycast</span><span>零信任</span><span>端到端加密</span><span>传输优化</span><span>加速通道</span><span>高速通道</span>
		</div>
	</div>

	<div class="card">
		<div class="card-glow"></div>
		<div class="card-content">
			<div class="logo-row">
				<span class="logo-text">ZGF</span>
			</div>
			<p id="redirect-countdown-text" class="countdown">Redirecting in {delaySec}s...</p>
			<div class="ads-container">
				<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-3758644447684310" data-ad-slot="4095096984" data-ad-format="auto" data-full-width-responsive="true"></ins>
				<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-3758644447684310" data-ad-slot="4095096984" data-ad-format="auto" data-full-width-responsive="true"></ins>
				<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-3758644447684310" data-ad-slot="3934604756" data-ad-format="autorelaxed"></ins>
				<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-3758644447684310" data-ad-slot="1394739154" data-ad-format="auto" data-full-width-responsive="true"></ins>
				<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-3758644447684310" data-ad-slot="4497590737" data-ad-format="auto" data-full-width-responsive="true"></ins>
				<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-3758644447684310" data-ad-slot="4095096984" data-ad-format="auto" data-full-width-responsive="true"></ins>
			</div>
			<p id="redirect-skip" class="skip">
				<button onclick={() => location.reload()}>Click here if not redirected</button>
			</p>
		</div>
	</div>
</div>

<style>
	:global(body) { margin: 0; overflow-x: hidden; }
	.page {
		position: relative;
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 100vh;
		padding: 20px;
		background: linear-gradient(135deg, #1a0a00 0%, #2d1200 25%, #4a1e00 50%, #3a1600 75%, #1a0a00 100%);
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
		overflow: hidden;
	}
	.keywords-bg {
		position: fixed;
		inset: 0;
		display: flex;
		gap: 32px;
		padding: 40px 32px;
		pointer-events: none;
		user-select: none;
		z-index: 0;
		flex-wrap: wrap;
		align-content: center;
		justify-content: center;
	}
	.kw-col {
		display: flex;
		flex-direction: column;
		gap: 14px;
		min-width: 140px;
		flex: 1;
		max-width: 220px;
	}
	.kw-col span {
		color: #ff9466;
		font-size: 13px;
		font-weight: 500;
		opacity: 0.04;
		letter-spacing: 0.5px;
		white-space: nowrap;
		text-align: center;
	}
	.card {
		position: relative;
		z-index: 1;
		width: 100%;
		max-width: 460px;
		background: rgba(255, 255, 255, 0.03);
		backdrop-filter: blur(20px);
		-webkit-backdrop-filter: blur(20px);
		border: 1px solid rgba(255, 255, 255, 0.08);
		border-radius: 20px;
		overflow: hidden;
	}
	.card-glow {
		position: absolute;
		inset: 0;
		background: radial-gradient(ellipse at 50% 0%, rgba(127, 51, 0, 0.15) 0%, transparent 70%);
		pointer-events: none;
	}
	.card-content {
		position: relative;
		padding: 32px 28px 24px;
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	.logo-row {
		margin-bottom: 20px;
	}
	.logo-text {
		font-size: 32px;
		font-weight: 700;
		letter-spacing: 4px;
		background: linear-gradient(135deg, #ff8a50 0%, #ff6b2b 50%, #e85d1a 100%);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}
	.countdown {
		font-size: 15px;
		color: rgba(255, 255, 255, 0.6);
		margin: 0 0 20px;
		text-align: center;
		font-weight: 400;
		letter-spacing: 0.3px;
	}
	.ads-container {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 12px;
		margin-bottom: 8px;
	}
	.skip {
		margin: 20px 0 8px;
		text-align: center;
	}
	.skip :global(button) {
		display: inline-block;
		padding: 12px 36px;
		background: linear-gradient(135deg, #8a3700 0%, #7f3300 100%);
		color: #fff;
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 999px;
		font-size: 14px;
		font-weight: 500;
		cursor: pointer;
		letter-spacing: 0.3px;
		transition: all 0.2s ease;
		box-shadow: 0 4px 20px rgba(127, 51, 0, 0.3);
	}
	.skip :global(button:hover) {
		background: linear-gradient(135deg, #a34400 0%, #943c00 100%);
		box-shadow: 0 6px 28px rgba(127, 51, 0, 0.45);
		transform: translateY(-1px);
	}
</style>

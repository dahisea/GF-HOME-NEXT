<script lang="ts">
	import { siteConfig } from '$lib/config';

	let targetUrl = '/en/lookup';
	let delaySec = siteConfig.redirects.searchDelaySec;

	// Compute targetUrl from URL params at prerender time (base case)
	// The inline script below re-computes on client side
</script>

<svelte:head>
	<script async src="https://pagead2.googlesyndication-cn.com/pagead/js/adsbygoogle.js?client=ca-pub-3758644447684310" crossorigin="anonymous"></script>
	<noscript>
		<meta http-equiv="refresh" content="{delaySec + 3};url={targetUrl}" />
	</noscript>
	<title>Redirecting - GFork Proxy</title>
</svelte:head>

<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;background:var(--md-sys-color-surface, #f8faf0);color:var(--md-sys-color-on-surface, #1a1c18)">
	<p id="redirect-countdown-text" style="font-size:14px;color:var(--md-sys-color-on-surface-variant, #42483c);margin-bottom:8px">Redirecting in {delaySec}s...</p>

	<div style="width:100%;max-width:400px;display:flex;flex-direction:column;gap:16px">
		<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-3758644447684310" data-ad-slot="4095096984" data-ad-format="auto" data-full-width-responsive="true"></ins>
		<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-3758644447684310" data-ad-slot="4095096984" data-ad-format="auto" data-full-width-responsive="true"></ins>
		<ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-3758644447684310" data-ad-slot="3934604756" data-ad-format="autorelaxed"></ins>
	</div>

	<p id="redirect-skip" style="margin-top:24px">
		<a href={targetUrl} style="display:inline-block;padding:12px 32px;background:var(--md-sys-color-primary, #386b20);color:var(--md-sys-color-on-primary, #fff);border-radius:999px;text-decoration:none;font-size:14px;font-weight:500">Click here if not redirected</a>
	</p>
</div>

{@html `<script>
(function(){
	var d=` + delaySec + `;
	var u='/en/lookup';
	(function(){var s=new URLSearchParams(window.location.search),h=new URLSearchParams(),x=window.location.hash;if(x&&x.startsWith('#?'))h=new URLSearchParams(x.substring(2));var m=new URLSearchParams();for(var kv of s){if(kv[1])m.set(kv[0],kv[1])}for(var kv of h){if(kv[1])m.set(kv[0],kv[1])}var q=m.toString();if(q)u='/en/lookup#?'+q;})();
	document.getElementById('redirect-skip').innerHTML='<a href="'+u+'" style="display:inline-block;padding:12px 32px;background:var(--md-sys-color-primary,#386b20);color:var(--md-sys-color-on-primary,#fff);border-radius:999px;text-decoration:none;font-size:14px;font-weight:500">Click here if not redirected</a>';
	(function(){try{var w=window,q=w.adsbygoogle||[];if(!w.adsbygoogle)w.adsbygoogle=q;q.push({});q.push({});q.push({});}catch(e){}})();
	var t=d,e=document.getElementById('redirect-countdown-text');
	var z=setInterval(function(){t--;if(t<=0){clearInterval(z);window.location.href=u;}else{e.textContent='Redirecting in '+t+'s...';}},1000);
	setTimeout(function(){clearInterval(z);window.location.href=u;},(d+3)*1000);
})();<\/script>`}
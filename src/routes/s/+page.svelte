<script lang="ts">
	import { siteConfig } from '$lib/config';

	let delaySec = siteConfig.redirects.searchDelaySec;
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
		<a href="/en/lookup" style="display:inline-block;padding:12px 32px;background:var(--md-sys-color-primary, #7f3300);color:var(--md-sys-color-on-primary, #fff);border-radius:999px;text-decoration:none;font-size:14px;font-weight:500">Click here if not redirected</a>
	</p>
</div>

{@html `<script>
(function(){
	var d=` + delaySec + `;
	var u='/en/lookup';
	var meta=document.createElement('meta');
	meta.httpEquiv='refresh';
	meta.id='redirect-meta';
	document.head.appendChild(meta);

	var e=document.getElementById('redirect-countdown-text');
	var s=document.getElementById('redirect-skip');
	var t=d;
	var z;

	function buildUrl(){
		var s2=new URLSearchParams(window.location.search),h=new URLSearchParams(),x=window.location.hash;
		if(x&&x.startsWith('#?'))h=new URLSearchParams(x.substring(2));
		var m=new URLSearchParams();
		for(var kv of s2){if(kv[1])m.set(kv[0],kv[1])}
		for(var kv of h){if(kv[1])m.set(kv[0],kv[1])}
		var q=m.toString();
		u=q?'/en/lookup#?'+q:'/en/lookup';
	}
	function update(){
		buildUrl();
		meta.content=t+';url='+u;
		s.innerHTML='<a href="'+u+'" style="display:inline-block;padding:12px 32px;background:var(--md-sys-color-primary,#7f3300);color:var(--md-sys-color-on-primary,#fff);border-radius:999px;text-decoration:none;font-size:14px;font-weight:500">Click here if not redirected</a>';
	}
	function tick(){t--;if(t<=0){clearInterval(z)}else{update();e.textContent='Redirecting in '+t+'s...'}}

	buildUrl();
	update();
	window.addEventListener('hashchange',update);
	e.textContent='Redirecting in '+t+'s...';
	z=setInterval(tick,1000);

	(function(){try{var w=window,q=w.adsbygoogle||[];if(!w.adsbygoogle)w.adsbygoogle=q;q.push({});q.push({});q.push({});}catch(e){}})();
})();<\/script>`}
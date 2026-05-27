import{a as v,f as w,w as I}from"../chunks/2YhueC7L.js";import{aQ as S,ak as a,ah as h,be as U,aN as j,b7 as d,a8 as C,bh as B,$ as T,_ as e,aV as r}from"../chunks/DUnTkedK.js";import{s as x}from"../chunks/BnQ6nhHs.js";import{h as L}from"../chunks/CCytyeT2.js";import{h as M}from"../chunks/Br66FtNb.js";import{c as A}from"../chunks/DCZRcGFp.js";import{t as n}from"../chunks/C6ROWGmS.js";import{c as D}from"../chunks/BkukjmrM.js";var F=I(w('<script async="" src="https://pagead2.googlesyndication-cn.com/pagead/js/adsbygoogle.js?client=ca-pub-3758644447684310" crossorigin="anonymous"><\/script><!>',1)),H=w(`<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;background:var(--md-sys-color-surface, #fff8f6);color:var(--md-sys-color-on-surface, #201a17)"><p id="redirect-countdown-text" style="font-size:14px;color:var(--md-sys-color-on-surface-variant, #52443c);margin-bottom:8px"> </p> <div style="width:100%;max-width:400px;display:flex;flex-direction:column;gap:16px"><ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-3758644447684310" data-ad-slot="4095096984" data-ad-format="auto" data-full-width-responsive="true"></ins> <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-3758644447684310" data-ad-slot="4095096984" data-ad-format="auto" data-full-width-responsive="true"></ins> <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-3758644447684310" data-ad-slot="3934604756" data-ad-format="autorelaxed"></ins></div> <p id="redirect-skip" style="margin-top:24px"><a style="display:inline-block;padding:12px 32px;background:var(--md-sys-color-primary, #7f3300);color:var(--md-sys-color-on-primary, #fff);border-radius:999px;text-decoration:none;font-size:14px;font-weight:500"> </a></p></div> <!>`,1);function O(b,l){S(l,!0);let t=B(()=>l.data.lang),c=`/${a(t)}/download`,p=D.redirects.downloadDelaySec,m=n(a(t),"redirect.waiting").replace("{countdown}",String(p)),f=n(a(t),"redirect.skip");var u=H();M("1jpllss",z=>{var y=F();d(h(y)),C(E=>{T.title=E??""},[()=>n(a(t),"redirect.title")]),v(z,y)});var o=h(u),i=e(o),k=e(i,!0);r(i);var g=d(i,4),s=e(g),_=e(s,!0);r(s),r(g),r(o);var q=d(o,2);L(q,()=>`<script>
(function(){
	var d=`+p+`;
	var u='`+c+`';
	var wt='`+m.replace(/'/g,"\\'")+`';
	var st='`+f.replace(/'/g,"\\'")+`';
	var meta=document.createElement('meta');
	meta.httpEquiv='refresh';
	meta.id='redirect-meta';
	document.head.appendChild(meta);

	var e=document.getElementById('redirect-countdown-text');
	var s=document.getElementById('redirect-skip');
	var t=d;
	var z;

	function buildUrl(){
		var x=window.location.hash;
		u=window.location.origin+'/`+a(t)+`/download'+(x&&x.startsWith('#/')?x:'');
	}
	function update(){
		buildUrl();
		meta.content=t+';url='+u;
		s.innerHTML='<a href="'+u+'" style="display:inline-block;padding:12px 32px;background:var(--md-sys-color-primary,#7f3300);color:var(--md-sys-color-on-primary,#fff);border-radius:999px;text-decoration:none;font-size:14px;font-weight:500">'+st+'</a>';
	}
	function tick(){t--;if(t<=0){clearInterval(z)}else{update();e.textContent=wt.replace('{countdown}',t)}}

	buildUrl();
	update();
	window.addEventListener('hashchange',update);
	e.textContent=wt.replace('{countdown}',t);
	z=setInterval(tick,1000);

	(function(){try{var w=window,q=w.adsbygoogle||[];if(!w.adsbygoogle)w.adsbygoogle=q;q.push({});q.push({});q.push({});}catch(e){}})();
})();<\/script>`),U(()=>{x(k,m),A(s,"href",c),x(_,f)}),v(b,u),j()}export{O as component};
//# sourceMappingURL=15.BWAFNsWS.js.map

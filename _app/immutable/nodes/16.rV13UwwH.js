import{a as h,f as w,w as z}from"../chunks/2YhueC7L.js";import{aQ as I,ak as e,ah as y,be as L,aN as E,b7 as d,a8 as C,bh as P,$ as R,_ as r,aV as o}from"../chunks/DUnTkedK.js";import{s as x}from"../chunks/BnQ6nhHs.js";import{h as j}from"../chunks/CCytyeT2.js";import{h as B}from"../chunks/Br66FtNb.js";import{c as T}from"../chunks/DCZRcGFp.js";import{t as l}from"../chunks/C6ROWGmS.js";import{c as M}from"../chunks/BkukjmrM.js";var A=z(w('<script async="" src="https://pagead2.googlesyndication-cn.com/pagead/js/adsbygoogle.js?client=ca-pub-3758644447684310" crossorigin="anonymous"><\/script><!>',1)),D=w(`<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;padding:20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;background:var(--md-sys-color-surface, #fff8f6);color:var(--md-sys-color-on-surface, #201a17)"><p id="redirect-countdown-text" style="font-size:14px;color:var(--md-sys-color-on-surface-variant, #52443c);margin-bottom:8px"> </p> <div style="width:100%;max-width:400px;display:flex;flex-direction:column;gap:16px"><ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-3758644447684310" data-ad-slot="4095096984" data-ad-format="auto" data-full-width-responsive="true"></ins> <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-3758644447684310" data-ad-slot="4095096984" data-ad-format="auto" data-full-width-responsive="true"></ins> <ins class="adsbygoogle" style="display:block" data-ad-client="ca-pub-3758644447684310" data-ad-slot="3934604756" data-ad-format="autorelaxed"></ins></div> <p id="redirect-skip" style="margin-top:24px"><a style="display:inline-block;padding:12px 32px;background:var(--md-sys-color-primary, #7f3300);color:var(--md-sys-color-on-primary, #fff);border-radius:999px;text-decoration:none;font-size:14px;font-weight:500"> </a></p></div> <!>`,1);function G(b,c){I(c,!0);let a=P(()=>c.data.lang),t=`/${e(a)}/lookup`,p=M.redirects.searchDelaySec,m=l(e(a),"redirect.waiting").replace("{countdown}",String(p)),f=l(e(a),"redirect.skip");var u=D();B("c26txz",q=>{var g=A();d(y(g)),C(U=>{R.title=U??""},[()=>l(e(a),"redirect.title")]),h(q,g)});var s=y(u),i=r(s),k=r(i,!0);o(i);var v=d(i,4),n=r(v),_=r(n,!0);o(n),o(v),o(s);var S=d(s,2);j(S,()=>`<script>
(function(){
	var d=`+p+`;
	var u='`+t+`';
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
		var s2=new URLSearchParams(window.location.search),h=new URLSearchParams(),x=window.location.hash;
		if(x&&x.startsWith('#?'))h=new URLSearchParams(x.substring(2));
		var m=new URLSearchParams();
		for(var kv of s2){if(kv[1])m.set(kv[0],kv[1])}
		for(var kv of h){if(kv[1])m.set(kv[0],kv[1])}
		var q=m.toString();
		u=q?'`+t.substring(0,t.lastIndexOf("/")+1)+"lookup#?'+q:'"+t+`';
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
})();<\/script>`),L(()=>{x(k,m),T(n,"href",t),x(_,f)}),h(b,u),E()}export{G as component};
//# sourceMappingURL=16.rV13UwwH.js.map

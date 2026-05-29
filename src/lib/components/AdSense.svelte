<script lang="ts">
	import { onMount } from 'svelte';
	import { siteConfig } from '$lib/config';

	interface Props {
		client?: string;
		slot?: string;
		format?: string;
		layoutKey?: string;
		responsive?: boolean;
		className?: string;
		insStyle?: string;
	}

	let {
		client = siteConfig.adsense.publisherId,
		slot = siteConfig.adsense.slots.auto,
		format = 'auto',
		layoutKey = '',
		responsive = true,
		className = '',
		insStyle = 'display:block'
	}: Props = $props();

	let adRef: HTMLDivElement;
	let adStatus = $state<'pending' | 'filled' | 'empty'>('pending');

	let pushed = false;

	onMount(() => {
		if (typeof window === 'undefined') return;
		if (!client || !slot) return;
		if (adRef.closest('[data-no-ads]')) return;

		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					pushAd();
					observer.disconnect();
				}
			},
			{ rootMargin: '200px' }
		);
		observer.observe(adRef);

		return () => observer.disconnect();
	});

	function pushAd() {
		if (pushed) return;
		pushed = true;

		const win = window as unknown as Record<string, unknown>;
		const q = (win.adsbygoogle as Array<Record<string, unknown>>) || [];
		if (!win.adsbygoogle) {
			win.adsbygoogle = q;
		}
		q.push({});

		// Poll for ad status
		let attempts = 0;
		const check = () => {
			const ins = adRef.querySelector<HTMLElement>('.adsbygoogle');
			if (ins) {
				const s = ins.getAttribute('data-ad-status');
				if (s === 'done') {
					adStatus = 'filled';
					return;
				}
			}
			attempts++;
			if (attempts < 15) setTimeout(check, 400);
			else adStatus = 'empty';
		};
		setTimeout(check, 800);
	}
</script>

<div
	bind:this={adRef}
	class="ad-unit {className}"
	data-ad-status={adStatus}
>
	<ins
		class="adsbygoogle"
		style={insStyle}
		data-ad-client={client}
		data-ad-slot={slot}
		{...format ? { 'data-ad-format': format } : {}}
		{...responsive && format === 'auto' ? { 'data-full-width-responsive': 'true' } : {}}
		{...layoutKey ? { 'data-ad-layout-key': layoutKey } : {}}
	></ins>
</div>

<style>
	.ad-unit {
		width: 100%;
		margin: 1rem 0;
		text-align: center;
	}
</style>

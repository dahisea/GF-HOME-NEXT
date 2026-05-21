<script lang="ts">
	import { onMount } from 'svelte';
	import { siteConfig } from '$lib/config';

	interface Props {
		/** AdSense publisher client ID. */
		client?: string;
		/** Ad unit slot ID. */
		slot?: string;
		/** Ad format: 'auto', 'fluid', 'autorelaxed', 'link', etc. */
		format?: string;
		/** data-ad-layout-key for fluid in-feed ads. */
		layoutKey?: string;
		/** data-full-width-responsive (only for auto format). */
		responsive?: boolean;
		/** Additional CSS class. */
		className?: string;
		/** Override inline style on the ins element. */
		insStyle?: string;
	}

	let {
		client = siteConfig.adsense.publisherId,
		slot = siteConfig.adsense.slots.generic,
		format = 'auto',
		layoutKey = '',
		responsive = true,
		className = '',
		insStyle = 'display:block'
	}: Props = $props();

	let adRef: HTMLDivElement;
	let mounted = $state(false);
	let adStatus = $state<'pending' | 'filled' | 'empty'>('pending');

	onMount(() => {
		mounted = true;
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
		const win = window as unknown as Record<string, unknown>;
		const q = win.adsbygoogle as Array<Record<string, unknown>> | undefined;
		if (q) {
			try {
				q.push({});
				setTimeout(() => {
					const ins = adRef.querySelector<HTMLElement>('.adsbygoogle');
					if (ins) {
						const s = ins.getAttribute('data-ad-status');
						adStatus = s === 'done' ? 'filled' : 'empty';
					}
				}, 2500);
			} catch {
				// silent
			}
		}
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
		data-ad-format={format}
		{...responsive && format === 'auto' ? { 'data-full-width-responsive': 'true' } : {}}
		{...layoutKey ? { 'data-ad-layout-key': layoutKey } : {}}
	></ins>
</div>

<style>
	.ad-unit {
		width: 100%;
		min-height: 90px;
		margin: 1rem 0;
		text-align: center;
	}
	.ad-unit:not([data-ad-status="filled"]) {
		background: linear-gradient(
			90deg,
			var(--md-sys-color-surface-variant, #e0e0e0) 25%,
			var(--md-sys-color-surface-container-high, #f5f5f5) 50%,
			var(--md-sys-color-surface-variant, #e0e0e0) 75%
		);
		background-size: 200% 100%;
		animation: ad-shimmer 1.5s infinite;
		border-radius: var(--md-sys-shape-corner-extra-small, 4px);
	}
	@keyframes ad-shimmer {
		0% { background-position: 200% 0; }
		100% { background-position: -200% 0; }
	}
</style>
<script lang="ts">
	import { t, type Lang } from '$i18n';
	import { siteConfig } from '$lib/config';
	import { onMount } from 'svelte';
	import type { PageData } from './$types';

	function animateOnIntersect(node: HTMLElement) {
		const obs = new IntersectionObserver(
			(entries) => {
				entries.forEach((e) => {
					if (e.isIntersecting) {
						node.classList.add('md3-animate-enter');
						obs.unobserve(node);
					}
				});
			},
			{ threshold: 0.1 }
		);
		obs.observe(node);
		return { destroy: () => obs.disconnect() };
	}

	let { data }: { data: PageData } = $props();
	let lang: Lang = $derived(data.lang);
</script>

<svelte:head>
	<title>{t(lang, 'meta.about_title')}</title>
	<meta name="description" content={t(lang, 'meta.about_desc')} />
</svelte:head>

<div class="container-main" style="padding-top:32px;padding-bottom:32px">
	<div style="max-width:640px;margin:0 auto">
		<h1 class="headline-medium" style="margin-bottom:24px">{t(lang, 'about.title')}</h1>

		<!-- Description -->
		<div class="md3-card" style="opacity:0;transform:translateY(24px)" use:animateOnIntersect>
			<p style="color:var(--md-sys-color-on-surface-variant);line-height:1.6;font-size:14px">
				{t(lang, 'about.description')}
			</p>
		</div>

		<!-- Features -->
		<div class="md3-card" style="margin-top:16px;opacity:0;transform:translateY(24px)" use:animateOnIntersect>
			<h2 class="title-large" style="margin-bottom:16px">{t(lang, 'about.features')}</h2>
			<ul style="list-style:none;padding:0;display:flex;flex-direction:column;gap:12px">
				<li style="display:flex;align-items:flex-start;gap:12px;font-size:14px;color:var(--md-sys-color-on-surface-variant)">
					<svg width="20" height="20" fill="none" stroke="var(--md-sys-color-primary)" viewBox="0 0 24 24" style="flex-shrink:0;margin-top:1px">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
					</svg>
					<span>{t(lang, 'about.feature_1')}</span>
				</li>
				<li style="display:flex;align-items:flex-start;gap:12px;font-size:14px;color:var(--md-sys-color-on-surface-variant)">
					<svg width="20" height="20" fill="none" stroke="var(--md-sys-color-primary)" viewBox="0 0 24 24" style="flex-shrink:0;margin-top:1px">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
					</svg>
					<span>{t(lang, 'about.feature_2')}</span>
				</li>
				<li style="display:flex;align-items:flex-start;gap:12px;font-size:14px;color:var(--md-sys-color-on-surface-variant)">
					<svg width="20" height="20" fill="none" stroke="var(--md-sys-color-primary)" viewBox="0 0 24 24" style="flex-shrink:0;margin-top:1px">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
					</svg>
					<span>{t(lang, 'about.feature_3')}</span>
				</li>
				<li style="display:flex;align-items:flex-start;gap:12px;font-size:14px;color:var(--md-sys-color-on-surface-variant)">
					<svg width="20" height="20" fill="none" stroke="var(--md-sys-color-primary)" viewBox="0 0 24 24" style="flex-shrink:0;margin-top:1px">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
					</svg>
					<span>{t(lang, 'about.feature_4')}</span>
				</li>
			</ul>
		</div>

		<!-- Open Source -->
		<div class="md3-card" style="margin-top:16px;opacity:0;transform:translateY(24px)" use:animateOnIntersect>
			<h2 class="title-large" style="margin-bottom:12px">{t(lang, 'about.opensource_title')}</h2>
			<p style="font-size:14px;color:var(--md-sys-color-on-surface-variant);line-height:1.6">
				{t(lang, 'about.opensource_desc')}
			</p>
			<div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:12px">
				<a href={siteConfig.github.gfHomeSvelteKit} target="_blank" rel="noopener noreferrer" class="md3-tonal-button md3-ripple">
					gf-home-sveltekit
				</a>
				<a href={siteConfig.github.gfHomeNext} target="_blank" rel="noopener noreferrer" class="md3-tonal-button md3-ripple">
					GF-HOME-NEXT
				</a>
				<a href={siteConfig.github.repo} target="_blank" rel="noopener noreferrer" class="md3-outlined-button md3-ripple">
					Greasy Fork
				</a>
			</div>
		</div>

		<!-- Contact -->
		<div class="md3-card" style="margin-top:16px;opacity:0;transform:translateY(24px)" use:animateOnIntersect>
			<h2 class="title-large" style="margin-bottom:12px">{t(lang, 'about.contact')}</h2>
			<p style="font-size:14px;color:var(--md-sys-color-on-surface-variant);line-height:1.6">
				{t(lang, 'about.contact_desc')} <a href="mailto:{siteConfig.contactEmail}" style="color:var(--md-sys-color-primary)">{siteConfig.contactEmail}</a>
			</p>
		</div>
	</div>
</div>

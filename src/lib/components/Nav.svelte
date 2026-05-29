<script lang="ts">
	import { page } from '$app/state';
	import { goto } from '$app/navigation';
	import { i18nConfig, type Lang } from '$i18n';
	import { t } from '$i18n';
	import { onMount } from 'svelte';

	let { lang }: { lang: Lang } = $props();
	let mobileOpen = $state(false);

	import { getTheme, setTheme, getSchemeId, setScheme, SCHEMES } from '$lib/theme.svelte.ts';

	// Focus trap
	let drawerRef = $state<HTMLElement>();
	let theme = $derived(getTheme());
	let schemeId = $derived(getSchemeId());
	let showColorPicker = $state(false);

	onMount(() => {
		const handleKey = (e: KeyboardEvent) => {
			if (!mobileOpen) return;
			if (e.key === 'Escape') { mobileOpen = false; return; }
			if (e.key === 'Tab' && drawerRef) {
				const focusable = drawerRef.querySelectorAll<HTMLElement>(
					'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
				);
				if (focusable.length === 0) return;
				const first = focusable[0], last = focusable[focusable.length - 1];
				if (e.shiftKey) { if (document.activeElement === first) { e.preventDefault(); last.focus(); } }
				else { if (document.activeElement === last) { e.preventDefault(); first.focus(); } }
			}
		};
		document.addEventListener('keydown', handleKey);
		return () => document.removeEventListener('keydown', handleKey);
	});

	const navItems = $derived([
		{ href: `/${lang}`, label: t(lang, 'nav.home') },
		{ href: `/${lang}/search`, label: t(lang, 'nav.search') },
		{ href: `/${lang}/help`, label: t(lang, 'nav.help') },
		{ href: `/${lang}/about`, label: t(lang, 'nav.about') }
	]);

	const langItems = i18nConfig.supportedLangs.map((l) => ({
		lang: l,
		label: i18nConfig.langDisplayNames[l],
		href: page.url.pathname.replace(/^\/[^/]+/, `/${l}`)
	}));

	function switchLang(newLang: Lang) {
		goto(page.url.pathname.replace(/^\/[^/]+/, `/${newLang}`));
	}
	const isActive = (href: string) => page.url.pathname === href;
</script>

<header class="m3-nav-header glass-nav">
	<nav class="m3-nav-inner">
		<a href="/{lang}" class="m3-nav-brand" data-sveltekit-preload-data="hover">GreasyFork镜像 Proxy</a>

		<!-- Desktop links -->
		<div class="m3-nav-links">
			{#each navItems as item}
				<a href={item.href} class="m3-nav-link" class:m3-nav-link--active={isActive(item.href)} data-sveltekit-preload-data="hover">
					{item.label}
				</a>
			{/each}

			<!-- Language selector -->
			<div class="m3-lang-selector">
				<button class="m3-lang-btn">
					{i18nConfig.langDisplayNames[lang]}
					<svg class="m3-lang-chevron" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
					</svg>
				</button>
				<div class="m3-lang-dropdown">
					{#each langItems as item}
						<button onclick={() => switchLang(item.lang)} class="m3-lang-option">{item.label}</button>
					{/each}
				</div>
			</div>

			<!-- Color scheme picker -->
			<div class="m3-color-selector">
				<button class="m3-color-btn" onclick={() => showColorPicker = !showColorPicker} aria-label="Choose color theme">
					<svg class="m3-color-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="10" />
						<circle cx="12" cy="12" r="4" fill="var(--md-sys-color-primary)" stroke="none" />
					</svg>
				</button>
				{#if showColorPicker}
					<div class="m3-color-dropdown">
						{#each SCHEMES as scheme (scheme.id)}
							<button
								class="m3-color-swatch"
								class:m3-color-swatch--active={schemeId === scheme.id}
								style:background={scheme.swatch}
								onclick={() => { setScheme(scheme.id); showColorPicker = false; }}
								aria-label={scheme.label}
								title={scheme.label}
							>
								{#if schemeId === scheme.id}
									<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/></svg>
								{/if}
							</button>
						{/each}
					</div>
				{/if}
			</div>

			<!-- Theme toggle -->
			<button
				class="m3-theme-btn"
				onclick={() => {
					if (theme === 'light') setTheme('dark');
					else if (theme === 'dark') setTheme('system');
					else setTheme('light');
				}}
				aria-label="Toggle theme"
			>
				{#if theme === 'light'}
					<svg class="m3-theme-icon" fill="currentColor" viewBox="0 0 24 24">
						<path d="M12 3a9 9 0 109 9c0-4.97-4.03-9-9-9z"/>
					</svg>
				{:else if theme === 'dark'}
					<svg class="m3-theme-icon" fill="currentColor" viewBox="0 0 24 24">
						<path d="M12 3V1m0 22v-2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 7a5 5 0 110 10 5 5 0 010-10z"/>
					</svg>
				{:else}
					<svg class="m3-theme-icon" fill="currentColor" viewBox="0 0 24 24">
						<path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm0 18a8 8 0 110-16 8 8 0 018 8z"/>
					</svg>
				{/if}
			</button>
		</div>

		<!-- Mobile hamburger -->
		<button class="m3-hamburger" onclick={() => mobileOpen = !mobileOpen} aria-label="Toggle menu">
			<svg class="m3-hamburger-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				{#if mobileOpen}
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
				{:else}
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
				{/if}
			</svg>
		</button>
	</nav>

	<!-- Mobile drawer -->
	{#if mobileOpen}
		<button class="m3-drawer-overlay" onclick={() => mobileOpen = false} aria-label="Close menu"></button>
		<nav class="m3-drawer" class:open={mobileOpen} bind:this={drawerRef}>
			<div class="m3-drawer-header">
				<span class="m3-drawer-title">GreasyFork镜像 Proxy</span>
				<button class="m3-drawer-close" onclick={() => mobileOpen = false} aria-label="Close menu">
					<svg class="m3-drawer-close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
					</svg>
				</button>
			</div>

			{#each navItems as item}
				<a href={item.href} class="m3-drawer-item" class:m3-drawer-item--active={isActive(item.href)} onclick={() => mobileOpen = false} data-sveltekit-preload-data="hover">
					{item.label}
				</a>
			{/each}

			<div class="m3-drawer-divider"></div>

			<p class="m3-drawer-lang-label">{t(lang, 'lang.' + lang)}</p>
			{#each langItems as item}
				<button class="m3-drawer-item" onclick={() => { switchLang(item.lang); mobileOpen = false; }}>
					{item.label}
				</button>
			{/each}

			<!-- Theme toggle (mobile) -->
			<div class="m3-drawer-theme">
				<button class="m3-drawer-theme-btn" onclick={() => {
					if (theme === 'light') setTheme('dark');
					else if (theme === 'dark') setTheme('system');
					else setTheme('light');
				}}>
						{#if theme === 'light'}
							<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" style="margin-right:8px;flex-shrink:0"><path d="M12 3a9 9 0 109 9c0-4.97-4.03-9-9-9z"/></svg>深色
						{/if}
						{#if theme === 'dark'}
							<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" style="margin-right:8px;flex-shrink:0"><path d="M12 3V1m0 22v-2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42M12 7a5 5 0 110 10 5 5 0 010-10z"/></svg>浅色
						{/if}
						{#if theme === 'system'}
							<svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24" style="margin-right:8px;flex-shrink:0"><path d="M12 2a10 10 0 1010 10A10 10 0 0012 2zm0 18a8 8 0 110-16 8 8 0 018 8z"/></svg>跟随系统
						{/if}
				</button>
			</div>

			<!-- Color scheme picker (mobile) -->
			<div class="m3-drawer-colors">
				<p class="m3-drawer-colors-label">Theme Color</p>
				<div class="m3-drawer-swatch-row">
					{#each SCHEMES as scheme (scheme.id)}
						<button
							class="m3-drawer-swatch"
							class:m3-drawer-swatch--active={schemeId === scheme.id}
							style:background={scheme.swatch}
							onclick={() => setScheme(scheme.id)}
							aria-label={scheme.label}
							title={scheme.label}
						>
							{#if schemeId === scheme.id}
								<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><path d="M5 13l4 4L19 7" stroke-linecap="round" stroke-linejoin="round"/></svg>
							{/if}
						</button>
					{/each}
				</div>
			</div>
		</nav>
	{/if}
</header>

<style>
	/* ─── Top bar ─────────────────────── */
	.m3-nav-header {
		position: sticky; top: 0; z-index: 50;
		height: 64px; display: flex; align-items: center;
		background: var(--md-sys-color-surface);
		border-bottom: 1px solid var(--md-sys-color-outline-variant);
		padding: 0 var(--md-sys-layout-side-margin);
	}
	.m3-nav-inner {
		display: flex; align-items: center; justify-content: space-between;
		width: 100%; max-width: var(--md-sys-layout-max-width); margin: 0 auto;
	}
	.m3-nav-brand {
		font-size: var(--md-sys-typescale-title-large); font-weight: 600;
		color: var(--md-sys-color-on-surface); text-decoration: none;
		transition: color var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard);
		flex-shrink: 0;
	}
	.m3-nav-brand:hover { color: var(--md-sys-color-primary); }

	/* ─── Desktop links ───────────────── */
	.m3-nav-links {
		display: none; align-items: center; gap: 2px;
	}
	.m3-nav-link {
		display: inline-flex; align-items: center; padding: 12px 16px; height: 40px;
		font-size: var(--md-sys-typescale-label-large); font-weight: 500;
		color: var(--md-sys-color-on-surface-variant); text-decoration: none;
		border-bottom: 3px solid transparent; position: relative; overflow: hidden;
		transition: color var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard),
		            background var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard);
		border-radius: var(--md-sys-shape-corner-full) var(--md-sys-shape-corner-full) 0 0;
	}
	.m3-nav-link:hover { color: var(--md-sys-color-on-surface); background: var(--md-sys-color-surface-variant); }
	.m3-nav-link--active { color: var(--md-sys-color-primary) !important; }
	.m3-nav-link--active:after, .m3-nav-link:hover:after {
		content: ''; position: absolute; bottom: 0; left: 50%; width: 100%; height: 3px;
		background: var(--md-sys-color-primary);
		transform: translate(-50%) scaleX(0);
		transition: transform var(--md-sys-motion-duration-medium) var(--md-sys-motion-easing-emphasized);
		transform-origin: center;
	}
	.m3-nav-link--active:after { transform: translate(-50%) scaleX(1); }

	/* ─── Language selector ─────────────── */
	.m3-lang-selector { position: relative; margin-left: 8px; }
	.m3-lang-btn {
		display: inline-flex; align-items: center; gap: 6px;
		padding: 10px 20px; height: 40px;
		background: var(--md-sys-color-secondary-container);
		color: var(--md-sys-color-on-secondary-container);
		border: none; border-radius: var(--md-sys-shape-corner-full);
		font-family: inherit; font-size: var(--md-sys-typescale-label-large); font-weight: 500;
		cursor: pointer;
		transition: all var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard);
		white-space: nowrap;
	}
	.m3-lang-btn:hover { filter: brightness(.95); box-shadow: var(--md-sys-elevation-1); }
	.m3-lang-chevron { width: 16px; height: 16px; flex-shrink: 0; }
	.m3-lang-dropdown {
		position: absolute; right: 0; top: calc(100% + 4px); min-width: 140px;
		background: var(--md-sys-color-surface-container);
		border-radius: var(--md-sys-shape-corner-extra-small);
		box-shadow: var(--md-sys-elevation-2);
		border: 1px solid var(--md-sys-color-outline-variant);
		overflow: hidden;
		opacity: 0; visibility: hidden; transform: translateY(-4px);
		transition: all var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard);
		z-index: 100;
	}
	.m3-lang-selector:hover .m3-lang-dropdown { opacity: 1; visibility: visible; transform: translateY(0); }
	.m3-lang-option {
		display: block; width: 100%; padding: 12px 16px; text-align: left;
		font-family: inherit; font-size: var(--md-sys-typescale-body-medium);
		color: var(--md-sys-color-on-surface); background: none;
		border: none; cursor: pointer;
		transition: background var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard);
	}
	.m3-lang-option:hover { background: var(--md-sys-color-surface-variant); }

	/* ─── Color picker (desktop) ──────── */
	.m3-color-selector { position: relative; margin-left: 4px; }
	.m3-color-btn {
		display: inline-flex; align-items: center; justify-content: center;
		width: 40px; height: 40px; border-radius: var(--md-sys-shape-corner-full);
		border: none; background: transparent; color: var(--md-sys-color-on-surface-variant);
		cursor: pointer;
		transition: all var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard);
		flex-shrink: 0;
	}
	.m3-color-btn:hover { background: var(--md-sys-color-surface-variant); color: var(--md-sys-color-primary); }
	.m3-color-icon { width: 20px; height: 20px; }
	.m3-color-dropdown {
		position: absolute; right: 0; top: calc(100% + 8px);
		display: flex; gap: 8px; padding: 12px;
		background: var(--md-sys-color-surface-container);
		border-radius: var(--md-sys-shape-corner-medium);
		box-shadow: var(--md-sys-elevation-3);
		border: 1px solid var(--md-sys-color-outline-variant);
		z-index: 100;
	}
	.m3-color-swatch {
		width: 32px; height: 32px; border-radius: var(--md-sys-shape-corner-full);
		border: 3px solid transparent; cursor: pointer;
		transition: transform var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard),
		            border-color var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard);
		display: inline-flex; align-items: center; justify-content: center;
		padding: 0;
	}
	.m3-color-swatch:hover { transform: scale(1.15); }
	.m3-color-swatch--active { border-color: var(--md-sys-color-on-surface); }
	.m3-color-swatch svg { width: 16px; height: 16px; }

	/* ─── Theme toggle (desktop) ──────── */
	.m3-theme-btn {
		display: inline-flex; align-items: center; justify-content: center;
		width: 40px; height: 40px; border-radius: var(--md-sys-shape-corner-full);
		border: none; background: transparent; color: var(--md-sys-color-on-surface-variant);
		cursor: pointer;
		transition: all var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard);
		flex-shrink: 0; margin-left: 4px;
	}
	.m3-theme-btn:hover { background: var(--md-sys-color-surface-variant); color: var(--md-sys-color-primary); }
	.m3-theme-icon { width: 20px; height: 20px; }

	/* ─── Hamburger ──────────────────── */
	.m3-hamburger {
		display: flex; align-items: center; justify-content: center;
		width: 48px; height: 48px; background: none; border: none;
		border-radius: var(--md-sys-shape-corner-full);
		color: var(--md-sys-color-on-surface); cursor: pointer;
		transition: background var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard);
		flex-shrink: 0;
	}
	.m3-hamburger:hover { background: var(--md-sys-color-surface-variant); }
	.m3-hamburger-icon { width: 24px; height: 24px; }

	/* ─── Drawer ─────────────────────── */
	.m3-drawer-overlay {
		position: fixed; top: 0; right: 0; bottom: 0; left: 0;
		background: #0000004d; z-index: 80; border: none; cursor: pointer;
	}
	.m3-drawer {
		position: fixed; top: 0; right: 0; bottom: 0;
		width: 320px; max-width: 85vw;
		background: var(--md-sys-color-surface-container-low);
		z-index: 90; padding: 24px 16px;
		display: flex; flex-direction: column; gap: 2px;
		box-shadow: var(--md-sys-elevation-3); overflow-y: auto;
		transform: translate(100%);
		transition: transform var(--md-sys-motion-duration-medium) var(--md-sys-motion-easing-emphasized);
	}
	.m3-drawer.open { transform: translate(0); }
	.m3-drawer-header {
		display: flex; align-items: center; justify-content: space-between;
		padding: 0 8px 16px; border-bottom: 1px solid var(--md-sys-color-outline-variant);
		margin-bottom: 8px;
	}
	.m3-drawer-title { font-size: var(--md-sys-typescale-title-medium); font-weight: 600; color: var(--md-sys-color-on-surface); }
	.m3-drawer-close {
		display: flex; align-items: center; justify-content: center;
		width: 40px; height: 40px; background: none; border: none;
		border-radius: var(--md-sys-shape-corner-full); color: var(--md-sys-color-on-surface);
		cursor: pointer;
		transition: background var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard);
	}
	.m3-drawer-close:hover { background: var(--md-sys-color-surface-variant); }
	.m3-drawer-close-icon { width: 20px; height: 20px; }
	.m3-drawer-item {
		display: flex; align-items: center; gap: 12px; padding: 14px 16px;
		border-radius: var(--md-sys-shape-corner-full);
		font-size: var(--md-sys-typescale-body-large); font-weight: 500;
		color: var(--md-sys-color-on-surface-variant); text-decoration: none;
		transition: all var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard);
		font-family: inherit; background: none; border: none; cursor: pointer;
		width: 100%; text-align: left; position: relative; overflow: hidden;
	}
	.m3-drawer-item:hover { background: var(--md-sys-color-surface-variant); color: var(--md-sys-color-on-surface); }
	.m3-drawer-item--active { color: var(--md-sys-color-primary) !important; background: var(--md-sys-color-primary-container) !important; }
	.m3-drawer-divider { height: 1px; background: var(--md-sys-color-outline-variant); margin: 8px; }
	.m3-drawer-lang-label { padding: 8px 16px; font-size: var(--md-sys-typescale-label-medium); color: var(--md-sys-color-on-surface-variant); }

	/* ─── Drawer: theme + color ──────── */
	.m3-drawer-theme { padding: 16px 8px 0; margin-top: auto; border-top: 1px solid var(--md-sys-color-outline-variant); }
	.m3-drawer-theme-btn {
		display: flex; align-items: center; gap: 8px; width: 100%; padding: 12px 16px;
		border-radius: var(--md-sys-shape-corner-full); border: none; background: none;
		font-family: inherit; font-size: var(--md-sys-typescale-body-large);
		color: var(--md-sys-color-on-surface-variant); cursor: pointer;
		transition: background var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard);
	}
	.m3-drawer-theme-btn:hover { background: var(--md-sys-color-surface-variant); }
	.m3-drawer-colors { padding: 16px 8px 0; }
	.m3-drawer-colors-label { padding: 0 16px 8px; font-size: var(--md-sys-typescale-label-medium); color: var(--md-sys-color-on-surface-variant); }
	.m3-drawer-swatch-row { display: flex; gap: 10px; padding: 0 16px; flex-wrap: wrap; }
	.m3-drawer-swatch {
		width: 36px; height: 36px; border-radius: var(--md-sys-shape-corner-full);
		border: 3px solid transparent; cursor: pointer;
		transition: transform var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard),
		            border-color var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard);
		display: inline-flex; align-items: center; justify-content: center; padding: 0;
	}
	.m3-drawer-swatch:hover { transform: scale(1.1); }
	.m3-drawer-swatch--active { border-color: var(--md-sys-color-on-surface); }
	.m3-drawer-swatch svg { width: 18px; height: 18px; }

	/* ─── Responsive ─────────────────── */
	@media (min-width: 768px) {
		.m3-nav-links { display: flex; }
		.m3-hamburger { display: none; }
	}
	@media (max-width: 767px) {
		.m3-nav-links { display: none; }
		.m3-hamburger { display: flex; }
	}
</style>
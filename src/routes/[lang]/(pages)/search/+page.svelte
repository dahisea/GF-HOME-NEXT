<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { page } from '$app/state';
	import { t, type Lang } from '$i18n';
	import { siteConfig, shouldShowAds } from '$lib/config';
	import AdSense from '$components/AdSense.svelte';
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

	// ─── Hash state management (for advanced filters persistence) ───
	function hashGet(): Record<string, string> {
		const h = window.location.hash;
		if (!h || !h.startsWith('#?') || h === '#google_vignette') return {};
		const params = new URLSearchParams(h.substring(2));
		const obj: Record<string, string> = {};
		params.forEach((v, k) => { if (v) obj[k] = v; });
		return obj;
	}
	function hashSet(obj: Record<string, string>): void {
		const p = new URLSearchParams();
		for (const [k, v] of Object.entries(obj)) {
			if (v) p.set(k, v);
		}
		const s = p.toString();
		window.location.hash = s ? '#?' + s : '';
	}

	// ─── Basic search form ──────────────────────────────────────────────
	function handleBasicSubmit(e: Event) {
		const form = e.target as HTMLFormElement;
		const siteInput = form.querySelector<HTMLInputElement>('[name="site"]');
		if (siteInput && !siteInput.value.trim()) {
			siteInput.disabled = true;
		}
	}

	// ─── Advanced filter values ────────────────────────────────────────
	let totalInstallsOp = $state('gt');
	let totalInstalls = $state('');
	let dailyInstallsOp = $state('gt');
	let dailyInstalls = $state('');
	let ratingsOp = $state('gt');
	let ratings = $state('');
	let createdOp = $state('after');
	let created = $state('');
	let updatedOp = $state('after');
	let updated = $state('');
	let locales: string[] = $state([]);
	let tz = $state('');

	// Available locales for the multi-select
	const localeOptions = [
		{ value: '187', label: '简体中文 (zh-CN)' },
		{ value: '188', label: '繁體中文 (zh-TW)' },
		{ value: '40',  label: 'English (en)' },
		{ value: '78',  label: '日本語 (ja)' },
		{ value: '88',  label: '한국어 (ko)' },
		{ value: '42',  label: 'Español (es)' },
		{ value: '51',  label: 'Français (fr)' },
		{ value: '35',  label: 'Deutsch (de)' },
		{ value: '139', label: 'Русский (ru)' },
		{ value: '134', label: 'Português Brasileiro (pt-BR)' },
		{ value: '76',  label: 'Italiano (it)' },
		{ value: '118', label: 'Nederlands (nl)' },
		{ value: '130', label: 'Polski (pl)' },
		{ value: '171', label: 'Türkçe (tr)' },
		{ value: '181', label: 'Tiếng Việt (vi)' },
		{ value: '165', label: 'ไทย (th)' },
		{ value: '71',  label: 'Bahasa Indonesia (id)' }
	];

	function applyFilters() {
		const params = new URLSearchParams();
		if (totalInstalls) { params.set('total_installs_op', totalInstallsOp); params.set('total_installs', totalInstalls); }
		if (dailyInstalls) { params.set('daily_installs_op', dailyInstallsOp); params.set('daily_installs', dailyInstalls); }
		if (ratings) { params.set('ratings_op', ratingsOp); params.set('ratings', ratings); }
		if (created) { params.set('created_op', createdOp); params.set('created', created); }
		if (updated) { params.set('updated_op', updatedOp); params.set('updated', updated); }
		if (tz) params.set('tz', tz);
		hashSet(Object.fromEntries(params));
		alert('Filter conditions applied. You can view the results by submitting the script search above.');
	}

	function clearAdvancedFilters() {
		totalInstallsOp = 'gt'; totalInstalls = '';
		dailyInstallsOp = 'gt'; dailyInstalls = '';
		ratingsOp = 'gt'; ratings = '';
		createdOp = 'after'; created = '';
		updatedOp = 'after'; updated = '';
		locales = []; tz = '';
		hashSet({});
		alert('All advanced filter conditions have been cleared.');
	}

	// ─── Restore filters from hash on mount ────────────────────────────
	onMount(() => {
		const stored = hashGet();
		if (stored.total_installs_op) totalInstallsOp = stored.total_installs_op;
		if (stored.total_installs) totalInstalls = stored.total_installs;
		if (stored.daily_installs_op) dailyInstallsOp = stored.daily_installs_op;
		if (stored.daily_installs) dailyInstalls = stored.daily_installs;
		if (stored.ratings_op) ratingsOp = stored.ratings_op;
		if (stored.ratings) ratings = stored.ratings;
		if (stored.created_op) createdOp = stored.created_op;
		if (stored.created) created = stored.created;
		if (stored.updated_op) updatedOp = stored.updated_op;
		if (stored.updated) updated = stored.updated;
		if (stored.tz) tz = stored.tz;

		if (!stored.tz && !stored.total_installs && !stored.daily_installs) {
			// auto-detect timezone
			tick().then(() => {
				try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone; } catch {}
			});
		}
	});
</script>

<svelte:head>
	<title>{t(lang, 'meta.search_title')}</title>
	<meta name="description" content={t(lang, 'meta.search_desc')} />
</svelte:head>

<div class="width-constraint">
	<section class="text-content">
		<!-- Top Ad (en/ja only) -->
		{#if shouldShowAds(lang)}
			<AdSense slot={siteConfig.adsense.slots.generic} format="auto" />
		{/if}

		<!-- Basic Script Search -->
		<form class="script-search" action="/{lang}/s" accept-charset="UTF-8" method="get" onsubmit={handleBasicSubmit}>
			<h3>{t(lang, 'search.script_search_title')}</h3>
			<p style="color:var(--md-sys-color-on-surface-variant);font-size:14px">{t(lang, 'search.script_search_desc')}</p>
			<p style="color:var(--md-sys-color-on-surface-variant);font-size:14px;margin-top:4px">{t(lang, 'search.enter_keywords')}</p>
			<input type="search" name="q" placeholder={t(lang, 'search.placeholder')} style="display:block;width:100%;max-width:400px;margin-top:8px;padding:10px 16px;border:1px solid var(--md-sys-color-outline-variant);border-radius:var(--md-sys-shape-corner-full);font-family:inherit;font-size:14px;background:var(--md-sys-color-surface-container-highest);color:var(--md-sys-color-on-surface);outline:none" />
			<p style="color:var(--md-sys-color-on-surface-variant);font-size:14px;margin-top:12px">{t(lang, 'search.enter_domain_desc')}</p>
			<input type="search" name="site" id="site-input" placeholder={t(lang, 'search.site.placeholder')} style="display:block;width:100%;max-width:400px;margin-top:4px;padding:10px 16px;border:1px solid var(--md-sys-color-outline-variant);border-radius:var(--md-sys-shape-corner-full);font-family:inherit;font-size:14px;background:var(--md-sys-color-surface-container-highest);color:var(--md-sys-color-on-surface);outline:none" />
			<input type="hidden" name="sort" value="" />
			<input type="hidden" name="filter_locale" value="0" />
			<div style="margin-top:16px">
				<button type="submit" class="search-icon-btn md3-ripple" aria-label={t(lang, 'search.button')}>
					<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
					</svg>
				</button>
			</div>
		</form>

		<!-- Advanced Search Options -->
		<div class="md3-card" style="margin-top:32px;padding:20px 24px;opacity:0;transform:translateY(24px)" use:animateOnIntersect>
			<details open>
				<summary style="font-size:16px;font-weight:500;color:var(--md-sys-color-on-surface);cursor:pointer;user-select:none;padding:4px 0">
					⚙️ {t(lang, 'search.advanced_options')}
				</summary>

				<form id="advanced-search-form" onsubmit={e => { e.preventDefault(); applyFilters(); }} style="margin-top:16px;display:flex;flex-direction:column;gap:16px">
					<!-- Total Installs -->
					<div class="filter-group">
						<span style="display:block;font-size:13px;font-weight:500;color:var(--md-sys-color-on-surface-variant);margin-bottom:6px">{t(lang, 'search.filter.total_installs')}</span>
						<div class="filter-row" style="display:flex;gap:12px">
							<select bind:value={totalInstallsOp} style="flex:1;padding:10px 14px;border:1px solid var(--md-sys-color-outline-variant);border-radius:var(--md-sys-shape-corner-small);font-family:inherit;font-size:14px;background:var(--md-sys-color-surface-container-highest);color:var(--md-sys-color-on-surface)">
								<option value="gt">{t(lang, 'search.operator.gt')}</option>
								<option value="lt">{t(lang, 'search.operator.lt')}</option>
								<option value="eq">{t(lang, 'search.operator.eq')}</option>
							</select>
							<input type="number" bind:value={totalInstalls} placeholder="1000" min="0" style="flex:2;padding:10px 14px;border:1px solid var(--md-sys-color-outline-variant);border-radius:var(--md-sys-shape-corner-small);font-family:inherit;font-size:14px;background:var(--md-sys-color-surface-container-highest);color:var(--md-sys-color-on-surface);outline:none" />
						</div>
					</div>

					<!-- Daily Installs -->
					<div class="filter-group">
						<span style="display:block;font-size:13px;font-weight:500;color:var(--md-sys-color-on-surface-variant);margin-bottom:6px">{t(lang, 'search.filter.daily_installs')}</span>
						<div class="filter-row" style="display:flex;gap:12px">
							<select bind:value={dailyInstallsOp} style="flex:1;padding:10px 14px;border:1px solid var(--md-sys-color-outline-variant);border-radius:var(--md-sys-shape-corner-small);font-family:inherit;font-size:14px;background:var(--md-sys-color-surface-container-highest);color:var(--md-sys-color-on-surface)">
								<option value="gt">{t(lang, 'search.operator.gt')}</option>
								<option value="lt">{t(lang, 'search.operator.lt')}</option>
								<option value="eq">{t(lang, 'search.operator.eq')}</option>
							</select>
							<input type="number" bind:value={dailyInstalls} placeholder="100" min="0" style="flex:2;padding:10px 14px;border:1px solid var(--md-sys-color-outline-variant);border-radius:var(--md-sys-shape-corner-small);font-family:inherit;font-size:14px;background:var(--md-sys-color-surface-container-highest);color:var(--md-sys-color-on-surface);outline:none" />
						</div>
					</div>

					<!-- Ratings -->
					<div class="filter-group">
						<span style="display:block;font-size:13px;font-weight:500;color:var(--md-sys-color-on-surface-variant);margin-bottom:6px">{t(lang, 'search.filter.ratings')}</span>
						<div class="filter-row" style="display:flex;gap:12px">
							<select bind:value={ratingsOp} style="flex:1;padding:10px 14px;border:1px solid var(--md-sys-color-outline-variant);border-radius:var(--md-sys-shape-corner-small);font-family:inherit;font-size:14px;background:var(--md-sys-color-surface-container-highest);color:var(--md-sys-color-on-surface)">
								<option value="gt">{t(lang, 'search.operator.gt')}</option>
								<option value="lt">{t(lang, 'search.operator.lt')}</option>
								<option value="eq">{t(lang, 'search.operator.eq')}</option>
							</select>
							<input type="number" bind:value={ratings} placeholder="4.5" step="0.1" min="0" max="5" style="flex:2;padding:10px 14px;border:1px solid var(--md-sys-color-outline-variant);border-radius:var(--md-sys-shape-corner-small);font-family:inherit;font-size:14px;background:var(--md-sys-color-surface-container-highest);color:var(--md-sys-color-on-surface);outline:none" />
						</div>
					</div>

					<!-- Created Date -->
					<div class="filter-group">
						<span style="display:block;font-size:13px;font-weight:500;color:var(--md-sys-color-on-surface-variant);margin-bottom:6px">{t(lang, 'search.filter.created')}</span>
						<div class="filter-row" style="display:flex;gap:12px">
							<select bind:value={createdOp} style="flex:1;padding:10px 14px;border:1px solid var(--md-sys-color-outline-variant);border-radius:var(--md-sys-shape-corner-small);font-family:inherit;font-size:14px;background:var(--md-sys-color-surface-container-highest);color:var(--md-sys-color-on-surface)">
								<option value="after">{t(lang, 'search.operator.after')}</option>
								<option value="before">{t(lang, 'search.operator.before')}</option>
							</select>
							<input type="datetime-local" bind:value={created} style="flex:2;padding:10px 14px;border:1px solid var(--md-sys-color-outline-variant);border-radius:var(--md-sys-shape-corner-small);font-family:inherit;font-size:14px;background:var(--md-sys-color-surface-container-highest);color:var(--md-sys-color-on-surface);outline:none" />
						</div>
					</div>

					<!-- Updated Date -->
					<div class="filter-group">
						<span style="display:block;font-size:13px;font-weight:500;color:var(--md-sys-color-on-surface-variant);margin-bottom:6px">{t(lang, 'search.filter.updated')}</span>
						<div class="filter-row" style="display:flex;gap:12px">
							<select bind:value={updatedOp} style="flex:1;padding:10px 14px;border:1px solid var(--md-sys-color-outline-variant);border-radius:var(--md-sys-shape-corner-small);font-family:inherit;font-size:14px;background:var(--md-sys-color-surface-container-highest);color:var(--md-sys-color-on-surface)">
								<option value="after">{t(lang, 'search.operator.after')}</option>
								<option value="before">{t(lang, 'search.operator.before')}</option>
							</select>
							<input type="datetime-local" bind:value={updated} style="flex:2;padding:10px 14px;border:1px solid var(--md-sys-color-outline-variant);border-radius:var(--md-sys-shape-corner-small);font-family:inherit;font-size:14px;background:var(--md-sys-color-surface-container-highest);color:var(--md-sys-color-on-surface);outline:none" />
						</div>
					</div>

					<!-- Script Language -->
					<div class="filter-group">
						<label for="filter-locales" style="display:block;font-size:13px;font-weight:500;color:var(--md-sys-color-on-surface-variant);margin-bottom:6px">{t(lang, 'search.filter.locales')}</label>
						<select id="filter-locales" name="entry_locales" multiple style="width:100%;padding:10px 14px;border:1px solid var(--md-sys-color-outline-variant);border-radius:var(--md-sys-shape-corner-small);font-family:inherit;font-size:14px;background:var(--md-sys-color-surface-container-highest);color:var(--md-sys-color-on-surface);min-height:120px">
							{#each localeOptions as opt}
								<option value={opt.value}>{opt.label}</option>
							{/each}
						</select>
						<small style="font-size:12px;color:var(--md-sys-color-on-surface-variant);display:block;margin-top:4px">Hold Ctrl (Windows) or Cmd (Mac) to select multiple</small>
					</div>

					<!-- Time Zone -->
					<div class="filter-group">
						<label for="filter-tz" style="display:block;font-size:13px;font-weight:500;color:var(--md-sys-color-on-surface-variant);margin-bottom:6px">{t(lang, 'search.filter.tz')}</label>
						<input id="filter-tz" type="text" bind:value={tz} placeholder="Auto-detect (optional)" style="width:100%;padding:10px 14px;border:1px solid var(--md-sys-color-outline-variant);border-radius:var(--md-sys-shape-corner-small);font-family:inherit;font-size:14px;background:var(--md-sys-color-surface-container-highest);color:var(--md-sys-color-on-surface);outline:none" />
					</div>

					<!-- Actions -->
					<div class="button-group" style="display:flex;gap:12px;padding-top:16px;border-top:1px solid var(--md-sys-color-outline-variant)">
						<button type="submit" class="md3-button md3-ripple" style="flex:1">{t(lang, 'search.filter.apply')}</button>
						<button type="button" onclick={clearAdvancedFilters} class="md3-outlined-button md3-ripple" style="flex:1">{t(lang, 'search.filter.clear')}</button>
					</div>
				</form>
			</details>
		</div>

		<!-- Bottom Ad (en/ja only) -->
		{#if shouldShowAds(lang)}
			<div style="margin-top:24px">
				<AdSense slot={siteConfig.adsense.slots.inFeedFluid} format="fluid" layoutKey={siteConfig.adsense.fluidLayoutKey} />
			</div>
		{/if}
	</section>
</div>

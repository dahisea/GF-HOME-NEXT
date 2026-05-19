<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { t, type Lang, i18nConfig } from '$i18n';
	import { siteConfig, getPrimaryLookupNodes, getBackupLookupNodes } from '$lib/config';
	import { sendAudit } from '$lib/audit';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let lang: Lang = $derived(data.lang);

	// 从 config 获取 Lookup API 节点列表
	const PRIMARY_NODES = getPrimaryLookupNodes();
	const BACKUP_NODES = getBackupLookupNodes();

	type ApiNode = { id: string; endpoint: string; method: string };

	function nodeName(n: ApiNode): string { return `NODE_${n.id}`; }

	// Hash 参数解析（与旧项目一致）
	interface SearchParams {
		q?: string;
		site?: string;
		sort?: string;
		filter_locale?: string;
		page?: string;
		total_installs?: string;
		total_installs_operator?: string;
		daily_installs?: string;
		daily_installs_operator?: string;
		ratings?: string;
		ratings_operator?: string;
		created?: string;
		created_operator?: string;
		updated?: string;
		updated_operator?: string;
		'entry_locales[]'?: string[];
		tz?: string;
	}

	let lastValidHash = $state('');
	let lastSearchParams = $state<SearchParams>({});

	function isHashValid(hash: string): boolean {
		return !!hash && hash !== '#' && hash !== '#?' && hash !== '#google_vignette';
	}

	function parseHashParams(hash: string): SearchParams {
		let raw = '';
		if (hash.startsWith('#?')) raw = hash.substring(2);
		else if (hash.startsWith('#')) raw = hash.substring(1);

		const params = new URLSearchParams(raw);
		const result: SearchParams = {};
		for (const [key, value] of params.entries()) {
			if (key.endsWith('[]')) {
				if (!result[key as keyof SearchParams]) (result as Record<string, unknown>)[key] = [];
				((result as Record<string, unknown>)[key] as string[]).push(value);
			} else {
				(result as Record<string, unknown>)[key] = value;
			}
		}
		return result;
	}

	function getSearchParams(): SearchParams {
		const hash = window.location.hash;
		if (!isHashValid(hash)) {
			return isHashValid(lastValidHash) ? parseHashParams(lastValidHash) : {};
		}
		lastValidHash = hash;
		const p = parseHashParams(hash);
		if (Object.keys(p).length > 0) lastSearchParams = p;
		return p;
	}

	function setHashParams(params: SearchParams): void {
		const search = new URLSearchParams();
		for (const [key, value] of Object.entries(params)) {
			if (value == null || value === '') continue;
			if (Array.isArray(value)) {
				for (const v of value) if (v) search.append(key, v);
			} else {
				search.append(key, value);
			}
		}
		const qs = search.toString();
		const url = new URL(window.location);
		url.hash = qs ? `#?${qs}` : '#';
		window.history.pushState({}, '', url);
	}

	// 脚本结果接口定义
	interface ScriptResult {
		id: number;
		name: string;
		description: string;
		daily_installs: number;
		total_installs: number;
		good_ratings: number;
		ok_ratings: number;
		bad_ratings: number;
		fan_score: number;
		created_at: string;
		code_updated_at: string;
		code_url: string;
		users?: { name?: string; id?: number }[];
		url?: string;
	}

	let results = $state<ScriptResult[]>([]);
	let loading = $state(false);
	let error = $state('');
	let sidebarOpen = $state(false);
	let query = $state('');
	let sortBy = $state('');
	let filterLocale = $state('0');
	let currentPage = $state('1');
	let advancedParams = $state<SearchParams>({});
	let responseNode = $state('');
	let abortController: AbortController | null = $state(null);

	// SHA-256 签名生成
	async function generateSS(): Promise<string> {
		const timestamp = Math.floor(Date.now() / 1000).toString();
		const input = timestamp.substring(0, 8);
		const data = new TextEncoder().encode(input);
		const hashBuffer = await crypto.subtle.digest('SHA-256', data);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('').substring(0, siteConfig.lookupSignature.ssLength);
	}

	// API 请求函数（单节点带超时）
	async function fetchFromNode(
		node: ApiNode,
		signal: AbortSignal,
		timeoutMs = 5000
	): Promise<{ success: boolean; data?: ScriptResult[]; node?: ApiNode; error?: string }> {
		try {
			const params = { ...getSearchParams() };
			delete params.locale;
			const ss = await generateSS();

			let url: string;
			let options: RequestInit;

			if (node.method === 'POST') {
				const body = new URLSearchParams(params as Record<string, string>).toString();
				url = `${node.endpoint}/${ss}`;
				options = {
					method: 'POST',
					headers: { Accept: 'application/json', 'Content-Type': 'application/x-www-form-urlencoded' },
					body,
					mode: 'cors' as RequestMode,
					signal
				};
			} else {
				(params as Record<string, string>).ss = ss;
				const qs = new URLSearchParams(params as Record<string, string>).toString();
				url = qs ? `${node.endpoint}?${qs}` : node.endpoint;
				options = {
					method: 'GET',
					headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
					mode: 'cors' as RequestMode,
					signal
				};
			}

			const timeout = new Promise<never>((_, reject) =>
				setTimeout(() => reject(new Error('Timeout')), timeoutMs)
			);
			const res = await Promise.race([fetch(url, options), timeout]);

			if (!(res instanceof Response) || !res.ok) throw new Error(`HTTP ${(res as Response).status}`);

			let json: ScriptResult[];
			const encoding = (res as Response).headers.get('X-Content-Encoding');
			if (encoding === 'base64') {
				const text = await (res as Response).text();
				const decoded = atob(text);
				const bytes = new Uint8Array(decoded.length);
				for (let i = 0; i < decoded.length; i++) bytes[i] = decoded.charCodeAt(i);
				json = JSON.parse(new TextDecoder('utf-8').decode(bytes));
			} else {
				json = await (res as Response).json();
			}

			return { success: true, data: json, node };
		} catch (e) {
			return { success: false, error: e instanceof Error ? e.message : 'Unknown error', node };
		}
	}

	async function raceNodes(nodes: ApiNode[], signal: AbortSignal): Promise<{ success: boolean; data?: ScriptResult[]; node?: ApiNode; failedNodes?: string[]; message?: string }> {
		return new Promise((resolve) => {
			let resolved = false;
			let completed = 0;
			const failed: string[] = [];

			nodes.forEach(async (node) => {
				const result = await fetchFromNode(node, signal);
				if (resolved) return;
				completed++;

				if (result.success) {
					resolved = true;
					resolve({ success: true, data: result.data, node: result.node });
				} else {
					failed.push(node.id);
					if (completed === nodes.length) {
						resolved = true;
						resolve({ success: false, failedNodes: failed, message: `所有节点请求失败: ${failed.join(', ')}` });
					}
				}
			});
		});
	}

	// 主搜索流程 — 先主节点，失败后尝试备节点
	async function doSearch(): Promise<void> {
		const params = getSearchParams();
		if (!params.q && !params.site && !params.page) {
			error = '警告: 当前未搜索任何内容';
			return;
		}

		abortController?.abort();
		abortController = new AbortController();
		const signal = abortController.signal;

		loading = true;
		error = '';
		responseNode = '';

		// 尝试主节点
		const primaryResult = await raceNodes(PRIMARY_NODES, signal);
		if (primaryResult.success && primaryResult.data) {
			responseNode = primaryResult.node ? nodeName(primaryResult.node) : '';
			handleResults(primaryResult.data);
			return;
		}

		// 尝试备用节点
		const backupResult = await raceNodes(BACKUP_NODES, signal);
		if (backupResult.success && backupResult.data) {
			responseNode = backupResult.node ? nodeName(backupResult.node) : '';
			handleResults(backupResult.data);
		} else {
			error = backupResult.message || '所有 API 请求失败，请检查网络连接或稍后重试';
			loading = false;
		}
	}

	function handleResults(data: ScriptResult[]): void {
		if ((data as unknown as { redirect?: boolean; target_url?: string; message?: string }).redirect) {
			const r = data as unknown as { target_url: string; message: string };
			alert(r.message || '检测到非中文区域，将跳转到 Greasyfork Official Site');
			window.location.href = r.target_url;
			return;
		}

		if (Array.isArray(data)) {
			results = data;

			// Audit: search event
			if (siteConfig.audit.enabled) {
				const sp = getSearchParams();
				sendAudit('search', {
					path: page.url.pathname,
					lang,
					payload: {
						q: sp.q || '',
						site: sp.site || '',
						sort: sp.sort || '',
						filter_locale: sp.filter_locale || '',
						page: sp.page || '1',
						hit_count: data.length,
					},
				});
			}
		} else {
			results = [];
		}
		loading = false;
	}

	// 从 Hash 同步到 UI 控件
	function syncFromHash(): SearchParams {
		const p = getSearchParams();
		query = p.q || '';
		sortBy = p.sort || '';
		filterLocale = p.filter_locale || '0';
		currentPage = p.page || '1';
		advancedParams = p;
		return p;
	}

	function applyFilter(e: Event): void {
		e.preventDefault();
		const form = e.target as HTMLFormElement;
		const fd = new FormData(form);
		const newParams: SearchParams = {};

		for (const [key, value] of fd.entries()) {
			if (key.endsWith('[]')) {
				if (!newParams[key as keyof SearchParams]) (newParams as Record<string, unknown>)[key] = [];
				if (value) ((newParams as Record<string, unknown>)[key] as string[]).push(value as string);
			} else {
				if (value) (newParams as Record<string, unknown>)[key] = value;
			}
		}

		setHashParams(newParams);
		syncFromHash();
		window.open(window.location.href, '_blank');
	}

	function clearFilters(): void {
		const p = { q: query, page: currentPage !== '1' ? currentPage : undefined };
		setHashParams(p);
		syncFromHash();
		window.open(window.location.href, '_blank');
	}

	function handleSearch(e: Event): void {
		e.preventDefault();
		const form = e.target as HTMLFormElement;
		const q = (form.querySelector('input[name="q"]') as HTMLInputElement)?.value?.trim();
		if (!q) return;
		const p = getSearchParams();
		const newParams: SearchParams = { q, sort: p.sort || '', filter_locale: p.filter_locale || '0' };
		if (p.site) newParams.site = p.site;
		setHashParams(newParams);
		syncFromHash();
		window.open(window.location.href, '_blank');
	}

	function handleSort(value: string): void {
		const newParams = { ...getSearchParams(), sort: value };
		setHashParams(newParams);
		syncFromHash();
		window.open(window.location.href, '_blank');
	}

	function handleLangFilter(value: string): void {
		const newParams = { ...getSearchParams(), filter_locale: value };
		setHashParams(newParams);
		syncFromHash();
		window.open(window.location.href, '_blank');
	}

	// 工具函数
	function formatDateTime(raw: string): string {
		if (!raw) return '未知';
		const d = new Date(raw);
		return d.toLocaleString('zh-CN', {
			year: 'numeric', month: '2-digit', day: '2-digit',
			hour: '2-digit', minute: '2-digit', hour12: false
		}).replace(/\//g, '-');
	}

	function escapeHtml(text: string): string {
		const div = document.createElement('div');
		div.textContent = text;
		return div.innerHTML;
	}

	function getScriptInfoUrl(script: ScriptResult): string {
		const locale = i18nConfig.langNames[lang];
		return `/${lang}/info#/${locale}/scripts/${script.id}/detail`;
	}

	function getDownloadUrl(script: ScriptResult): string {
		if (script.code_url) {
			const path = script.code_url.replace('https://update.greasyfork.org/scripts/', '');
			return `/${lang}/l#/${path}`;
		}
		return '#';
	}

	function getAuthorUrl(script: ScriptResult): string {
		const userId = script.users?.[0]?.id;
		if (!userId) return '#';
		const locale = i18nConfig.langNames[lang];
		return `/${lang}/info#/${locale}/users/${userId}`;
	}

	// ─── 生命周期 ──────────────────────────────────────────────────────
	let popstateTimer: ReturnType<typeof setTimeout>;
	let initialChecked = $state(false);

	function onHashChanged() {
		const hash = window.location.hash;
		if (hash === '#google_vignette') return;
		if (isHashValid(hash)) lastValidHash = hash;
	}

	onMount(() => {
		if (window.location.hash === '#google_vignette') return;

		window.addEventListener('hashchange', onHashChanged);

		const debouncedPop = () => {
			clearTimeout(popstateTimer);
			popstateTimer = setTimeout(() => {
				clearTimeout(popstateTimer);
				if (window.location.hash === '#google_vignette') return;
				syncFromHash();
				doSearch();
			}, 100);
		};
		window.addEventListener('popstate', debouncedPop);

		// visibility 变化时 abort 请求
		document.addEventListener('visibilitychange', () => {
			if (document.hidden && abortController) abortController.abort();
		});

		// 初始加载
		initialChecked = true;
		const params = syncFromHash();
		if (params.q || params.site || params.page) {
			doSearch();
		} else {
			error = '警告: 当前未搜索任何内容';
		}

		return () => {
			window.removeEventListener('hashchange', onHashChanged);
			window.removeEventListener('popstate', debouncedPop);
		};
	});

	// 排序选项
	const sortOptions = [
		{ value: '', label: '相关程度' },
		{ value: 'daily_installs', label: '日安装量' },
		{ value: 'total_installs', label: '总安装量' },
		{ value: 'ratings', label: '得分' },
		{ value: 'created', label: '创建日期' },
		{ value: 'updated', label: '更新日期' },
		{ value: 'name', label: '名称' }
	];

	const localeOptions = [
		{ value: '187', label: '简体中文 (zh-CN)' },
		{ value: '188', label: '繁體中文 (zh-TW)' },
		{ value: '40', label: 'English (en)' },
		{ value: '78', label: '日本語 (ja)' },
		{ value: '88', label: '한국어 (ko)' },
		{ value: '42', label: 'Español (es)' },
		{ value: '51', label: 'Français (fr)' },
		{ value: '35', label: 'Deutsch (de)' },
		{ value: '139', label: 'Русский (ru)' },
		{ value: '134', label: 'Português do Brasil (pt-BR)' },
		{ value: '76', label: 'Italiano (it)' },
		{ value: '118', label: 'Nederlands (nl)' },
		{ value: '130', label: 'Polski (pl)' },
		{ value: '171', label: 'Türkçe (tr)' },
		{ value: '181', label: 'Tiếng Việt (vi)' },
		{ value: '165', label: 'ไทย (th)' },
		{ value: '71', label: 'Bahasa Indonesia (id)' }
	];
</script>

<svelte:head>
	<title>{t(lang, 'lookup.title')} - {t(lang, 'site.name')}</title>
	<meta name="description" content={t(lang, 'lookup.description')} />
	<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
</svelte:head>

<section class="lk-page">
	<!-- 移动端侧边栏切换按钮 -->
	<button class="lk-sidebar-toggle" class:open={sidebarOpen} onclick={() => (sidebarOpen = !sidebarOpen)}>
		{sidebarOpen ? '✕' : '☰'}
	</button>

	<div class="width-constraint">
		<div class="lk-layout" class:sidebar-open={sidebarOpen}>
			<!-- 主内容区 -->
			<div class="lk-main">
				<!-- 加载中 -->
				{#if loading}
					<div class="md3-card lk-center-box" style="min-height:400px">
						<span class="material-icons" style="font-size:48px;animation:lk-spin 1s linear infinite;display:inline-block;color:var(--md-sys-color-primary)">autorenew</span>
						<div class="lk-loading-tip">
							少女祈祷中…正等待加载脚本。<br />
							<small>注意：所有结果均来源于网络搜索，可靠性未知，请注意甄别代码以及相关内容，谨防欺诈。</small>
						</div>
					</div>
				{:else if error}
					<div class="md3-card lk-center-box">
						<h3 class="title-large" style="margin-bottom:12px">加载失败</h3>
						<p style="color:var(--md-sys-color-on-surface-variant)">{error}</p>
						{#if !query}
							<p style="margin-top:16px;color:var(--md-sys-color-on-surface-variant)">请通过正确的搜索入口访问本页面</p>
						{/if}
					</div>
				{:else if results.length === 0 && query}
					<div class="md3-card lk-center-box">
						<p style="color:var(--md-sys-color-on-surface-variant)">未找到匹配内容</p>
					</div>
				{:else if results.length > 0}
					<ol class="lk-script-list">
						{#each results as script, i (script.id)}
							<li class="lk-result-item" style="animation: lk-fadeIn 0.3s ease-out forwards; animation-delay: {Math.min(0.05 * i, 0.5)}s;">
								<article>
									<h2>
										<a class="lk-script-link" href={getScriptInfoUrl(script)} target="_blank" rel="noopener noreferrer">
											{script.name || '未命名'}
										</a>
										<span class="lk-badge-js" title="用户脚本">JS</span>
										<span class="lk-sep">-</span>
										<span class="lk-script-desc">{escapeHtml(script.description || '暂无描述')}</span>
									</h2>
									<div class="lk-script-meta">
										<dl class="lk-stats">
											<dt>作者</dt>
											<dd><a href={getAuthorUrl(script)} target="_blank" rel="noopener noreferrer">{escapeHtml(script.users?.[0]?.name || '未知作者')}</a></dd>
											<dt>日安装量</dt>
											<dd>{script.daily_installs || 0}</dd>
											<dt>总安装量</dt>
											<dd>{script.total_installs || 0}</dd>
											<dt>评分</dt>
											<dd class="lk-ratings-cell" data-rating-score={script.fan_score || 0}>
												<span class="lk-good" title="评级为好评或已加入到收藏的人数">{script.good_ratings || 0}</span>
												<span class="lk-ok" title="评级为一般的人数">{script.ok_ratings || 0}</span>
												<span class="lk-bad" title="评级为差评的人数">{script.bad_ratings || 0}</span>
											</dd>
											<dt>创建于</dt>
											<dd>{formatDateTime(script.created_at)}</dd>
											<dt>更新于</dt>
											<dd>{formatDateTime(script.code_updated_at)}</dd>
										</dl>
										<div class="lk-install-area">
											<a href={getDownloadUrl(script)} class="md3-button" target="_blank" rel="noopener noreferrer">
												立即安装此脚本
											</a>
										</div>
									</div>
								</article>
							</li>
						{/each}
					</ol>
					<!-- 分页 -->
					{@const pageNum = parseInt(currentPage) || 1}
					<div class="lk-pagination">
						<a href={null} onclick={e => { e.preventDefault(); setHashParams({ ...getSearchParams(), page: '1' }); window.open(window.location.href, '_blank'); }} class="md3-outlined-button" class:disabled={pageNum === 1} style="opacity:{pageNum === 1 ? '0.4' : '1'}">回到第一页</a>
						<a href={null} onclick={e => { e.preventDefault(); setHashParams({ ...getSearchParams(), page: String(Math.max(pageNum - 1, 1)) }); window.open(window.location.href, '_blank'); }} class="md3-outlined-button" class:disabled={pageNum === 1} style="opacity:{pageNum === 1 ? '0.4' : '1'}">上一页</a>
						<span class="lk-current-page">{pageNum}</span>
						<a href={null} onclick={e => { e.preventDefault(); setHashParams({ ...getSearchParams(), page: String(pageNum + 1) }); window.open(window.location.href, '_blank'); }} class="md3-outlined-button" class:disabled={results.length < 25} style="opacity:{results.length < 25 ? '0.4' : '1'}">下一页</a>
					</div>
				{/if}

				<!-- 警告栏 -->
				<div class="lk-warning-bar">
					注意：所有结果均来源于网络搜索，可靠性未知，请注意甄别代码以及相关内容，谨防欺诈。
				</div>
			</div>

			<!-- 侧边栏 -->
			<div class="lk-sidebar" class:open={sidebarOpen}>
				<div class="lk-sidebar-title">搜索选项</div>

				<!-- 搜索框 -->
				<form class="lk-sidebar-search" onsubmit={handleSearch}>
					<input type="search" name="q" bind:value={query} placeholder="搜索脚本..." />
					<button type="submit" class="search-icon-btn" aria-label="搜索">
					<svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
					</svg>
				</button>
				</form>

				<!-- 排序方式 -->
				<div class="lk-option-group">
					<div style="font-size:13px;font-weight:600;color:var(--md-sys-color-on-surface);margin-bottom:8px">排序方式</div>
					<div style="display:flex;flex-wrap:wrap;gap:6px">
						{#each sortOptions as opt}
							<button
								class="md3-chip"
								class:md3-chip--selected={sortBy === opt.value}
								onclick={e => { e.preventDefault(); handleSort(opt.value); }}
							>
								{opt.label}
							</button>
						{/each}
					</div>
				</div>

				<!-- 语言筛选 -->
				<div class="lk-option-group">
					<div style="font-size:13px;font-weight:600;color:var(--md-sys-color-on-surface);margin-bottom:8px">语言筛选</div>
					<div style="display:flex;flex-wrap:wrap;gap:6px">
						<button class="md3-chip" class:md3-chip--selected={filterLocale === '0'} onclick={e => { e.preventDefault(); handleLangFilter('0'); }}>
							展示所有语言内容
						</button>
						<button class="md3-chip" class:md3-chip--selected={filterLocale === '1'} onclick={e => { e.preventDefault(); handleLangFilter('1'); }}>
							仅展示中文内容
						</button>
					</div>
				</div>

				<!-- 高级筛选 -->
				<div class="lk-option-group">
					<details style="margin-top:8px">
						<summary style="font-size:13px;font-weight:600;color:var(--md-sys-color-on-surface);cursor:pointer;margin-bottom:12px">高级筛选选项</summary>
						<form class="lk-advanced-form" onsubmit={applyFilter}>
							<div class="lk-filter-group">
								<input name="site" placeholder="网站域名过滤（如：bilibili.com）" />
							</div>

							{#each [
								{ key: 'total_installs', label: '总安装量', type: 'number' },
								{ key: 'daily_installs', label: '日安装量', type: 'number' },
								{ key: 'ratings', label: '评分', type: 'number', step: '0.1' }
							] as filter}
								<div class="lk-filter-group">
									<label for="{filter.key}_operator">{filter.label}:</label>
									<div class="lk-filter-row">
										<select id="{filter.key}_operator" name="{filter.key}_operator">
											<option value="gt">大于</option>
											<option value="lt">小于</option>
											<option value="eq">等于</option>
										</select>
										<input type={filter.type} name={filter.key} placeholder="数值" step={filter.step || ''} />
									</div>
								</div>
							{/each}

							{#each [
								{ key: 'created', label: '创建日期' },
								{ key: 'updated', label: '更新日期' }
							] as filter}
								<div class="lk-filter-group">
									<label for="{filter.key}_operator">{filter.label}:</label>
									<div class="lk-filter-row">
										<select id="{filter.key}_operator" name="{filter.key}_operator">
											<option value="gt">晚于</option>
											<option value="lt">早于</option>
										</select>
										<input type="datetime-local" name={filter.key} />
									</div>
								</div>
							{/each}

							<div class="lk-filter-group">
								<label for="entry_locales">脚本语言筛选:</label>
								<select name="entry_locales[]" multiple size="5" id="entry_locales">
									{#each localeOptions as loc}
										<option value={loc.value}>{loc.label}</option>
									{/each}
								</select>
								<small style="display:block;margin-top:4px;color:var(--md-sys-color-on-surface-variant);font-size:12px">按住 Ctrl 键可多选（Windows）</small>
							</div>

							<input type="hidden" name="tz" value={Intl.DateTimeFormat().resolvedOptions().timeZone} />

							<div style="display:flex;gap:8px;margin-top:12px">
								<button type="submit" class="md3-button" style="flex:1;height:36px;padding:0 16px;font-size:13px">应用筛选</button>
								<button type="button" class="md3-outlined-button" style="flex:1;height:36px;padding:0 16px;font-size:13px" onclick={clearFilters}>清除高级筛选</button>
							</div>
						</form>
					</details>
				</div>
			</div>
		</div>
	</div>
</section>

<style>
	.lk-page {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
		background: var(--md-sys-color-surface);
		min-height: 100vh;
		color: var(--md-sys-color-on-surface);
	}

	.lk-layout {
		display: flex;
		gap: 24px;
	}

	.lk-main { flex: 1; min-width: 0; }

	.lk-sidebar {
		width: 280px; flex-shrink: 0;
		background: var(--md-sys-color-surface-container-low);
		border: 1px solid var(--md-sys-color-outline-variant);
		border-radius: var(--md-sys-shape-corner-medium);
		padding: 20px;
		box-shadow: var(--md-sys-elevation-1);
		position: sticky; top: 16px;
		max-height: calc(100vh - 32px);
		overflow-y: auto;
	}

	.lk-sidebar-title {
		font-size: var(--md-sys-typescale-title-medium);
		font-weight: 500;
		color: var(--md-sys-color-on-surface);
		margin-bottom: 16px;
	}

	.lk-sidebar-toggle {
		display: none;
		position: fixed; top: 12px; left: 12px;
		width: 40px; height: 40px;
		background: var(--md-sys-color-primary);
		color: var(--md-sys-color-on-primary);
		border: none; border-radius: var(--md-sys-shape-corner-small);
		font-size: 20px; cursor: pointer;
		z-index: 100;
		box-shadow: var(--md-sys-elevation-3);
	}

	.lk-sidebar-search {
		display: flex; gap: 6px;
		margin-bottom: 16px;
	}

	.lk-sidebar-search input {
		flex: 1; padding: 8px 12px;
		border: 1px solid var(--md-sys-color-outline-variant);
		border-radius: var(--md-sys-shape-corner-small);
		font-size: 14px; font-family: inherit;
		background: var(--md-sys-color-surface);
		color: var(--md-sys-color-on-surface);
		outline: none;
	}

	.lk-option-group {
		margin-bottom: 20px;
	}

	.lk-filter-group { margin-bottom: 12px; }
	.lk-filter-group label { display: block; margin-bottom: 4px; font-size: 13px; font-weight: 500; color: var(--md-sys-color-on-surface-variant); }
	.lk-filter-group input,
	.lk-filter-group select {
		width: 100%; padding: 6px 8px;
		border: 1px solid var(--md-sys-color-outline-variant);
		border-radius: var(--md-sys-shape-corner-small);
		font-size: 13px; font-family: inherit;
		background: var(--md-sys-color-surface);
		color: var(--md-sys-color-on-surface);
	}

	.lk-filter-row {
		display: flex; gap: 4px;
	}
	.lk-filter-row select { width: 60px; flex-shrink: 0; }
	.lk-filter-row input { flex: 1; }

	.lk-center-box {
		display: flex; flex-direction: column;
		align-items: center; justify-content: center;
		padding: 60px 20px; min-height: 400px;
		text-align: center;
	}

	.lk-loading-tip {
		text-align: center; line-height: 1.6;
		max-width: 500px; margin-top: 20px;
		color: var(--md-sys-color-on-surface-variant);
	}
	.lk-loading-tip small { font-size: 0.9em; opacity: 0.7; }

	.lk-script-list { list-style: none; padding: 0; margin: 0; }

	.lk-result-item {
		background: var(--md-sys-color-surface-container-low);
		border: 1px solid var(--md-sys-color-outline-variant);
		border-radius: var(--md-sys-shape-corner-medium);
		padding: 20px;
		margin-bottom: 12px;
		box-shadow: var(--md-sys-elevation-1);
		opacity: 0;
		transition: box-shadow var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard);
	}
	.lk-result-item:hover { box-shadow: var(--md-sys-elevation-2); }

	.lk-result-item h2 {
		margin: 0 0 10px; font-size: 16px;
		display: flex; align-items: baseline; gap: 6px; flex-wrap: wrap;
	}

	.lk-script-link {
		color: var(--md-sys-color-primary);
		text-decoration: none; font-weight: 600;
	}
	.lk-script-link:hover { text-decoration: underline; }

	.lk-badge-js {
		background: var(--md-sys-color-primary-container);
		color: var(--md-sys-color-on-primary-container);
		padding: 1px 6px; border-radius: 3px;
		font-size: 11px; font-weight: 600;
	}

	.lk-sep { color: var(--md-sys-color-outline-variant); }
	.lk-script-desc { color: var(--md-sys-color-on-surface-variant); font-size: 14px; font-weight: normal; }
	.lk-script-meta { margin-top: 8px; }

	.lk-stats {
		display: flex; flex-wrap: wrap; gap: 4px 16px;
		font-size: 13px; margin: 0 0 10px; padding: 0;
	}
	.lk-stats dt { color: var(--md-sys-color-on-surface-variant); }
	.lk-stats dd { margin: 0 12px 0 4px; }
	.lk-stats a { color: var(--md-sys-color-primary); text-decoration: none; }

	.lk-ratings-cell .lk-good { color: #4caf50; }
	.lk-ratings-cell .lk-ok { color: #ff9800; margin: 0 4px; }
	.lk-ratings-cell .lk-bad { color: var(--md-sys-color-error); }

	.lk-install-area { margin-top: 12px; }

	.lk-pagination {
		display: flex; justify-content: center; align-items: center;
		gap: 8px; margin-top: 20px; padding: 12px 0;
		font-size: 13px;
	}
	.lk-pagination a.disabled { pointer-events: none; }
	.lk-current-page {
		padding: 6px 14px; font-weight: 600;
		color: var(--md-sys-color-on-surface);
	}

	.lk-warning-bar {
		margin-top: 16px; padding: 10px 16px;
		background: var(--md-sys-color-surface-container-highest);
		border: 1px solid var(--md-sys-color-outline-variant);
		border-radius: var(--md-sys-shape-corner-small);
		font-size: 13px;
		color: var(--md-sys-color-on-surface-variant);
	}

	@media (max-width: 768px) {
		.lk-sidebar-toggle { display: flex; align-items:center; justify-content:center; }
		.lk-layout { flex-direction: column; }
		.lk-sidebar {
			display: none; position: fixed;
			top: 0; left: 0;
			width: 280px; height: 100vh;
			z-index: 99; border-radius: 0;
			box-shadow: var(--md-sys-elevation-4);
		}
		.lk-sidebar.open { display: block; }
	}
</style>

<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { page } from '$app/state';
	import { siteConfig, siteProxyUrl } from '$lib/config';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	let lang = $derived(data.lang);

	// ─── Hash 路由解析 ──────────────────────────────────────────────────────
	interface RouteInfo {
		locale: string;
		scriptId: string | null;
		userId: string | null;
		pageType: 'detail' | 'feedback' | 'redirect' | 'users';
		fullPath: string;
	}

	let lastValidHash = $state('');
	let hashInvalidWarningShown = $state(false);
	let initialParamChecked = $state(false);
	let abortController: AbortController | null = $state(null);

	function isHashValid(hash: string): boolean {
		return !!hash && hash !== '#' && hash !== '#google_vignette' && hash.startsWith('#') && hash.length > 1;
	}

	function parseHash(hashStr: string): RouteInfo | null {
		if (!hashStr) return null;
		const raw = hashStr.startsWith('#') ? hashStr.substring(1) : hashStr;
		if (!raw) return null;
		const path = raw.trim().replace(/^\/+|\/+$/g, '');
		if (!path) return null;

		const patterns: { regex: RegExp; pageType: RouteInfo['pageType'] }[] = [
			{ regex: /^([a-z]{2}(?:-[A-Z]{2})?)\/scripts\/(\d+)(?:-[^/]+)?\/detail$/, pageType: 'detail' },
			{ regex: /^([a-z]{2}(?:-[A-Z]{2})?)\/scripts\/(\d+)(?:-[^/]+)?\/feedback$/, pageType: 'feedback' },
			{ regex: /^([a-z]{2}(?:-[A-Z]{2})?)\/scripts\/(\d+)(?:-[^/]+)?\/(code|versions|stats)$/, pageType: 'redirect' },
			{ regex: /^([a-z]{2}(?:-[A-Z]{2})?)\/scripts\/(\d+)(?:-[^/]+)?$/, pageType: 'redirect' },
			{ regex: /^([a-z]{2}(?:-[A-Z]{2})?)\/users\/(.+)$/, pageType: 'users' }
		];

		for (const { regex, pageType } of patterns) {
			const m = path.match(regex);
			if (m) {
				return {
					locale: m[1],
					scriptId: pageType !== 'users' ? m[2] : null,
					userId: pageType === 'users' ? m[2] : null,
					pageType,
					fullPath: '/' + path
				};
			}
		}
		return null;
	}

	function getRoute(): RouteInfo | null {
		const hash = window.location.hash;
		if (isHashValid(hash)) {
			const route = parseHash(hash);
			if (route) {
				lastValidHash = hash;
				return route;
			}
		}
		const fallback = lastValidHash;
		return isHashValid(fallback) ? parseHash(fallback) : null;
	}

	function setHashRoute(route: RouteInfo): void {
		const url = new URL(window.location);
		if (route.pageType === 'users') {
			url.hash = `#/${route.locale}/users/${route.userId}`;
		} else {
			const suffix = route.pageType === 'detail' ? '/detail' : `/${route.pageType}`;
			url.hash = `#/${route.locale}/scripts/${route.scriptId}${suffix}`;
		}
		url.search = '';
		lastValidHash = url.hash;
		window.history.pushState({}, '', url);
	}

	function showHashInvalidWarning(): void {
		if (hashInvalidWarningShown) return;
		hashInvalidWarningShown = true;
		const toast = document.createElement('div');
		toast.style.cssText = 'position:fixed;top:20px;right:20px;background:#ff9800;color:white;padding:16px 24px;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,0.2);z-index:10000;display:flex;align-items:center;gap:12px;font-size:14px;animation:slideIn 0.3s ease';
		toast.innerHTML = '<span class="material-icons" style="font-size:20px">warning</span><span>浏览历史链接已失效，建议重新搜索脚本</span>';
		const style = document.createElement('style');
		style.textContent = '@keyframes slideIn{from{transform:translateX(400px);opacity:0}to{transform:translateX(0);opacity:1}}';
		document.head.appendChild(style);
		document.body.appendChild(toast);
		setTimeout(() => {
			toast.style.animation = 'slideIn 0.3s ease reverse';
			setTimeout(() => toast.remove(), 300);
		}, 5000);
	}

	// ─── base64 解码 ──────────────────────────────────────────────────────
	function decodeBase64(str: string): string {
		if (!str) return '';
		try {
			const raw = atob(str);
			const bytes = new Uint8Array(raw.length);
			for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
			return new TextDecoder('utf-8').decode(bytes);
		} catch {
			return str;
		}
	}

	// ─── API URL ─────────────────────────────────────────────────────────
	const INFO_API = siteConfig.infoApi.primary;

	// ─── 页面状态 ─────────────────────────────────────────────────────────
	let route = $state<RouteInfo | null>(null);
	let activeTab = $state<'info' | 'feedback'>('info');
	let loading = $state(true);
	let error = $state('');

	// detail page data
	let scriptTitle = $state('');
	let headerHtml = $state('');
	let scriptMetaHtml = $state('');
	let additionalInfoHtml = $state('');
	let installLink = $state('');
	let installPath = $derived(installLink ? installLink.replace('https://update.greasyfork.org/scripts/', '') : '');

	// feedback page data
	let feedbackTitle = $state('');
	let feedbackListHtml = $state('');

	// users page data
	interface GithubIdentity { name: string; url?: string }
	interface UserScript { id: number; name?: string; description?: string; daily_installs?: number; total_installs?: number; good_ratings?: number; ok_ratings?: number; bad_ratings?: number; fan_score?: number; created_at?: string; code_updated_at?: string; code_url?: string; deleted?: boolean }
	interface UserInfo { id: number; name?: string; created_at?: string; bio?: string; github_identities?: GithubIdentity[]; scripts?: UserScript[] }
	let userData = $state<UserInfo | null>(null);

	// ─── 链接处理 ─────────────────────────────────────────────────────────
	function processAllLinks(container: HTMLElement | null, locale: string): void {
		if (!container) return;
		container.querySelectorAll('a[href]').forEach((a) => {
			if (a.hasAttribute('data-processed')) return;
			const href = a.getAttribute('href');
			if (!href) return;
			if (href.startsWith('http://') || href.startsWith('https://') ||
				href.startsWith('javascript:') || href.startsWith('mailto:') ||
				href.startsWith('tel:') || href.includes('?') || href.includes('#')) return;

			const userMatch = href.match(/\/users\/([^/?]+)/);
			if (userMatch) {
				a.setAttribute('href', `#/${locale}/users/${userMatch[1]}`);
				a.setAttribute('data-processed', 'true');
				if (!a.hasAttribute('target')) a.setAttribute('target', '_blank');
				return;
			}

			const siteMatch = href.match(/\/scripts\/by-site\/([^/?]+)/);
			if (siteMatch) {
				a.setAttribute('href', `https://home.greasyfork.org.cn/lookup.php?q=&sort=&filter_locale=0&site=${siteMatch[1]}`);
				a.setAttribute('data-processed', 'true');
				if (!a.hasAttribute('target')) a.setAttribute('target', '_blank');
				return;
			}

			const proxy = siteProxyUrl();
			a.setAttribute('href', proxy + (href.startsWith('/') ? href : '/' + href));
			a.setAttribute('data-processed', 'true');
			if (!a.hasAttribute('target')) a.setAttribute('target', '_blank');
		});
	}

	function processLinks(node: HTMLElement, locale: string): { destroy(): void } {
		tick().then(() => processAllLinks(node, locale));
		return { destroy() {} };
	}

	// ─── 格式化 ──────────────────────────────────────────────────────────
	function formatDateTime(raw: string): string {
		if (!raw) return '未知';
		return new Date(raw).toLocaleString('zh-CN', {
			year: 'numeric', month: '2-digit', day: '2-digit',
			hour: '2-digit', minute: '2-digit', hour12: false
		}).replace(/\//g, '-');
	}

	function escapeHtml(text: string): string {
		const div = document.createElement('div');
		div.textContent = text;
		return div.innerHTML;
	}

	// ─── 主加载函数 ────────────────────────────────────────────────────
	async function loadContent(r: RouteInfo): Promise<void> {
		abortController?.abort();
		abortController = new AbortController();
		const signal = abortController.signal;
		loading = true;
		error = '';

		try {
			if (r.pageType === 'users') {
				await loadUserPage(r, signal);
			} else if (r.pageType === 'feedback') {
				await loadFeedbackPage(r, signal);
			} else if (r.pageType === 'redirect') {
				const url = new URL(window.location);
				url.hash = `#/${r.locale}/scripts/${r.scriptId}/detail`;
				url.search = '';
				window.history.replaceState({}, '', url);
				lastValidHash = url.hash;
				await loadContent({ ...r, pageType: 'detail', fullPath: url.hash.substring(1) });
				return;
			} else {
				await loadDetailPage(r, signal);
			}
		} catch (e) {
			if ((e as Error).name !== 'AbortError') {
				error = '加载失败: ' + ((e as Error).message || '未知错误');
			}
		} finally {
			loading = false;
		}
	}

	async function loadDetailPage(r: RouteInfo, signal: AbortSignal): Promise<void> {
		activeTab = 'info';
		const url = `${INFO_API}/${r.locale}/scripts/${r.scriptId}/detail.json`;
		const res = await fetch(url, { headers: { Accept: 'application/json' }, signal });
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const json = await res.json();
		scriptTitle = json.title || '';
		headerHtml = decodeBase64(json.c1);
		scriptMetaHtml = decodeBase64(json.c2);
		additionalInfoHtml = decodeBase64(json.c3);
		installLink = json.install || '';
		document.title = scriptTitle ? `${scriptTitle} - 用户脚本` : '脚本详情';
	}

	async function loadFeedbackPage(r: RouteInfo, signal: AbortSignal): Promise<void> {
		activeTab = 'feedback';
		const url = `${INFO_API}/${r.locale}/scripts/${r.scriptId}/feedback.json`;
		const res = await fetch(url, { headers: { Accept: 'application/json' }, signal });
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const json = await res.json();
		feedbackTitle = json.title || '';
		feedbackListHtml = decodeBase64(json.c1) || '<p style="text-align:center;color:#999;">暂无反馈信息</p>';
		document.title = feedbackTitle ? `${feedbackTitle} - 反馈` : '反馈';
	}

	async function loadUserPage(r: RouteInfo, signal: AbortSignal): Promise<void> {
		const url = `${INFO_API}/${r.locale}/users/${r.userId}.json`;
		const res = await fetch(url, { headers: { Accept: 'application/json' }, signal });
		if (!res.ok) throw new Error(`HTTP ${res.status}`);
		const json = await res.json();
		userData = json;
		document.title = json.name ? `${json.name} - 用户` : '用户信息';
	}

	// ─── 触发生命周期 ──────────────────────────────────────────────────
	let debounceTimer: ReturnType<typeof setTimeout>;

	onMount(() => {
		if (window.location.hash === '#google_vignette') return;

		const onHashChange = () => {
			const hash = window.location.hash;
			if (hash === '#google_vignette') return;
			if (isHashValid(hash)) lastValidHash = hash;
		};
		window.addEventListener('hashchange', onHashChange);

		const onPop = () => {
			clearTimeout(debounceTimer);
			debounceTimer = setTimeout(() => {
				clearTimeout(debounceTimer);
				if (window.location.hash === '#google_vignette') return;
				initPage();
			}, 100);
		};
		window.addEventListener('popstate', onPop);

		document.addEventListener('visibilitychange', () => {
			if (document.hidden && abortController) abortController.abort();
		});

		// Click interception for hash links → _blank
		document.addEventListener('click', (e) => {
			const a = (e.target as Element).closest('a[href]');
			if (!a) return;
			const href = a.getAttribute('href');
			if (href && href.startsWith('#') && href !== '#' && href !== '#google_vignette') {
				if (!a.hasAttribute('target')) {
					e.preventDefault();
					window.open(a.href, '_blank');
				}
			}
		}, true);

		// DOM observer for dynamic links
		const observer = new MutationObserver((mutations) => {
			for (const m of mutations) {
				if (m.type === 'childList') {
					m.addedNodes.forEach((node) => {
						if (node.nodeType === Node.ELEMENT_NODE) {
							const el = node as HTMLElement;
							if (el.tagName === 'A') processAllLinks(el.parentElement, lang);
							else if (el.querySelectorAll) processAllLinks(el, lang);
						}
					});
				}
				if (m.type === 'attributes' && m.attributeName === 'href' && m.target.nodeType === Node.ELEMENT_NODE) {
					const el = m.target as HTMLElement;
					if (el.tagName === 'A') {
						el.removeAttribute('data-processed');
						processAllLinks(el.parentElement, lang);
					}
				}
			}
		});
		observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['href'] });

		initPage();

		return () => {
			window.removeEventListener('hashchange', onHashChange);
			window.removeEventListener('popstate', onPop);
			observer.disconnect();
		};
	});

	function initPage(): void {
		const r = getRoute();
		if (!r) {
			initialParamChecked = true;
			error = '无效的页面访问 — 检测到初始参数为空或已失效，请重新搜索脚本';
			loading = false;
			return;
		}

		if (!initialParamChecked) {
			if (!isHashValid(window.location.hash) && isHashValid(lastValidHash)) {
				showHashInvalidWarning();
				if (!document.title.startsWith('[历史记录已失效]')) {
					document.title = `[历史记录已失效] ${document.title}`;
				}
			}
			initialParamChecked = true;
		}

		route = r;
		loadContent(r);
	}

	function switchTab(tab: 'info' | 'feedback'): void {
		if (!route) return;
		const newRoute = { ...route, pageType: tab === 'info' ? 'detail' as const : 'feedback' as const };
		setHashRoute(newRoute);
		window.open(window.location.href, '_blank');
	}
</script>

<svelte:head>
	<link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons" />
</svelte:head>

<section class="info-page-root">
	<div class="width-constraint">
		{#if loading}
			<div class="md3-card" style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px 20px;min-height:400px;text-align:center">
				<span class="material-icons" style="font-size:48px;animation:if-spin 1s linear infinite;display:inline-block;color:var(--md-sys-color-primary)">autorenew</span>
				<div style="text-align:center;line-height:1.6;margin-top:20px;color:var(--md-sys-color-on-surface-variant)">
					少女祈祷中…正等待加载脚本信息。<br />
					<small style="font-size:0.9em;opacity:0.7">注意: 所有内容均来源于网络，可靠性未知，请注意甄别代码以及相关内容，谨防欺诈。</small>
				</div>
			</div>
		{:else if error}
			<div class="md3-card" style="text-align:center;padding:40px">
				<h3 class="title-large" style="margin-bottom:12px">加载失败</h3>
				<p style="color:var(--md-sys-color-on-surface-variant)">{error}</p>
				<p style="margin-top:20px">
					<button onclick={() => window.location.reload()} class="md3-button">刷新页面重试</button>
				</p>
			</div>
		{:else if userData}
			<!-- 用户页面 -->
			<section class="md3-card" style="margin-bottom:16px">
				<header style="margin-bottom:24px">
					<h1 class="headline-large" style="margin-bottom:16px">{escapeHtml(userData.name || '未知用户')}</h1>
					<dl class="if-user-stats">
						<dt>脚本数</dt>
						<dd>{userData.scripts?.filter(s => !s.deleted).length || 0}</dd>
						<dt>总安装量</dt>
						<dd>{((userData.scripts?.reduce((sum, s) => sum + (s.total_installs || 0), 0) || 0)).toLocaleString()}</dd>
						<dt>好评</dt>
						<dd class="if-good">{userData.scripts?.reduce((sum, s) => sum + (s.good_ratings || 0), 0) || 0}</dd>
						<dt>一般</dt>
						<dd class="if-ok">{userData.scripts?.reduce((sum, s) => sum + (s.ok_ratings || 0), 0) || 0}</dd>
						<dt>差评</dt>
						<dd class="if-bad">{userData.scripts?.reduce((sum, s) => sum + (s.bad_ratings || 0), 0) || 0}</dd>
						<dt>注册于</dt>
						<dd>{formatDateTime(userData.created_at || '')}</dd>
					</dl>
				</header>
				<div>
					<h3 class="title-large" style="margin-bottom:16px">脚本</h3>
					{#if userData.scripts && userData.scripts.filter(s => !s.deleted).length > 0}
						<ol class="if-script-list">
							{#each userData.scripts.filter(s => !s.deleted) as script, i (script.id)}
								<li class="if-result-item" style="animation: if-fadeIn 0.3s ease-out forwards; animation-delay: {Math.min(0.05 * i, 0.5)}s;">
									<article>
										<h2>
											<a class="if-script-link" href={`#/${route?.locale || 'zh-CN'}/scripts/${script.id}/detail`} target="_blank" rel="noopener noreferrer">
												{script.name || '未命名'}
											</a>
											<span class="if-badge-js">JS</span>
											<span class="if-sep">-</span>
											<span class="if-script-desc">{escapeHtml(script.description || '暂无描述')}</span>
										</h2>
										<div class="if-script-meta">
											<dl class="if-stats">
												<dt>作者</dt>
												<dd>{escapeHtml(userData.name || '未知')}</dd>
												<dt>日安装量</dt>
												<dd>{script.daily_installs || 0}</dd>
												<dt>总安装量</dt>
												<dd>{script.total_installs || 0}</dd>
												<dt>评分</dt>
												<dd>
													<span class="if-good">{script.good_ratings || 0}</span>
													<span class="if-ok">{script.ok_ratings || 0}</span>
													<span class="if-bad">{script.bad_ratings || 0}</span>
												</dd>
												<dt>创建于</dt>
												<dd>{formatDateTime(script.created_at || '')}</dd>
												<dt>更新于</dt>
												<dd>{formatDateTime(script.code_updated_at || '')}</dd>
											</dl>
											<div style="margin-top:12px">
												{#if script.code_url}
													{@const dl = `/${lang}/l#/` + script.code_url.replace('https://update.greasyfork.org/scripts/', '')}
													<a href={dl} class="md3-button" target="_blank" rel="noopener noreferrer">立即安装此脚本</a>
												{:else}
													<a href={null} class="md3-button" target="_blank" rel="noopener noreferrer">立即安装此脚本</a>
												{/if}
											</div>
										</div>
									</article>
								</li>
							{/each}
						</ol>
					{:else}
						<p style="text-align:center;color:var(--md-sys-color-on-surface-variant);padding:40px 0">该用户暂无脚本</p>
					{/if}
				</div>
			</section>
		{:else if route}
			<!-- 脚本页面 -->
			<section>
				<div class="if-notice-bar" style="margin-bottom:16px">
					你正在访问的内容是外部程序的镜像地址，仅用于用户加速访问，本站无法保证其可靠性，源站链接
					<a id="source-link" href="https://greasyfork.org{route.fullPath.replace(/\/detail$/, '')}" target="_blank" rel="noopener noreferrer" style="color:var(--md-sys-color-primary)">点此以跳转</a>。
				</div>

				<!-- Tabs -->
				<div class="md3-tabs" style="margin-bottom:0">
					<button class="md3-tab" class:active={activeTab === 'info'} onclick={e => { e.preventDefault(); switchTab('info'); }}>
						信息
					</button>
					<button class="md3-tab" class:active={activeTab === 'feedback'} onclick={e => { e.preventDefault(); switchTab('feedback'); }}>
						反馈
					</button>
				</div>

				<!-- 安装区域 -->
				<details class="if-install-details">
					<summary>点击查看源站下载链接地址</summary>
					<code>{installLink || '加载中...'}</code>
				</details>
				<div style="display:flex;align-items:center;gap:8px;margin:12px 0 20px">
					<a href="/{lang}/l#/{installPath}" class="md3-button" target="_blank" rel="noopener noreferrer">
						安装此脚本
					</a>
					<a href="/page/installing-user-scripts" style="color:var(--md-sys-color-on-surface-variant);text-decoration:none;font-size:18px;padding:8px" title="如何安装" rel="nofollow">?</a>
				</div>

				<!-- Info Tab -->
				{#if activeTab === 'info'}
					<div class="if-content-area" id="script-header" use:processLinks={lang}>{@html headerHtml}</div>
					{#if scriptMetaHtml}
						<div class="if-content-area" id="script-meta" use:processLinks={lang}>{@html scriptMetaHtml}</div>
					{/if}
					{#if additionalInfoHtml}
						<div class="if-content-area" id="additional-info" use:processLinks={lang}>{@html additionalInfoHtml}</div>
					{/if}
				{:else}
					{#if feedbackListHtml}
						<div class="if-content-area" id="feedback-list" use:processLinks={lang}>{@html feedbackListHtml}</div>
					{/if}
				{/if}
			</section>
		{/if}
	</div>
</section>

<style>
	.info-page-root {
		font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
		background: var(--md-sys-color-surface);
		min-height: 100vh;
		color: var(--md-sys-color-on-surface);
		padding: 24px 0;
	}

	.if-user-stats {
		display: flex; flex-wrap: wrap; gap: 4px 16px;
		font-size: 14px; margin: 0;
	}
	.if-user-stats dt { color: var(--md-sys-color-on-surface-variant); }
	.if-user-stats dd { margin: 0 12px 0 4px; }

	.if-good { color: #4caf50; }
	.if-ok { color: #ff9800; }
	.if-bad { color: var(--md-sys-color-error); }

	.if-notice-bar {
		padding: 10px 16px;
		background: var(--md-sys-color-surface-container-highest);
		border: 1px solid var(--md-sys-color-outline-variant);
		border-radius: var(--md-sys-shape-corner-small);
		font-size: 13px;
		color: var(--md-sys-color-on-surface-variant);
	}

	.if-install-details {
		padding: 12px 0;
		font-size: 13px;
		color: var(--md-sys-color-on-surface-variant);
	}
	.if-install-details summary { cursor: pointer; }
	.if-install-details code {
		display: block; margin-top: 8px; padding: 8px;
		background: var(--md-sys-color-surface-container-highest);
		border-radius: var(--md-sys-shape-corner-small);
		word-break: break-all; font-size: 12px;
		color: var(--md-sys-color-on-surface);
	}

	.if-content-area {
		background: var(--md-sys-color-surface-container-low);
		border: 1px solid var(--md-sys-color-outline-variant);
		border-radius: var(--md-sys-shape-corner-medium);
		padding: 24px;
		margin-bottom: 16px;
		box-shadow: var(--md-sys-elevation-1);
	}

	.if-script-list { list-style: none; padding: 0; margin: 0; }

	.if-result-item {
		border: 1px solid var(--md-sys-color-outline-variant);
		border-radius: var(--md-sys-shape-corner-medium);
		padding: 16px;
		margin-bottom: 12px;
		opacity: 0;
		background: var(--md-sys-color-surface);
		transition: box-shadow var(--md-sys-motion-duration-short) var(--md-sys-motion-easing-standard);
	}
	.if-result-item:hover { box-shadow: var(--md-sys-elevation-1); }

	@keyframes if-fadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }

	.if-result-item h2 {
		margin: 0 0 10px; font-size: 16px;
		display: flex; align-items: baseline; gap: 6px; flex-wrap: wrap;
	}

	.if-script-link { color: var(--md-sys-color-primary); text-decoration: none; font-weight: 600; }
	.if-script-link:hover { text-decoration: underline; }
	.if-badge-js { background: var(--md-sys-color-primary-container); color: var(--md-sys-color-on-primary-container); padding: 1px 6px; border-radius: 3px; font-size: 11px; font-weight: 600; }
	.if-sep { color: var(--md-sys-color-outline-variant); }
	.if-script-desc { color: var(--md-sys-color-on-surface-variant); font-size: 14px; font-weight: normal; }
	.if-script-meta { margin-top: 8px; }

	.if-stats {
		display: flex; flex-wrap: wrap; gap: 4px 16px;
		font-size: 13px; margin: 0 0 10px; padding: 0;
	}
	.if-stats dt { color: var(--md-sys-color-on-surface-variant); }
	.if-stats dd { margin: 0 12px 0 4px; }

	@keyframes if-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
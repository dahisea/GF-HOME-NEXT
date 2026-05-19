// ═══════════════════════════════════════════════════════════════════════════
//  GFork SvelteKit — 站点配置
//  唯一配置来源。编辑此文件即可配置整个站点。
// ═══════════════════════════════════════════════════════════════════════════

import type { Lang } from '$i18n';
import { cdnEnabled } from './cdn-toggle';

// ─── 类型定义 ────────────────────────────────────────────────────────────

interface FaviconConfig {
  icon32: string; icon16: string; iconIco: string;
  appleTouch: string; android192: string; android512: string; manifest: string;
}

interface CdnConfig {
  /** 全局 CDN 开关。false = 所有 CDN URL 变为相对路径。 */
  enabled: boolean;
  /** 静态资源源站（图片、字体）。 */
  static: string;
  /** 可登录的整站镜像，用于用户可见链接。 */
  siteProxy: string;
  /** AdSense 加载器脚本 URL（无论 enabled 为何值，始终为完整 URL）。 */
  adsenseScript: string;
  /** 构建输出基础路径，例如 '/app'。/app 将变为 /app/_app。 */
  buildBasePath: string;
}

interface LookupNode {
  id: string;
  endpoint: string;
  method: 'GET' | 'POST';
}

interface DownloadConfig {
  /** 每个域名的测速超时（毫秒）。 */
  testTimeout: number;
  /** 每次测速的域名数量。 */
  testCount: number;
  /** 测速结果缓存有效期（天，按 IP）。 */
  cacheDays: number;
  /** localStorage 键名前缀。 */
  cacheKey: string;
  /** IP 获取超时（毫秒）。 */
  ipTimeout: number;
  /** 缓存检查延迟（毫秒）。 */
  cacheTimeout: number;
  /** 初始化延迟（毫秒）。 */
  initTimeout: number;
  /** 自动刷新回退（毫秒）。 */
  autoFallbackMs: number;
  /** 仅显示进度条（隐藏调试信息）。 */
  showProgressOnly: boolean;
  /** true: ?path=, false: #/... */
  useQueryString: boolean;
  /** 启用调试日志。 */
  debugMode: boolean;
}

interface AdSenseConfig {
  publisherId: string;
  gtmId: string;
  /** 广告显示开关。false = 全站无广告。 */
  enabled: boolean;
  /** 显示广告的语言（空 = 全部）。默认：全部。 */
  allowedLangs: Lang[];
  slots: {
    generic: string;          inFeedFluid: string;
    autoRelaxed: string;      homepageAuto: string;
    homepageFluid: string;    redirectAuto: string;
    redirectAutoRelaxed: string;
  };
  fluidLayoutKey: string;
  dnsPrefetch: string[];
}

interface SponsorConfig { name: string; url: string; image: string; }

interface FooterConfig {
  icpNumber: string; icpLink: string;
  ratingImage: string; copyrightYears: string;
}

interface GitHubConfig { org: string; repo: string; gfHomeNext: string; gfHomeSvelteKit: string; }

interface ExternalLinks {
  tampermonkey: string; violentmonkey: string; greasemonkey: string;
  scriptcat: string; greasyfork: string; sleazyfork: string; bbsTampermonkey: string;
}

interface RedirectConfig { searchDelaySec: number; downloadDelaySec: number; }

interface SeoConfig {
  twitterHandle: string; defaultOgImage: string;
  googleVerification: string; baiduVerification: string; bingVerification: string;
}

interface LookupSignatureConfig {
  mode: 'none' | 'sha256Timestamp' | 'saltedSha256';
  /** Salt applied when mode=saltedSha256. */
  salt?: (ts: string) => string;
  /** Length of ss parameter (chars from hash start). */
  ssLength: number;
}

interface AuditConfig {
  /** Enable the client-side audit beacon. */
  enabled: boolean;
  /** Audit server URL (e.g. http://localhost:3001). */
  endpoint: string;
  /** CORS origin that the audit server expects (this site's URL). */
  corsOrigin: string;
}

// ═══════════════════════════════════════════════════════════════════════════

export const siteConfig = {

  name: 'GFork Proxy',
  tagline: 'Greasy Fork Script Accelerated Access Service',

  description: {
    'zh-hans': 'Greasy Fork 油猴脚本加速访问服务 — 多 CDN 节点加速脚本下载，高级搜索，多语言支持',
    'zh-hant': 'Greasy Fork 油猴腳本加速訪問服務 — 多 CDN 節點加速腳本下載，高級搜索，多語言支持',
    en: 'Greasy Fork Script Accelerated Access — Multi-CDN acceleration, advanced search, multi-language support',
    ja: 'Greasy Fork ユーザースクリプト高速アクセス — マルチCDN高速化、高度な検索、多言語対応',
  } as const,

  keywords: [
    'greasyfork','userscript','tampermonkey','violentmonkey',
    'scriptcat','油猴','脚本','加速','proxy','gfork',
    'user.js','greasemonkey','CDN','download accelerator',
  ],

  /** 站点权威 URL（无尾部斜杠）。 */
  url: 'https://home.greasyfork.org.cn',

  // ─── 网站图标 ───────────────────────────────────────────────────────
  favicon: {
    icon32:   '/favicon-32x32.png',
    icon16:   '/favicon-16x16.png',
    iconIco:  '/favicon.ico',
    appleTouch: '/apple-touch-icon.png',
    android192: '/android-chrome-192x192.png',
    android512: '/android-chrome-512x512.png',
    manifest:  '/site.webmanifest',
  } satisfies FaviconConfig,

  // ─── CDN 与构建 ────────────────────────────────────────────────────
  //  编辑 src/lib/cdn-toggle.ts 以启用/禁用 CDN 源站改写。
  cdn: {
    get enabled() { return cdnEnabled; },
    static:  'https://web-static-origin.dahi.edu.cn.dahi.e.yu.ac.cn',
    siteProxy: 'https://gfork.zh-tw.eu.org',
    adsenseScript: 'https://pagead2.googlesyndication-cn.com/pagead/js/adsbygoogle.js',
    /** 构建 /_app 资源的部署基础路径，例如 '/app' 或 ''。
     *  若将 build/_app 镜像至 https://a.com/app/_app/，则设为 '/app'。 */
    buildBasePath: '/gfork',
  } satisfies CdnConfig,

  // ─── 下载测速节点 ──────────────────────────────────────────────────
  //  通过 iframe 注入测速域名，找出最快的 CDN 节点。
  downloadNodes: [
    'https://static-sg-apse1-primary-mirror-aws-s3-cloudfront-public-cdn.dahi.edu.eu.org',
    'https://static-sg-apse1-primary-mirror-aws-s3-cloudfront-public-cdn.dahi.edu.eu.org.cdn.cloudflare.net',
    'https://tencent.api-data-abtest-config.dahi.edu.eu.org',
    'https://api-data-aws-abtest-config.dahi.edu.eu.org',
    'https://abtest-ch-snssdk-os.netlify.app',
  ],

  /** 下载页可调参数。 */
  download: {
    testTimeout: 2000,
    testCount: 3,
    cacheDays: 3,
    cacheKey: 'gfork_fastest_domain',
    ipTimeout: 3000,
    cacheTimeout: 2000,
    initTimeout: 1000,
    autoFallbackMs: 16100,
    showProgressOnly: true,
    useQueryString: false,
    debugMode: false,
  } satisfies DownloadConfig,

  // ─── 脚本查询 API 端点 ──────────────────────────────────────────────
  //  两级：先测试主节点，再竞速备用节点。
  lookupNodes: {
    primary: [
      { id: 'TCT',  endpoint: 'https://web-static-origin.dahi.edu.cn.dahi.e.yu.ac.cn/gftls', method: 'POST' as const },
    ],
    backup: [
      { id: 'ALI',  endpoint: 'https://web-static-origin.e.yu.ac.cn/gftls',            method: 'POST' as const },
      { id: 'AWSP', endpoint: 'https://dev-volcengine-auth.netlify.app/gftls',          method: 'POST' as const },
      { id: 'CFWK', endpoint: 'https://volcengine-cf-gateway.dahi.edu.eu.org/gftls',     method: 'POST' as const },
      { id: 'AWSS', endpoint: 'https://api-edge-sakiko-dispatch-network-aws-nf-cdn.dahi.edu.eu.org/gftls', method: 'POST' as const },
    ],
  },

  /** 查询请求签名参数。 */
  lookupSignature: {
    mode: 'sha256Timestamp',
    ssLength: 9,
  } satisfies LookupSignatureConfig,

  // ─── 脚本信息 API ───────────────────────────────────────────────────
  infoApi: {
    primary: 'https://web-static-origin.dahi.edu.cn.dahi.e.yu.ac.cn/gfinfo',
  },

  // ─── 区域 ─────────────────────────────────────────────────────────
  greasyforkRegion: 'cn' as 'cn' | 'org',

  // ─── AdSense 广告 ─────────────────────────────────────────────────
  //  Publisher ID 为已配置的真实标识符。GTM 为可选项。
  //  enabled=true 时所有语言均展示广告。
  adsense: {
    publisherId: 'ca-pub-3758644447684310',
    gtmId:       'GTM-KZFGTVN7',
    enabled: true,
    allowedLangs: [] as Lang[], // 空 = 所有语言
    slots: {
      generic:            '4095096984',
      inFeedFluid:        '1394739154',
      autoRelaxed:        '3934604756',
      homepageAuto:       '4095096984',
      homepageFluid:      '1394739154',
      redirectAuto:       '4095096984',
      redirectAutoRelaxed:'3934604756',
    },
    fluidLayoutKey: '-gy+2i+5x-ek+82',
    dnsPrefetch: [
      'https://ep1.adtrafficquality.google',
      'https://ep2.adtrafficquality.google',
      'https://googleads.g.doubleclick.net',
      'https://www.googleadservices.com',
      'https://www.clarity.ms',
      'https://s.clarity.ms',
      'https://hm.baidu.com',
    ],
  } satisfies AdSenseConfig,

  // ─── 赞助商 ────────────────────────────────────────────────────────
  sponsor: {
    name:  'Secbit.ai',
    url:   'https://secbit.ai/',
    image: '/img/scai.gif',
  } satisfies SponsorConfig,

  // ─── SEO ──────────────────────────────────────────────────────────
  seo: {
    twitterHandle:     '',
    defaultOgImage:    '/android-chrome-512x512.png',
    googleVerification:'',
    baiduVerification: '',
    bingVerification:  '',
  } satisfies SeoConfig,

  contactEmail: 'greasyfork.org.cn@proton.me',

  // ─── 页脚 ─────────────────────────────────────────────────────────
  footer: {
    icpNumber:      '萌 20213149 号',
    icpLink:        'https://icp.gov.moe/?keyword=20213149',
    ratingImage:    '/img/15p.svg',
    copyrightYears: '2020–2026',
  } satisfies FooterConfig,

  // ─── GitHub ──────────────────────────────────────────────────────
  github: {
    org:             'https://github.com/greasyfork-proxy',
    repo:            'https://github.com/greasyfork-proxy/greasyfork-mirror',
    gfHomeNext:      'https://github.com/greasyfork-proxy',
    gfHomeSvelteKit: 'https://github.com/greasyfork-proxy',
  } satisfies GitHubConfig,

  // ─── 外部链接 ──────────────────────────────────────────────────────
  links: {
    tampermonkey:    'https://www.tampermonkey.net/',
    violentmonkey:   'https://violentmonkey.github.io/',
    greasemonkey:    'https://www.greasesmonkey.org/',
    scriptcat:       'https://docs.scriptcat.org/',
    greasyfork:      'https://greasyfork.org/',
    sleazyfork:      'https://sleazyfork.org/',
    bbsTampermonkey: 'https://bbs.tampermonkey.net.cn/forum.php',
  } satisfies ExternalLinks,

  // ─── 审计（独立的 pg 后端分析服务器）─────────────────────────────
  //  客户端信标开关。详见 C:\Users\Dahi\Documents\GitHub\analysis\
  audit: {
    enabled: false,
    endpoint: 'http://localhost:3001',
    corsOrigin: 'https://home.greasyfork.org.cn',
  } satisfies AuditConfig,

  // ─── 重定向页面（插屏广告）────────────────────────────────────
  redirects: {
    searchDelaySec:   3,
    downloadDelaySec: 3,
  } satisfies RedirectConfig,

  // ─── URL 重写规则（首页 URL 工具）───────────────────────────────
  urlRewriteRules: [
    { from: /^https?:\/\/(www\.)?greasyfork\.org/, to: 'https://gfork.zh-tw.eu.org' },
    { from: /^https?:\/\/(www\.)?sleazyfork\.org/, to: 'https://gfork.zh-tw.eu.org' },
  ] as { from: RegExp; to: string }[],

};  // 不加 "as const"：防止 Vite 将 cdn.enabled 常量折叠

// ═══════════════════════════════════════════════════════════════════════════
//  派生辅助函数
// ═══════════════════════════════════════════════════════════════════════════

export function siteUrl(path: string): string {
  return `${siteConfig.url.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

/** CDN 感知的静态资源 URL。cdn.enabled=false 时返回相对路径。 */
export function staticUrl(path: string): string {
  const base = siteConfig.cdn.enabled ? siteConfig.cdn.static : '';
  return `${base.replace(/\/+$/, '')}/${path.replace(/^\/+/, '')}`;
}

/** CDN 感知的站点镜像源站（可登录镜像链接）。cdn.enabled=false 时返回 ''。 */
export function siteProxyUrl(): string {
  return siteConfig.cdn.enabled ? siteConfig.cdn.siteProxy : '';
}

/** 审计服务器端点。audit.enabled=false 时返回 ''。 */
export function auditEndpoint(): string {
  return siteConfig.audit.enabled ? siteConfig.audit.endpoint : '';
}

export function ogImageUrl(): string {
  return siteUrl(siteConfig.seo.defaultOgImage);
}

/**
 * 判断指定语言是否应展示广告。
 * allowedLangs 为空时，所有语言均展示广告（前提是 enabled）。
 */
export function shouldShowAds(lang: string): boolean {
  if (!siteConfig.adsense.enabled) return false;
  const allowed = siteConfig.adsense.allowedLangs as readonly string[];
  if (allowed.length === 0) return true;
  return allowed.includes(lang);
}

/** 随机打乱的下载域名副本，用于随机测速。 */
export function getDownloadDomains(): string[] {
  const arr = [...siteConfig.downloadNodes];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
}

/** 主查询节点。 */
export function getPrimaryLookupNodes(): LookupNode[] {
  return [...siteConfig.lookupNodes.primary];
}

/** 备用（回退）查询节点。 */
export function getBackupLookupNodes(): LookupNode[] {
  return [...siteConfig.lookupNodes.backup];
}

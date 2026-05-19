# GFork SvelteKit

> Greasy Fork 脚本加速访问代理 | SvelteKit 重构版  
> 多 CDN 节点 · 竞速搜索 · 多语言 · MD3 设计

---

## 一、路由速览

| 路由 | 用途 |
|---|---|
| `/[lang]/` | 首页（搜索框 + 推荐 + 广告） |
| `/[lang]/s` | 搜索广告中间页 → 3s 跳 lookup |
| `/[lang]/l` | 下载广告中间页 → 3s 跳 download |
| `/[lang]/search` | 高级搜索表单（Script Search + Advanced Options） |
| `/[lang]/lookup#?...` | 搜索结果页（多节点竞速） |
| `/[lang]/download#/path` | 下载加速（iframe 测速 + 最优节点跳转） |
| `/[lang]/info#/zh-CN/scripts/123/detail` | 脚本/用户详情（hash 路由含 locale） |
| `/[lang]/help` | 帮助页 |
| `/[lang]/installing` | 安装教程 |
| `/[lang]/about` | 关于页 |
| `/[lang]/tos` | 服务条款 |
| `/[lang]/applist` | 推荐脚本列表 |
| `/[lang]/feedback` | 反馈页 |
| `/s` / `/l` | 301 跳到 `/zh-hans/s` / `/zh-hans/l` |

---

## 二、配置文件 `src/lib/config.ts`

所有部署配置集中于此。分为 11 个配置段 + 若干 helper 函数。

### 2.1 站点基础

```typescript
name: 'GFork Proxy',
tagline: 'Greasy Fork Script Accelerated Access Service',
description: { 'zh-hans': ..., 'zh-hant': ..., en: ..., ja: ... },
url: 'https://gfork.secbit.io',      // 规范域名
keywords: ['greasyfork', ...],
contactEmail: 'hi@dahi.icu',
```

### 2.2 Favicon `favicon`

全部 favicon 路径，支持 PNG / ICO / Apple Touch / Android Chrome / Web Manifest。
图片放 `static/` 目录，CDN 同步后改这里。

### 2.3 CDN & Build `cdn`

| 字段 | 用途 |
|---|---|
| `static` | 静态资源 CDN（图片/字体，`staticUrl()` 拼接） |
| `update` | 脚本更新代理 CDN |
| `apiProxy` | GreasyFork API 反代 origin |
| `adsenseScript` | AdSense 加载脚本地址 |
| `buildBasePath` | `build/_app` 镜像的基础路径。设为 `'/app'` 时 `/_app` → `/app/_app` |

**CDN 镜像 `build/_app` 的操作：**
1. 修改 `cdn.buildBasePath` 为 `/app`（或其他路径）
2. `npm run build`
3. 将 `build/_app/` 目录上传到 CDN 的 `/app/_app/` 路径下
4. 将 `build/*.html` 部署到 Web 服务器（HTML 中会引用 `/app/_app/...`）

### 2.4 下载测速 `downloadNodes` + `download`

```typescript
downloadNodes: [
  'https://static-sg-apse1-primary-mirror-aws-s3-cloudfront-public-cdn.dahi.edu.eu.org',
  'https://static-sg-apse1-primary-mirror-aws-s3-cloudfront-public-cdn.dahi.edu.eu.org.cdn.cloudflare.net',
  'https://tencent.api-data-abtest-config.dahi.edu.eu.org',
  'https://api-data-aws-abtest-config.dahi.edu.eu.org',
  'https://abtest-ch-snssdk-os.netlify.app',
],

download: {
  testTimeout: 2000,       // 单节点测速超时(ms)
  testCount: 3,            // 每轮测试节点数
  cacheDays: 3,            // 缓存有效期(天)
  cacheKey: 'gfork_fastest_domain',
  ipTimeout: 3000,         // IP 获取超时(ms)
  cacheTimeout: 2000,      // 缓存检查延迟(ms)
  initTimeout: 1000,       // 初始化延迟(ms)
  autoFallbackMs: 16100,   // 自动回退总时限
  showProgressOnly: true,  // 仅显示进度条
  useQueryString: false,   // false=hash 模式, true=querystring
  debugMode: false,
},
```

**测速流程：** 创建隐藏 iframe → 注入 `gfork_speedtest.html` → 接收 `gfork_speedtest_pong` → 选最快节点 → 缓存到 localStorage（按 IP+天数区分）

### 2.5 搜索 API `lookupNodes` + `lookupSignature`

```typescript
lookupNodes: {
  primary: [
    { id: 'TCT', endpoint: 'https://web-static-origin.dahi.edu.cn.dahi.e.yu.ac.cn/gftls', method: 'POST' },
  ],
  backup: [
    { id: 'ALI',  endpoint: 'https://web-static-origin.e.yu.ac.cn/gftls', method: 'POST' },
    { id: 'AWSP', endpoint: 'https://dev-volcengine-auth.netlify.app/gftls', method: 'POST' },
    { id: 'CFWK', endpoint: 'https://volcengine-cf-gateway.dahi.edu.eu.org/gftls', method: 'POST' },
    { id: 'AWSS', endpoint: 'https://api-edge-sakiko-dispatch-network-aws-nf-cdn.dahi.edu.eu.org/gftls', method: 'POST' },
  ],
},

lookupSignature: {
  mode: 'sha256Timestamp',   // SHA256(timestamp.substring(0,8))
  ssLength: 9,               // ss 参数取 hash 前 9 位
},
```

**竞速逻辑：** 先请求 primary 节点 → 失败则并发请求所有 backup → `Promise.race` 取最快成功者。

### 2.6 Info API `infoApi`

```typescript
infoApi: {
  primary: 'https://home.greasyfork.org.cn/info',
},
greasyforkApi: {
  search:       'https://greasyfork.org/en/scripts.json',
  scriptDetail: 'https://greasyfork.org/en/scripts',
},
```

### 2.7 广告 `adsense`

```typescript
adsense: {
  publisherId: 'ca-pub-3758644447684310',
  gtmId:       'GTM-KZFGTVN7',
  enabled: true,
  allowedLangs: [],  // 空数组 = 全部语言显示广告
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
  dnsPrefetch: ['https://ep1.adtrafficquality.google', ...],
},
```

`allowedLangs: []` 表示所有语言都展示广告。要限制语言，填入 `['en', 'ja']` 等。

### 2.8 赞助商 `sponsor`

```typescript
sponsor: {
  name: 'Secbit.ai',
  url:  'https://secbit.ai/',
  image:'https://web-static-origin.dahi.edu.cn.dahi.e.yu.ac.cn/gfork/img/scai.gif',
},
```

### 2.9 SEO `seo`

Twitter Card / Open Graph / 搜索引擎验证标签。

### 2.10 页脚 `footer`

ICP 备案号、分级标签图片、版权年份。

### 2.11 外部链接 `links`

Tampermonkey / Violentmonkey / Greasemonkey / ScriptCat / GreasyFork 官网链接。

### 2.12 跳转延迟 `redirects`

```typescript
redirects: {
  searchDelaySec: 3,    // /s 广告页展示时长
  downloadDelaySec: 3,  // /l 广告页展示时长
},
```

---

## 三、Helper 函数

| 函数 | 用途 |
|---|---|
| `siteUrl(path)` | 拼接规范 URL |
| `staticUrl(path)` | 拼接 CDN 静态资源 URL |
| `ogImageUrl()` | 默认 OG 图片 URL |
| `shouldShowAds(lang)` | 当前语言是否显示广告 |
| `getDownloadDomains()` | 返回打乱顺序的下载节点列表 |
| `getPrimaryLookupNodes()` | 搜索 primary 节点 |
| `getBackupLookupNodes()` | 搜索 backup 节点 |

---

## 四、部署

```bash
npm install
# 编辑 src/lib/config.ts
npm run build       # 输出到 build/
```

`build/` 目录可直接部署到任意静态托管。

如需 CDN 镜像 `_app` 资源：
1. 设置 `cdn.buildBasePath = '/app'`
2. 重新构建
3. 将 `build/_app/` → CDN 的 `/app/_app/`
4. `build/*.html` → Web 服务器

---

## 五、CSS 设计规范

遵循 [Material Design 3](https://m3.material.io/develop/web) 的 Design Token 体系：

- 颜色：`--md-sys-color-primary` / `--md-sys-color-surface` / `--md-sys-color-outline-variant` 等
- 形状：`--md-sys-shape-corner-*`（full/small/medium/extra-small）
- 高度：`--md-sys-elevation-*`（0~5）
- 动效：`--md-sys-motion-duration-*` + `--md-sys-motion-easing-*`

Info 页的 API 注入 HTML（`#script-info` / `#script-meta` / `#additional-info` / `#feedback-list`）有独立的 MD3 样式，不依赖原项目 CSS。

---

*最后更新：2026-05-19*

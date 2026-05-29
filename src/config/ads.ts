/**
 * Ad unit templates — all ad HTML generated from config at build time.
 * Use {@html adAuto()} etc. in Svelte templates.
 */
const CLIENT = 'ca-pub-3758644447684310';
const PUSH = '<script>(adsbygoogle=window.adsbygoogle||[]).push({})<\/script>';

const SLOTS: Record<string, string> = {
  fluid:       '1394739154',
  auto:        '4095096984',
  sidebar:     '4497590737',
  autorelaxed: '3934604756',
};

/** Small fluid in-feed ad */
export const adFluid = () =>
  `<ins class="adsbygoogle" style="display:block" data-ad-client="${CLIENT}" data-ad-slot="${SLOTS.fluid}" data-ad-format="fluid" data-ad-layout-key="-gy+2i+5x-ek+82"></ins>${PUSH}`;

/** Medium auto responsive ad */
export const adAuto = () =>
  `<ins class="adsbygoogle" style="display:block" data-ad-client="${CLIENT}" data-ad-slot="${SLOTS.auto}" data-ad-format="auto" data-full-width-responsive="true"></ins>${PUSH}`;

/** Extra-long vertical sidebar ad 190x570 */
export const adSidebar = () =>
  `<ins class="adsbygoogle" style="display:inline-block;width:190px;height:570px" data-ad-client="${CLIENT}" data-ad-slot="${SLOTS.sidebar}"></ins>${PUSH}`;

/** Large autorelaxed ad */
export const adAutorelaxed = () =>
  `<ins class="adsbygoogle" style="display:block" data-ad-client="${CLIENT}" data-ad-slot="${SLOTS.autorelaxed}" data-ad-format="autorelaxed"></ins>${PUSH}`;

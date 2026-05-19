/// <reference types="@sveltejs/kit" />

declare global {
	namespace App {
		interface Locals {
			lang: 'zh-hans' | 'zh-hant' | 'en';
		}
		interface Error {
			message: string;
			code?: string;
		}
		interface PageData {
			lang: 'zh-hans' | 'zh-hant' | 'en';
			meta?: Record<string, string>;
			hreflang?: Array<{ lang: string; url: string }>;
			jsonLd?: Record<string, unknown> | Array<Record<string, unknown>>;
		}
	}
}

export {};

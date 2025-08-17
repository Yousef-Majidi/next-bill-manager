import React from "react";

import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock window.matchMedia for next-themes
Object.defineProperty(window, "matchMedia", {
	writable: true,
	value: vi.fn().mockImplementation((query) => ({
		matches: false,
		media: query,
		onchange: null,
		addListener: vi.fn(), // deprecated
		removeListener: vi.fn(), // deprecated
		addEventListener: vi.fn(),
		removeEventListener: vi.fn(),
		dispatchEvent: vi.fn(),
	})),
});

// Mock Next.js router
vi.mock("next/navigation", () => ({
	useRouter: () => ({
		push: vi.fn(),
		replace: vi.fn(),
		prefetch: vi.fn(),
		back: vi.fn(),
		forward: vi.fn(),
		refresh: vi.fn(),
	}),
	useSearchParams: () => new URLSearchParams(),
	usePathname: () => "/",
}));

// Mock Next.js image component
vi.mock("next/image", () => ({
	default: ({
		src,
		alt,
		...props
	}: React.ImgHTMLAttributes<HTMLImageElement>) => {
		// eslint-disable-next-line @next/next/no-img-element
		return <img src={src} alt={alt} {...props} />;
	},
}));

// Mock Next.js link component
vi.mock("next/link", () => ({
	default: ({
		children,
		href,
		...props
	}: React.AnchorHTMLAttributes<HTMLAnchorElement>) => {
		return (
			<a href={href} {...props}>
				{children}
			</a>
		);
	},
}));

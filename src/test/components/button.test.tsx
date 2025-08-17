import { describe, expect, it, vi } from "vitest";

import { Button } from "@/components/ui/button";
import { render, screen } from "@/test/utils";

describe("Button Component", () => {
	it("renders with children", () => {
		render(<Button>Click me</Button>);
		expect(
			screen.getByRole("button", { name: "Click me" }),
		).toBeInTheDocument();
	});

	it("applies variant classes correctly", () => {
		render(<Button variant="destructive">Delete</Button>);
		const button = screen.getByRole("button", { name: "Delete" });
		expect(button).toHaveClass("bg-destructive");
	});

	it("handles click events", async () => {
		const handleClick = vi.fn();
		render(<Button onClick={handleClick}>Click me</Button>);

		const button = screen.getByRole("button", { name: "Click me" });
		await button.click();

		expect(handleClick).toHaveBeenCalledTimes(1);
	});
});

import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BugReportCallout } from "./BugReportCallout";

afterEach(() => {
	vi.unstubAllGlobals();
	vi.restoreAllMocks();
});

describe("BugReportCallout", () => {
	it("only lets the user open the issue after the diagnostic bundle is downloaded", async () => {
		vi.stubGlobal(
			"fetch",
			vi.fn((url: string) =>
				Promise.resolve(
					url.endsWith("/bundle")
						? new Response(new Blob(["zip"]), { headers: { "Content-Disposition": 'attachment; filename="d.zip"' } })
						: new Response("{}", { status: 404 }),
				),
			),
		);
		URL.createObjectURL = vi.fn(() => "blob:x");
		URL.revokeObjectURL = vi.fn();
		vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

		render(<BugReportCallout />);

		expect(screen.queryByRole("link", { name: /Relatar problema/ })).toBeNull();
		expect(screen.getByTitle("Libera depois de baixar o diagnóstico")).toBeTruthy();

		fireEvent.click(screen.getByRole("button", { name: /Baixar Diagnóstico/ }));

		const link = await screen.findByRole("link", { name: /Relatar problema/ });
		expect(link.getAttribute("href")).toContain("/issues/new?");
		expect(screen.getByRole("button", { name: /Diagnóstico baixado/ })).toBeTruthy();
	});
});

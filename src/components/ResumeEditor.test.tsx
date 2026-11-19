import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import type { StructuredResume } from "../api/types";
import { ResumeEditor } from "./ResumeEditor";

beforeAll(() => {
	HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
		this.setAttribute("open", "");
	};
	HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
		this.removeAttribute("open");
	};
	vi.stubGlobal("ResizeObserver", class {
		observe() {}
		unobserve() {}
		disconnect() {}
	});
});

afterEach(cleanup);

const CONTENT: StructuredResume = {
	name: "Ana",
	headline: "Dev",
	sections: [
		{ title: "Resumo", semanticType: "SUMMARY", kind: "PARAGRAPH", paragraph: "Texto" },
		{ title: "Competências", semanticType: "SKILLS", kind: "KEY_VALUE", keyValues: [{ label: "Backend", value: "Java" }] },
	],
} as StructuredResume;

function renderEditor(props: { removableSections?: boolean; editableSections?: boolean }, onContentChange = vi.fn()) {
	render(<ResumeEditor content={CONTENT} contact={{}} onContentChange={onContentChange} onContactChange={vi.fn()} {...props} />);
	return onContentChange;
}

describe("ResumeEditor section removal", () => {
	it("does not offer removing sections by default", () => {
		renderEditor({});

		expect(screen.queryByRole("button", { name: /Remover seção/ })).toBeNull();
	});

	it("removes a whole section after confirming, without offering to move or add sections", () => {
		const onContentChange = renderEditor({ removableSections: true });

		expect(screen.queryByRole("button", { name: /Mover seção/ })).toBeNull();
		fireEvent.click(screen.getByRole("button", { name: "Remover seção Competências" }));
		fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Excluir seção" }));

		expect(onContentChange).toHaveBeenCalledTimes(1);
		const updated = onContentChange.mock.calls[0][0] as StructuredResume;
		expect(updated.sections?.map((section) => section.title)).toEqual(["Resumo"]);
	});

	it("keeps the section when the removal is cancelled", () => {
		const onContentChange = renderEditor({ removableSections: true });

		fireEvent.click(screen.getByRole("button", { name: "Remover seção Resumo" }));
		fireEvent.click(within(screen.getByRole("dialog")).getByRole("button", { name: "Cancelar" }));

		expect(onContentChange).not.toHaveBeenCalled();
	});
});

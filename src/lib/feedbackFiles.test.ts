import { describe, expect, it } from "vitest";
import { addFiles, formatSize, MAX_FILE_BYTES } from "./feedbackFiles";

function image(name: string, type = "image/png", size = 1000): File {
	return new File([new Uint8Array(size)], name, { type });
}

describe("addFiles", () => {
	it("keeps valid images and appends to the current ones", () => {
		const result = addFiles([image("a.png")], [image("b.jpg", "image/jpeg")]);
		expect(result.files.map((file) => file.name)).toEqual(["a.png", "b.jpg"]);
		expect(result.error).toBeNull();
	});

	it("refuses other file types and big files with a message", () => {
		expect(addFiles([], [image("a.pdf", "application/pdf")])).toMatchObject({ files: [], error: "Use imagens PNG, JPG ou WebP." });
		expect(addFiles([], [image("a.png", "image/png", MAX_FILE_BYTES + 1)])).toMatchObject({
			files: [],
			error: "Cada imagem deve ter até 3 MB.",
		});
	});

	it("stops at three images", () => {
		const result = addFiles([image("1.png"), image("2.png")], [image("3.png"), image("4.png")]);
		expect(result.files).toHaveLength(3);
		expect(result.error).toContain("no máximo 3");
	});
});

describe("formatSize", () => {
	it("shows KB below one megabyte and MB above", () => {
		expect(formatSize(2048)).toBe("2 KB");
		expect(formatSize(1.5 * 1024 * 1024)).toBe("1.5 MB");
	});
});

import { inflateRawSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { zip } from "./zip.mjs";

function entries(buffer) {
	const end = buffer.length - 22;
	const count = buffer.readUInt16LE(end + 10);
	let at = buffer.readUInt32LE(end + 16);
	const result = {};
	for (let i = 0; i < count; i++) {
		const nameLength = buffer.readUInt16LE(at + 28);
		const compressedSize = buffer.readUInt32LE(at + 20);
		const local = buffer.readUInt32LE(at + 42);
		const name = buffer.toString("utf8", at + 46, at + 46 + nameLength);
		const dataAt = local + 30 + buffer.readUInt16LE(local + 26);
		result[name] = inflateRawSync(buffer.subarray(dataAt, dataAt + compressedSize)).toString();
		at += 46 + nameLength;
	}
	return result;
}

describe("zip", () => {
	it("keeps every file path and content", () => {
		const archive = zip([
			{ path: "manifest.json", data: Buffer.from('{"a":1}') },
			{ path: "icons/icon.png", data: Buffer.from("png-bytes") },
		]);

		expect(entries(archive)).toEqual({ "manifest.json": '{"a":1}', "icons/icon.png": "png-bytes" });
	});
});

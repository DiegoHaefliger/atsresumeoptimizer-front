import { describe, expect, it } from "vitest";
import { sortByKind } from "./releaseChangeLabels";

describe("sortByKind", () => {
	it("lists new features first, then improvements, then fixes, keeping the order inside each group", () => {
		const sorted = sortByKind([
			{ kind: "fix", text: "c1" },
			{ kind: "feat", text: "a1" },
			{ kind: "improvement", text: "b1" },
			{ kind: "feat", text: "a2" },
		]);

		expect(sorted.map((change) => change.text)).toEqual(["a1", "a2", "b1", "c1"]);
	});
});

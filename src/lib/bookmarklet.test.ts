import { afterEach, describe, expect, it, vi } from "vitest";
import extractSource from "../../extension/extract.js?raw";
import readerTemplate from "../../bookmarklet/reader.js?raw";
import { bookmarkletCode, bookmarkletHref } from "./bookmarklet";
import { parseFragment } from "./linkedinDraft";

function readerSource(): string {
	return readerTemplate.replace("__EXTRACT__", () => extractSource.trim());
}

describe("bookmarkletHref", () => {
	it("is a javascript: url with the app origin baked in", () => {
		const href = bookmarkletHref("var APP = '__APP_ORIGIN__'", "http://localhost:8080");

		expect(href.startsWith("javascript:")).toBe(true);
		expect(decodeURIComponent(href.slice("javascript:".length))).toBe("var APP = 'http://localhost:8080'");
	});

	it("does not interpret replacement patterns in the origin", () => {
		expect(bookmarkletCode("'__APP_ORIGIN__'", "http://x/$&")).toBe("'http://x/$&'");
	});
});

describe("the reader", () => {
	afterEach(() => {
		vi.useRealTimers();
		document.body.innerHTML = "";
	});

	function run(hostname: string, pathname: string) {
		const receiver = { location: { href: "" } };
		const open = vi.fn().mockReturnValue(receiver);
		const alert = vi.fn();
		const fakeWindow = { open, scrollTo: vi.fn() };
		const code = bookmarkletCode(readerSource(), "http://localhost:8080");
		new Function("window", "location", "alert", code)(fakeWindow, { hostname, pathname }, alert);
		return { receiver, open, alert };
	}

	it("refuses to run outside a linkedin profile", () => {
		const { open, alert } = run("example.com", "/in/ana/");

		expect(alert).toHaveBeenCalled();
		expect(open).not.toHaveBeenCalled();
	});

	it("reads the profile and hands it to the app window in the url fragment", () => {
		vi.useFakeTimers();
		window.history.pushState({}, "", "/in/ana-souza/");
		document.title = "Ana Souza | LinkedIn";
		document.body.innerHTML = `<main>
			<section><h2><a>Ana Souza</a></h2><p>Engenheira de Software | Java</p><p>São Paulo, Brasil</p><span>·</span><a>Dados de contato</a></section>
			<section><h2>Sobre</h2><p>Trabalho com sistemas críticos.</p></section>
		</main>`;

		const { receiver, open } = run("www.linkedin.com", "/in/ana-souza/");
		vi.advanceTimersByTime(5000);

		expect(open).toHaveBeenCalledWith("", "ats-linkedin-receiver");
		const [base, fragment] = receiver.location.href.split("#");
		expect(base).toBe("http://localhost:8080/linkedin/receber");
		const capture = parseFragment(`#${fragment}`);
		expect(capture?.profile?.headline).toBe("Engenheira de Software | Java");
		expect(capture?.profile?.about).toBe("Trabalho com sistemas críticos.");
	});
});

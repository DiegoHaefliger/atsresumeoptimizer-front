import { describe, expect, it } from "vitest";
import { openLinkLabel, siteLabel, sourceLabel } from "./suggestionLabels";

describe("suggestionLabels", () => {
	it("names the origin of a suggestion", () => {
		expect(sourceLabel("LINKEDIN")).toBe("LinkedIn");
		expect(sourceLabel("LINKEDIN_POST")).toBe("Postagem do LinkedIn");
		expect(sourceLabel("GUPY")).toBe("Gupy");
		expect(sourceLabel("PROGRAMATHOR")).toBe("Programathor");
		expect(sourceLabel(undefined)).toBe("Vaga");
	});

	it("labels the external link by origin", () => {
		expect(openLinkLabel("LINKEDIN_POST")).toBe("Abrir postagem");
		expect(openLinkLabel("LINKEDIN")).toBe("Abrir no LinkedIn");
		expect(openLinkLabel("GUPY")).toBe("Abrir na Gupy");
		expect(openLinkLabel("OUTRA")).toBe("Abrir vaga");
	});

	it("names the site a job came from by its link", () => {
		expect(siteLabel("https://www.linkedin.com/jobs/view/4012345678/")).toBe("LinkedIn");
		expect(siteLabel("https://www.linkedin.com/posts/ana_vaga-java-123")).toBe("Postagem do LinkedIn");
		expect(siteLabel("https://acme.gupy.io/jobs/99")).toBe("Gupy");
		expect(siteLabel("https://programathor.com.br/jobs/1-java")).toBe("Programathor");
		expect(siteLabel("https://www.infojobs.com.br/vaga-de-dev__1.aspx")).toBe("InfoJobs");
		expect(siteLabel("https://www.vagas.com.br/vagas/v1/dev")).toBe("Vagas.com");
		expect(siteLabel("https://remotar.com.br/job/168194")).toBe("Remotar");
		expect(siteLabel("https://example.com/vaga")).toBeNull();
		expect(siteLabel("nao e url")).toBeNull();
		expect(siteLabel(undefined)).toBeNull();
	});
});

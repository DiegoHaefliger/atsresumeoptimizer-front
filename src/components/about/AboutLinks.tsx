import type { ComponentType, SVGProps } from "react";
import {
	DownloadIcon,
	ExternalLinkIcon,
	GitHubIcon,
	LinkedInIcon,
	TagIcon,
} from "../icons";
import { PROJECT_LINKS } from "../../lib/projectLinks";

type AboutLink = {
	title: string;
	description: string;
	href: string;
	Icon: ComponentType<SVGProps<SVGSVGElement>>;
};

type AboutLinkGroup = {
	id: string;
	title: string;
	subtitle: string;
	links: AboutLink[];
};

const LINK_GROUPS: AboutLinkGroup[] = [
	{
		id: "project",
		title: "Projeto",
		subtitle: "Código-fonte e versões publicadas.",
		links: [
			{
				title: "Repositório",
				description: "Código-fonte e documentação do projeto.",
				href: PROJECT_LINKS.repository,
				Icon: TagIcon,
			},
			{
				title: "Versões",
				description: "Baixe instaladores e veja o histórico de releases.",
				href: PROJECT_LINKS.releases,
				Icon: DownloadIcon,
			},
		],
	},
	{
		id: "author",
		title: "Autor",
		subtitle: "Diego Haefliger",
		links: [
			{ title: "GitHub", description: "Outros projetos e contribuições.", href: PROJECT_LINKS.github, Icon: GitHubIcon },
			{ title: "LinkedIn", description: "Contato profissional.", href: PROJECT_LINKS.linkedin, Icon: LinkedInIcon },
		],
	},
];

const hostOf = (href: string) => new URL(href).host.replace(/^www\./, "");

export function AboutLinks() {
	return (
		<div className="about-links-page">
			{LINK_GROUPS.map((group) => (
				<section key={group.id} className="about-link-group" aria-labelledby={`about-links-${group.id}`}>
					<header className="about-link-group-header">
						<h2 id={`about-links-${group.id}`}>{group.title}</h2>
						<p>{group.subtitle}</p>
					</header>
					<ul className="about-links">
						{group.links.map(({ title, description, href, Icon }) => (
							<li key={href}>
								<a className="about-card panel" href={href} target="_blank" rel="noreferrer">
									<span className="about-card-icon">
										<Icon />
									</span>
									<span className="about-card-text">
										<strong>{title}</strong>
										<span>{description}</span>
										<small className="about-card-host">{hostOf(href)}</small>
									</span>
									<ExternalLinkIcon className="about-card-arrow" />
									<span className="sr-only">(abre em nova aba)</span>
								</a>
							</li>
						))}
					</ul>
				</section>
			))}
		</div>
	);
}

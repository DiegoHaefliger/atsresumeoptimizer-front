import type { ComponentType, SVGProps } from "react";
import { ExternalLinkIcon, GitHubIcon, LinkedInIcon, TagIcon } from "../icons";
import { PROJECT_LINKS } from "../../lib/projectLinks";

const LINKS: {
	title: string;
	description: string;
	href: string;
	Icon: ComponentType<SVGProps<SVGSVGElement>>;
}[] = [
	{
		title: "Repositório do projeto",
		description: "Código-fonte, issues e releases.",
		href: PROJECT_LINKS.repository,
		Icon: TagIcon,
	},
	{ title: "GitHub", description: "Diego Haefliger", href: PROJECT_LINKS.github, Icon: GitHubIcon },
	{ title: "LinkedIn", description: "Diego Haefliger", href: PROJECT_LINKS.linkedin, Icon: LinkedInIcon },
];

export function AboutLinksTab() {
	return (
		<ul className="about-links">
			{LINKS.map(({ title, description, href, Icon }) => (
				<li key={href}>
					<a className="about-card panel" href={href} target="_blank" rel="noreferrer">
						<span className="about-card-icon">
							<Icon />
						</span>
						<span className="about-card-text">
							<strong>{title}</strong>
							<span>{description}</span>
						</span>
						<ExternalLinkIcon className="about-card-arrow" />
					</a>
				</li>
			))}
		</ul>
	);
}

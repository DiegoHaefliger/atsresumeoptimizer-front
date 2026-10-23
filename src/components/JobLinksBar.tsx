import { ExternalLinkIcon } from "./icons";

type JobLinksBarProps = {
	adUrl?: string | null;
	applicationUrl?: string | null;
};

export function JobLinksBar({ adUrl, applicationUrl }: JobLinksBarProps) {
	if (!adUrl && !applicationUrl) {
		return null;
	}
	return (
		<nav className="job-links-bar" aria-label="Links da vaga">
			{adUrl && (
				<a href={adUrl} target="_blank" rel="noopener noreferrer" className="job-link-button job-link-button-primary">
					Anúncio da vaga <ExternalLinkIcon />
				</a>
			)}
			{applicationUrl && (
				<a href={applicationUrl} target="_blank" rel="noopener noreferrer" className="job-link-button">
					Candidatura <ExternalLinkIcon />
				</a>
			)}
		</nav>
	);
}

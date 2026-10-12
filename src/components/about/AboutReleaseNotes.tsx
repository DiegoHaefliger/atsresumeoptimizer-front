import { Badge } from "../Badge";
import { RELEASE_CHANGE_LABELS, RELEASE_CHANGE_TONES } from "../../lib/releaseChangeLabels";
import { RELEASE_NOTES } from "../../lib/releaseNotes";
import { useAppVersion } from "../../lib/useAppVersion";

const dateFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeZone: "UTC" });

export function AboutReleaseNotes() {
	const current = useAppVersion()?.current;

	return (
		<div className="release-list">
			{RELEASE_NOTES.map((release) => (
				<section key={release.version} className="release panel" aria-labelledby={`release-${release.version}`}>
					<header className="release-header">
						<h2 id={`release-${release.version}`}>Versão {release.version}</h2>
						{release.version === current && <Badge tone="info">Instalada</Badge>}
						<time className="release-date" dateTime={release.date}>
							{dateFormat.format(new Date(release.date))}
						</time>
					</header>
					<p className="release-summary">{release.summary}</p>
					<ul className="release-changes">
						{release.changes.map((change) => (
							<li key={change.text}>
								<Badge tone={RELEASE_CHANGE_TONES[change.kind]}>{RELEASE_CHANGE_LABELS[change.kind]}</Badge>
								<span>{change.text}</span>
							</li>
						))}
					</ul>
				</section>
			))}
		</div>
	);
}

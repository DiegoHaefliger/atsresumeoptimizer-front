import { Badge } from "../Badge";
import { RELEASE_CHANGE_LABELS, RELEASE_CHANGE_TONES } from "../../lib/releaseChangeLabels";
import { RELEASE_NOTES, type ReleaseNote } from "../../lib/releaseNotes";
import { useAppVersion } from "../../lib/useAppVersion";

const dateFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long", timeZone: "UTC" });

export function AboutReleaseNotes() {
	const current = useAppVersion()?.current;
	const [latest, ...older] = RELEASE_NOTES;

	return (
		<div className="release-list">
			{latest && (
				<section className="release panel" aria-labelledby={`release-${latest.version}`}>
					<ReleaseHeader release={latest} installed={latest.version === current} />
					<ReleaseBody release={latest} />
				</section>
			)}
			{older.map((release) => (
				<details key={release.version} className="release release-older panel">
					<summary>
						<ReleaseHeader release={release} installed={release.version === current} />
					</summary>
					<ReleaseBody release={release} />
				</details>
			))}
		</div>
	);
}

function ReleaseHeader({ release, installed }: { release: ReleaseNote; installed: boolean }) {
	return (
		<header className="release-header">
			<h2 id={`release-${release.version}`}>Versão {release.version}</h2>
			{installed && <Badge tone="info">Instalada</Badge>}
			<time className="release-date" dateTime={release.date}>
				{dateFormat.format(new Date(release.date))}
			</time>
		</header>
	);
}

function ReleaseBody({ release }: { release: ReleaseNote }) {
	return (
		<>
			<p className="release-summary">{release.summary}</p>
			<ul className="release-changes">
				{release.changes.map((change) => (
					<li key={change.text}>
						<Badge tone={RELEASE_CHANGE_TONES[change.kind]}>{RELEASE_CHANGE_LABELS[change.kind]}</Badge>
						<span>{change.text}</span>
					</li>
				))}
			</ul>
		</>
	);
}

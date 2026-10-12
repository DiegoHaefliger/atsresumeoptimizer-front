import { Badge } from "../Badge";
import { AboutReleaseNotes } from "./AboutReleaseNotes";
import { CheckCircleIcon, DownloadIcon } from "../icons";
import { useAppVersion } from "../../lib/useAppVersion";

const dateFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" });

export function AboutVersionTab() {
	const version = useAppVersion();
	const updateAvailable = Boolean(version?.updateAvailable && version.releaseUrl);

	return (
		<>
			<section className="about-hero panel" aria-label="Versão do sistema">
				<span className="brand-mark about-hero-mark">A</span>
				<div className="about-hero-body">
					<span className="about-hero-label">Versão instalada</span>
					<strong className="about-hero-version">{version?.current ? `v${version.current}` : "Indisponível"}</strong>
					{!version && <span className="about-hero-meta">Não foi possível consultar o backend.</span>}
				{version?.publishedAt && (
						<span className="about-hero-meta">Publicada em {dateFormat.format(new Date(version.publishedAt))}</span>
					)}
				</div>
				{updateAvailable ? (
					<div className="about-hero-status">
						<Badge tone="warning">Nova versão {version?.latest}</Badge>
						<a className="update-banner-download about-hero-action" href={version?.releaseUrl} target="_blank" rel="noreferrer">
							<DownloadIcon /> Baixar
						</a>
					</div>
				) : (
					version?.current && (
						<div className="about-hero-status">
							<Badge tone="success">
								<CheckCircleIcon /> Atualizado
							</Badge>
						</div>
					)
				)}
			</section>
			<h2 className="about-section-title">Novidades por versão</h2>
			<AboutReleaseNotes />
		</>
	);
}

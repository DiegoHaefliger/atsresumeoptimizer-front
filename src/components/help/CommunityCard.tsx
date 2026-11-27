import { PROJECT_LINKS } from "../../lib/projectLinks";
import { ArrowRightIcon, WhatsAppIcon } from "../icons";

export function CommunityCard() {
	return (
		<section className="about-community panel" aria-labelledby="about-community-title">
			<span className="about-community-icon">
				<WhatsAppIcon />
			</span>
			<div className="about-community-body">
				<span className="about-community-eyebrow">Dúvidas de uso</span>
				<h2 id="about-community-title">Grupo de dúvidas no WhatsApp</h2>
				<p>
					Ficou com dúvida sobre como usar o sistema, configurar a chave de IA ou interpretar uma análise? Pergunte no grupo
					e troque experiências com outros usuários.
				</p>
			</div>
			<a
				className="about-community-action"
				href={PROJECT_LINKS.whatsappGroup}
				target="_blank"
				rel="noreferrer"
				aria-describedby="about-community-title"
			>
				Entrar no grupo <ArrowRightIcon />
				<span className="sr-only">(abre em nova aba)</span>
			</a>
		</section>
	);
}

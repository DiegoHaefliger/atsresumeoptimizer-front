const CHECKS = [
	{ title: "Leitura por ATS", detail: "Se o arquivo tem texto selecionável, colunas, tabelas ou caixas que confundem o robô." },
	{ title: "Estrutura", detail: "Seções esperadas (resumo, experiência, formação, competências) e ordem." },
	{ title: "Dados de contato", detail: "E-mail, telefone e LinkedIn fáceis de achar, fora de cabeçalho e rodapé." },
	{ title: "Qualidade dos tópicos", detail: "Verbos de ação, resultados e números em cada experiência." },
	{ title: "Português", detail: "Ortografia e gramática." },
];

export function GeneralAnalysisAside() {
	return (
		<div className="aside-card">
			<span className="aside-card-title">O que a avaliação geral olha</span>
			<ul className="aside-checks">
				{CHECKS.map((check) => (
					<li key={check.title}>
						<strong>{check.title}</strong>
						<span>{check.detail}</span>
					</li>
				))}
			</ul>
			<p className="aside-card-note">
				Sem vaga não há comparação de palavras-chave nem de requisitos. Quando tiver uma vaga em mente, escolha
				&ldquo;Para uma vaga&rdquo;.
			</p>
		</div>
	);
}

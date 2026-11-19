import { useState } from "react";
import { WORK_MODEL_LABELS } from "../lib/jobLabels";
import {
	applyChange,
	buildPostSearchUrl,
	canAddTo,
	LINKEDIN_OPERATOR_LIMIT,
	operatorCost,
	POST_DATE_LABELS,
	POST_LANGUAGE_LABELS,
	POST_SORT_LABELS,
	type PostDateFilter,
	type PostLanguage,
	type PostSearch,
	type PostSort,
} from "../lib/linkedinPostSearch";
import { loadPostSearch, savePostSearch } from "../lib/linkedinPostSearchStorage";
import { useCopyFeedback } from "../lib/useCopyFeedback";
import { ChoiceGroup } from "./ChoiceGroup";
import { StateMessage } from "./StateMessage";
import { TagInput } from "./TagInput";

const FULL_HINT = `Limite de ${LINKEDIN_OPERATOR_LIMIT} operadores atingido. Remova um filtro pra adicionar outro.`;
const CLAMPED_NOTICE = `O LinkedIn ignora buscas com mais de ${LINKEDIN_OPERATOR_LIMIT} operadores, então parte do que você tentou adicionar não coube. Remova outro filtro pra liberar espaço.`;

export function LinkedInLinkForm() {
	const [search, setSearch] = useState<PostSearch>(loadPostSearch);
	const [notice, setNotice] = useState<{ field: keyof PostSearch; message: string } | null>(null);
	const { copied, copy } = useCopyFeedback();
	const url = buildPostSearchUrl(search);
	const used = operatorCost(search);

	function noticeFor(field: keyof PostSearch) {
		return notice?.field === field ? <StateMessage variant="error" layout="inline" message={notice.message} /> : null;
	}

	function update<K extends keyof PostSearch>(field: K, value: PostSearch[K]) {
		const change = applyChange(search, { ...search, [field]: value });
		setSearch(change.search);
		savePostSearch(change.search);
		setNotice(change.clamped ? { field, message: CLAMPED_NOTICE } : null);
	}

	return (
		<section className="panel">
			<div className="panel-header">
				<h2>Parâmetros da busca</h2>
				<p>Muitas vagas aparecem só em postagens de recrutadores no LinkedIn. Monte aqui a sua busca e abra o resultado já filtrado, sem refazer a pesquisa toda vez.</p>
			</div>
			<div className="panel-body linkedin-link-form">
				<p className="field-hint" aria-live="polite">
					Operadores do LinkedIn em uso:{" "}
					<strong>
						{used} de {LINKEDIN_OPERATOR_LIMIT}
					</strong>
					. Cada item extra em um filtro e cada filtro ativo consome um; acima disso o LinkedIn não retorna nada.
				</p>
				<TagInput
					label="Cargos e palavras-chave"
					placeholder="Ex.: Desenvolvedor Java, Spring Boot"
					values={search.terms}
					onChange={(values) => update("terms", values)}
					limitHint={canAddTo(search, "terms") ? undefined : FULL_HINT}
				/>
				{noticeFor("terms")}
				<TagInput
					label="Palavras a excluir"
					placeholder="Ex.: estágio, jovem aprendiz"
					values={search.excluded}
					onChange={(values) => update("excluded", values)}
					limitHint={canAddTo(search, "excluded") ? undefined : FULL_HINT}
				/>
				{noticeFor("excluded")}
				<TagInput
					label="Perfis ou empresas a ocultar"
					placeholder="Ex.: Vagas Remotas"
					values={search.blockedAuthors}
					onChange={(values) => update("blockedAuthors", values)}
					limitHint={canAddTo(search, "blockedAuthors") ? undefined : FULL_HINT}
				/>
				{noticeFor("blockedAuthors")}
				<p className="field-hint">
					Usa o nome do perfil como exclusão na busca, então também some postagem que só cita esse nome. Vale pro nome como
					aparece no LinkedIn.
				</p>
				<TagInput
					label="Cidades ou regiões"
					placeholder="Ex.: Curitiba, São Paulo"
					values={search.locations}
					onChange={(values) => update("locations", values)}
					limitHint={canAddTo(search, "locations") ? undefined : FULL_HINT}
				/>
				{noticeFor("locations")}
				<ChoiceGroup
					legend="Modelo de trabalho"
					options={WORK_MODEL_LABELS}
					selected={search.workModels}
					onChange={(value) => update("workModels", value)}
				/>
				{noticeFor("workModels")}
				<label>
					Idioma das publicações
					<select value={search.language} onChange={(event) => update("language", event.target.value as PostLanguage)}>
						{(Object.keys(POST_LANGUAGE_LABELS) as PostLanguage[]).map((value) => (
							<option key={value} value={value}>
								{POST_LANGUAGE_LABELS[value]}
							</option>
						))}
					</select>
					<span className="field-hint">
						{search.language === "any"
							? "Qualquer idioma não adiciona nada ao link nem consome operadores."
							: 'O LinkedIn não filtra idioma em postagens. Com "só contratação" ligada, as palavras de contratação já são do idioma; desligada, o link usa palavras típicas dele. Ocupa 2 operadores.'}
					</span>
				</label>
				{noticeFor("language")}
				<div className="form-row">
					<label>
						Publicada em
						<select value={search.datePosted} onChange={(event) => update("datePosted", event.target.value as PostDateFilter)}>
							{(Object.keys(POST_DATE_LABELS) as PostDateFilter[]).map((value) => (
								<option key={value} value={value}>
									{POST_DATE_LABELS[value]}
								</option>
							))}
						</select>
					</label>
					<label>
						Ordenar por
						<select value={search.sortBy} onChange={(event) => update("sortBy", event.target.value as PostSort)}>
							{(Object.keys(POST_SORT_LABELS) as PostSort[]).map((value) => (
								<option key={value} value={value}>
									{POST_SORT_LABELS[value]}
								</option>
							))}
						</select>
					</label>
				</div>
				<label className="toggle-option">
					<input
						type="checkbox"
						role="switch"
						checked={search.hiringOnly}
						onChange={(event) => update("hiringOnly", event.target.checked)}
					/>
					<span className="toggle-switch" aria-hidden="true" />
					<span className="toggle-option-text">
						<span className="toggle-option-title">Só postagens de contratação</span>
						<span className="toggle-option-desc">
							Exige palavras como contratando e vaga (no idioma escolhido, se houver) no texto. Ocupa 2 operadores.
						</span>
					</span>
				</label>
				{noticeFor("hiringOnly")}
				<label>
					Link gerado
					<textarea readOnly rows={3} value={url ?? ""} placeholder="Informe ao menos um termo pra gerar o link." />
				</label>
				<div className="form-actions">
					<button type="button" className="btn-secondary" disabled={!url} onClick={() => url && void copy(url)}>
						{copied ? "Copiado" : "Copiar link"}
					</button>
					<a
						className="button-link"
						href={url ?? undefined}
						target="_blank"
						rel="noopener noreferrer"
						aria-disabled={!url}
						hidden={!url}
					>
						Abrir no LinkedIn
					</a>
				</div>
			</div>
		</section>
	);
}

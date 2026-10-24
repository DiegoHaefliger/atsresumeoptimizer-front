import type { PostedWithin } from "../../api/types";
import { POSTED_WITHIN_LABELS } from "../../lib/jobLabels";
import { describeSearch, INTERVAL_HOURS_OPTIONS, MAX_RESULTS_LIMIT, searchMaxResultsValue, type PreferenceForm } from "../../lib/preferenceForm";
import { TagInput } from "../TagInput";
import type { SectionProps } from "./sectionProps";

export function SearchSection({ form, onChange }: SectionProps<PreferenceForm>) {
	const hasKeywords = form.searchKeywords.length > 0;
	const limitInvalid = searchMaxResultsValue(form) === null;
	return (
		<section className="panel">
			<div className="panel-header">
				<h2>Busca de vagas</h2>
				<p>
					A busca reaproveita senioridade, modelo, contrato e cidades definidos nas outras abas. Aqui ficam só os
					campos que a busca precisa a mais.
				</p>
			</div>
			<div className="panel-body">
				<TagInput
					label="Cargos e palavras-chave"
					placeholder="Ex.: Desenvolvedor Java, Spring Boot"
					values={form.searchKeywords}
					onChange={(values) => onChange("searchKeywords", values)}
				/>
				<TagInput
					label="Palavras a excluir"
					placeholder="Ex.: estágio, jovem aprendiz"
					values={form.searchExcludedKeywords}
					onChange={(values) => onChange("searchExcludedKeywords", values)}
				/>
				<div className="form-row">
					<label>
						Publicada em
						<select
							value={form.searchPostedWithin}
							onChange={(event) => onChange("searchPostedWithin", event.target.value as PostedWithin)}
						>
							{(Object.keys(POSTED_WITHIN_LABELS) as PostedWithin[]).map((value) => (
								<option key={value} value={value}>
									{POSTED_WITHIN_LABELS[value]}
								</option>
							))}
						</select>
					</label>
					<label>
						Máximo de vagas por busca
						<input
							type="number"
							inputMode="numeric"
							min={1}
							max={MAX_RESULTS_LIMIT}
							value={form.searchMaxResults}
							aria-invalid={limitInvalid}
							onChange={(event) => onChange("searchMaxResults", event.target.value)}
						/>
						{limitInvalid && <span className="field-error">Informe um número de 1 a {MAX_RESULTS_LIMIT}.</span>}
					</label>
				</div>
				<label>
					Repetir a busca a cada
					<select
						value={form.searchIntervalHours}
						onChange={(event) => onChange("searchIntervalHours", Number(event.target.value))}
					>
						{INTERVAL_HOURS_OPTIONS.map((hours) => (
							<option key={hours} value={hours}>
								{hours} horas
							</option>
						))}
					</select>
					<span className="field-hint">
						A busca automática roda com o app aberto. Também dá pra buscar na hora, na tela de Vagas.
					</span>
				</label>
				<label>
					Aderência mínima: <strong>{form.searchMinAdherence}%</strong>
					<input
						type="range"
						min={0}
						max={100}
						step={5}
						value={form.searchMinAdherence}
						onChange={(event) => onChange("searchMinAdherence", Number(event.target.value))}
					/>
					<span className="field-hint">
						Só aparecem vagas que informam algo do que você definiu nas Preferências e que alcançam esse valor.
						Vaga sem informação suficiente é descartada.
					</span>
				</label>
				<p className="search-summary-text">
					{hasKeywords
						? `${describeSearch(form).join(" · ")} · aderência de ${form.searchMinAdherence}% ou mais`
						: "Informe ao menos um cargo ou palavra-chave para ativar a busca."}
				</p>
				<label className="toggle-option">
					<input
						type="checkbox"
						role="switch"
						checked={form.searchEnabled && hasKeywords}
						disabled={!hasKeywords}
						onChange={(event) => onChange("searchEnabled", event.target.checked)}
					/>
					<span className="toggle-switch" aria-hidden="true" />
					<span className="toggle-option-text">
						<span className="toggle-option-title">Busca ativa</span>
						<span className="toggle-option-desc">
							Usa só fontes públicas, sem login, e respeita o limite de requisições.
						</span>
					</span>
				</label>
			</div>
		</section>
	);
}

import { useState } from "react";
import type { PostedWithin } from "../../api/types";
import { POSTED_WITHIN_LABELS } from "../../lib/jobLabels";
import { clampMaxResults, describeSearch, MAX_RESULTS_LIMIT, searchMaxResultsValue, type PreferenceForm } from "../../lib/preferenceForm";
import { CUSTOM_SCHEDULE, isCronShaped, presetFor, SCHEDULE_PRESETS } from "../../lib/searchSchedule";
import { TagInput } from "../TagInput";
import { UsageTags } from "./UsageTags";
import { SiteSelector } from "./SiteSelector";
import type { SectionProps } from "./sectionProps";

export function SearchSection({ form, onChange }: SectionProps<PreferenceForm>) {
	const hasKeywords = form.searchKeywords.length > 0;
	const limitInvalid = searchMaxResultsValue(form) === null;
	const [custom, setCustom] = useState(() => presetFor(form.searchCron) === CUSTOM_SCHEDULE);
	const selectValue = custom || presetFor(form.searchCron) === CUSTOM_SCHEDULE ? CUSTOM_SCHEDULE : form.searchCron;

	function selectSchedule(value: string) {
		setCustom(value === CUSTOM_SCHEDULE);
		if (value !== CUSTOM_SCHEDULE) {
			onChange("searchCron", value);
		}
	}
	return (
		<section className="panel">
			<div className="panel-header">
				<h2>Busca de vagas</h2>
				<p>
					A busca reaproveita senioridade, modelo, contrato e cidades das outras abas. Aqui ficam os campos que
					só ela usa. Ela consulta apenas os sites ativos abaixo, todos sem login.
				</p>
			</div>
			<div className="panel-body">
				<SiteSelector selected={form.searchSites} onChange={(value) => onChange("searchSites", value)} />
				<TagInput
					label="Cargos e palavras-chave"
					tags={<UsageTags uses={["search", "score"]} />}
					placeholder="Ex.: Desenvolvedor Java, Spring Boot"
					values={form.searchKeywords}
					onChange={(values) => onChange("searchKeywords", values)}
				/>
				<TagInput
					label="Palavras a excluir"
					tags={<UsageTags uses={["search", "score"]} />}
					placeholder="Ex.: estágio, jovem aprendiz"
					values={form.searchExcludedKeywords}
					onChange={(values) => onChange("searchExcludedKeywords", values)}
				/>
				<div className="form-row">
					<label>
						Publicada em <UsageTags uses={["search"]} />
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
						Máximo de vagas por busca <UsageTags uses={["search"]} />
						<input
							type="number"
							inputMode="numeric"
							min={1}
							max={MAX_RESULTS_LIMIT}
							value={form.searchMaxResults}
							aria-invalid={limitInvalid}
							onChange={(event) => onChange("searchMaxResults", clampMaxResults(event.target.value))}
						/>
						{limitInvalid && <span className="field-error">Informe um número de 1 a {MAX_RESULTS_LIMIT}.</span>}
					</label>
				</div>
				<label>
					Aderência mínima: <strong>{form.searchMinAdherence}%</strong> <UsageTags uses={["score"]} />
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
				<div className="schedule-block">
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
							<span className="toggle-option-title">Busca automática agendada</span>
							<span className="toggle-option-desc">
								Roda sozinha nos horários abaixo enquanto o app estiver aberto. Desligada, você ainda busca na hora
								pela tela de Vagas.
							</span>
						</span>
					</label>
					<label>
						Agendamento <UsageTags uses={["search"]} />
						<select
							value={selectValue}
							onChange={(event) => selectSchedule(event.target.value)}
						>
							{SCHEDULE_PRESETS.map((preset) => (
								<option key={preset.cron} value={preset.cron}>
									{preset.label}
								</option>
							))}
							<option value={CUSTOM_SCHEDULE}>Personalizado (cron)</option>
						</select>
					</label>
					{selectValue === CUSTOM_SCHEDULE && (
						<label>
							Expressão cron
							<input
								value={form.searchCron}
								placeholder="0 0 8,20 * * *"
								spellCheck={false}
								onChange={(event) => onChange("searchCron", event.target.value)}
							/>
							{!isCronShaped(form.searchCron) && (
								<span className="field-error">Use 6 campos: segundo minuto hora dia mês dia-da-semana.</span>
							)}
							<span className="field-hint">
								Exemplo: <code>0 30 7 * * MON-FRI</code> roda às 7h30 nos dias úteis. O intervalo entre buscas
								automáticas não pode ser menor que 1 hora.
							</span>
						</label>
					)}
					<span className="field-hint">Usa só fontes públicas, sem login, e respeita o limite de requisições.</span>
				</div>
			</div>
		</section>
	);
}

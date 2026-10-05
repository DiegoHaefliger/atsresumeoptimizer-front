import { useEffect, useRef, useState } from "react";
import { entryLabelsFor, type EntryLabels } from "../lib/entryLabels";
import { formatPeriod, parsePeriod, type PeriodParts } from "../lib/period";
import type { ResumeContact, ResumeEntry, ResumeSection, StructuredResume, TextSpan } from "../api/types";
import {
	emptySection,
	keyValuesToText,
	richLinesToText,
	SECTION_PRESETS,
	textToKeyValues,
	plainText,
	textToRichLines,
} from "../lib/resumeSections";
import { AutoGrowTextarea } from "./AutoGrowTextarea";
import { RichTextField } from "./RichTextField";
import { Dialog } from "./Dialog";
import { MonthYearField } from "./MonthYearField";
import { ChevronDownIcon, ChevronUpIcon } from "./icons";
import { AddButton, RemoveButton } from "./EditorButtons";
import { LanguagesEditor } from "./LanguagesEditor";
import { CertificationsEditor } from "./CertificationsEditor";

type ResumeEditorProps = {
	content: StructuredResume;
	contact: ResumeContact;
	onContentChange: (content: StructuredResume) => void;
	onContactChange: (contact: ResumeContact) => void;
	editableSections?: boolean;
};

const CONTACT_FIELDS: { key: keyof ResumeContact; label: string }[] = [
	{ key: "email", label: "E-mail" },
	{ key: "phone", label: "Telefone" },
	{ key: "linkedIn", label: "LinkedIn" },
	{ key: "github", label: "GitHub" },
	{ key: "portfolio", label: "Portfólio" },
	{ key: "location", label: "Localização" },
];

export function ResumeEditor({
	content,
	contact,
	onContentChange,
	onContactChange,
	editableSections = false,
}: ResumeEditorProps) {
	const sections = content.sections ?? [];
	const [pendingRemoval, setPendingRemoval] = useState<number | null>(null);
	const [layoutRevision, setLayoutRevision] = useState(0);
	const pendingFocus = useRef<{ index: number; offset: number } | null>(null);

	useEffect(() => {
		const target = pendingFocus.current;
		if (!target) {
			return;
		}
		pendingFocus.current = null;
		const section = document.querySelector<HTMLElement>(`[data-section-index="${target.index}"]`);
		const preferred = section?.querySelector<HTMLButtonElement>(`[data-move-offset="${target.offset}"]`);
		const button = preferred && !preferred.disabled ? preferred : section?.querySelector<HTMLButtonElement>("[data-move-offset]:not(:disabled)");
		(button ?? section)?.focus();
		section?.scrollIntoView({ block: "nearest" });
	}, [layoutRevision]);

	function moveSection(index: number, offset: number) {
		const target = index + offset;
		if (target < 0 || target >= sections.length) {
			return;
		}
		const reordered = [...sections];
		[reordered[index], reordered[target]] = [reordered[target], reordered[index]];
		pendingFocus.current = { index: target, offset };
		setLayoutRevision((revision) => revision + 1);
		onContentChange({ ...content, sections: reordered });
	}

	function confirmRemoval() {
		if (pendingRemoval !== null) {
			onContentChange({ ...content, sections: removeAt(sections, pendingRemoval) });
		}
		setLayoutRevision((revision) => revision + 1);
		setPendingRemoval(null);
	}

	function updateSection(index: number, section: ResumeSection) {
		onContentChange({ ...content, sections: replaceAt(sections, index, section) });
	}

	return (
		<div className="resume-editor">
			<fieldset className="resume-editor-group">
				<legend>Cabeçalho</legend>
				<label>
					Nome
					<input value={content.name ?? ""} onChange={(event) => onContentChange({ ...content, name: event.target.value })} />
				</label>
				<label>
					Título
					<input
						value={content.headline ?? ""}
						onChange={(event) => onContentChange({ ...content, headline: event.target.value })}
					/>
				</label>
				<div className="resume-editor-grid">
					{CONTACT_FIELDS.map((field) => (
						<label key={field.key}>
							{field.label}
							<input
								value={contact[field.key] ?? ""}
								onChange={(event) => onContactChange({ ...contact, [field.key]: event.target.value })}
							/>
						</label>
					))}
				</div>
			</fieldset>

			{sections.map((section, index) => (
				<fieldset
					key={`${layoutRevision}-${index}`}
					className="resume-editor-group"
					data-section-index={index}
					tabIndex={-1}
				>
					<legend className="sr-only">{section.title || "Seção sem título"}</legend>
					<div className="resume-editor-section-header">
						<h3 className="resume-editor-section-title">{section.title || "Seção sem título"}</h3>
						{editableSections && (
							<div className="resume-editor-section-actions">
								<button
									type="button"
									className="btn-icon"
									aria-label={`Mover seção ${section.title ?? ""} para cima`}
									disabled={index === 0}
									data-move-offset={-1}
									onClick={() => moveSection(index, -1)}
								>
									<ChevronUpIcon />
								</button>
								<button
									type="button"
									className="btn-icon"
									aria-label={`Mover seção ${section.title ?? ""} para baixo`}
									disabled={index === sections.length - 1}
									data-move-offset={1}
									onClick={() => moveSection(index, 1)}
								>
									<ChevronDownIcon />
								</button>
								<RemoveButton label={`Remover seção ${section.title ?? ""}`} onClick={() => setPendingRemoval(index)} />
							</div>
						)}
					</div>
					<SectionEditor section={section} onChange={(updated) => updateSection(index, updated)} />
				</fieldset>
			))}

			{editableSections && (
				<AddSection
					sections={sections}
					onAdd={(section) => onContentChange({ ...content, sections: [...sections, section] })} />
			)}

			<Dialog open={pendingRemoval !== null} title="Excluir seção?" onClose={() => setPendingRemoval(null)}>
				<p>
					Tem certeza que deseja excluir a seção{" "}
					<strong>{pendingRemoval === null ? "" : (sections[pendingRemoval]?.title ?? "")}</strong>? O conteúdo dela será
					perdido.
				</p>
				<div className="dialog-actions">
					<button type="button" className="btn-secondary" onClick={() => setPendingRemoval(null)}>
						Cancelar
					</button>
					<button type="button" className="btn-danger" onClick={confirmRemoval}>
						Excluir seção
					</button>
				</div>
			</Dialog>
		</div>
	);
}

function isPresetInResume(preset: (typeof SECTION_PRESETS)[number], sections: ResumeSection[]): boolean {
	return sections.some(
		(section) =>
			section.title?.trim().toLowerCase() === preset.title?.toLowerCase() ||
			(preset.semanticType !== "OTHER" && section.semanticType === preset.semanticType),
	);
}

function AddSection({ sections, onAdd }: { sections: ResumeSection[]; onAdd: (section: ResumeSection) => void }) {
	const available = SECTION_PRESETS.filter((preset) => !isPresetInResume(preset, sections));
	const [selectedTitle, setSelectedTitle] = useState("");
	if (available.length === 0) {
		return null;
	}
	const selected = available.find((preset) => preset.title === selectedTitle) ?? available[0];
	return (
		<div className="resume-editor-add-section">
			<label>
				Nova seção
				<select value={selected.title} onChange={(event) => setSelectedTitle(event.target.value)}>
					{available.map((preset) => (
						<option key={preset.title} value={preset.title}>
							{preset.title}
						</option>
					))}
				</select>
			</label>
			<AddButton label="Adicionar seção" onClick={() => onAdd(emptySection(selected))} />
		</div>
	);
}

const COMPANY_LOCATION_SEPARATOR = " | ";
const ENTRY_TYPES = ["EXPERIENCE", "EDUCATION", "PROJECTS"];

const OBJECTIVE_PLACEHOLDER =
	"Cargo ou área desejada. Ex.: Analista de Logística | Operador de Produção | Assistente Administrativo";

const SUMMARY_PLACEHOLDER =
	"Escreva de 3 a 5 linhas sobre sua experiência, principais conhecimentos e resultados. Ex.: Profissional com 5 anos de experiência em logística, atuando com controle de estoque, inventários e operação de sistemas ERP. Vivência com indicadores, conferência de materiais e melhoria de processos.";

function paragraphPlaceholder(section: ResumeSection): string | undefined {
	const title = (section.title ?? "").trim().toLocaleLowerCase("pt-BR");
	if (title.startsWith("objetivo")) {
		return OBJECTIVE_PLACEHOLDER;
	}
	return title.startsWith("resumo") || section.semanticType === "SUMMARY" ? SUMMARY_PLACEHOLDER : undefined;
}

const OTHER_INFO_PLACEHOLDER =
	"Inclua apenas informações que agreguem à candidatura: disponibilidade de horário, CNH/categoria, disponibilidade para viagens ou mudança, quando forem relevantes.";

function richLinesPlaceholder(section: ResumeSection): string | undefined {
	const title = (section.title ?? "").trim().toLocaleLowerCase("pt-BR");
	return title.startsWith("outras informa") ? OTHER_INFO_PLACEHOLDER : undefined;
}

const KEY_VALUE_PLACEHOLDERS: Record<string, string> = {
	SKILLS:
		"Liste de 6 a 10 conhecimentos relevantes para a vaga. Ex.: Excel intermediário | SAP | Atendimento ao cliente | Leitura e interpretação de desenho | Gestão de estoque | Recrutamento e Seleção",
};

const KEY_VALUE_HINTS: Record<string, string> = {
	SKILLS: "Uma linha por categoria, no formato Categoria: tecnologias. Ex.: Backend: Java, Spring Boot.",
	LANGUAGES: "Uma linha por idioma, no formato Idioma: nível. Ex.: Inglês: Avançado.",
};

function sectionTextLines(section: ResumeSection): TextSpan[][] {
	switch (section.kind) {
		case "PARAGRAPH":
			return textToRichLines(section.paragraph ?? "");
		case "RICH_LINES":
			return section.richLines ?? [];
		default:
			return [];
	}
}

function SectionEditor({ section, onChange }: { section: ResumeSection; onChange: (section: ResumeSection) => void }) {
	if (ENTRY_TYPES.includes(section.semanticType ?? "") && section.kind !== "ENTRIES") {
		return (
			<>
				<SectionTextEditor section={section} onChange={onChange} />
				<AddButton
					label={entryLabelsFor(section.semanticType).add}
					onClick={() =>
						onChange({
							...section,
							kind: "ENTRIES",
							entries: [{ ...EMPTY_ENTRY, bullets: sectionTextLines(section) }],
						})
					}
				/>
			</>
		);
	}
	if (section.semanticType === "LANGUAGES" && section.kind !== "KEY_VALUE") {
		return (
			<>
				<SectionTextEditor section={section} onChange={onChange} />
				<AddButton
					label="Adicionar idioma"
					onClick={() =>
						onChange({
							...section,
							kind: "KEY_VALUE",
							keyValues: [
								...textToKeyValues(sectionTextLines(section).map(plainText).join("\n")).map((line) =>
									line.label ? line : { label: line.value, value: "" },
								),
								{ label: "", value: "" },
							],
						})
					}
				/>
			</>
		);
	}
	return <SectionTextEditor section={section} onChange={onChange} />;
}

function SectionTextEditor({ section, onChange }: { section: ResumeSection; onChange: (section: ResumeSection) => void }) {
	switch (section.kind) {
		case "PARAGRAPH":
			return (
				<RichTextField
					label={section.title ?? "Seção"}
					rows={5}
					placeholder={paragraphPlaceholder(section)}
					value={section.paragraph ?? ""}
					onChange={(paragraph) => onChange({ ...section, paragraph })}
				/>
			);
		case "KEY_VALUE":
			if (section.semanticType === "LANGUAGES") {
				return (
					<LanguagesEditor
						languages={section.keyValues ?? []}
						onChange={(keyValues) => onChange({ ...section, keyValues })}
					/>
				);
			}
			return (
				<LinesTextarea
					label={section.title ?? "Seção"}
					hint={KEY_VALUE_HINTS[section.semanticType ?? ""] ?? "Uma linha por item, no formato Rótulo: valor."}
					placeholder={KEY_VALUE_PLACEHOLDERS[section.semanticType ?? ""]}
					initialText={keyValuesToText(section.keyValues ?? [])}
					onChange={(text) => onChange({ ...section, keyValues: textToKeyValues(text) })}
				/>
			);
		case "RICH_LINES":
			if (section.semanticType === "CERTIFICATIONS") {
				return <CertificationsEditor lines={section.richLines ?? []} onChange={(richLines) => onChange({ ...section, richLines })} />;
			}
			return (
				<LinesTextarea
					toolbar="lists"
					label={section.title ?? "Seção"}
					placeholder={richLinesPlaceholder(section)}
					initialText={richLinesToText(section.richLines ?? [])}
					onChange={(text) => onChange({ ...section, richLines: textToRichLines(text) })}
				/>
			);
		case "ENTRIES": {
			const entries = section.entries ?? [];
			return (
				<>
					{entries.map((entry, index) => (
						<EntryEditor
							key={index}
							entry={entry}
							labels={entryLabelsFor(section.semanticType)}
							onChange={(updated) => onChange({ ...section, entries: replaceAt(entries, index, updated) })}
							onRemove={() => onChange({ ...section, entries: removeAt(entries, index) })}
						/>
					))}
					<AddButton
						label={
							entryLabelsFor(section.semanticType).add
						}
						onClick={() => onChange({ ...section, entries: [...entries, EMPTY_ENTRY] })}
					/>
				</>
			);
		}
		default:
			return null;
	}
}

const EMPTY_ENTRY: ResumeEntry = { heading: "", period: "", subheading: "", context: "", bullets: [], technologies: "", results: [] };

type EntryEditorProps = {
	entry: ResumeEntry;
	labels: EntryLabels;
	onChange: (entry: ResumeEntry) => void;
	onRemove: () => void;
};

function EntryEditor({ entry, labels, onChange, onRemove }: EntryEditorProps) {
	const headingField = (
		<label>
			{labels.heading}
			<input value={entry.heading ?? ""} onChange={(event) => onChange({ ...entry, heading: event.target.value })} />
		</label>
	);
	const periodField = (
		<div className="resume-editor-period">
			<PeriodFields period={entry.period} labels={labels} onChange={(period) => onChange({ ...entry, period })} />
		</div>
	);
	const subheading = entry.subheading ?? "";
	const separatorAt = subheading.indexOf(COMPANY_LOCATION_SEPARATOR);
	const company = separatorAt < 0 ? subheading : subheading.slice(0, separatorAt);
	const location = separatorAt < 0 ? "" : subheading.slice(separatorAt + COMPANY_LOCATION_SEPARATOR.length);
	const updateCompanyLocation = (nextCompany: string, nextLocation: string) =>
		onChange({
			...entry,
			subheading: nextLocation ? `${nextCompany}${COMPANY_LOCATION_SEPARATOR}${nextLocation}` : nextCompany,
		});
	const subheadingField = labels.contextLast ? (
		<>
			<label>
				Empresa
				<input value={company} onChange={(event) => updateCompanyLocation(event.target.value, location)} />
			</label>
			<label>
				Cidade/UF
				<input value={location} onChange={(event) => updateCompanyLocation(company, event.target.value)} />
			</label>
		</>
	) : (
		<label>
			{labels.subheading}
			<input
				value={entry.subheading ?? ""}
				onChange={(event) => onChange({ ...entry, subheading: event.target.value })}
			/>
		</label>
	);
	const contextField = (
		<div className="rich-text-group">
			<span>{labels.context}</span>
			<RichTextField
				label={labels.context}
				rows={2}
				placeholder={labels.contextPlaceholder}
				value={entry.context ?? ""}
				onChange={(context) => onChange({ ...entry, context })}
			/>
		</div>
	);
	const bulletsField = (
		<LinesTextarea
			label={labels.bullets}
			showLabel
			toolbar="inline"
			placeholder={labels.bulletsPlaceholder}
			initialText={richLinesToText(entry.bullets ?? [])}
			onChange={(text) => onChange({ ...entry, bullets: textToRichLines(text) })}
		/>
	);
	const resultsField = labels.hasResults && (
		<LinesTextarea
			label="Resultados"
			showLabel
			toolbar="inline"
			placeholder={labels.resultsPlaceholder}
			initialText={richLinesToText(entry.results ?? [])}
			onChange={(text) => onChange({ ...entry, results: textToRichLines(text) })}
		/>
	);
	return (
		<div className="resume-editor-entry">
			<div className="resume-editor-entry-header">
				<span className="resume-editor-sublabel">{entry.heading || labels.newItem}</span>
				<RemoveButton label={`Remover ${entry.heading || labels.newItem.toLowerCase()}`} onClick={onRemove} />
			</div>
			{labels.institutionFirst ? (
				<>
					{subheadingField}
					{headingField}
					{periodField}
				</>
			) : (
				<>
					{headingField}
					{periodField}
					{subheadingField}
				</>
			)}
			{labels.contextLast ? (
				<>
					{bulletsField}
					{contextField}
					{resultsField}
				</>
			) : (
				<>
					{contextField}
					{bulletsField}
					{resultsField}
				</>
			)}
			{labels.hasTechnologies && (
				<label>
					Tecnologias
					<input
						value={entry.technologies ?? ""}
						onChange={(event) => onChange({ ...entry, technologies: event.target.value })}
					/>
				</label>
			)}
		</div>
	);
}

type PeriodFieldsProps = { period: string | undefined; labels: EntryLabels; onChange: (period: string) => void };

function PeriodFields({ period, labels, onChange }: PeriodFieldsProps) {
	const [parts, setParts] = useState(() => parsePeriod(period));
	const external = parsePeriod(period);
	if (formatPeriod(parts) !== formatPeriod(external) && formatPeriod(parts) !== (period ?? "")) {
		setParts(external);
	}
	const update = (changes: Partial<PeriodParts>) => {
		const next = { ...parts, ...changes };
		setParts(next);
		onChange(formatPeriod(next));
	};
	return (
		<>
			<MonthYearField label={labels.startDate} value={parts.start} onChange={(start) => update({ start })} />
			<MonthYearField label={labels.endDate} value={parts.end} disabled={parts.current} futureYears={labels.endFutureYears} onChange={(end) => update({ end })} />

			{labels.currentLabel && (
				<label className="resume-editor-checkbox">
					<input
						type="checkbox"
						checked={parts.current}
						onChange={(event) => update({ current: event.target.checked, end: "" })}
					/>
					{labels.currentLabel}
				</label>
			)}
		</>
	);
}

const MIN_TEXTAREA_ROWS = 3;

type LinesTextareaProps = {
	label: string;
	showLabel?: boolean;
	hint?: string;
	placeholder?: string;
	initialText: string;
	toolbar?: "none" | "inline" | "lists";
	onChange: (text: string) => void;
};

function LinesTextarea({ label, showLabel = false, hint, placeholder, initialText, toolbar = "none", onChange }: LinesTextareaProps) {
	const [text, setText] = useState(initialText);
	const rows = Math.max(MIN_TEXTAREA_ROWS, text.split("\n").length + 1);
	const update = (next: string) => {
		setText(next);
		onChange(next);
	};

	if (toolbar !== "none") {
		return (
			<div className="rich-text-group">
				{showLabel ? <span>{label}</span> : <span className="sr-only">{label}</span>}
				<RichTextField label={label} rows={rows} placeholder={placeholder} value={text} lists={toolbar === "lists"} onChange={update} />
				{hint && <span className="field-hint">{hint}</span>}
			</div>
		);
	}
	return (
		<label>
			{showLabel ? label : <span className="sr-only">{label}</span>}
			<AutoGrowTextarea rows={rows} placeholder={placeholder} value={text} onChange={(event) => update(event.target.value)} />
			{hint && <span className="field-hint">{hint}</span>}
		</label>
	);
}

function replaceAt<T>(items: T[], index: number, value: T): T[] {
	return items.map((item, i) => (i === index ? value : item));
}

function removeAt<T>(items: T[], index: number): T[] {
	return items.filter((_, i) => i !== index);
}

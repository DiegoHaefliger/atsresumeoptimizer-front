import { useCallback, useState, type FormEvent } from "react";
import { apiPostForBlob, errorMessage } from "../api/client";
import type { ResumeContact, ResumeTemplate, StructuredResume } from "../api/types";
import { entryLabelsFor } from "../lib/entryLabels";
import { hasFutureDate, isIncompletePeriod } from "../lib/period";
import { BusyLabel } from "./BusyLabel";
import { ResumeEditor } from "./ResumeEditor";
import { PdfFrame } from "./PdfFrame";
import { SegmentedTabs } from "./SegmentedTabs";
import { StateMessage } from "./StateMessage";
import { TemplatePicker } from "./TemplatePicker";

const VIEW_OPTIONS: { value: "edit" | "preview"; label: string }[] = [
	{ value: "edit", label: "Editar" },
	{ value: "preview", label: "Prévia" },
];

const TITLE_MAX_LENGTH = 255;

export type ResumeDraft = { title?: string; template: ResumeTemplate; content: StructuredResume; contact: ResumeContact };

type ResumeFormProps = {
	initial: ResumeDraft;
	submitLabel: string;
	onSave: (draft: ResumeDraft) => Promise<void>;
	onDirtyChange?: (dirty: boolean) => void;
};

export function ResumeForm({ initial, submitLabel, onSave, onDirtyChange }: ResumeFormProps) {
	const [template, setTemplate] = useState<ResumeTemplate>(initial.template);
	const [content, setContent] = useState<StructuredResume>(initial.content);
	const [contact, setContact] = useState<ResumeContact>(initial.contact);
	const [title, setTitle] = useState(initial.title);
	const [view, setView] = useState<"edit" | "preview">("edit");
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const loadPreview = useCallback(
		() => apiPostForBlob("/api/v1/resumes/preview", { template, content, contact }),
		[template, content, contact],
	);

	function changed<T>(setter: (value: T) => void) {
		return (value: T) => {
			setter(value);
			onDirtyChange?.(true);
		};
	}

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();
		if (!content.name?.trim()) {
			setError("Preenche pelo menos o nome antes de salvar.");
			return;
		}
		const incompleteSection = (content.sections ?? []).find((section) =>
			(section.entries ?? []).some((entry) => isIncompletePeriod(entry.period)),
		);
		const incomplete = incompleteSection?.entries?.find((entry) => isIncompletePeriod(entry.period));
		if (incompleteSection && incomplete) {
			const current = entryLabelsFor(incompleteSection.semanticType).currentLabel;
			const hint = current ? `, ou marque "${current}"` : "";
			setError(`${incomplete.heading || "Um item"}: informe a data inicial e a final${hint}.`);
			return;
		}
		const futureSection = (content.sections ?? []).find((section) =>
			(section.entries ?? []).some((entry) =>
				hasFutureDate(entry.period, entryLabelsFor(section.semanticType).endFutureYears),
			),
		);
		const futureEntry = futureSection?.entries?.find((entry) =>
			hasFutureDate(entry.period, entryLabelsFor(futureSection.semanticType).endFutureYears),
		);
		if (futureEntry) {
			setError(`${futureEntry.heading || "Um item"}: a data informada é posterior ao permitido.`);
			return;
		}
		setError(null);
		setSaving(true);
		try {
			const withoutBlankLines = {
				...content,
				sections: (content.sections ?? []).map((section) => ({
					...section,
					keyValues: (section.keyValues ?? []).filter((line) => (line.label ?? "").trim() || (line.value ?? "").trim()),
					richLines: (section.richLines ?? []).filter((line) => line.some((span) => (span.text ?? "").trim() !== "")),
				})),
			};
			await onSave({ title: title?.trim() || undefined, template, content: withoutBlankLines, contact });
		} catch (err) {
			setError(errorMessage(err, "Não deu pra salvar o currículo. Tenta de novo."));
			setSaving(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} className="form">
			{title !== undefined && (
				<label>
					Nome do currículo na lista
					<input
						value={title}
						maxLength={TITLE_MAX_LENGTH}
						onChange={(event) => changed(setTitle)(event.target.value)}
					/>
				</label>
			)}

			<TemplatePicker value={template} onChange={changed(setTemplate)} />

			<div className="preview-toolbar">
				<SegmentedTabs label="Modo" options={VIEW_OPTIONS} value={view} onChange={setView} spaced />
			</div>

			{view === "edit" ? (
				<ResumeEditor
					content={content}
					contact={contact}
					onContentChange={changed(setContent)}
					onContactChange={changed(setContact)}
					editableSections
				/>
			) : (
				<PdfFrame
					title="Prévia do currículo"
					className="resume-pdf-preview"
					load={loadPreview}
				/>
			)}

			{error && <StateMessage variant="error" layout="inline" message={error} />}

			<button type="submit" disabled={saving} className="btn-block" aria-busy={saving}>
				<BusyLabel busy={saving} busyText="Gerando PDF e DOCX...">
					{submitLabel}
				</BusyLabel>
			</button>
		</form>
	);
}

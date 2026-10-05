import { useState } from "react";
import {
	certificationsFromLines,
	certificationsToLines,
	type Certification,
} from "../lib/certifications";
import type { TextSpan } from "../api/types";
import { AddButton, RemoveButton } from "./EditorButtons";

const YEAR_LENGTH = 4;
const EMPTY_CERTIFICATION: Certification = { name: "", institution: "", year: "" };

type CertificationsEditorProps = {
	lines: TextSpan[][];
	onChange: (lines: TextSpan[][]) => void;
};

function linesText(lines: TextSpan[][]): string {
	return lines.map((spans) => spans.map((span) => span.text ?? "").join("")).join("\n");
}

export function CertificationsEditor({ lines, onChange }: CertificationsEditorProps) {
	const externalText = linesText(lines);
	const [items, setItems] = useState(() => certificationsFromLines(lines));
	const [syncedText, setSyncedText] = useState(externalText);
	const currentYear = new Date().getFullYear();
	if (externalText !== syncedText) {
		setSyncedText(externalText);
		setItems(certificationsFromLines(lines));
	}

	function commit(next: Certification[]) {
		const nextLines = certificationsToLines(next);
		setItems(next);
		setSyncedText(linesText(nextLines));
		onChange(nextLines);
	}

	function update(index: number, changes: Partial<Certification>) {
		commit(items.map((item, i) => (i === index ? { ...item, ...changes } : item)));
	}

	return (
		<>
			{items.map((item, index) => (
				<div key={index} className="resume-editor-entry">
					<div className="resume-editor-entry-header">
						<span className="resume-editor-sublabel">{item.name || "Nova certificação"}</span>
						<RemoveButton
							label={`Remover ${item.name || "certificação"}`}
							onClick={() => commit(items.filter((_, i) => i !== index))}
						/>
					</div>
					<label>
						Nome do curso
						<input value={item.name} onChange={(event) => update(index, { name: event.target.value })} />
					</label>
					<label>
						Instituição
						<input value={item.institution} onChange={(event) => update(index, { institution: event.target.value })} />
					</label>
					<label>
						Ano
						<input
							inputMode="numeric"
							maxLength={YEAR_LENGTH}
							placeholder={String(currentYear)}
							value={item.year}
							onChange={(event) => {
								const digits = event.target.value.replace(/\D/g, "");
								update(index, { year: Number(digits) > currentYear ? String(currentYear) : digits });
							}}
						/>
					</label>
				</div>
			))}
			<AddButton
				label="Adicionar certificação"
				onClick={() => commit([...items, EMPTY_CERTIFICATION])}
			/>
		</>
	);
}

import type { KeyValueLine } from "../api/types";
import { AddButton, RemoveButton } from "./EditorButtons";

type LanguagesEditorProps = {
	languages: KeyValueLine[];
	onChange: (languages: KeyValueLine[]) => void;
};

const LANGUAGES = [
	"Português",
	"Inglês",
	"Espanhol",
	"Francês",
	"Alemão",
	"Italiano",
	"Mandarim",
	"Japonês",
	"Coreano",
	"Russo",
	"Árabe",
	"Hebraico",
	"Holandês",
	"Libras",
];
const LEVELS = ["Básico", "Intermediário", "Avançado", "Fluente", "Nativo"];
const EMPTY_LANGUAGE: KeyValueLine = { label: "", value: "" };

function withCurrent(options: string[], current: string | undefined): string[] {
	return current && !options.includes(current) ? [...options, current] : options;
}

export function LanguagesEditor({ languages, onChange }: LanguagesEditorProps) {
	function update(index: number, changes: Partial<KeyValueLine>) {
		onChange(languages.map((language, i) => (i === index ? { ...language, ...changes } : language)));
	}

	return (
		<>
			{languages.map((language, index) => (
				<div key={index} className="resume-editor-entry">
					<div className="resume-editor-entry-header">
						<span className="resume-editor-sublabel">{language.label || "Novo idioma"}</span>
						<RemoveButton
							label={`Remover ${language.label || "idioma"}`}
							onClick={() => onChange(languages.filter((_, i) => i !== index))}
						/>
					</div>
					<label>
						Idioma
						<select value={language.label ?? ""} onChange={(event) => update(index, { label: event.target.value })}>
							<option value="">Selecione</option>
							{withCurrent(LANGUAGES, language.label).map((name) => (
								<option key={name} value={name}>
									{name}
								</option>
							))}
						</select>
					</label>
					<label>
						Nível
						<select value={language.value ?? ""} onChange={(event) => update(index, { value: event.target.value })}>
							<option value="">Selecione</option>
							{withCurrent(LEVELS, language.value).map((level) => (
								<option key={level} value={level}>
									{level}
								</option>
							))}
						</select>
					</label>
				</div>
			))}
			<AddButton label="Adicionar idioma" onClick={() => onChange([...languages, EMPTY_LANGUAGE])} />
		</>
	);
}

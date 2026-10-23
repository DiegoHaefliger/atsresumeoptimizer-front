import { useState } from "react";
import type { ResumeContact, ResumeEntry, ResumeSection, ResumeTemplate, StructuredResume, TextSpan } from "../api/types";
import { plainText, richLinesToText, textToKeyValues, textToRichLines } from "../lib/resumeSections";
import { EditableBlock } from "./EditableBlock";
import { EditableLine } from "./EditableLine";

type DocumentEditorProps = {
	content: StructuredResume;
	contact: ResumeContact;
	template: ResumeTemplate;
	onContentChange: (content: StructuredResume) => void;
	onContactChange: (contact: ResumeContact) => void;
};

const CONTACT_ORDER: { key: keyof ResumeContact; label: string }[] = [
	{ key: "location", label: "Localização" },
	{ key: "phone", label: "Telefone" },
	{ key: "email", label: "E-mail" },
	{ key: "linkedIn", label: "LinkedIn" },
	{ key: "github", label: "GitHub" },
	{ key: "portfolio", label: "Portfólio" },
];
const CONTACT_SEPARATOR = " | ";

export function DocumentEditor({ content, contact, template, onContentChange, onContactChange }: DocumentEditorProps) {
	const sections = content.sections ?? [];
	const [contactKeys] = useState(() => CONTACT_ORDER.filter(({ key }) => (contact[key] ?? "").trim() !== ""));

	function updateSection(index: number, section: ResumeSection) {
		onContentChange({ ...content, sections: sections.map((item, i) => (i === index ? section : item)) });
	}

	return (
		<article className={`resume-preview resume-preview-${template.toLowerCase()} document-sheet`} aria-label="Documento do currículo">
			<EditableLine
				as="h2"
				className="resume-preview-name"
				label="Nome"
				value={content.name ?? ""}
				onChange={(name) => onContentChange({ ...content, name })}
			/>
			<EditableLine
				className="resume-preview-headline"
				label="Título"
				value={content.headline ?? ""}
				onChange={(headline) => onContentChange({ ...content, headline })}
			/>
			{contactKeys.length > 0 && (
				<p className="resume-preview-contact">
					{contactKeys.map(({ key, label }, index) => (
						<span key={key}>
							<EditableLine
								as="span"
								label={label}
								value={contact[key] ?? ""}
								onChange={(value) => onContactChange({ ...contact, [key]: value })}
							/>
							{index < contactKeys.length - 1 && CONTACT_SEPARATOR}
						</span>
					))}
				</p>
			)}
			{sections.map((section, index) => (
				<section className="resume-preview-section" key={index}>
					<EditableLine
						as="h3"
						label="Título da seção"
						value={section.title ?? ""}
						onChange={(title) => updateSection(index, { ...section, title })}
					/>
					<SectionBody section={section} onChange={(updated) => updateSection(index, updated)} />
				</section>
			))}
		</article>
	);
}


function keyValueLines(section: ResumeSection): TextSpan[][] {
	const boldLabel = section.semanticType !== "SOFT_SKILLS";
	return (section.keyValues ?? []).map((line) =>
		line.label
			? [{ text: `${line.label}: `, bold: boldLabel, italic: false, underline: false }, { text: line.value ?? "", bold: false, italic: false, underline: false }]
			: [{ text: line.value ?? "", bold: false, italic: false, underline: false }],
	);
}

function SectionBody({ section, onChange }: { section: ResumeSection; onChange: (section: ResumeSection) => void }) {
	const label = section.title || "Seção";
	switch (section.kind) {
		case "PARAGRAPH":
			return (
				<EditableBlock
					label={label}
					lines={textToRichLines(section.paragraph ?? "")}
					onChange={(lines) => onChange({ ...section, paragraph: richLinesToText(lines) })}
				/>
			);
		case "KEY_VALUE":
			return (
				<EditableBlock
					label={label}
					lines={keyValueLines(section)}
					onChange={(lines) => onChange({ ...section, keyValues: textToKeyValues(lines.map(plainText).join("\n")) })}
				/>
			);
		case "RICH_LINES":
			return (
				<EditableBlock
					label={label}
					lines={section.richLines ?? []}
					onChange={(richLines) => onChange({ ...section, richLines })}
				/>
			);
		case "ENTRIES":
			return (
				<>
					{(section.entries ?? []).map((entry, index) => (
						<EntryDocument
							key={index}
							entry={entry}
							onChange={(updated) =>
								onChange({
									...section,
									entries: (section.entries ?? []).map((item, i) => (i === index ? updated : item)),
								})
							}
						/>
					))}
				</>
			);
		default:
			return null;
	}
}

function EntryDocument({ entry, onChange }: { entry: ResumeEntry; onChange: (entry: ResumeEntry) => void }) {
	const [hasContext] = useState(() => (entry.context ?? "").trim() !== "");
	const [hasResults] = useState(() => (entry.results ?? []).length > 0);
	const [hasTechnologies] = useState(() => (entry.technologies ?? "").trim() !== "");
	return (
		<div className="resume-preview-entry">
			<EditableLine
				className="resume-preview-entry-heading"
				label="Cargo ou título"
				value={entry.heading ?? ""}
				onChange={(heading) => onChange({ ...entry, heading })}
			/>
			<EditableLine
				className="resume-preview-entry-subheading"
				label="Empresa | Cidade/UF"
				value={entry.subheading ?? ""}
				onChange={(subheading) => onChange({ ...entry, subheading })}
			/>
			<EditableLine label="Período" value={entry.period ?? ""} onChange={(period) => onChange({ ...entry, period })} />
			{hasContext && (
				<EditableBlock
					label="Contexto"
					lines={textToRichLines(entry.context ?? "")}
					onChange={(lines) => onChange({ ...entry, context: richLinesToText(lines) })}
				/>
			)}
			<EditableBlock list label="Tópicos" lines={entry.bullets ?? []} onChange={(bullets) => onChange({ ...entry, bullets })} />
			{hasResults && (
				<EditableBlock list label="Resultados" lines={entry.results ?? []} onChange={(results) => onChange({ ...entry, results })} />
			)}
			{hasTechnologies && (
				<EditableLine
					className="resume-preview-technologies"
					label="Tecnologias"
					value={entry.technologies ?? ""}
					onChange={(technologies) => onChange({ ...entry, technologies })}
				/>
			)}
		</div>
	);
}

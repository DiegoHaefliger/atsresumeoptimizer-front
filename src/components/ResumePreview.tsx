import type { ResumeContact, ResumeEntry, ResumeSection, ResumeTemplate, StructuredResume, TextSpan } from "../api/types";
import { closestOriginalBullet, originalSectionText, type OriginalResume } from "../lib/originalResume";
import { formatCertificationLine } from "../lib/certifications";
import { educationHeadline, experienceBulletSpans, experienceTitle, experiencePeriod } from "../lib/experienceLayout";
import { parseInline } from "../lib/richText";
import { plainText } from "../lib/resumeSections";
import { diffWords, hasChanges, normalizedLabel } from "../lib/textDiff";

type ResumePreviewProps = {
	content: StructuredResume;
	contact: ResumeContact;
	original: OriginalResume;
	template: ResumeTemplate;
	showChanges: boolean;
};

const CONTACT_SEPARATOR = " | ";
const LINK_TOKEN = /^(https?:\/\/\S+|www\.\S+|[\w.+-]+@[\w-]+\.[\w.-]+|(linkedin|github)\.com\/\S+)$/i;
const LIST_MARKER = /^(- |\d+\. )/;

const CONTACT_ORDER: (keyof ResumeContact)[] = ["email", "phone", "linkedIn", "github", "portfolio", "location"];

export function ResumePreview({ content, contact, original, template, showChanges }: ResumePreviewProps) {
	const contactLine = CONTACT_ORDER.map((key) => contact[key]).filter((value) => value && value.trim());

	return (
		<article className={`resume-preview resume-preview-${template.toLowerCase()}`} aria-label="Prévia do currículo">
			<h2 className="resume-preview-name">{content.name}</h2>
			{content.headline && <p className="resume-preview-headline">{content.headline}</p>}
			{contactLine.length > 0 && (
				<p className="resume-preview-contact">
					{contactLine.map((value, index) => (
						<span key={index}>
							{LINK_TOKEN.test(value!.trim()) ? <span className="resume-preview-link">{value}</span> : value}
							{index < contactLine.length - 1 && CONTACT_SEPARATOR}
						</span>
					))}
				</p>
			)}
			{(content.sections ?? []).map((section, index) => (
				<PreviewSection key={index} section={section} original={original} showChanges={showChanges} />
			))}
		</article>
	);
}

function PreviewSection({
	section,
	original,
	showChanges,
}: {
	section: ResumeSection;
	original: OriginalResume;
	showChanges: boolean;
}) {
	const title = section.title ?? "";
	return (
		<section className="resume-preview-section">
			<h3>{title}</h3>
			{section.kind === "PARAGRAPH" && (
				showChanges ? (
					<p>
						<DiffText
							before={originalSectionText(original, title, section.semanticType === "SUMMARY")}
							after={section.paragraph ?? ""}
							showChanges
						/>
					</p>
				) : (
					<MarkupLines markup={section.paragraph ?? ""} />
				)
			)}
			{section.kind === "KEY_VALUE" &&
				(section.keyValues ?? []).map((line, index) => (
					<p key={index} className="resume-preview-line">
						<strong>{line.label}: </strong>
						<DiffText
							before={original.labeledLines.get(normalizedLabel(line.label ?? "")) ?? null}
							after={line.value ?? ""}
							showChanges={showChanges}
						/>
					</p>
				))}
			{section.kind === "RICH_LINES" &&
				(section.richLines ?? []).map((line, index) => (
					<p key={index} className="resume-preview-line">
						<Spans spans={section.semanticType === "CERTIFICATIONS" ? formatCertificationLine(line) : line} />
					</p>
				))}
			{section.kind === "ENTRIES" &&
				(section.entries ?? []).map((entry, index) =>
					section.semanticType === "EXPERIENCE" ? (
						<PreviewExperience key={index} entry={entry} original={original} showChanges={showChanges} />
					) : (
						<PreviewEntry
							key={index}
							entry={entry}
							original={original}
							showChanges={showChanges}
							isEducation={section.semanticType === "EDUCATION"}
						/>
					),
				)}
		</section>
	);
}

function PreviewExperience({
	entry,
	original,
	showChanges,
}: {
	entry: ResumeEntry;
	original: OriginalResume;
	showChanges: boolean;
}) {
	const period = experiencePeriod(entry);
	const { title, location } = experienceTitle(entry);
	return (
		<div className="resume-preview-entry">
			<p className="resume-preview-entry-heading">
				<strong>{title}</strong>
				{location && <span> | {location}</span>}
			</p>
			{period && <p className="resume-preview-line">{period}</p>}
			<ul>
				{experienceBulletSpans(entry).map((line, index) => {
					const text = plainText(line);
					return (
						<li key={index}>
							{showChanges ? (
								<DiffText before={closestOriginalBullet(original, text)} after={text} showChanges />
							) : (
								<Spans spans={line} />
							)}
						</li>
					);
				})}
			</ul>
			{entry.technologies && (
				<p className="resume-preview-technologies">
					<strong>Tecnologias: </strong>
					{entry.technologies}
				</p>
			)}
		</div>
	);
}

function PreviewEntry({
	entry,
	original,
	showChanges,
	isEducation,
}: {
	entry: ResumeEntry;
	original: OriginalResume;
	showChanges: boolean;
	isEducation: boolean;
}) {
	return (
		<div className="resume-preview-entry">
			{isEducation ? (
				<p className="resume-preview-entry-heading">
					<strong>{educationHeadline(entry).title}</strong>
					{educationHeadline(entry).period && <span> | {educationHeadline(entry).period}</span>}
				</p>
			) : (
				<>
					<p className="resume-preview-entry-heading">
						<strong>{entry.heading}</strong>
						{entry.period && <span> | {entry.period}</span>}
					</p>
					{entry.subheading && <p className="resume-preview-entry-subheading">{entry.subheading}</p>}
				</>
			)}
			{entry.context && (
				<div className="resume-preview-entry-context">
					<MarkupLines markup={entry.context} />
				</div>
			)}
			{(entry.bullets ?? []).length > 0 && (
				<ul>
					{(entry.bullets ?? []).map((bullet, index) => {
						const text = plainText(bullet);
						return (
							<li key={index}>
								{showChanges ? (
									<DiffText before={closestOriginalBullet(original, text)} after={text} showChanges />
								) : (
									<Spans spans={bullet} />
								)}
							</li>
						);
					})}
				</ul>
			)}
			{(entry.results ?? []).length > 0 && (
				<>
					<p className="resume-preview-line">
						<strong>Resultados:</strong>
					</p>
					<ul>
						{(entry.results ?? []).map((result, index) => (
							<li key={index}>
								<Spans spans={result} />
							</li>
						))}
					</ul>
				</>
			)}
			{entry.technologies && (
				<p className="resume-preview-technologies">
					<strong>Tecnologias: </strong>
					{entry.technologies}
				</p>
			)}
		</div>
	);
}

function MarkupLines({ markup }: { markup: string }) {
	return (
		<>
			{markup
				.trim()
				.split(/\r?\n/)
				.map((raw, index) => {
					const line = raw.trimStart();
					const marker = LIST_MARKER.exec(line);
					if (!marker) {
						return (
							<p key={index}>
								<Spans spans={parseInline(raw)} />
							</p>
						);
					}
					return (
						<p key={index} className="resume-preview-list-line">
							{marker[1] === "- " ? "• " : marker[1]}
							<Spans spans={parseInline(line.slice(marker[0].length))} />
						</p>
					);
				})}
		</>
	);
}

function DiffText({ before, after, showChanges }: { before: string | null; after: string; showChanges: boolean }) {
	if (!showChanges) {
		return <>{after}</>;
	}
	if (before === null) {
		return <ins className="diff-added">{after}</ins>;
	}
	const parts = diffWords(before, after);
	if (!hasChanges(parts)) {
		return <>{after}</>;
	}
	return (
		<>
			{parts.map((part, index) =>
				part.kind === "same" ? (
					<span key={index}>{part.text}</span>
				) : part.kind === "added" ? (
					<ins key={index} className="diff-added">
						{part.text}
					</ins>
				) : (
					<del key={index} className="diff-removed">
						{part.text}
					</del>
				),
			)}
		</>
	);
}

function Spans({ spans }: { spans: TextSpan[] }) {
	return (
		<>
			{spans.map((span, index) => (
				<span
					key={index}
					style={{
						fontWeight: span.bold ? "bold" : undefined,
						fontStyle: span.italic ? "italic" : undefined,
						textDecoration: span.underline ? "underline" : undefined,
					}}
				>
					{span.text}
				</span>
			))}
		</>
	);
}

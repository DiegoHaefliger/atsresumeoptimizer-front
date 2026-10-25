import type { ResumeSummary } from "../api/types";
import { resumeMeta, versionLabel } from "../lib/resumeLabels";
import { Badge } from "./Badge";
import { FileTextIcon } from "./icons";
import { ResumeListSkeleton } from "./ResumeListSkeleton";

export type SavedResumeSelection = { resumeId: string; versionId: string };

type SavedResumePickerProps = {
	resumes: ResumeSummary[] | null;
	selected: SavedResumeSelection | null;
	onSelect: (selection: SavedResumeSelection) => void;
};

export function SavedResumePicker({ resumes, selected, onSelect }: SavedResumePickerProps) {
	if (resumes === null) {
		return <ResumeListSkeleton />;
	}

	return (
		<div className="saved-resumes" role="radiogroup" aria-label="Currículos base">
			{resumes.map((resume) => (
				<ResumeOption key={resume.id} resume={resume} selected={selected} onSelect={onSelect} />
			))}
		</div>
	);
}

type ResumeOptionProps = {
	resume: ResumeSummary;
	selected: SavedResumeSelection | null;
	onSelect: (selection: SavedResumeSelection) => void;
};

function ResumeOption({ resume, selected, onSelect }: ResumeOptionProps) {
	const versions = resume.versions ?? [];
	const isSelected = selected?.resumeId === resume.id;
	return (
		<div className={`saved-resume-card${isSelected ? " saved-resume-card-selected" : ""}`}>
			<label className="saved-resume-option">
				<input
					type="radio"
					name="saved-resume"
					checked={isSelected}
					onChange={() => resume.id && versions[0]?.id && onSelect({ resumeId: resume.id, versionId: versions[0].id })}
				/>
				<FileTextIcon />
				<span className="saved-resume-text">
					<span className="saved-resume-title">{resume.title}</span>
					<span className="saved-resume-meta">{resumeMeta(resume)}</span>
				</span>
				{resume.favorite && <Badge tone="info">Favorito</Badge>}
			</label>
			{selected && isSelected && versions.length > 1 && (
				<label className="saved-resume-version">
					Versão
					<select
						value={selected.versionId}
						onChange={(event) => onSelect({ resumeId: selected.resumeId, versionId: event.target.value })}
					>
						{versions.map((version) => (
							<option key={version.id} value={version.id}>
								{versionLabel(version)}
							</option>
						))}
					</select>
				</label>
			)}
		</div>
	);
}

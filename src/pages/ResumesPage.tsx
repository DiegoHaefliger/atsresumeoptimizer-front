import { useState } from "react";
import { apiPostJson } from "../api/client";
import type { EditedDocumentsView, ResumeOrigin, ResumeSummary } from "../api/types";
import { ResumeFileUpload } from "../components/ResumeFileUpload";
import { ResumeLibrary } from "../components/ResumeLibrary";
import { ResumeForm, type ResumeDraft } from "../components/ResumeForm";
import { SegmentedTabs } from "../components/SegmentedTabs";
import { splitByOrigin } from "../lib/resumeLabels";
import { starterResume } from "../lib/resumeSections";
import { useResumes } from "../lib/useResumes";

const EMPTY_DRAFT: ResumeDraft = { template: "CLASSIC", content: starterResume(), contact: {} };

type RegistrationMode = "upload" | "compose";

const MODE_OPTIONS: { value: RegistrationMode; label: string }[] = [
	{ value: "upload", label: "Enviar arquivo" },
	{ value: "compose", label: "Criar no sistema" },
];

const LIBRARY_TABS: Record<ResumeOrigin, { hint: string; emptyMessage: string }> = {
	BASE: {
		hint: "Os que você cadastrou ou importou. São o ponto de partida das análises.",
		emptyMessage: "Nenhum currículo cadastrado ainda.",
	},
	ADAPTED: {
		hint: "Criados ao adaptar um currículo numa análise. Ficam separados e não alteram o currículo base.",
		emptyMessage: "Nenhum currículo adaptado ainda. Eles aparecem aqui depois de usar “Adaptar currículo” numa análise.",
	},
};

function tabLabel(label: string, resumes: ResumeSummary[] | null): string {
	return resumes ? `${label} (${resumes.length})` : label;
}

export function ResumesPage() {
	const [mode, setMode] = useState<RegistrationMode>("upload");
	const [libraryTab, setLibraryTab] = useState<ResumeOrigin>("BASE");
	const { resumes, failed, reload, remove, removeVersion, setFavorite } = useResumes();
	const [formKey, setFormKey] = useState(0);
	const { base, adapted } = resumes ? splitByOrigin(resumes) : { base: null, adapted: null };

	function registered() {
		setFormKey((current) => current + 1);
		setLibraryTab("BASE");
		reload();
	}

	async function save(draft: ResumeDraft) {
		await apiPostJson<EditedDocumentsView>("/api/v1/resumes/composed", draft);
		registered();
	}

	return (
		<div className="page">
			<header className="page-header">
				<div>
					<span className="eyebrow">Currículos</span>
					<h1>Currículos</h1>
					<p className="page-subtitle">
						Seus currículos cadastrados ficam disponíveis pra qualquer análise. Edite, exclua ou cadastre um novo.
					</p>
				</div>
			</header>

			<section className="page-section" aria-labelledby="new-resume">
				<h2 id="new-resume" className="page-section-title">
					Novo currículo
				</h2>
				<div className="preview-toolbar">
					<SegmentedTabs label="Como cadastrar" options={MODE_OPTIONS} value={mode} onChange={setMode} />
				</div>

				{mode === "upload" ? (
					<ResumeFileUpload key={formKey} onUploaded={registered} />
				) : (
					<ResumeForm key={formKey} initial={EMPTY_DRAFT} submitLabel="Salvar currículo" onSave={save} />
				)}
			</section>

			<section className="page-section" aria-labelledby="registered-resumes">
				<h2 id="registered-resumes" className="page-section-title">
					Currículos cadastrados
				</h2>
				<div className="preview-toolbar">
					<SegmentedTabs
						label="Tipo de currículo"
						options={[
							{ value: "BASE", label: tabLabel("Currículos base", base) },
							{ value: "ADAPTED", label: tabLabel("Gerados por análise", adapted) },
						]}
						value={libraryTab}
						onChange={setLibraryTab}
					/>
				</div>
				<p className="field-hint">{LIBRARY_TABS[libraryTab].hint}</p>
				<ResumeLibrary
					key={libraryTab}
					resumes={libraryTab === "BASE" ? base : adapted}
					failed={failed}
					onRetry={reload}
					onDelete={remove}
					onDeleteVersion={removeVersion}
					onToggleFavorite={libraryTab === "BASE" ? setFavorite : undefined}
					emptyMessage={LIBRARY_TABS[libraryTab].emptyMessage}
				/>
			</section>
		</div>
	);
}

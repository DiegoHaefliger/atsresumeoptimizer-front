import { useEffect, useRef, useState } from "react";
import { useBlocker, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { apiGet, apiPutJson, errorMessage } from "../api/client";
import type { EditableResumeView, EditedDocumentsView } from "../api/types";
import { Dialog } from "../components/Dialog";
import { ArrowLeftIcon } from "../components/icons";
import { ResumeForm, type ResumeDraft } from "../components/ResumeForm";
import { Skeleton } from "../components/Skeleton";
import { StateMessage } from "../components/StateMessage";

export function ResumeEditPage() {
	const { resumeId } = useParams<{ resumeId: string }>();
	const [searchParams] = useSearchParams();
	const versionId = searchParams.get("version");
	const [editable, setEditable] = useState<EditableResumeView | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [dirty, setDirty] = useState(false);
	const saved = useRef(false);
	const navigate = useNavigate();
	const location = useLocation();
	const blocker = useBlocker(
		({ currentLocation, nextLocation }) =>
			dirty && !saved.current && currentLocation.pathname !== nextLocation.pathname,
	);

	useEffect(() => {
		if (!dirty) {
			return;
		}
		function warn(event: BeforeUnloadEvent) {
			event.preventDefault();
		}
		window.addEventListener("beforeunload", warn);
		return () => window.removeEventListener("beforeunload", warn);
	}, [dirty]);
	const editablePath = `/api/v1/resumes/${resumeId}/versions/${versionId}/editable`;

	useEffect(() => {
		if (!resumeId || !versionId) {
			return;
		}
		apiGet<EditableResumeView>(editablePath)
			.then(setEditable)
			.catch((err) => setError(errorMessage(err, "Não deu pra abrir o currículo.")));
	}, [resumeId, versionId, editablePath]);

	async function save(draft: ResumeDraft) {
		await apiPutJson<EditedDocumentsView>(editablePath, draft);
		saved.current = true;
		navigate("/resumes");
	}

	function goBack() {
		if (location.key === "default") {
			navigate("/resumes");
		} else {
			navigate(-1);
		}
	}

	const missingVersion = !resumeId || !versionId;
	return (
		<div className="page">
			<header className="page-header">
				<div>
					<span className="eyebrow">Currículo salvo</span>
					<h1>Editar currículo</h1>
					<p className="page-subtitle">
						Ao salvar, geramos PDF e DOCX novos. A versão anterior continua no histórico do currículo.
					</p>
				</div>
				<button type="button" className="page-back" onClick={goBack}>
					<ArrowLeftIcon /> Voltar
				</button>
			</header>

			{missingVersion || error ? (
				<StateMessage
					variant="error"
					layout="page"
					message={error ?? "Versão do currículo não informada."}
					action={{ label: "Voltar pros currículos", to: "/resumes" }}
				/>
			) : editable ? (
				<>
					{editable.importedFromFile && (
						<p className="alert alert-neutral" role="status">
							Importamos o texto do arquivo enviado do jeito que está. Confira as seções e organize as experiências
							antes de salvar.
						</p>
					)}
					<ResumeForm
						initial={{
							title: editable.title ?? "",
							template: editable.template ?? "CLASSIC",
							content: editable.content ?? { name: "", sections: [] },
							contact: editable.contact ?? {},
						}}
						submitLabel="Salvar alterações"
						onSave={save}
						onDirtyChange={setDirty}
					/>
				</>
			) : (
				<div className="form" role="status" aria-busy="true">
					<span className="sr-only">Carregando currículo...</span>
					<Skeleton width="100%" height={140} radius="var(--radius-lg)" />
					<Skeleton width={180} height={40} radius="var(--radius-md)" />
					<Skeleton width="100%" height={260} radius="var(--radius-lg)" />
					<Skeleton width="100%" height={180} radius="var(--radius-lg)" />
				</div>
			)}
			<Dialog
				open={blocker.state === "blocked"}
				title="Descartar alterações?"
				onClose={() => blocker.reset?.()}
			>
				<p>Você mudou o currículo e ainda não salvou. Se sair agora, as alterações serão perdidas.</p>
				<div className="dialog-actions">
					<button type="button" className="btn-secondary" onClick={() => blocker.reset?.()}>
						Continuar editando
					</button>
					<button type="button" className="btn-danger" onClick={() => blocker.proceed?.()}>
						Sair sem salvar
					</button>
				</div>
			</Dialog>
		</div>
	);
}

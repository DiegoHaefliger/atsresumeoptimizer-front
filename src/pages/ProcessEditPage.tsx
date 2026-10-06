import { Link, useNavigate, useParams } from "react-router-dom";
import { apiPutJson } from "../api/client";
import type { SelectionProcess } from "../api/types";
import { ArrowLeftIcon } from "../components/icons";
import { ProcessForm } from "../components/ProcessForm";
import { Skeleton } from "../components/Skeleton";
import { StateMessage } from "../components/StateMessage";
import { draftFromProcess, processRequest, type ProcessDraft } from "../lib/processDraft";
import { useApiResource } from "../lib/useApiResource";
import { PROCESSES_PATH } from "../lib/useProcesses";

export function ProcessEditPage() {
	const { processId } = useParams<{ processId: string }>();
	const { data: process, failed } = useApiResource<SelectionProcess>(`${PROCESSES_PATH}/${processId}`);
	const navigate = useNavigate();

	async function save(draft: ProcessDraft) {
		await apiPutJson(`${PROCESSES_PATH}/${processId}`, processRequest(draft));
		navigate("/processes");
	}

	return (
		<div className="page">
			<header className="page-header">
				<div>
					<span className="eyebrow">Processos</span>
					<h1>Editar processo seletivo</h1>
					<p className="page-subtitle">Pra mudar a etapa, use &quot;Mover etapa&quot; no quadro.</p>
				</div>
				<Link to="/processes" className="page-back">
					<ArrowLeftIcon /> Voltar
				</Link>
			</header>

			{failed ? (
				<StateMessage
					variant="error"
					layout="page"
					message="Não deu pra encontrar esse processo."
					action={{ label: "Voltar pros processos", to: "/processes" }}
				/>
			) : process ? (
				<ProcessForm initial={draftFromProcess(process)} submitLabel="Salvar alterações" chooseStage={false} onSave={save} />
			) : (
				<div className="form form-narrow" role="status" aria-busy="true">
					<span className="sr-only">Carregando processo...</span>
					<Skeleton width="100%" height={320} radius="var(--radius-lg)" />
				</div>
			)}
		</div>
	);
}

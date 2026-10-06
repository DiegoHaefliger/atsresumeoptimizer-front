import { Link, useNavigate } from "react-router-dom";
import { apiPostJson } from "../api/client";
import { ArrowLeftIcon } from "../components/icons";
import { ProcessForm } from "../components/ProcessForm";
import { EMPTY_PROCESS, processRequest, type ProcessDraft } from "../lib/processDraft";
import { PROCESSES_PATH } from "../lib/useProcesses";

export function ProcessFormPage() {
	const navigate = useNavigate();

	async function save(draft: ProcessDraft) {
		await apiPostJson(PROCESSES_PATH, processRequest(draft));
		navigate("/processes");
	}

	return (
		<div className="page">
			<header className="page-header">
				<div>
					<span className="eyebrow">Processos</span>
					<h1>Novo processo seletivo</h1>
					<p className="page-subtitle">Guarde os links da vaga e do processo pra achar tudo num lugar só.</p>
				</div>
				<Link to="/processes" className="page-back">
					<ArrowLeftIcon /> Voltar
				</Link>
			</header>
			<ProcessForm initial={EMPTY_PROCESS} submitLabel="Cadastrar processo" chooseStage onSave={save} />
		</div>
	);
}

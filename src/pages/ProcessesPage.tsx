import { useState } from "react";
import { Link } from "react-router-dom";
import type { SelectionProcess } from "../api/types";
import { LoadFailed } from "../components/LoadFailed";
import { MoveStageDialog } from "../components/MoveStageDialog";
import { ProcessBoard } from "../components/ProcessBoard";
import { Skeleton } from "../components/Skeleton";
import { StateMessage } from "../components/StateMessage";
import { useProcesses } from "../lib/useProcesses";

export function ProcessesPage() {
	const { processes, failed, reload, moveStage, remove } = useProcesses();
	const [moving, setMoving] = useState<SelectionProcess | null>(null);
	const movingCurrent = processes?.find((process) => process.id === moving?.id) ?? null;

	return (
		<div className="page">
			<header className="page-header">
				<div>
					<span className="eyebrow">Processos</span>
					<h1>Processos seletivos</h1>
					<p className="page-subtitle">
						Acompanhe em qual etapa cada vaga está. Você move a etapa na mão, quando o recrutador responder.
					</p>
				</div>
				<Link to="/processes/new" className="button-link">
					Novo processo
				</Link>
			</header>

			{failed ? (
				<LoadFailed message="Não deu pra carregar os processos." onRetry={reload} />
			) : processes === null ? (
				<div role="status" aria-busy="true">
					<span className="sr-only">Carregando processos...</span>
					<Skeleton width="100%" height={220} radius="var(--radius-lg)" />
				</div>
			) : processes.length === 0 ? (
				<StateMessage
					variant="empty"
					layout="page"
					message="Nenhum processo seletivo ainda."
					action={{ label: "Cadastrar o primeiro processo", to: "/processes/new" }}
				/>
			) : (
				<ProcessBoard
					processes={processes}
					onMove={setMoving}
					onRemove={(process) => remove(process.id)}
				/>
			)}
			<MoveStageDialog
				process={movingCurrent}
				onClose={() => setMoving(null)}
				onMove={moveStage}
			/>
		</div>
	);
}

import type { NoteText } from "../api/types";
import { NoteEditor } from "../components/NoteEditor";
import { Skeleton } from "../components/Skeleton";
import { StateMessage } from "../components/StateMessage";
import { PERSONAL_NOTE_PATH, savePersonalNote } from "../lib/personalNoteApi";
import { useApiResource } from "../lib/useApiResource";

export function NotesPage() {
	const { data: note, failed } = useApiResource<NoteText>(PERSONAL_NOTE_PATH);

	return (
		<div className="page">
			<header className="page-header">
				<div>
					<span className="eyebrow">Notas</span>
					<h1>Minhas notas</h1>
					<p className="page-subtitle">
						Pontos fortes, comportamentos, o que quiser lembrar sobre você. É só seu: a IA não lê esta nota em nenhuma análise.
					</p>
				</div>
			</header>
			{failed ? (
				<StateMessage
					variant="error"
					layout="page"
					message="Não deu pra carregar a nota."
					action={{ label: "Tentar de novo", to: "/notes" }}
				/>
			) : note === null ? (
				<div className="form form-narrow" role="status" aria-busy="true">
					<span className="sr-only">Carregando nota...</span>
					<Skeleton width="100%" height={240} radius="var(--radius-lg)" />
				</div>
			) : (
				<section className="panel panel-body">
					<NoteEditor label="Minhas notas" initial={note} rows={12} onSave={savePersonalNote} />
				</section>
			)}
		</div>
	);
}

import type { NoteText } from "../api/types";
import { jobNotePath, saveJobNote } from "../lib/jobNotesApi";
import { useApiResource } from "../lib/useApiResource";
import { NoteEditor } from "./NoteEditor";
import { Skeleton } from "./Skeleton";
import { StateMessage } from "./StateMessage";

export function JobNotes({ jobId }: { jobId: string }) {
	const { data: note, failed } = useApiResource<NoteText>(jobNotePath(jobId));

	return (
		<section className="job-notes">
			<p className="field-hint">Só você vê. A IA não lê essa nota em nenhuma análise.</p>
			{failed ? (
				<StateMessage variant="error" layout="inline" message="Não deu pra carregar a nota." />
			) : note === null ? (
				<Skeleton width="100%" height={160} radius="var(--radius-lg)" />
			) : (
				<NoteEditor
					label="Nota da vaga"
					initial={note}
					rows={8}
					placeholder="Empresa, vaga, recrutador, o que for útil lembrar..."
					onSave={(content) => saveJobNote(jobId, content)}
				/>
			)}
		</section>
	);
}

import { useState } from "react";
import { Link } from "react-router-dom";
import { ApiError, errorMessage } from "../api/client";
import type { JobSuggestion } from "../api/types";
import { useJobSuggestions, type SuggestionCounts, type SuggestionView } from "../lib/useJobSuggestions";
import { useDismissedRun } from "../lib/useDismissedRun";
import { useSearchStatus } from "../lib/useSearchStatus";
import { BusyLabel } from "./BusyLabel";
import { DismissibleError } from "./DismissibleError";
import { ImportPostForm } from "./ImportPostForm";
import { JobSuggestionCard } from "./JobSuggestionCard";
import { SegmentedTabs } from "./SegmentedTabs";
import { LoadFailed } from "./LoadFailed";
import { SearchProgress } from "./SearchProgress";
import { Skeleton } from "./Skeleton";
import { StateMessage } from "./StateMessage";

type JobSuggestionsPanelProps = {
	counts: SuggestionCounts;
	onChanged: () => void;
	onPromoted: (jobId: string) => void;
};

type IdentifiedSuggestion = JobSuggestion & { id: string };

const UNPROCESSABLE = 422;

const EMPTY_MESSAGES: Record<SuggestionView, string> = {
	new: "Nenhuma vaga sugerida. Defina a busca em Preferências e clique em Buscar novas vagas, ou importe uma postagem.",
	below: "Nenhuma vaga ficou abaixo da aderência mínima.",
	discarded: "Nenhuma vaga descartada.",
};

const VIEW_HINTS: Record<SuggestionView, string> = {
	new: "Vagas que atingiram a aderência mínima das Preferências. Promova as que interessam ou descarte.",
	below: "Ficaram abaixo da aderência mínima ou não informam o bastante para ter nota. Ainda dá para promover.",
	discarded: "Não voltam a aparecer nas buscas. Restaure se mudar de ideia.",
};

function withCount(label: string, count: number) {
	return count > 0 ? `${label} (${count})` : label;
}

export function JobSuggestionsPanel({ counts, onChanged, onPromoted }: JobSuggestionsPanelProps) {
	const [view, setView] = useState<SuggestionView>("new");
	const [busyId, setBusyId] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [importing, setImporting] = useState(false);
	const [needsPreferences, setNeedsPreferences] = useState(false);
	const { suggestions, failed, reload, promote, decide } = useJobSuggestions(view);
	const { status, start, busy: searching } = useSearchStatus(() => {
		reload();
		onChanged();
	});
	const lastRunError = useDismissedRun(status?.lastRun?.id);
	const items = suggestions?.filter((item): item is IdentifiedSuggestion => Boolean(item.id)) ?? null;

	async function run(id: string, action: () => Promise<unknown>, fallback: string) {
		setBusyId(id);
		setError(null);
		try {
			await action();
			onChanged();
			return true;
		} catch (err) {
			setError(errorMessage(err, fallback));
			return false;
		} finally {
			setBusyId(null);
		}
	}

	async function handlePromote(id: string) {
		let jobId: string | undefined;
		const done = await run(id, async () => {
			jobId = await promote(id);
		}, "Não deu pra promover a vaga. Tenta de novo.");
		if (done && jobId) {
			onPromoted(jobId);
		}
	}

	function handleImported(imported: JobSuggestion) {
		const target: SuggestionView = imported.status === "FILTERED" ? "below" : "new";
		setImporting(false);
		if (target === view) {
			reload();
		} else {
			setView(target);
		}
		onChanged();
	}

	async function handleSearch() {
		if (searching) {
			return;
		}
		setError(null);
		setNeedsPreferences(false);
		try {
			await start();
		} catch (err) {
			setNeedsPreferences(err instanceof ApiError && err.status === UNPROCESSABLE);
			setError(errorMessage(err, "Não deu pra iniciar a busca."));
		}
	}

	return (
		<section className="suggestions-panel">
			<div className="suggestions-toolbar">
				<SegmentedTabs
					label="Tipo de sugestão"
					options={[
						{ value: "new", label: withCount("Sugeridas", counts.newSuggestions) },
						{ value: "below", label: withCount("Abaixo da aderência", counts.belowAdherence) },
						{ value: "discarded", label: withCount("Descartadas", counts.discarded) },
					]}
					value={view}
					onChange={(next) => {
						setView(next);
						setImporting(false);
					}}
				/>
				<div className="suggestions-toolbar-actions">
					<button type="button" className="btn-secondary" disabled={importing} onClick={() => setImporting(true)}>
						Importar postagem
					</button>
					<button type="button" disabled={searching} aria-busy={searching} onClick={handleSearch}>
						<BusyLabel busy={searching} busyText="Buscando vagas...">Buscar novas vagas</BusyLabel>
					</button>
				</div>
			</div>
			<div className="suggestions-info">
				<p className="suggestions-hint">{VIEW_HINTS[view]}</p>
				<Link to="/preferences?section=search" className="link">
					Configurar busca de vagas
				</Link>
				{status?.lastRun?.error && !lastRunError.isDismissed && (
					<DismissibleError message={status.lastRun.error} onDismiss={lastRunError.dismiss} />
				)}
			</div>
			{searching && <SearchProgress progress={status?.progress} />}
			{importing && <ImportPostForm onImported={handleImported} onCancel={() => setImporting(false)} />}
			{error && <DismissibleError message={error} onDismiss={() => setError(null)} />}
			{error && needsPreferences && (
				<Link to="/preferences" className="link">
					Abrir Preferências
				</Link>
			)}
			{failed ? (
				<LoadFailed message="Não deu pra carregar as sugestões." onRetry={reload} />
			) : items === null ? (
				<div className="job-grid">
					<Skeleton height={180} />
					<Skeleton height={180} />
				</div>
			) : items.length === 0 ? (
				<StateMessage
					variant="empty"
					layout="page"
					message={EMPTY_MESSAGES[view]}
					action={view === "new" ? { label: "Abrir Preferências", to: "/preferences" } : undefined}
				/>
			) : (
				<div className="job-grid">
					{items.map((item) => (
						<JobSuggestionCard
							key={item.id}
							suggestion={item}
							view={view}
							busy={busyId !== null}
							onPromote={handlePromote}
							onDiscard={(id) => run(id, () => decide(id, "discard"), "Não deu pra descartar.")}
							onRestore={(id) => run(id, () => decide(id, "restore"), "Não deu pra restaurar.")}
						/>
					))}
				</div>
			)}
		</section>
	);
}

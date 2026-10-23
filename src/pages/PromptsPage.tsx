import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { apiGet, apiPutJson, errorMessage } from "../api/client";
import { Link } from "react-router-dom";
import type { AiSettingsView, PromptTemplateRequest, PromptTemplateSummary, PromptTemplateView } from "../api/types";
import { BusyLabel } from "../components/BusyLabel";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { LoadFailed } from "../components/LoadFailed";
import { PromptKeyList } from "../components/PromptKeyList";
import { PromptMarkerChips } from "../components/PromptMarkerChips";
import { PromptVersionHistory } from "../components/PromptVersionHistory";
import { CheckCircleIcon } from "../components/icons";
import { StateMessage } from "../components/StateMessage";
import { modelsInUse } from "../lib/promptModels";
import { promptDescription, promptLabel } from "../lib/promptInfo";
import { markersOf, missingMarkers } from "../lib/promptMarkers";

const BASE_PATH = "/api/v1/prompt-templates";
export function PromptsPage() {
	const [templates, setTemplates] = useState<PromptTemplateSummary[] | null>(null);
	const [loadFailed, setLoadFailed] = useState(false);
	const [selectedKey, setSelectedKey] = useState<string | null>(null);
	const [history, setHistory] = useState<PromptTemplateSummary[]>([]);
	const [loaded, setLoaded] = useState<PromptTemplateView | null>(null);
	const [content, setContent] = useState("");
	const [aiSettings, setAiSettings] = useState<AiSettingsView | null>(null);
	const [confirmingDiscard, setConfirmingDiscard] = useState(false);
	const [pendingSwitch, setPendingSwitch] = useState<(() => void) | null>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);
	const [saving, setSaving] = useState(false);
	const [saved, setSaved] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const latestVersion = history[0]?.version ?? null;
	const dirty = loaded !== null && (content !== (loaded.content ?? ""));
	const markers = markersOf(loaded?.content ?? "");
	const missing = missingMarkers(loaded?.content ?? "", content);

	const show = useCallback((view: PromptTemplateView) => {
		setLoaded(view);
		setContent(view.content ?? "");
		setSaved(false);
		setError(null);
	}, []);

	const loadList = useCallback(async () => {
		try {
			const list = await apiGet<PromptTemplateSummary[]>(BASE_PATH);
			setTemplates(list);
			setLoadFailed(false);
			return list;
		} catch {
			setLoadFailed(true);
			return null;
		}
	}, []);

	const open = useCallback(
		async (key: string) => {
			setSelectedKey(key);
			try {
				const [current, versions] = await Promise.all([
					apiGet<PromptTemplateView>(`${BASE_PATH}/${key}`),
					apiGet<PromptTemplateSummary[]>(`${BASE_PATH}/${key}/versions`),
				]);
				setHistory(versions);
				show(current);
			} catch (err) {
				setError(errorMessage(err, "Não deu pra carregar a instrução."));
			}
		},
		[show],
	);

	useEffect(() => {
		apiGet<AiSettingsView>("/api/v1/ai-settings").then(setAiSettings).catch(() => setAiSettings(null));
		loadList().then((list) => {
			const first = list?.find((item) => item.key === "resume-structuring") ?? list?.[0];
			if (first?.key) {
				open(first.key);
			}
		});
	}, [loadList, open]);

	function guard(action: () => void) {
		if (dirty) {
			setPendingSwitch(() => action);
		} else {
			action();
		}
	}

	function insertMarker(marker: string) {
		const field = textareaRef.current;
		if (!field) {
			return;
		}
		const { selectionStart, selectionEnd } = field;
		const next = content.slice(0, selectionStart) + marker + content.slice(selectionEnd);
		setContent(next);
		requestAnimationFrame(() => {
			field.focus();
			field.setSelectionRange(selectionStart + marker.length, selectionStart + marker.length);
		});
	}

	async function openVersion(version: number) {
		if (!selectedKey) {
			return;
		}
		try {
			show(await apiGet<PromptTemplateView>(`${BASE_PATH}/${selectedKey}/versions/${version}`));
		} catch (err) {
			setError(errorMessage(err, "Não deu pra carregar essa versão."));
		}
	}

	async function handleSubmit(event?: FormEvent) {
		event?.preventDefault();
		const key = selectedKey;
		if (!key) {
			return;
		}
		setSaving(true);
		setError(null);
		try {
			const request: PromptTemplateRequest = { content };
			const published = await apiPutJson<PromptTemplateView>(`${BASE_PATH}/${key}`, request);
			await loadList();
			await open(key);
			show(published);
			setSaved(true);
		} catch (err) {
			setError(errorMessage(err, "Não deu pra salvar. Tenta de novo."));
		} finally {
			setSaving(false);
		}
	}

	const usedModels = modelsInUse(aiSettings, selectedKey ?? "");
	const viewingOlder = loaded !== null && latestVersion !== null && loaded.version !== latestVersion;

	return (
		<div className="page">
			<header className="page-header">
				<div>
					<span className="eyebrow">Configurações</span>
					<h1>Instruções da IA</h1>
					<p className="page-subtitle">
						Texto que a IA recebe em cada tarefa. Salvar cria uma nova versão e ela passa a valer na hora; as anteriores
						ficam só como histórico. Mantenha os marcadores entre chaves, como {"{{resumeText}}"}: o sistema preenche
						cada um antes de enviar.
					</p>
				</div>
			</header>

			{loadFailed && <LoadFailed message="Não deu pra carregar as instruções." onRetry={loadList} />}

			<div className="prompts-layout">
				<div className="prompts-side">
					<aside className="panel prompts-list">
						<div className="panel-header">
							<h2>Instruções</h2>
						</div>
						<div className="panel-body">
							<PromptKeyList
								templates={templates ?? []}
								selectedKey={selectedKey}
								onSelect={(key) => key !== selectedKey && guard(() => open(key))}
							/>
						</div>
					</aside>
					{history.length > 0 && (
						<aside className="panel prompts-history">
							<div className="panel-header">
								<h2>Histórico</h2>
							</div>
							<div className="panel-body">
								<PromptVersionHistory
									versions={history}
									latestVersion={latestVersion}
									viewing={loaded?.version ?? null}
									onSelect={(version) => guard(() => openVersion(version))}
								/>
							</div>
						</aside>
					)}
				</div>

				<form className="panel prompts-editor" onSubmit={handleSubmit}>
					<div className="panel-header">
						<h2>{selectedKey ? promptLabel(selectedKey) : "Selecione uma instrução"}</h2>
						{selectedKey && promptDescription(selectedKey) && <p>{promptDescription(selectedKey)}</p>}
						{loaded && (
							<p className={viewingOlder ? "prompt-version-note prompt-version-note-old" : "prompt-version-note"}>
								{viewingOlder
									? `Vendo a v${loaded.version}, que não é a atual. Salvar cria a v${(latestVersion ?? 0) + 1} com este texto.`
									: `Versão em uso: v${loaded.version}.`}
							</p>
						)}
					</div>
					<div className="panel-body">
						{loaded && (
							<>
								<p className="field-hint">
									{usedModels.length > 0
										? `Modelo usado: ${usedModels.map((item) => `${item.model} (${item.provider})`).join(", depois ")}. `
										: "Nenhum provedor configurado. "}
									Definido em <Link to="/settings" className="link">Configurações</Link>.
								</p>
								<PromptMarkerChips markers={markers} missing={missing} onInsert={insertMarker} />
								<label>
									Texto da instrução
									<textarea
										ref={textareaRef}
										className="prompt-textarea"
										value={content}
										onChange={(event) => setContent(event.target.value)}
										onKeyDown={(event) => {
											if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
												event.preventDefault();
												if (dirty && content.trim() && !saving) {
													void handleSubmit();
												}
											}
										}}
										spellCheck={false}
										rows={28}
									/>
								</label>
							</>
						)}
						{error && <StateMessage variant="error" message={error} />}
						{saved && !dirty && (
							<p className="alert alert-success" role="status">
								<CheckCircleIcon />
								<span>Nova versão salva e já em uso.</span>
							</p>
						)}
					</div>
					{loaded && (
						<div className="prompts-actions">
							<span className="field-hint" aria-live="polite">
								{dirty ? "Alterações não salvas · " : ""}
								{content.length.toLocaleString("pt-BR")} caracteres
							</span>
							<div className="form-actions">
								{dirty && (
									<button type="button" className="btn-secondary" onClick={() => setConfirmingDiscard(true)}>
										Descartar alterações
									</button>
								)}
								<button type="submit" disabled={saving || !content.trim() || !dirty}>
									<BusyLabel busy={saving} busyText="Salvando...">
										Salvar nova versão
									</BusyLabel>
								</button>
							</div>
						</div>
					)}
				</form>
				<ConfirmDialog
					open={confirmingDiscard}
					title="Descartar alterações?"
					confirmLabel="Descartar"
					onConfirm={() => {
						if (loaded) {
							show(loaded);
						}
						setConfirmingDiscard(false);
					}}
					onCancel={() => setConfirmingDiscard(false)}
				>
					<p>As mudanças na instrução que você ainda não salvou serão perdidas.</p>
				</ConfirmDialog>
				<ConfirmDialog
					open={pendingSwitch !== null}
					title="Trocar sem salvar?"
					confirmLabel="Descartar e trocar"
					onConfirm={() => {
						pendingSwitch?.();
						setPendingSwitch(null);
					}}
					onCancel={() => setPendingSwitch(null)}
				>
					<p>Você editou esta instrução e não salvou. Se trocar agora, as mudanças serão perdidas.</p>
				</ConfirmDialog>
			</div>
		</div>
	);
}

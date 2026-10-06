import { useCallback, useEffect, useState, type FormEvent } from "react";
import { apiGet, apiPutJson, errorMessage } from "../api/client";
import { Link } from "react-router-dom";
import type { AiSettingsView, PromptTemplateRequest, PromptTemplateSummary, PromptTemplateView } from "../api/types";
import { BusyLabel } from "../components/BusyLabel";
import { LoadFailed } from "../components/LoadFailed";
import { PromptVersionHistory } from "../components/PromptVersionHistory";
import { CheckCircleIcon } from "../components/icons";
import { StateMessage } from "../components/StateMessage";
import { modelsInUse } from "../lib/promptModels";

const BASE_PATH = "/api/v1/prompt-templates";
const KEY_LABELS: Record<string, string> = {
	"resume-structuring": "Adaptação do currículo",
	"job-structuring": "Estruturação da vaga",
	"requirement-evidence": "Evidência de exigências",
	"bullet-review": "Revisão de bullets",
	rewrite: "Reescrita (legado)",
};
const KEY_FORMAT = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const labelOf = (key: string) => KEY_LABELS[key] ?? key;

export function PromptsPage() {
	const [templates, setTemplates] = useState<PromptTemplateSummary[] | null>(null);
	const [loadFailed, setLoadFailed] = useState(false);
	const [selectedKey, setSelectedKey] = useState<string | null>(null);
	const [history, setHistory] = useState<PromptTemplateSummary[]>([]);
	const [loaded, setLoaded] = useState<PromptTemplateView | null>(null);
	const [content, setContent] = useState("");
	const [aiSettings, setAiSettings] = useState<AiSettingsView | null>(null);
	const [creating, setCreating] = useState(false);
	const [newKey, setNewKey] = useState("");
	const [saving, setSaving] = useState(false);
	const [saved, setSaved] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const latestVersion = history[0]?.version ?? null;
	const dirty = loaded !== null && (content !== (loaded.content ?? ""));

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
			setCreating(false);
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

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();
		const key = creating ? newKey.trim() : selectedKey;
		if (!key) {
			return;
		}
		if (creating && !KEY_FORMAT.test(key)) {
			setError("O identificador usa só letras minúsculas, números e hífen (ex.: nova-instrucao).");
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

	function startCreating() {
		setCreating(true);
		setSelectedKey(null);
		setLoaded(null);
		setHistory([]);
		setNewKey("");
		setContent("");
		setSaved(false);
		setError(null);
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
				<aside className="panel prompts-list">
					<div className="panel-header">
						<h2>Instruções</h2>
					</div>
					<div className="panel-body">
						<ul className="prompt-keys">
							{(templates ?? []).map((item) => (
								<li key={item.key}>
									<button
										type="button"
										className={`prompt-key${item.key === selectedKey ? " is-selected" : ""}`}
										onClick={() => open(item.key ?? "")}
									>
										<span>{labelOf(item.key ?? "")}</span>
										<span className="prompt-key-version">v{item.version}</span>
									</button>
								</li>
							))}
						</ul>
						<button type="button" className="btn-secondary btn-small" onClick={startCreating}>
							+ Nova instrução
						</button>
					</div>
				</aside>

				<form className="panel prompts-editor" onSubmit={handleSubmit}>
					<div className="panel-header">
						<h2>{creating ? "Nova instrução" : selectedKey ? labelOf(selectedKey) : "Selecione uma instrução"}</h2>
						{loaded && (
							<p>
								{viewingOlder
									? `Vendo a v${loaded.version}, que não é a atual. Salvar cria a v${(latestVersion ?? 0) + 1} com este texto.`
									: `Versão em uso: v${loaded.version}.`}
							</p>
						)}
					</div>
					<div className="panel-body">
						{creating && (
							<label>
								Identificador
								<input
									value={newKey}
									onChange={(event) => setNewKey(event.target.value)}
									placeholder="ex.: nova-instrucao"
								/>
							</label>
						)}
						{(creating || loaded) && (
							<>
								<p className="field-hint">
									{usedModels.length > 0
										? `Modelo usado: ${usedModels.map((item) => `${item.model} (${item.provider})`).join(", depois ")}. `
										: "Nenhum provedor configurado. "}
									Definido em <Link to="/settings" className="link">Configurações</Link>.
								</p>
								<label>
									Texto da instrução
									<textarea
										className="prompt-textarea"
										value={content}
										onChange={(event) => setContent(event.target.value)}
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
						{(creating || loaded) && (
							<div className="form-actions">
								<button type="submit" disabled={saving || !content.trim() || (!creating && !dirty)}>
									<BusyLabel busy={saving} busyText="Salvando...">
										Salvar nova versão
									</BusyLabel>
								</button>
								{dirty && loaded && (
									<button type="button" className="btn-secondary" onClick={() => show(loaded)}>
										Descartar alterações
									</button>
								)}
							</div>
						)}
					</div>
				</form>

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
								onSelect={openVersion}
							/>
						</div>
					</aside>
				)}
			</div>
		</div>
	);
}

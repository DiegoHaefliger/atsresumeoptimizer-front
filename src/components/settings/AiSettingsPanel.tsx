import { useEffect, useState, type FormEvent } from "react";
import { apiGet, apiPostJson, apiPutJson, errorMessage } from "../../api/client";
import type {
	AiConnectionTestRequest,
	AiConnectionTestResult,
	AiModelList,
	AiProvider,
	AiProviderView,
	AiSettingsRequest,
	AiSettingsView,
} from "../../api/types";
import { ModelPicker } from "../ModelPicker";
import { ProviderCard } from "./ProviderCard";
import { isConfigured } from "./providerStatus";
import { ProviderQueue } from "./ProviderQueue";
import { SettingsLayoutSkeleton, Skeleton } from "../Skeleton";
import { BusyLabel } from "../BusyLabel";
import { StateMessage } from "../StateMessage";
import { AlertCircleIcon, CheckCircleIcon } from "../icons";

type ProviderDraft = { apiKey: string; baseUrl: string; model: string; heavyModel: string };

type GeneralDraft = { temperature: string; maxOutputTokens: string; timeoutSeconds: string };

function draftOf(provider: AiProviderView): ProviderDraft {
	return {
		apiKey: "",
		baseUrl: provider.baseUrl ?? provider.defaultBaseUrl ?? "",
		model: provider.model ?? "",
		heavyModel: provider.heavyModel ?? "",
	};
}

function queueOf(settings: AiSettingsView): AiProvider[] {
	return (settings.providers ?? [])
		.filter((provider) => provider.enabled && provider.provider)
		.sort((a, b) => (a.priority ?? Number.MAX_SAFE_INTEGER) - (b.priority ?? Number.MAX_SAFE_INTEGER))
		.map((provider) => provider.provider as AiProvider);
}

export function AiSettingsPanel() {
	const [settings, setSettings] = useState<AiSettingsView | null>(null);
	const [selected, setSelected] = useState<AiProvider | null>(null);
	const [queue, setQueue] = useState<AiProvider[]>([]);
	const [drafts, setDrafts] = useState<Record<string, ProviderDraft>>({});
	const [general, setGeneral] = useState<GeneralDraft | null>(null);
	const [loadError, setLoadError] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [saved, setSaved] = useState(false);
	const [saving, setSaving] = useState(false);
	const [testing, setTesting] = useState(false);
	const [testResult, setTestResult] = useState<AiConnectionTestResult | null>(null);
	const [modelList, setModelList] = useState<AiModelList | null>(null);
	const [loadingModels, setLoadingModels] = useState(false);

	function apply(loaded: AiSettingsView) {
		const loadedQueue = queueOf(loaded);
		const loadedDrafts = Object.fromEntries(
			(loaded.providers ?? []).map((provider) => [provider.provider, draftOf(provider)]),
		) as Record<string, ProviderDraft>;
		const first = loadedQueue[0] ?? loaded.providers?.[0]?.provider ?? "OPENAI";
		setSettings(loaded);
		setQueue(loadedQueue);
		setDrafts(loadedDrafts);
		setGeneral({
			temperature: String(loaded.temperature ?? 0.1),
			maxOutputTokens: String(loaded.maxOutputTokens ?? 2000),
			timeoutSeconds: String(loaded.timeoutSeconds ?? 120),
		});
		setSelected(first);
		loadModels(first, loadedDrafts[first]);
	}

	async function loadModels(provider: AiProvider, draft: ProviderDraft | undefined) {
		setLoadingModels(true);
		try {
			setModelList(
				await apiPostJson<AiModelList>("/api/v1/ai-settings/models", {
					provider,
					apiKey: draft?.apiKey.trim() || undefined,
					baseUrl: draft?.baseUrl.trim() || undefined,
				}),
			);
		} catch (err) {
			setModelList({
				provider,
				source: "SUGGESTED",
				models: [],
				message: errorMessage(err, "Não deu pra listar os modelos."),
			});
		} finally {
			setLoadingModels(false);
		}
	}

	useEffect(() => {
		apiGet<AiSettingsView>("/api/v1/ai-settings")
			.then(apply)
			.catch((err) => setLoadError(errorMessage(err, "Não deu pra carregar as configurações.")));
	}, []);

	function markDirty() {
		setSaved(false);
		setTestResult(null);
	}

	function updateDraft(field: keyof ProviderDraft, value: string) {
		if (!selected) {
			return;
		}
		setDrafts((current) => ({ ...current, [selected]: { ...current[selected], [field]: value } }));
		markDirty();
	}

	function updateGeneral(field: keyof GeneralDraft, value: string) {
		setGeneral((current) => (current ? { ...current, [field]: value } : current));
		markDirty();
	}

	function selectProvider(provider: AiProvider) {
		setSelected(provider);
		setError(null);
		markDirty();
		loadModels(provider, drafts[provider]);
	}

	function toggleProvider(provider: AiProvider, enabled: boolean) {
		setQueue((current) => (enabled ? [...current, provider] : current.filter((item) => item !== provider)));
		markDirty();
	}

	function moveProvider(provider: AiProvider, offset: -1 | 1) {
		setQueue((current) => {
			const index = current.indexOf(provider);
			const target = index + offset;
			if (index < 0 || target < 0 || target >= current.length) {
				return current;
			}
			const next = [...current];
			[next[index], next[target]] = [next[target], next[index]];
			return next;
		});
		markDirty();
	}

	function settingsRequest(providers: AiProviderView[], parameters: GeneralDraft): AiSettingsRequest {
		const others = providers
			.map((provider) => provider.provider as AiProvider)
			.filter((provider) => !queue.includes(provider));
		return {
			temperature: Number(parameters.temperature),
			maxOutputTokens: Number(parameters.maxOutputTokens),
			timeoutSeconds: Number(parameters.timeoutSeconds),
			providers: [...queue, ...others].map((provider) => {
				const draft = drafts[provider];
				return {
					provider,
					enabled: queue.includes(provider),
					apiKey: draft.apiKey.trim() || undefined,
					baseUrl: draft.baseUrl.trim() || undefined,
					model: draft.model.trim() || undefined,
					heavyModel: draft.heavyModel.trim() || undefined,
				};
			}),
		};
	}

	function testRequest(provider: AiProvider, parameters: GeneralDraft): AiConnectionTestRequest {
		const draft = drafts[provider];
		return {
			provider,
			apiKey: draft.apiKey.trim() || undefined,
			baseUrl: draft.baseUrl.trim() || undefined,
			model: draft.model.trim(),
			heavyModel: draft.heavyModel.trim() || undefined,
			temperature: Number(parameters.temperature),
			maxOutputTokens: Number(parameters.maxOutputTokens),
			timeoutSeconds: Number(parameters.timeoutSeconds),
		};
	}

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();
		if (!settings || !general) {
			return;
		}
		setError(null);
		setSaving(true);
		try {
			apply(await apiPutJson<AiSettingsView>("/api/v1/ai-settings", settingsRequest(settings.providers ?? [], general)));
			setSaved(true);
		} catch (err) {
			setError(errorMessage(err, "Não deu pra salvar. Tenta de novo."));
		} finally {
			setSaving(false);
		}
	}

	async function handleTest() {
		if (!selected || !general) {
			return;
		}
		setError(null);
		setTesting(true);
		setTestResult(null);
		try {
			setTestResult(
				await apiPostJson<AiConnectionTestResult>("/api/v1/ai-settings/test", testRequest(selected, general)),
			);
		} catch (err) {
			setError(errorMessage(err, "Não deu pra testar a conexão."));
		} finally {
			setTesting(false);
		}
	}

	if (loadError) {
		return <StateMessage variant="error" layout="page" message={loadError} action={{ label: "Voltar", to: "/upload" }} />;
	}

	const providers = settings?.providers ?? [];
	const current = providers.find((provider) => provider.provider === selected);
	const draft = selected ? drafts[selected] : undefined;
	const draftModels = Object.fromEntries(Object.entries(drafts).map(([provider, item]) => [provider, item.model]));
	const availableModels =
		modelList?.provider === selected && (modelList.models ?? []).length > 0
			? (modelList.models ?? [])
			: (current?.suggestedModels ?? []);

	return (
		<>
			<p className="page-subtitle">
				Configure um ou mais provedores. O primeiro da fila é usado em toda análise; se ele falhar, o próximo assume
				automaticamente. As chaves ficam criptografadas no servidor e nunca voltam pra tela.
			</p>

			{!settings || !current || !draft || !general || !selected ? (
				<SettingsLayoutSkeleton label="Carregando configurações..." asideHeight={280} />
			) : (
				<form onSubmit={handleSubmit} className="settings-layout">
					<div className="settings-main">
						<section className="panel">
							<div className="panel-header">
								<h2>Provedores</h2>
								<p>Clique no provedor pra editar. Só entra na fila quem já tem chave (ou endereço, no caso local) configurada.</p>
							</div>
							<div className="panel-body">
								<div className="provider-grid">
									{providers.map((provider) => {
										const id = provider.provider as AiProvider;
										const position = queue.indexOf(id);
										return (
											<ProviderCard
												key={id}
												provider={provider}
												model={drafts[id]?.model ?? ""}
												position={position >= 0 ? position + 1 : null}
												selected={id === selected}
												configured={isConfigured(provider, drafts[id]?.apiKey ?? "", drafts[id]?.baseUrl ?? "")}
												onSelect={() => selectProvider(id)}
												onToggle={(enabled) => toggleProvider(id, enabled)}
											/>
										);
									})}
								</div>
							</div>
						</section>

						<section className="panel">
							<div className="panel-header">
								<h2>Acesso — {current.label}</h2>
								<p>
									{current.requiresApiKey
										? "Deixe a chave em branco pra manter a que já está configurada."
										: "Roda na sua máquina, sem chave e sem custo."}
								</p>
							</div>
							<div className="panel-body">
								{current.requiresApiKey && (
									<label>
										Chave de API
										<input
											type="password"
											autoComplete="off"
											value={draft.apiKey}
											onChange={(event) => updateDraft("apiKey", event.target.value)}
											placeholder={current.apiKeyHint ? `Atual: ${current.apiKeyHint}` : "Cole a chave aqui"}
										/>
									</label>
								)}
								{current.requiresBaseUrl && (
									<label>
										URL base
										<input
											type="url"
											value={draft.baseUrl}
											onChange={(event) => updateDraft("baseUrl", event.target.value)}
											placeholder={current.defaultBaseUrl ?? "https://api.exemplo.com/v1"}
										/>
										<span className="field-hint">
											Trocar a URL exige informar a chave de novo, pra ela não ser enviada a outro servidor.
										</span>
									</label>
								)}
							</div>
						</section>

						<section className="panel">
							<div className="panel-header">
								<h2>Modelos — {current.label}</h2>
								<p>O modelo de tarefas pesadas é usado na reescrita do currículo; o padrão, no resto.</p>
							</div>
							<div className="panel-body">
								<div className="model-list-status">
									<span>
										{loadingModels
											? "Buscando modelos no provedor..."
											: modelList?.source === "PROVIDER"
												? `${availableModels.length} modelos disponíveis na sua conta.`
												: `${availableModels.length} modelos sugeridos.${modelList?.message ? ` ${modelList.message}` : ""}`}
									</span>
									<button
										type="button"
										className="btn-secondary btn-small"
										onClick={() => loadModels(selected, draft)}
										disabled={loadingModels}
									>
										Atualizar lista
									</button>
								</div>
								{loadingModels ? (
									<div className="form-row" role="status" aria-busy="true">
										<span className="sr-only">Buscando modelos...</span>
										<Skeleton width="100%" height={64} radius="var(--radius-md)" />
										<Skeleton width="100%" height={64} radius="var(--radius-md)" />
									</div>
								) : (
									<div className="form-row">
										<ModelPicker
											key={`${selected}-model`}
											label="Modelo padrão"
											models={availableModels}
											value={draft.model}
											onChange={(value) => updateDraft("model", value)}
										/>
										<ModelPicker
											key={`${selected}-heavy`}
											label="Modelo para tarefas pesadas"
											models={availableModels}
											value={draft.heavyModel}
											onChange={(value) => updateDraft("heavyModel", value)}
											emptyLabel="Igual ao padrão"
										/>
									</div>
								)}
							</div>
						</section>

						<section className="panel">
							<div className="panel-header">
								<h2>Parâmetros de geração</h2>
								<p>Valem para todos os provedores. Modelos Claude 5.5 e de raciocínio da OpenAI ignoram a temperatura.</p>
							</div>
							<div className="panel-body">
								<div className="form-row form-row-3">
									<label>
										Temperatura
										<input
											type="number"
											min={0}
											max={2}
											step="any"
											value={general.temperature}
											onChange={(event) => updateGeneral("temperature", event.target.value)}
										/>
									</label>
									<label>
										Máximo de tokens na resposta
										<input
											type="number"
											min={256}
											max={128000}
											step={1}
											value={general.maxOutputTokens}
											onChange={(event) => updateGeneral("maxOutputTokens", event.target.value)}
										/>
									</label>
									<label>
										Tempo limite (segundos)
										<input
											type="number"
											min={10}
											max={600}
											value={general.timeoutSeconds}
											onChange={(event) => updateGeneral("timeoutSeconds", event.target.value)}
										/>
									</label>
								</div>
							</div>
						</section>
					</div>

					<aside className="settings-aside">
						<div className="panel">
							<div className="panel-header">
								<h2>Ordem de execução</h2>
								<p>
									{queue.length > 1
										? "Se o 1º falhar, o 2º assume, e assim por diante."
										: "Um provedor só. Adicione outro na fila pra ter reserva."}
								</p>
							</div>
							<div className="panel-body">
								<ProviderQueue
									queue={queue}
									providers={providers}
									models={draftModels}
									onMove={moveProvider}
									onSelect={selectProvider}
								/>
								{!settings.encryptionAvailable && (
									<p className="alert alert-error" role="alert">
										<AlertCircleIcon />
										<span>
											Defina <code>AI_SETTINGS_SECRET</code> no backend pra poder salvar chaves de API aqui.
										</span>
									</p>
								)}
								{testResult && (
									<p
										className={`connection-result connection-result-${testResult.success ? "ok" : "error"}`}
										role="status"
									>
										{testResult.success ? <CheckCircleIcon /> : <AlertCircleIcon />}
										<span>
											{testResult.success
												? `${testResult.model} respondeu em ${testResult.latencyMs} ms.`
												: testResult.message}
										</span>
									</p>
								)}
								<div className="settings-actions">
									{error && <StateMessage variant="error" layout="inline" message={error} />}
									{saved && (
										<p className="form-success" role="status">
											Configurações salvas.
										</p>
									)}
									<button
										type="button"
										className="btn-secondary btn-block"
										onClick={handleTest}
										disabled={testing || saving}
										aria-busy={testing}
									>
										<BusyLabel busy={testing} busyText="Testando...">Testar {current.label}</BusyLabel>
									</button>
									<button
										type="submit"
										disabled={saving || testing || queue.length === 0}
										className="btn-block"
										aria-busy={saving}
									>
										<BusyLabel busy={saving} busyText="Salvando...">Salvar configurações</BusyLabel>
									</button>
								</div>
							</div>
						</div>
					</aside>
				</form>
			)}
		</>
	);
}

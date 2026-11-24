import type { AiProviderView } from "../../api/types";
import { cleanApiKey, keyProblem, type KeyOrigin } from "../../lib/apiKeyCheck";
import { COMPATIBLE_PRESETS, PROVIDER_GUIDES, presetForBaseUrl } from "../../lib/apiKeyGuides";
import { AlertCircleIcon } from "../icons";
import { ApiKeyGuide } from "./ApiKeyGuide";

type ProviderAccessSectionProps = {
	provider: AiProviderView;
	apiKey: string;
	baseUrl: string;
	onApiKeyChange: (value: string) => void;
	onBaseUrlChange: (value: string) => void;
	onMoveKey: (origin: KeyOrigin, key: string) => void;
};

export function ProviderAccessSection({
	provider,
	apiKey,
	baseUrl,
	onApiKeyChange,
	onBaseUrlChange,
	onMoveKey,
}: ProviderAccessSectionProps) {
	const compatible = provider.provider === "OPENAI_COMPATIBLE";
	const preset = compatible ? presetForBaseUrl(baseUrl) : undefined;
	const guide = compatible ? preset : PROVIDER_GUIDES[provider.provider ?? "OPENAI"];
	const guideLabel = preset?.label ?? provider.label ?? "";
	const hasSavedKey = provider.apiKeySource !== undefined && provider.apiKeySource !== "NONE";
	const problem = keyProblem(provider.provider ?? "OPENAI", apiKey, preset?.id);

	return (
		<section className="panel">
			<div className="panel-header">
				<h2>Acesso — {provider.label}</h2>
				<p>
					{provider.requiresApiKey
						? hasSavedKey
							? "Já existe uma chave salva. Deixe o campo em branco pra manter, ou cole uma nova pra trocar."
							: "A chave de API é a senha que libera o app a usar a IA na sua conta. Siga o passo a passo abaixo."
						: "Roda na sua máquina, sem chave e sem custo."}
				</p>
			</div>
			<div className="panel-body">
				{compatible && (
					<div className="preset-picker" role="group" aria-label="Serviço compatível com OpenAI">
						<span className="field-hint">Qual serviço você vai usar?</span>
						<div className="preset-picker-options">
							{COMPATIBLE_PRESETS.map((item) => (
								<button
									key={item.id}
									type="button"
									className={`btn-secondary btn-small${preset?.id === item.id ? " preset-picker-active" : ""}`}
									aria-pressed={preset?.id === item.id}
									onClick={() => onBaseUrlChange(item.baseUrl)}
								>
									{item.label}
								</button>
							))}
						</div>
						{!preset && (
							<span className="field-hint">
								Outro serviço? Informe a URL base que a documentação dele indica pra clientes OpenAI.
							</span>
						)}
					</div>
				)}

				{guide && <ApiKeyGuide key={guideLabel} guide={guide} providerLabel={guideLabel} open={!hasSavedKey} />}

				{provider.requiresApiKey && (
					<label>
						Chave de API
						<input
							type="password"
							autoComplete="off"
							spellCheck={false}
							value={apiKey}
							onChange={(event) => onApiKeyChange(cleanApiKey(event.target.value))}
							placeholder={provider.apiKeyHint ? `Atual: ${provider.apiKeyHint}` : "Cole a chave aqui (Ctrl+V)"}
						/>
						{apiKey !== "" && !problem && (
							<span className="field-hint">Chave colada. Clique em Testar pra conferir e depois em Salvar.</span>
						)}
					</label>
				)}

				{problem?.kind === "WRONG_PROVIDER" && (
					<div className="alert alert-warning" role="alert">
						<AlertCircleIcon />
						<span>
							Essa chave parece ser do <strong>{problem.origin.label}</strong>, não do {guideLabel}.{" "}
							<button type="button" className="btn-secondary btn-small" onClick={() => onMoveKey(problem.origin, apiKey)}>
								Usar no {problem.origin.label}
							</button>
						</span>
					</div>
				)}
				{problem?.kind === "TOO_SHORT" && (
					<p className="alert alert-warning" role="alert">
						<AlertCircleIcon />
						<span>A chave parece incompleta. Copie de novo usando o botão de copiar da página do provedor.</span>
					</p>
				)}

				{provider.requiresBaseUrl && (
					<label>
						URL base
						<input
							type="url"
							value={baseUrl}
							onChange={(event) => onBaseUrlChange(event.target.value)}
							placeholder={provider.defaultBaseUrl ?? "https://api.exemplo.com/v1"}
						/>
						<span className="field-hint">
							Trocar a URL exige informar a chave de novo, pra ela não ser enviada a outro servidor.
						</span>
					</label>
				)}
			</div>
		</section>
	);
}

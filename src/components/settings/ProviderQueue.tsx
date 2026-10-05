import type { AiProvider, AiProviderView } from "../../api/types";
import { ChevronDownIcon, ChevronUpIcon } from "../icons";

type ProviderQueueProps = {
	queue: AiProvider[];
	providers: AiProviderView[];
	models: Record<string, string>;
	onMove: (provider: AiProvider, offset: -1 | 1) => void;
	onSelect: (provider: AiProvider) => void;
};

export function ProviderQueue({ queue, providers, models, onMove, onSelect }: ProviderQueueProps) {
	if (queue.length === 0) {
		return <p className="queue-empty">Marque "Usar na fila" em pelo menos um provedor.</p>;
	}

	return (
		<ol className="provider-queue">
			{queue.map((provider, index) => {
				const view = providers.find((item) => item.provider === provider);
				return (
					<li key={provider} className="provider-queue-item">
						<span className="provider-queue-position">{index + 1}</span>
						<button type="button" className="provider-queue-name" onClick={() => onSelect(provider)}>
							<span>{view?.label ?? provider}</span>
							<span className="provider-card-model">{models[provider] || "sem modelo"}</span>
						</button>
						<span className="provider-queue-actions">
							<button
								type="button"
								className="btn-icon"
								onClick={() => onMove(provider, -1)}
								disabled={index === 0}
								aria-label={`Subir ${view?.label ?? provider}`}
							>
								<ChevronUpIcon />
							</button>
							<button
								type="button"
								className="btn-icon"
								onClick={() => onMove(provider, 1)}
								disabled={index === queue.length - 1}
								aria-label={`Descer ${view?.label ?? provider}`}
							>
								<ChevronDownIcon />
							</button>
						</span>
					</li>
				);
			})}
		</ol>
	);
}

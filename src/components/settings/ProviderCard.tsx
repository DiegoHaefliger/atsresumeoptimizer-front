import type { AiProviderView } from "../../api/types";
import { Badge } from "../Badge";
import { keyStatus, missingConfiguration } from "./providerStatus";

type ProviderCardProps = {
	provider: AiProviderView;
	model: string;
	position: number | null;
	selected: boolean;
	configured: boolean;
	onSelect: () => void;
	onToggle: (enabled: boolean) => void;
};

export function ProviderCard({ provider, model, position, selected, configured, onSelect, onToggle }: ProviderCardProps) {
	const status = keyStatus(provider);
	const inQueue = position !== null;

	return (
		<div className={`provider-card${selected ? " provider-card-selected" : ""}${inQueue ? " provider-card-queued" : ""}`}>
			<button type="button" className="provider-card-select" onClick={onSelect} aria-pressed={selected}>
				<span className="provider-card-top">
					<span className="provider-card-name">{provider.label}</span>
					{inQueue && <span className="provider-card-position">{position}º</span>}
				</span>
				<span className="provider-card-meta">
					<Badge tone={status.tone}>{status.label}</Badge>
					{model && <span className="provider-card-model">{model}</span>}
				</span>
			</button>
			{configured || inQueue ? (
				<label className="provider-card-toggle">
					<input type="checkbox" checked={inQueue} onChange={(event) => onToggle(event.target.checked)} />
					Usar na fila
				</label>
			) : (
				<button type="button" className="provider-card-toggle provider-card-unconfigured" onClick={onSelect}>
					{missingConfiguration(provider)}
				</button>
			)}
		</div>
	);
}

import { XIcon } from "./icons";

export function RemoveButton({ onClick, label = "Remover" }: { onClick: () => void; label?: string }) {
	return (
		<button type="button" className="btn-icon" onClick={onClick} aria-label={label}>
			<XIcon />
		</button>
	);
}

export function AddButton({ label, onClick }: { label: string; onClick: () => void }) {
	return (
		<button type="button" className="btn-secondary btn-small" onClick={onClick}>
			+ {label}
		</button>
	);
}

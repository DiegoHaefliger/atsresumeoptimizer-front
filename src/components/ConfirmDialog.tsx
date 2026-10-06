import type { ReactNode } from "react";
import { SpinnerIcon } from "./icons";
import { Dialog } from "./Dialog";

type ConfirmDialogProps = {
	open: boolean;
	title: string;
	children: ReactNode;
	confirmLabel: string;
	cancelLabel?: string;
	busy?: boolean;
	onConfirm: () => void;
	onCancel: () => void;
};

export function ConfirmDialog({
	open,
	title,
	children,
	confirmLabel,
	cancelLabel = "Cancelar",
	busy = false,
	onConfirm,
	onCancel,
}: ConfirmDialogProps) {
	return (
		<Dialog open={open} title={title} onClose={busy ? () => undefined : onCancel}>
			<div className="confirm-message">{children}</div>
			<div className="dialog-actions">
				<button type="button" className="btn-secondary" onClick={onCancel} disabled={busy}>
					{cancelLabel}
				</button>
				<button type="button" className="btn-danger" onClick={onConfirm} disabled={busy} aria-busy={busy}>
					{busy && <SpinnerIcon />} {confirmLabel}
				</button>
			</div>
		</Dialog>
	);
}

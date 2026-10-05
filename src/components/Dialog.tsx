import { useEffect, useRef, type ReactNode } from "react";
import { XIcon } from "./icons";

type DialogProps = {
	open: boolean;
	title: string;
	onClose: () => void;
	children: ReactNode;
	size?: "small" | "large" | "full";
};

export function Dialog({ open, title, onClose, children, size = "small" }: DialogProps) {
	const ref = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		const dialog = ref.current;
		if (!dialog) {
			return;
		}
		if (open && !dialog.open) {
			dialog.showModal();
		} else if (!open && dialog.open) {
			dialog.close();
		}
	}, [open]);

	return (
		<dialog
			ref={ref}
			className={`dialog dialog-${size}`}
			aria-label={title}
			onCancel={(event) => {
				event.preventDefault();
				onClose();
			}}
			onClick={(event) => event.target === ref.current && onClose()}
		>
			{open && (
				<div className="dialog-body">
					<header className="dialog-header">
						<h2>{title}</h2>
						<button type="button" className="btn-icon" onClick={onClose} aria-label="Fechar">
							<XIcon />
						</button>
					</header>
					{children}
				</div>
			)}
		</dialog>
	);
}

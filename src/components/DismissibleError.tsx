import { XIcon } from "./icons";
import { StateMessage } from "./StateMessage";

type DismissibleErrorProps = {
	message: string;
	onDismiss: () => void;
};

export function DismissibleError({ message, onDismiss }: DismissibleErrorProps) {
	return (
		<div className="dismissible-error">
			<StateMessage variant="error" layout="inline" message={message} />
			<button type="button" className="dismissible-error-close" aria-label="Dispensar erro" onClick={onDismiss}>
				<XIcon />
			</button>
		</div>
	);
}

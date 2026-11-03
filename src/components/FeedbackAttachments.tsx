import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { ACCEPTED_TYPES, addFiles, formatSize, MAX_FILES } from "../lib/feedbackFiles";
import { ImagePlusIcon, XIcon } from "./icons";

type FeedbackAttachmentsProps = {
	files: File[];
	onChange: (files: File[]) => void;
	disabled?: boolean;
};

export function FeedbackAttachments({ files, onChange, disabled = false }: FeedbackAttachmentsProps) {
	const input = useRef<HTMLInputElement>(null);
	const [error, setError] = useState<string | null>(null);
	const [dragging, setDragging] = useState(false);
	const previews = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);

	useEffect(() => () => previews.forEach((url) => URL.revokeObjectURL(url)), [previews]);

	useEffect(() => {
		function onPaste(event: ClipboardEvent) {
			const pasted = Array.from(event.clipboardData?.files ?? []);
			if (!disabled && pasted.length > 0) {
				event.preventDefault();
				add(pasted);
			}
		}
		document.addEventListener("paste", onPaste);
		return () => document.removeEventListener("paste", onPaste);
	});

	function add(incoming: File[]) {
		const result = addFiles(files, incoming);
		setError(result.error);
		onChange(result.files);
	}

	function onDrop(event: DragEvent) {
		event.preventDefault();
		setDragging(false);
		if (!disabled) {
			add(Array.from(event.dataTransfer.files));
		}
	}

	return (
		<div className="feedback-attachments">
			{files.length < MAX_FILES && (
				<button
					type="button"
					className={`feedback-dropzone${dragging ? " feedback-dropzone-active" : ""}`}
					disabled={disabled}
					onClick={() => input.current?.click()}
					onDragOver={(event) => {
						event.preventDefault();
						setDragging(true);
					}}
					onDragLeave={() => setDragging(false)}
					onDrop={onDrop}
				>
					<ImagePlusIcon className="feedback-dropzone-icon" />
					<span className="feedback-dropzone-title">Anexar prints da tela</span>
					<span className="feedback-dropzone-hint">
						Arraste, cole com Ctrl+V ou clique para escolher. Até {MAX_FILES} imagens de 3 MB.
					</span>
				</button>
			)}
			<input
				ref={input}
				type="file"
				accept={ACCEPTED_TYPES.join(",")}
				multiple
				hidden
				onChange={(event) => {
					add(Array.from(event.target.files ?? []));
					event.target.value = "";
				}}
			/>
			{error && (
				<p className="field-error" role="alert">
					{error}
				</p>
			)}
			{files.length > 0 && (
				<ul className="feedback-thumbs">
					{files.map((file, index) => (
						<li key={`${file.name}-${index}`} className="feedback-thumb">
							<img src={previews[index]} alt={`Anexo ${index + 1}: ${file.name}`} />
							<span className="feedback-thumb-meta">
								<span className="feedback-thumb-name">{file.name}</span>
								<span className="feedback-thumb-size">{formatSize(file.size)}</span>
							</span>
							<button
								type="button"
								className="feedback-thumb-remove"
								aria-label={`Remover ${file.name}`}
								disabled={disabled}
								onClick={() => onChange(files.filter((_, position) => position !== index))}
							>
								<XIcon />
							</button>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}

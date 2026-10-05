import { useRef, useState, type DragEvent, type FormEvent } from "react";
import { apiPostForm, errorMessage } from "../api/client";
import { FileTextIcon, UploadCloudIcon, XIcon } from "./icons";
import { BusyLabel } from "./BusyLabel";
import { StateMessage } from "./StateMessage";

const ACCEPTED_EXTENSIONS = [".pdf", ".docx", ".odt"];
const TITLE_MAX_LENGTH = 255;

function titleFromFileName(fileName: string): string {
	const dot = fileName.lastIndexOf(".");
	return dot > 0 ? fileName.slice(0, dot) : fileName;
}

type ResumeUploaded = { resumeId: string };

export function ResumeFileUpload({ onUploaded }: { onUploaded: (resumeId: string) => void }) {
	const [file, setFile] = useState<File | null>(null);
	const [title, setTitle] = useState("");
	const [dragActive, setDragActive] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	function chooseFile(chosen: File | null) {
		setFile(chosen);
		setTitle(chosen ? titleFromFileName(chosen.name) : "");
	}

	function pickFile() {
		fileInputRef.current?.click();
	}

	function handleDrop(event: DragEvent<HTMLDivElement>) {
		event.preventDefault();
		setDragActive(false);
		const dropped = event.dataTransfer.files?.[0];
		if (dropped) {
			chooseFile(dropped);
		}
	}

	async function handleSubmit(event: FormEvent) {
		event.preventDefault();
		if (!file) {
			setError("Escolhe um arquivo PDF, DOCX ou ODT primeiro.");
			return;
		}
		setError(null);
		setUploading(true);
		try {
			const form = new FormData();
			form.append("file", file);
			form.append("title", title.trim() || titleFromFileName(file.name));
			const uploaded = await apiPostForm<ResumeUploaded>("/api/v1/resumes", form);
			onUploaded(uploaded.resumeId);
		} catch (err) {
			setError(errorMessage(err, "Não deu pra enviar o currículo. Tenta de novo."));
			setUploading(false);
		}
	}

	return (
		<form onSubmit={handleSubmit} className="panel panel-body form form-narrow">
			<label htmlFor="resume-file" className="sr-only">
				Arquivo do currículo
			</label>
			{file ? (
				<div className="file-chip">
					<FileTextIcon />
					<span className="file-chip-name">{file.name}</span>
					<button
						type="button"
						className="file-chip-remove"
						onClick={() => chooseFile(null)}
						aria-label="Remover arquivo"
						disabled={uploading}
					>
						<XIcon />
					</button>
				</div>
			) : (
				<div
					className={`dropzone${dragActive ? " dropzone-active" : ""}`}
					role="button"
					tabIndex={0}
					onClick={pickFile}
					onKeyDown={(event) => (event.key === "Enter" || event.key === " ") && pickFile()}
					onDragOver={(event) => {
						event.preventDefault();
						setDragActive(true);
					}}
					onDragLeave={() => setDragActive(false)}
					onDrop={handleDrop}
				>
					<UploadCloudIcon className="dropzone-icon" />
					<span className="dropzone-title">Arraste o arquivo aqui ou clique para escolher</span>
					<p className="dropzone-hint">PDF, DOCX ou ODT · até 2 MB · até 5 páginas</p>
				</div>
			)}
			<input
				id="resume-file"
				ref={fileInputRef}
				type="file"
				accept={ACCEPTED_EXTENSIONS.join(",")}
				onChange={(event) => chooseFile(event.target.files?.[0] ?? null)}
				className="sr-only-file-input"
			/>

			{file && (
				<label>
					Nome do currículo na lista
					<input
						value={title}
						maxLength={TITLE_MAX_LENGTH}
						disabled={uploading}
						onChange={(event) => setTitle(event.target.value)}
					/>
				</label>
			)}

			{error && <StateMessage variant="error" layout="inline" message={error} />}

			{file && (
				<button type="submit" disabled={uploading} className="btn-block" aria-busy={uploading}>
					<BusyLabel busy={uploading} busyText="Lendo o arquivo...">Salvar currículo</BusyLabel>
				</button>
			)}
		</form>
	);
}

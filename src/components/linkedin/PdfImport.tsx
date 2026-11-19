import { useRef, useState, type DragEvent } from "react";
import { isPdf } from "../../lib/linkedinPdf";
import { UploadCloudIcon } from "../icons";
import { StateMessage } from "../StateMessage";

type PdfImportProps = { onImport: (file: File) => void; busy: boolean };

export function PdfImport({ onImport, busy }: PdfImportProps) {
	const [dragActive, setDragActive] = useState(false);
	const [notPdf, setNotPdf] = useState(false);
	const input = useRef<HTMLInputElement>(null);

	function choose(file: File | undefined) {
		if (!file) {
			return;
		}
		setNotPdf(!isPdf(file));
		if (isPdf(file)) {
			onImport(file);
		}
	}

	function handleDrop(event: DragEvent<HTMLDivElement>) {
		event.preventDefault();
		setDragActive(false);
		choose(event.dataTransfer.files?.[0]);
	}

	function pick() {
		if (!busy) {
			input.current?.click();
		}
	}

	return (
		<>
			<ol className="linkedin-steps">
				<li>No LinkedIn, abra o seu perfil e clique em “Mais” (ou “Recursos”), logo abaixo da sua foto.</li>
				<li>Escolha “Salvar como PDF”. O arquivo é baixado na hora.</li>
				<li>Arraste o PDF para cá ou clique abaixo para escolher.</li>
			</ol>
			<div
				className={`dropzone${dragActive ? " dropzone-active" : ""}`}
				role="button"
				tabIndex={0}
				aria-disabled={busy}
				onClick={pick}
				onKeyDown={(event) => (event.key === "Enter" || event.key === " ") && pick()}
				onDragOver={(event) => {
					event.preventDefault();
					setDragActive(true);
				}}
				onDragLeave={() => setDragActive(false)}
				onDrop={handleDrop}
			>
				<UploadCloudIcon className="dropzone-icon" />
				<span className="dropzone-title">Arraste o PDF do seu perfil aqui ou clique para escolher</span>
				<p className="dropzone-hint">Só o PDF gerado pelo LinkedIn · até 5 MB</p>
			</div>
			<p className="field-hint">
				O PDF do LinkedIn não traz foto, banner, recomendações, destaques nem atividade recente, e limita as competências. Essas seções ficam de
				fora da análise. Para analisar tudo, use a extensão.
			</p>
			<label htmlFor="linkedin-pdf" className="sr-only">
				PDF do perfil do LinkedIn
			</label>
			<input
				id="linkedin-pdf"
				ref={input}
				type="file"
				accept="application/pdf,.pdf"
				className="sr-only-file-input"
				onChange={(event) => {
					choose(event.target.files?.[0]);
					event.target.value = "";
				}}
			/>
			{notPdf && <StateMessage variant="error" message="Esse arquivo não é um PDF. Use o PDF gerado pelo LinkedIn." />}
		</>
	);
}

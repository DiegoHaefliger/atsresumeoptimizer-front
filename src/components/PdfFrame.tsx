import { useEffect, useState } from "react";
import { errorMessage } from "../api/client";
import { Skeleton } from "./Skeleton";
import { StateMessage } from "./StateMessage";

const PDF_MIME = "application/pdf";

type PdfFrameProps = {
	title: string;
	load: () => Promise<Blob>;
	className?: string;
};

export function PdfFrame({ title, load, className = "dialog-pdf" }: PdfFrameProps) {
	const [url, setUrl] = useState<string | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		let objectUrl: string | null = null;
		let cancelled = false;
		load()
			.then((blob) => {
				objectUrl = URL.createObjectURL(new Blob([blob], { type: PDF_MIME }));
				if (cancelled) {
					URL.revokeObjectURL(objectUrl);
					return;
				}
				setUrl(objectUrl);
			})
			.catch((err) => !cancelled && setError(errorMessage(err, "Não deu pra gerar a prévia.")));
		return () => {
			cancelled = true;
			if (objectUrl) {
				URL.revokeObjectURL(objectUrl);
			}
		};
	}, [load]);

	if (error) {
		return <StateMessage variant="error" layout="inline" message={error} />;
	}
	if (url === null) {
		return (
			<div role="status" aria-busy="true">
				<span className="sr-only">Gerando prévia...</span>
				<Skeleton width="100%" height={520} radius="var(--radius-md)" />
			</div>
		);
	}
	return <iframe className={className} src={`${url}#view=FitH`} title={title} />;
}

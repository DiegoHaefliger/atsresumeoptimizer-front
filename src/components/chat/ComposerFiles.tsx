import { useEffect, useMemo } from "react";
import { formatSize, isImage } from "../../lib/chatFiles";
import { FileTextIcon, XIcon } from "../icons";

type ComposerFilesProps = {
	files: File[];
	onRemove: (index: number) => void;
};

export function ComposerFiles({ files, onRemove }: ComposerFilesProps) {
	const previews = useMemo(() => files.map((file) => ({ file, url: isImage(file) ? URL.createObjectURL(file) : null })), [files]);

	useEffect(() => () => previews.forEach((preview) => preview.url && URL.revokeObjectURL(preview.url)), [previews]);

	return (
		<ul className="chat-files" aria-label="Arquivos para enviar">
			{previews.map(({ file, url }, index) => (
				<li key={`${file.name}-${index}`} className="chat-file">
					{url ? <img src={url} alt="" className="chat-file-thumb" /> : <FileTextIcon className="chat-file-icon" />}
					<span className="chat-file-name" title={file.name}>
						{file.name}
					</span>
					<span className="chat-file-size">{formatSize(file.size)}</span>
					<button type="button" className="chat-chip-remove" onClick={() => onRemove(index)} aria-label={`Remover ${file.name}`}>
						<XIcon />
					</button>
				</li>
			))}
		</ul>
	);
}

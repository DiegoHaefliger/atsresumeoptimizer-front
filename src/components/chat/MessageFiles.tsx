import { formatSize } from "../../lib/chatFiles";
import type { ChatFile } from "../../lib/chatTypes";
import { FileTextIcon } from "../icons";

export function MessageFiles({ files }: { files: ChatFile[] }) {
	if (files.length === 0) {
		return null;
	}
	return (
		<ul className="chat-message-files" aria-label="Arquivos enviados">
			{files.map((file, index) =>
				file.imageUrl ? (
					<li key={`${file.id}-${index}`}>
						<a href={file.imageUrl} target="_blank" rel="noopener noreferrer" title={file.fileName}>
							<img src={file.imageUrl} alt={file.fileName} className="chat-message-image" />
						</a>
					</li>
				) : (
					<li key={`${file.id}-${index}`} className="chat-file">
						<FileTextIcon className="chat-file-icon" />
						<span className="chat-file-name" title={file.fileName}>
							{file.fileName}
						</span>
						<span className="chat-file-size">{formatSize(file.sizeBytes)}</span>
					</li>
				),
			)}
		</ul>
	);
}

import type { ChatDraft } from "../../lib/chatTypes";
import { SpinnerIcon } from "../icons";
import { Markdown } from "./Markdown";

export function ChatDraftItem({ draft }: { draft: ChatDraft }) {
	const lastTool = draft.tools.at(-1);
	return (
		<article className="chat-message chat-message-assistant" aria-label="A IA está respondendo" aria-busy="true">
			{draft.tools.length > 0 && (
				<ul className="chat-sources" aria-label="Dados consultados">
					{draft.tools.map((tool, index) => (
						<li key={`${tool}-${index}`}>{tool}</li>
					))}
				</ul>
			)}
			{draft.notice && (
				<p className="chat-notice" role="status">
					{draft.notice}
				</p>
			)}
			<div className="chat-bubble">
				{draft.text ? (
					<Markdown text={draft.text} />
				) : (
					<span className="chat-typing" role="status">
						<SpinnerIcon /> {lastTool ? `${lastTool}…` : "Pensando…"}
					</span>
				)}
			</div>
		</article>
	);
}

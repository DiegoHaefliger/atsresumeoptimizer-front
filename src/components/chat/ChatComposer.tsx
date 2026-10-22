import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { COUNTER_THRESHOLD, MAX_MESSAGE_LENGTH } from "../../lib/chatLabels";
import { removeMention, mentionAt, mentionOptionId, searchJobs } from "../../lib/chatMention";
import type { Job } from "../../lib/useJobs";
import { AutoGrowTextarea } from "../AutoGrowTextarea";
import { AtSignIcon, SendIcon, StopIcon } from "../icons";
import { JobMentionMenu } from "./JobMentionMenu";

export type Prefill = { text: string; nonce: number };

type ChatComposerProps = {
	jobs: Job[] | null;
	attachedIds: string[];
	streaming: boolean;
	blocked: boolean;
	initialText: string;
	prefill: Prefill | null;
	onTextChange: (text: string) => void;
	onSend: (text: string) => void;
	onStop: () => void;
	onAttach: (job: Job) => void;
};

export function ChatComposer({
	jobs,
	attachedIds,
	streaming,
	blocked,
	initialText,
	prefill,
	onTextChange,
	onSend,
	onStop,
	onAttach,
}: ChatComposerProps) {
	const menuId = useId();
	const textareaRef = useRef<HTMLTextAreaElement | null>(null);
	const [text, setText] = useState(initialText);
	const [caret, setCaret] = useState(initialText.length);
	const [dismissedStart, setDismissedStart] = useState<number | null>(null);
	const [activeIndex, setActiveIndex] = useState(0);
	const pendingCaret = useRef<number | null>(null);

	const mention = mentionAt(text, caret);
	const menuOpen = mention !== null && mention.start !== dismissedStart;
	const matches = menuOpen && jobs ? searchJobs(jobs, mention.query, attachedIds) : [];
	const active = Math.min(activeIndex, Math.max(matches.length - 1, 0));
	const tooLong = text.length > MAX_MESSAGE_LENGTH;
	const canSend = text.trim().length > 0 && !tooLong && !streaming && !blocked;

	useEffect(() => {
		if (pendingCaret.current !== null && textareaRef.current) {
			textareaRef.current.setSelectionRange(pendingCaret.current, pendingCaret.current);
			pendingCaret.current = null;
		}
	});

	useEffect(() => {
		if (!streaming) {
			textareaRef.current?.focus();
		}
	}, [streaming]);

	useEffect(() => {
		if (prefill) {
			setText(prefill.text);
			setCaret(prefill.text.length);
			onTextChange(prefill.text);
			pendingCaret.current = prefill.text.length;
			textareaRef.current?.focus();
		}
		// só reage a um novo pedido de preenchimento
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [prefill?.nonce]);

	function update(next: string, nextCaret: number) {
		setText(next);
		setCaret(nextCaret);
		setActiveIndex(0);
		onTextChange(next);
	}

	function pick(job: Job) {
		if (!mention) {
			return;
		}
		const inserted = removeMention(text, mention, caret);
		pendingCaret.current = inserted.caret;
		update(inserted.text, inserted.caret);
		onAttach(job);
		textareaRef.current?.focus();
	}

	function startMention() {
		const element = textareaRef.current;
		const position = element?.selectionStart ?? text.length;
		const needsSpace = position > 0 && !/\s/.test(text[position - 1]);
		const insertion = `${needsSpace ? " " : ""}@`;
		const next = text.slice(0, position) + insertion + text.slice(position);
		pendingCaret.current = position + insertion.length;
		setDismissedStart(null);
		update(next, position + insertion.length);
		element?.focus();
	}

	function submit() {
		if (!canSend) {
			return;
		}
		onSend(text.trim());
		update("", 0);
	}

	function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
		if (menuOpen && matches.length > 0) {
			if (event.key === "ArrowDown" || event.key === "ArrowUp") {
				event.preventDefault();
				const step = event.key === "ArrowDown" ? 1 : -1;
				setActiveIndex((active + step + matches.length) % matches.length);
				return;
			}
			if (event.key === "Enter" || event.key === "Tab") {
				event.preventDefault();
				pick(matches[active]);
				return;
			}
		}
		if (menuOpen && event.key === "Escape") {
			event.preventDefault();
			setDismissedStart(mention.start);
			return;
		}
		if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
			event.preventDefault();
			submit();
		}
	}

	return (
		<form
			className="chat-composer"
			onSubmit={(event) => {
				event.preventDefault();
				submit();
			}}
		>
			{menuOpen && (
				<JobMentionMenu
					id={menuId}
					jobs={jobs}
					matches={matches}
					activeIndex={active}
					query={mention.query}
					onPick={pick}
					onHover={setActiveIndex}
				/>
			)}
			<AutoGrowTextarea
				textareaRef={textareaRef}
				className="chat-input"
				rows={1}
				value={text}
				placeholder="Pergunte algo ou digite @ para buscar uma vaga"
				aria-label="Mensagem para a IA"
				autoFocus
				role="combobox"
				aria-expanded={menuOpen && matches.length > 0}
				aria-controls={menuOpen && matches.length > 0 ? menuId : undefined}
				aria-activedescendant={menuOpen && matches.length > 0 ? mentionOptionId(menuId, active) : undefined}
				aria-autocomplete="list"
				onChange={(event) => {
					setDismissedStart(null);
					update(event.target.value, event.target.selectionStart);
				}}
				onSelect={(event) => setCaret(event.currentTarget.selectionStart)}
				onKeyDown={handleKeyDown}
			/>
			<div className="chat-composer-actions">
				<button type="button" className="btn-secondary btn-small" onClick={startMention} title="Buscar uma vaga para a IA enxergar">
					<AtSignIcon /> Vaga
				</button>
				<span className="chat-hint">Enter envia · Shift+Enter quebra a linha</span>
				{text.length > COUNTER_THRESHOLD && (
					<span className={`chat-counter${tooLong ? " is-over" : ""}`} role={tooLong ? "alert" : undefined}>
						{text.length}/{MAX_MESSAGE_LENGTH}
					</span>
				)}
				{streaming ? (
					<button type="button" className="btn-secondary chat-send" onClick={onStop}>
						<StopIcon /> Parar
					</button>
				) : (
					<button type="submit" className="chat-send" disabled={!canSend}>
						<SendIcon /> Enviar
					</button>
				)}
			</div>
		</form>
	);
}

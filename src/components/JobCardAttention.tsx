import { useState } from "react";
import { Link } from "react-router-dom";
import type { SelectionProcess } from "../api/types";
import { attentionCopy, firstName, followUpMailto } from "../lib/attentionCopy";
import { attentionFor } from "../lib/processAttention";
import { AlertCircleIcon, CalendarIcon, SendIcon } from "./icons";

export function JobCardAttention({ process }: { process: SelectionProcess }) {
	const [now] = useState(() => new Date());
	const item = attentionFor(process, now);
	if (!item) {
		return null;
	}
	const { label, headline, detail } = attentionCopy(item, now);
	const mailto = item.kind === "stale" && process.stage !== "INTERESTED" ? followUpMailto(process) : null;
	const contact = firstName(process.contactName);
	const description = `${headline} · ${detail}${mailto ? `. Escrever pra ${contact ?? "o contato"}` : ""}`;
	const className = `job-card-attention attention-${item.kind}`;
	const content = (
		<>
			{mailto ? <SendIcon /> : item.kind === "upcoming" ? <CalendarIcon /> : <AlertCircleIcon />}
			{label}
		</>
	);

	return mailto ? (
		<a href={mailto} className={className} title={description} aria-label={description}>
			{content}
		</a>
	) : (
		<Link
			to={`/jobs/${process.jobPostingId}/${item.kind === "upcoming" ? "summary" : "process"}`}
			className={className}
			title={description}
			aria-label={description}
		>
			{content}
		</Link>
	);
}

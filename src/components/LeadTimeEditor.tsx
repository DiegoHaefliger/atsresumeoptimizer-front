import { useState } from "react";
import { formatLead, LEAD_UNIT_LABELS, MAX_LEAD_ENTRIES, MAX_LEAD_MINUTES, toMinutes, type LeadUnit } from "../lib/leadTime";
import { XIcon } from "./icons";

type LeadTimeEditorProps = {
	value: number[];
	onChange: (value: number[]) => void;
};

const UNITS = Object.keys(LEAD_UNIT_LABELS) as LeadUnit[];

export function LeadTimeEditor({ value, onChange }: LeadTimeEditorProps) {
	const [amount, setAmount] = useState("1");
	const [unit, setUnit] = useState<LeadUnit>("hours");
	const minutes = toMinutes(Number(amount), unit);
	const invalid = !Number.isInteger(Number(amount)) || minutes < 1 || minutes > MAX_LEAD_MINUTES;
	const duplicate = value.includes(minutes);
	const full = value.length >= MAX_LEAD_ENTRIES;

	function add() {
		onChange([...value, minutes].sort((a, b) => a - b));
	}

	return (
		<div className="lead-editor">
			<ul className="lead-chips" aria-label="Antecedências configuradas">
				{value.map((lead) => (
					<li key={lead} className="lead-chip">
						{formatLead(lead)} antes
						<button
							type="button"
							className="btn-icon"
							aria-label={`Remover ${formatLead(lead)} antes`}
							disabled={value.length === 1}
							onClick={() => onChange(value.filter((item) => item !== lead))}
						>
							<XIcon />
						</button>
					</li>
				))}
			</ul>
			<div className="lead-add">
				<label>
					Quantidade
					<input type="number" min={1} value={amount} onChange={(event) => setAmount(event.target.value)} />
				</label>
				<label>
					Unidade
					<select value={unit} onChange={(event) => setUnit(event.target.value as LeadUnit)}>
						{UNITS.map((option) => (
							<option key={option} value={option}>
								{LEAD_UNIT_LABELS[option]}
							</option>
						))}
					</select>
				</label>
				<button type="button" className="btn-secondary" disabled={invalid || duplicate || full} onClick={add}>
					Adicionar
				</button>
			</div>
			<p className="field-hint">
				{full
					? `Máximo de ${MAX_LEAD_ENTRIES} antecedências.`
					: duplicate
						? "Essa antecedência já está na lista."
						: "Até 30 dias antes. Cada antecedência gera um aviso."}
			</p>
		</div>
	);
}

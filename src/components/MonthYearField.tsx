import { useState } from "react";

const MONTHS = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
const OLDEST_YEAR = 1970;
const DEFAULT_FUTURE_YEARS = 0;

type MonthYearFieldProps = {
	label: string;
	value: string;
	disabled?: boolean;
	futureYears?: number;
	onChange: (value: string) => void;
};

type Selection = { year: string; month: string };

function split(value: string): Selection {
	const [year = "", month = ""] = value.split("-");
	return { year, month };
}

function join({ year, month }: Selection): string {
	return year && month ? `${year}-${month}` : "";
}

export function MonthYearField({ label, value, disabled = false, futureYears = DEFAULT_FUTURE_YEARS, onChange }: MonthYearFieldProps) {
	const [selection, setSelection] = useState(() => split(value));
	if (join(selection) !== value) {
		setSelection(split(value));
	}

	const now = new Date();
	const newestYear = now.getFullYear() + futureYears;
	const lastMonthAllowed = futureYears === 0 && selection.year === String(now.getFullYear()) ? now.getMonth() + 1 : 12;
	const years = Array.from({ length: newestYear - OLDEST_YEAR + 1 }, (_, index) => String(newestYear - index));

	function update(changes: Partial<Selection>) {
		const next = { ...selection, ...changes };
		if (futureYears === 0 && next.year === String(now.getFullYear()) && Number(next.month) > now.getMonth() + 1) {
			next.month = "";
		}
		setSelection(next);
		onChange(join(next));
	}

	return (
		<fieldset className="month-year-field" disabled={disabled}>
			<legend>{label}</legend>
			<select aria-label={`${label}: mês`} value={selection.month} onChange={(event) => update({ month: event.target.value })}>
				<option value="">Mês</option>
				{MONTHS.map((name, index) => (
					<option key={name} value={String(index + 1).padStart(2, "0")} disabled={index + 1 > lastMonthAllowed}>
						{name}
					</option>
				))}
			</select>
			<select aria-label={`${label}: ano`} value={selection.year} onChange={(event) => update({ year: event.target.value })}>
				<option value="">Ano</option>
				{years.map((year) => (
					<option key={year} value={year}>
						{year}
					</option>
				))}
			</select>
		</fieldset>
	);
}

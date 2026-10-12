import { joinDateTime, splitDateTime, toDateInput } from "../lib/dateTimeInput";

const DEFAULT_TIME = "09:00";
const TIME_STEP_SECONDS = 300;

const summaryFormat = new Intl.DateTimeFormat("pt-BR", { dateStyle: "full", timeStyle: "short" });

type DateTimeFieldProps = {
	legend: string;
	value: string;
	onChange: (value: string) => void;
	required?: boolean;
};

export function DateTimeField({ legend, value, onChange, required = false }: DateTimeFieldProps) {
	const { date, time } = splitDateTime(value);

	function changeDate(nextDate: string) {
		onChange(joinDateTime(nextDate, time || DEFAULT_TIME));
	}

	function changeTime(nextTime: string) {
		onChange(joinDateTime(date || toDateInput(new Date()), nextTime));
	}

	return (
		<fieldset className="datetime-field">
			<legend>{legend}</legend>
			<div className="datetime-inputs">
				<input type="date" aria-label="Data" required={required} value={date} onChange={(event) => changeDate(event.target.value)} />
				<input
					type="time"
					aria-label="Hora"
					required={required}
					step={TIME_STEP_SECONDS}
					value={time}
					onChange={(event) => changeTime(event.target.value)}
				/>
			</div>
			{value && <span className="field-hint datetime-summary">{summaryFormat.format(new Date(value))}</span>}
		</fieldset>
	);
}

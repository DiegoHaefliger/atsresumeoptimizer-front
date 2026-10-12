const DATE_LENGTH = 10;

function pad(value: number): string {
	return String(value).padStart(2, "0");
}

export function toDateInput(date: Date): string {
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function toDateTimeInput(date: Date): string {
	return `${toDateInput(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function instantToInput(instant: string): string {
	return toDateTimeInput(new Date(instant));
}

export function inputToInstant(value: string): string {
	return new Date(value).toISOString();
}

export function splitDateTime(value: string): { date: string; time: string } {
	return { date: value.slice(0, DATE_LENGTH), time: value.slice(DATE_LENGTH + 1) };
}

export function joinDateTime(date: string, time: string): string {
	return date && time ? `${date}T${time}` : "";
}

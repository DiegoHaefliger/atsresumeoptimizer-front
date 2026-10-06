function pad(value: number): string {
	return String(value).padStart(2, "0");
}

export function toDateTimeInput(date: Date): string {
	return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function instantToInput(instant: string): string {
	return toDateTimeInput(new Date(instant));
}

export function inputToInstant(value: string): string {
	return new Date(value).toISOString();
}

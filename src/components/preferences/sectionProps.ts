export type SectionProps<F> = {
	form: F;
	onChange: <K extends keyof F>(field: K, value: F[K]) => void;
};

import { useImperativeHandle, useLayoutEffect, useRef, type Ref, type TextareaHTMLAttributes } from "react";

type AutoGrowTextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
	textareaRef?: Ref<HTMLTextAreaElement | null>;
};

export function AutoGrowTextarea({ value, className, textareaRef, ...props }: AutoGrowTextareaProps) {
	const ref = useRef<HTMLTextAreaElement>(null);
	useImperativeHandle(textareaRef, () => ref.current as HTMLTextAreaElement, []);

	useLayoutEffect(() => {
		const element = ref.current;
		if (!element) {
			return;
		}
		element.style.height = "auto";
		element.style.height = `${element.scrollHeight}px`;
	}, [value]);

	return <textarea ref={ref} className={`auto-grow-textarea ${className ?? ""}`.trim()} value={value} {...props} />;
}

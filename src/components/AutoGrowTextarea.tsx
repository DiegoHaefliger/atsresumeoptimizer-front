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
		const resize = () => {
			element.style.height = "auto";
			element.style.height = `${element.scrollHeight}px`;
		};
		resize();
		let lastWidth = element.clientWidth;
		const observer = new ResizeObserver(() => {
			if (element.clientWidth !== lastWidth) {
				lastWidth = element.clientWidth;
				resize();
			}
		});
		observer.observe(element);
		return () => observer.disconnect();
	}, [value]);

	return <textarea ref={ref} className={`auto-grow-textarea ${className ?? ""}`.trim()} value={value} {...props} />;
}

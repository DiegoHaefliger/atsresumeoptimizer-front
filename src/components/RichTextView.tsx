import { markupToHtml } from "../lib/noteMarkup";

export function RichTextView({ markup }: { markup: string }) {
	return <div className="rich-text-view" dangerouslySetInnerHTML={{ __html: markupToHtml(markup, true) }} />;
}

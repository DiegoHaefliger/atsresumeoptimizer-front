import { useState } from "react";
import { LinkedInLinkForm } from "./LinkedInLinkForm";
import { SegmentedTabs } from "./SegmentedTabs";

type LinkSite = "linkedin";

export function CustomLinksPanel() {
	const [site, setSite] = useState<LinkSite>("linkedin");

	return (
		<section className="suggestions-panel">
			<SegmentedTabs label="Site do link" options={[{ value: "linkedin", label: "LinkedIn" }]} value={site} onChange={setSite} />
			{site === "linkedin" && <LinkedInLinkForm />}
		</section>
	);
}

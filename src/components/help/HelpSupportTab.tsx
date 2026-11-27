import { BugReportCallout } from "./BugReportCallout";
import { CommunityCard } from "./CommunityCard";
import { ReadinessSummary } from "./ReadinessSummary";

type HelpSupportTabProps = { onOpenDiagnostics: () => void };

export function HelpSupportTab({ onOpenDiagnostics }: HelpSupportTabProps) {
	return (
		<div className="help-support">
			<ReadinessSummary onOpenDiagnostics={onOpenDiagnostics} />
			<CommunityCard />
			<BugReportCallout />
		</div>
	);
}

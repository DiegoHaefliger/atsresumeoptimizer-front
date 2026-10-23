import type { SVGProps } from "react";

function Icon({ children, ...props }: SVGProps<SVGSVGElement>) {
	return (
		<svg
			viewBox="0 0 24 24"
			width="1em"
			height="1em"
			fill="none"
			stroke="currentColor"
			strokeWidth={1.75}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
			{...props}
		>
			{children}
		</svg>
	);
}

export function UploadCloudIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon {...props}>
			<path d="M7.5 17.5a4.5 4.5 0 0 1-.5-8.97 5.5 5.5 0 0 1 10.75-1.8A4.5 4.5 0 0 1 17 17.5" />
			<path d="M12 12v7" />
			<path d="m9 15 3-3 3 3" />
		</Icon>
	);
}

export function FileTextIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon {...props}>
			<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
			<path d="M14 2v6h6" />
			<path d="M9 13h6" />
			<path d="M9 17h6" />
		</Icon>
	);
}

export function XIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon {...props}>
			<path d="M18 6 6 18" />
			<path d="M6 6l12 12" />
		</Icon>
	);
}

export function AlertCircleIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon {...props}>
			<circle cx="12" cy="12" r="9" />
			<path d="M12 8v5" />
			<path d="M12 16h.01" />
		</Icon>
	);
}

export function SpinnerIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon className="spinner" {...props}>
			<path d="M12 3a9 9 0 1 0 9 9" />
		</Icon>
	);
}

export function ArrowRightIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon {...props}>
			<path d="M5 12h14" />
			<path d="m13 6 6 6-6 6" />
		</Icon>
	);
}

export function CheckCircleIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon {...props}>
			<circle cx="12" cy="12" r="9" />
			<path d="m8.5 12.5 2.5 2.5 4.5-5" />
		</Icon>
	);
}

export function DownloadIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon {...props}>
			<path d="M12 3v12" />
			<path d="m7 11 5 5 5-5" />
			<path d="M5 21h14" />
		</Icon>
	);
}

export function InboxIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon {...props}>
			<path d="M22 12h-6l-2 3h-4l-2-3H2" />
			<path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" />
		</Icon>
	);
}

export function ChevronUpIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon {...props}>
			<path d="m6 15 6-6 6 6" />
		</Icon>
	);
}

export function ChevronDownIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon {...props}>
			<path d="m6 9 6 6 6-6" />
		</Icon>
	);
}

export function TrashIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon {...props}>
			<path d="M4 7h16" />
			<path d="M10 11v6" />
			<path d="M14 11v6" />
			<path d="M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12" />
			<path d="M9 7V4h6v3" />
		</Icon>
	);
}

export function BriefcaseIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon {...props}>
			<rect x="3" y="7" width="18" height="13" rx="2" />
			<path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
			<path d="M3 13h18" />
		</Icon>
	);
}

export function ClipboardCheckIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon {...props}>
			<rect x="5" y="4" width="14" height="17" rx="2" />
			<path d="M9 4V3h6v1" />
			<path d="m9 13 2 2 4-4" />
		</Icon>
	);
}

export function SlidersIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon {...props}>
			<path d="M4 6h10" />
			<path d="M18 6h2" />
			<circle cx="16" cy="6" r="2" />
			<path d="M4 12h4" />
			<path d="M12 12h8" />
			<circle cx="10" cy="12" r="2" />
			<path d="M4 18h12" />
			<circle cx="18" cy="18" r="2" />
		</Icon>
	);
}

export function SettingsIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon {...props}>
			<circle cx="12" cy="12" r="3" />
			<path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
		</Icon>
	);
}

export function PencilIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon {...props}>
			<path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4z" />
			<path d="m13.5 6.5 4 4" />
		</Icon>
	);
}

export function CoinsIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon {...props}>
			<circle cx="12" cy="12" r="9" />
			<path d="M14.8 9.2c-.5-.8-1.5-1.2-2.8-1.2-1.6 0-2.8.8-2.8 2s1.2 1.7 2.8 2 2.8.8 2.8 2-1.2 2-2.8 2c-1.3 0-2.3-.4-2.8-1.2" />
			<path d="M12 6v2m0 8v2" />
		</Icon>
	);
}

export function ListChecksIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon {...props}>
			<path d="m3 6 1.5 1.5L7.5 4.5" />
			<path d="m3 13 1.5 1.5L7.5 11.5" />
			<path d="M11 6h10" />
			<path d="M11 13h10" />
			<path d="M3 20h.01M7 20h14" />
		</Icon>
	);
}

export function EyeIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon {...props}>
			<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z" />
			<circle cx="12" cy="12" r="3" />
		</Icon>
	);
}

export function ArrowLeftIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon {...props}>
			<path d="M19 12H5" />
			<path d="m12 19-7-7 7-7" />
		</Icon>
	);
}

export function StarIcon({ filled, ...props }: SVGProps<SVGSVGElement> & { filled?: boolean }) {
	return (
		<Icon {...props} fill={filled ? "currentColor" : "none"}>
			<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" />
		</Icon>
	);
}

export function MessageSquareIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon {...props}>
			<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
		</Icon>
	);
}

export function MessagesIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon {...props}>
			<path d="M14 9a2 2 0 0 1-2 2H6l-4 4V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2z" />
			<path d="M18 9h2a2 2 0 0 1 2 2v11l-4-4h-6a2 2 0 0 1-2-2v-1" />
		</Icon>
	);
}

export function SendIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon {...props}>
			<path d="m22 2-7 20-4-9-9-4Z" />
			<path d="M22 2 11 13" />
		</Icon>
	);
}

export function StopIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon {...props}>
			<rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" />
		</Icon>
	);
}

export function AtSignIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon {...props}>
			<circle cx="12" cy="12" r="4" />
			<path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
		</Icon>
	);
}

export function PaperclipIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon {...props}>
			<path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48" />
		</Icon>
	);
}

export function PlusIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon {...props}>
			<path d="M12 5v14" />
			<path d="M5 12h14" />
		</Icon>
	);
}

export function CopyIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon {...props}>
			<rect x="8" y="8" width="14" height="14" rx="2" />
			<path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
		</Icon>
	);
}

export function RefreshIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon {...props}>
			<path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
			<path d="M21 3v5h-5" />
		</Icon>
	);
}

export function ArrowDownIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon {...props}>
			<path d="M12 5v14" />
			<path d="m19 12-7 7-7-7" />
		</Icon>
	);
}

export function NotebookIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon {...props}>
			<path d="M15.5 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8.5z" />
			<path d="M15 3v6h6" />
			<path d="M8 13h8M8 17h5" />
		</Icon>
	);
}

export function KanbanIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon {...props}>
			<rect x="3" y="4" width="18" height="16" rx="2" />
			<path d="M9 4v16" />
			<path d="M15 4v16" />
			<path d="M6 8h.01" />
			<path d="M12 8h.01" />
			<path d="M18 8h.01" />
		</Icon>
	);
}

export function ExternalLinkIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon {...props}>
			<path d="M14 4h6v6" />
			<path d="M20 4 10 14" />
			<path d="M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
		</Icon>
	);
}

export function BellIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon {...props}>
			<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
			<path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
		</Icon>
	);
}

export function CalendarIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon {...props}>
			<rect x="3" y="4" width="18" height="18" rx="2" />
			<path d="M16 2v4" />
			<path d="M8 2v4" />
			<path d="M3 10h18" />
		</Icon>
	);
}

export function SparklesIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon {...props}>
			<path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
			<path d="M19 3v4" />
			<path d="M17 5h4" />
			<path d="M5 17v4" />
			<path d="M3 19h4" />
		</Icon>
	);
}

export function SunIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon {...props}>
			<circle cx="12" cy="12" r="4" />
			<path d="M12 2v2" />
			<path d="M12 20v2" />
			<path d="m4.93 4.93 1.41 1.41" />
			<path d="m17.66 17.66 1.41 1.41" />
			<path d="M2 12h2" />
			<path d="M20 12h2" />
			<path d="m6.34 17.66-1.41 1.41" />
			<path d="m19.07 4.93-1.41 1.41" />
		</Icon>
	);
}

export function MoonIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon {...props}>
			<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" />
		</Icon>
	);
}

export function InfoIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon {...props}>
			<circle cx="12" cy="12" r="9" />
			<path d="M12 16v-5" />
			<path d="M12 8h.01" />
		</Icon>
	);
}

export function TagIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon {...props}>
			<path d="M20.59 13.41 13.42 20.58a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
			<path d="M7 7h.01" />
		</Icon>
	);
}

export function GitHubIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon {...props}>
			<path d="M9 19c-4.3 1.4-4.3-2.5-6-3m12 5v-3.5c0-1 .1-1.4-.5-2 2.8-.3 5.5-1.4 5.5-6a4.6 4.6 0 0 0-1.3-3.2 4.2 4.2 0 0 0-.1-3.2s-1.1-.3-3.5 1.3a12.3 12.3 0 0 0-6.2 0C6.5 2.8 5.4 3.1 5.4 3.1a4.2 4.2 0 0 0-.1 3.2A4.6 4.6 0 0 0 4 9.5c0 4.6 2.7 5.7 5.5 6-.6.6-.6 1.2-.5 2V21" />
		</Icon>
	);
}

export function LinkedInIcon(props: SVGProps<SVGSVGElement>) {
	return (
		<Icon {...props}>
			<path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
			<rect x="2" y="9" width="4" height="12" />
			<circle cx="4" cy="4" r="2" />
		</Icon>
	);
}

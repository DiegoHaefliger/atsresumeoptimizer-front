import type { CSSProperties } from "react";

type SkeletonProps = {
	width?: string | number;
	height?: string | number;
	radius?: string;
	className?: string;
	style?: CSSProperties;
};

export function Skeleton({ width, height, radius, className = "", style }: SkeletonProps) {
	return (
		<div
			className={`skeleton ${className}`}
			style={{ width, height, borderRadius: radius, ...style }}
			aria-hidden="true"
		/>
	);
}

export function ScoreRingSkeleton({ size = 128 }: { size?: number }) {
	return <Skeleton width={size} height={size} radius="50%" />;
}

export function KeywordsSkeleton() {
	return (
		<div className="keyword-pills" aria-hidden="true">
			{[64, 84, 52, 96, 70].map((width, index) => (
				<Skeleton key={index} width={width} height={26} radius="var(--radius-full)" />
			))}
		</div>
	);
}

export function FindingsSkeleton({ count = 3 }: { count?: number }) {
	return (
		<div className="findings" aria-hidden="true">
			{Array.from({ length: count }).map((_, index) => (
				<div className="finding-card" key={index}>
					<Skeleton width="35%" height={16} />
					<Skeleton width="90%" height={14} style={{ marginTop: "var(--space-1)" }} />
				</div>
			))}
		</div>
	);
}

export function BulletsSkeleton({ count = 3 }: { count?: number }) {
	return (
		<ul className="bullets" aria-hidden="true">
			{Array.from({ length: count }).map((_, index) => (
				<li className="bullet-card" key={index}>
					<Skeleton width="85%" height={14} />
					<Skeleton width="65%" height={14} style={{ marginTop: "var(--space-2)" }} />
				</li>
			))}
		</ul>
	);
}

export function SettingsLayoutSkeleton({ label, asideHeight }: { label: string; asideHeight: number }) {
	return (
		<div className="settings-layout" role="status" aria-busy="true">
			<span className="sr-only">{label}</span>
			<div className="settings-main">
				{Array.from({ length: 3 }).map((_, index) => (
					<Skeleton key={index} width="100%" height={180} radius="var(--radius-lg)" />
				))}
			</div>
			<Skeleton width="100%" height={asideHeight} radius="var(--radius-lg)" />
		</div>
	);
}

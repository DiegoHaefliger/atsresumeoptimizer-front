import { Skeleton } from "./Skeleton";

export function ResumeListSkeleton() {
	return (
		<div className="saved-resumes" role="status" aria-busy="true" aria-label="Carregando currículos">
			{[0, 1].map((index) => (
				<div className="saved-resume-card" key={index} aria-hidden="true">
					<Skeleton width={20} height={20} />
					<div className="saved-resume-text">
						<Skeleton width="55%" height={14} />
						<Skeleton width="35%" height={12} />
					</div>
				</div>
			))}
		</div>
	);
}

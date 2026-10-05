export function LoadFailed({ message, onRetry }: { message: string; onRetry: () => void }) {
	return (
		<div className="recent-jobs recent-jobs-failed" role="status">
			<span className="recent-jobs-label">{message}</span>
			<button type="button" className="btn-secondary btn-small" onClick={onRetry}>
				Tentar de novo
			</button>
		</div>
	);
}

const VIEW_PARAM = "view";
const SAVED_VIEW = "saved";

export function rewritePath(analysisId: string, saved = false): string {
	return saved ? `/analyses/${analysisId}/rewrite?${VIEW_PARAM}=${SAVED_VIEW}` : `/analyses/${analysisId}/rewrite`;
}

export function isSavedView(searchParams: URLSearchParams): boolean {
	return searchParams.get(VIEW_PARAM) === SAVED_VIEW;
}

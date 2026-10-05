import { useCallback } from "react";
import { apiDelete, apiPut } from "../api/client";
import type { ResumeSummary } from "../api/types";
import { useApiResource } from "./useApiResource";

const RESUMES_PATH = "/api/v1/resumes";

export function useResumes() {
	const { data: resumes, setData: setResumes, failed, reload } = useApiResource<ResumeSummary[]>(RESUMES_PATH);

	const remove = useCallback(
		async (resumeId: string) => {
			await apiDelete(`${RESUMES_PATH}/${resumeId}`);
			setResumes((current) => (current ?? []).filter((resume) => resume.id !== resumeId));
		},
		[setResumes],
	);

	const removeVersion = useCallback(
		async (resumeId: string, versionId: string) => {
			await apiDelete(`${RESUMES_PATH}/${resumeId}/versions/${versionId}`);
			setResumes((current) =>
				(current ?? [])
					.map((resume) =>
						resume.id === resumeId
							? { ...resume, versions: (resume.versions ?? []).filter((version) => version.id !== versionId) }
							: resume,
					)
					.filter((resume) => (resume.versions ?? []).length > 0),
			);
		},
		[setResumes],
	);

	const setFavorite = useCallback(
		async (resumeId: string, favorite: boolean) => {
			if (favorite) {
				await apiPut(`${RESUMES_PATH}/${resumeId}/favorite`);
			} else {
				await apiDelete(`${RESUMES_PATH}/${resumeId}/favorite`);
			}
			setResumes((current) => {
				const updated = (current ?? []).map((resume) =>
					resume.origin === "ADAPTED" ? resume : { ...resume, favorite: favorite && resume.id === resumeId },
				);
				return [...updated].sort((a, b) => Number(b.favorite ?? false) - Number(a.favorite ?? false));
			});
		},
		[setResumes],
	);

	return { resumes, failed, reload, remove, removeVersion, setFavorite };
}

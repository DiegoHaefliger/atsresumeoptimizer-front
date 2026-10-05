import { useCallback, useEffect, useState } from "react";
import { apiGet } from "../api/client";

export function useApiResource<T>(path: string) {
	const [data, setData] = useState<T | null>(null);
	const [failed, setFailed] = useState(false);

	const reload = useCallback(() => {
		apiGet<T>(path)
			.then((loaded) => {
				setFailed(false);
				setData(loaded);
			})
			.catch(() => setFailed(true));
	}, [path]);

	useEffect(reload, [reload]);

	return { data, setData, failed, reload };
}

import { Link } from "react-router-dom";
import { useBackTarget } from "../lib/backTarget";
import { ArrowLeftIcon } from "./icons";

export function BackLink({ fallback }: { fallback?: string }) {
	const target = useBackTarget(fallback);
	if (!target) {
		return null;
	}
	return (
		<Link to={target} className="page-back">
			<ArrowLeftIcon /> Voltar
		</Link>
	);
}

import { formatJobCode } from "../lib/jobCode";

export function JobCode({ code }: { code: number }) {
	return <span className="job-code">{formatJobCode(code)}</span>;
}

import { apiPostJson } from "../api/client";
import type { SelectionSchedule } from "../api/types";
import { scheduleRequest, type ScheduleDraft } from "./scheduleDraft";
import { PROCESSES_PATH } from "./processPath";

function schedulesPath(processId: string): string {
	return `${PROCESSES_PATH}/${processId}/schedules`;
}

export function createSchedule(processId: string, draft: ScheduleDraft): Promise<SelectionSchedule> {
	return apiPostJson(schedulesPath(processId), scheduleRequest(draft));
}

export function rescheduleSchedule(processId: string, scheduleId: string, draft: ScheduleDraft): Promise<SelectionSchedule> {
	return apiPostJson(`${schedulesPath(processId)}/${scheduleId}/reschedule`, scheduleRequest(draft));
}

export function completeSchedule(processId: string, scheduleId: string): Promise<SelectionSchedule> {
	return apiPostJson(`${schedulesPath(processId)}/${scheduleId}/complete`, {});
}

export function cancelSchedule(processId: string, scheduleId: string): Promise<SelectionSchedule> {
	return apiPostJson(`${schedulesPath(processId)}/${scheduleId}/cancel`, {});
}

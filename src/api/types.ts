import type { components } from "./generated/schema";

export type AnalysisCreatedResponse = components["schemas"]["AnalysisCreatedResponse"];
export type RecentJobView = components["schemas"]["RecentJobView"];

export type AnalysisReportView = components["schemas"]["AnalysisReportView"];
export type AnalysisHeaderView = components["schemas"]["AnalysisHeaderView"];
export type ScoreSummaryView = components["schemas"]["ScoreSummaryView"];
export type KeywordsPanelView = components["schemas"]["KeywordsPanelView"];
export type FindingsListView = components["schemas"]["FindingsListView"];
export type DimensionView = components["schemas"]["DimensionView"];
export type FindingView = components["schemas"]["FindingView"];

export type ResumeTemplate = "CLASSIC" | "MODERN_BLUE";

export type RewriteResultView = components["schemas"]["RewriteResultView"];
export type DocumentDownloadsView = components["schemas"]["DocumentDownloadsView"];
export type BulletsPanelView = components["schemas"]["BulletsPanelView"];
export type ScoreComparisonView = components["schemas"]["ScoreComparisonView"];
export type BulletRewriteView = components["schemas"]["RewriteBulletResponse"];
export type RemovedSkillView = components["schemas"]["RemovedSkillResponse"];
export type StructuredResume = components["schemas"]["StructuredResume"];
export type ResumeSection = components["schemas"]["ResumeSection"];
export type ResumeEntry = components["schemas"]["ResumeEntry"];
export type TextSpan = components["schemas"]["TextSpan"];
export type KeyValueLine = components["schemas"]["KeyValueLine"];
export type ResumeContact = components["schemas"]["ResumeContact"];
export type OriginalSection = components["schemas"]["OriginalSection"];
export type EditedDocumentsView = components["schemas"]["EditedDocumentsView"];

export type JobPreferenceRequest = components["schemas"]["JobPreferenceRequest"];
export type JobPreferenceResponse = components["schemas"]["JobPreferenceResponse"];
export type PreferenceMatch = components["schemas"]["PreferenceMatch"];
export type CriterionMatch = components["schemas"]["CriterionMatch"];
export type AnalysisJobView = components["schemas"]["AnalysisJobView"];
export type WorkModel = NonNullable<AnalysisJobView["workModel"]>;
export type ContractType = NonNullable<JobPreferenceResponse["contractTypes"]>[number];
export type PreferenceCriterion = NonNullable<CriterionMatch["criterion"]>;
export type MatchStatus = NonNullable<CriterionMatch["status"]>;

export type AiSettingsView = components["schemas"]["AiSettingsView"];
export type AiProviderView = components["schemas"]["AiProviderView"];
export type AiSettingsRequest = components["schemas"]["AiSettingsRequest"];
export type AiProviderRequest = components["schemas"]["AiProviderRequest"];
export type AiConnectionTestRequest = components["schemas"]["AiConnectionTestRequest"];
export type AiConnectionTestResult = components["schemas"]["AiConnectionTestResult"];
export type AiProvider = AiProviderRequest["provider"];
export type AiModelList = components["schemas"]["AiModelList"];

export type ResumeSummary = components["schemas"]["ResumeSummary"];
export type ResumeOrigin = NonNullable<ResumeSummary["origin"]>;
export type ResumeVersionSummary = components["schemas"]["ResumeVersionSummary"];
export type EditableResumeView = components["schemas"]["EditableResumeView"];

export type PromptTemplateSummary = components["schemas"]["PromptTemplateSummary"];
export type PromptTemplateView = components["schemas"]["PromptTemplateView"];
export type PromptTemplateRequest = components["schemas"]["PromptTemplateRequest"];

export type SelectionStage =
	| "INTERESTED"
	| "APPLIED"
	| "SCREENING"
	| "TECHNICAL_TEST"
	| "TECHNICAL_INTERVIEW"
	| "MANAGER_INTERVIEW"
	| "OFFER"
	| "HIRED"
	| "REJECTED"
	| "WITHDRAWN";

export type StageMovement = {
	stage: SelectionStage;
	note: string | null;
	movedAt: string;
};

export type SelectionProcess = {
	id: string;
	company: string;
	jobTitle: string;
	jobUrl: string | null;
	processUrl: string | null;
	stage: SelectionStage;
	appliedOn: string | null;
	nextStepOn: string | null;
	contactName: string | null;
	contactEmail: string | null;
	salary: number | null;
	notes: string | null;
	createdAt: string;
	updatedAt: string;
	history: StageMovement[];
};

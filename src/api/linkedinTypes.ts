export type ProfileTone = "EXECUTIVE" | "TECHNICAL" | "CONSULTATIVE" | "CREATIVE";

export type CareerProfileRequest = {
	areaOfExpertise: string;
	currentJobTitle?: string;
	currentSeniority?: string;
	targetJobTitle: string;
	targetSeniority?: string;
	targetTimeframe?: string;
	targetIndustries: string[];
	targetCompanies: string[];
	location?: string;
	languages: string[];
	strengths: string[];
	differentiators?: string;
	tone: ProfileTone;
	profileLanguage: string;
	notes?: string;
};

export type CareerProfileResponse = CareerProfileRequest;

export type ProfileSection =
	| "PHOTO"
	| "BANNER"
	| "HEADLINE"
	| "ABOUT"
	| "CUSTOM_URL"
	| "EXPERIENCE"
	| "EDUCATION"
	| "SKILLS"
	| "CERTIFICATIONS"
	| "LANGUAGES"
	| "PROJECTS"
	| "PUBLICATIONS"
	| "RECOMMENDATIONS"
	| "FEATURED"
	| "ACTIVITY";

export type SnapshotSource = "EXTENSION" | "TEXT";

export type LinkedInProfileResponse = {
	profileUrl?: string;
	fullName?: string;
	headline?: string;
	location?: string;
	about?: string;
	customUrl?: string;
	connections?: string;
	followers?: string;
};

export type LinkedInSnapshotResponse = {
	id: string;
	capturedAt: string;
	source: SnapshotSource;
	profile: LinkedInProfileResponse;
	hasPhoto: boolean;
	hasBanner: boolean;
	missingSections: ProfileSection[];
};

export type PairingTokenResponse = { token: string };

export type SuggestionPriority = "HIGH" | "MEDIUM" | "LOW";

export type LinkedInSuggestionResponse = { priority: SuggestionPriority; text: string };

export type LinkedInItemReviewResponse = {
	title: string;
	score: number;
	diagnosis: string;
	suggestions: LinkedInSuggestionResponse[];
	rewrite?: string | null;
};

export type LinkedInSectionReviewResponse = {
	section: ProfileSection;
	score: number;
	diagnosis: string;
	suggestions: LinkedInSuggestionResponse[];
	rewrite?: string | null;
	items?: LinkedInItemReviewResponse[];
};

export type LinkedInAnalysisResponse = {
	id: string;
	snapshotId: string;
	createdAt: string;
	overallScore: number;
	summary: string;
	targetFit?: string;
	topActions: string[];
	recruiterKeywords: string[];
	missingKeywords: string[];
	sections: LinkedInSectionReviewResponse[];
	imagesAnalyzed: boolean;
	aiModel?: string;
	costUsd?: number;
};

export type LinkedInAnalysisSummaryResponse = {
	id: string;
	snapshotId: string;
	createdAt: string;
	overallScore: number;
};

import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AppSidebar } from "./components/AppSidebar";
import { ScrollToTop } from "./components/ScrollToTop";
import { OnboardingPanel } from "./components/OnboardingPanel";
import { UpdateBanner } from "./components/UpdateBanner";
import { ResultPage } from "./pages/ResultPage";
import { RewritePage } from "./pages/RewritePage";
import { JobEditPage } from "./pages/JobEditPage";
import { JobFormPage } from "./pages/JobFormPage";
import { JobsPage } from "./pages/JobsPage";
import { JobAssistantPage } from "./pages/JobAssistantPage";
import { JobCostPage } from "./pages/JobCostPage";
import { JobSummaryPage } from "./pages/JobSummaryPage";
import { JobProcessPage } from "./pages/JobProcessPage";
import { PromptsPage } from "./pages/PromptsPage";
import { NotesPage } from "./pages/NotesPage";
import { PreferencesPage } from "./pages/PreferencesPage";
import { ResumesPage } from "./pages/ResumesPage";
import { ResumeEditPage } from "./pages/ResumeEditPage";
import { SettingsPage } from "./pages/SettingsPage";
import { ChatPage } from "./pages/ChatPage";
import { CalendarPage } from "./pages/CalendarPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { AboutPage } from "./pages/AboutPage";
import { ProcessRedirectPage } from "./pages/ProcessRedirectPage";

export default function App() {
	const { pathname } = useLocation();
	return (
		<>
			<ScrollToTop />
			<div className="app-shell">
				<AppSidebar />
				<main className="app-main">
					<UpdateBanner />
					{!pathname.startsWith("/chat") && <OnboardingPanel />}
					<Routes>
						<Route path="/upload" element={<Navigate to="/jobs" replace />} />
						<Route path="/jobs" element={<JobsPage />} />
						<Route path="/jobs/new" element={<JobFormPage />} />
						<Route path="/jobs/:jobId/process" element={<JobProcessPage />} />
						<Route path="/jobs/:jobId/summary" element={<JobSummaryPage />} />
						<Route path="/jobs/:jobId/cost" element={<JobCostPage />} />
						<Route path="/jobs/:jobId/assistant" element={<JobAssistantPage />} />
						<Route path="/jobs/:jobId/edit" element={<JobEditPage />} />
						<Route path="/resumes" element={<ResumesPage />} />
						<Route path="/resumes/new" element={<Navigate to="/resumes" replace />} />
						<Route path="/resumes/:resumeId/edit" element={<ResumeEditPage />} />
						<Route path="/analyses/:id" element={<ResultPage />} />
						<Route path="/analyses/:id/rewrite" element={<RewritePage />} />
						<Route path="/notes" element={<NotesPage />} />
						<Route path="/preferences" element={<PreferencesPage />} />
						<Route path="/prompts" element={<PromptsPage />} />
						<Route path="/settings" element={<SettingsPage />} />
						<Route path="/settings/notifications" element={<SettingsPage />} />
						<Route path="/settings/database" element={<SettingsPage />} />
						<Route path="/notifications" element={<NotificationsPage />} />
						<Route path="/calendar" element={<CalendarPage />} />
						<Route path="/chat" element={<ChatPage />} />
						<Route path="/chat/:conversationId" element={<ChatPage />} />
						<Route path="/changelog" element={<Navigate to="/about" replace />} />
						<Route path="/about" element={<AboutPage />} />
						<Route path="/processes/:processId" element={<ProcessRedirectPage />} />
						<Route path="*" element={<Navigate to="/jobs" replace />} />
					</Routes>
				</main>
			</div>
		</>
	);
}

import { Navigate, Route, Routes } from "react-router-dom";
import { AppHeader } from "./components/AppHeader";
import { ScrollToTop } from "./components/ScrollToTop";
import { UploadPage } from "./pages/UploadPage";
import { ResultPage } from "./pages/ResultPage";
import { RewritePage } from "./pages/RewritePage";
import { JobEditPage } from "./pages/JobEditPage";
import { JobFormPage } from "./pages/JobFormPage";
import { JobsPage } from "./pages/JobsPage";
import { JobProcessPage } from "./pages/JobProcessPage";
import { PromptsPage } from "./pages/PromptsPage";
import { PreferencesPage } from "./pages/PreferencesPage";
import { ResumesPage } from "./pages/ResumesPage";
import { ResumeEditPage } from "./pages/ResumeEditPage";
import { SettingsPage } from "./pages/SettingsPage";
import { CalendarPage } from "./pages/CalendarPage";
import { NotificationsPage } from "./pages/NotificationsPage";
import { ProcessRedirectPage } from "./pages/ProcessRedirectPage";

export default function App() {
	return (
		<>
			<ScrollToTop />
			<AppHeader />
			<Routes>
				<Route path="/upload" element={<UploadPage />} />
				<Route path="/jobs" element={<JobsPage />} />
				<Route path="/jobs/new" element={<JobFormPage />} />
				<Route path="/jobs/:jobId/process" element={<JobProcessPage />} />
				<Route path="/jobs/:jobId/edit" element={<JobEditPage />} />
				<Route path="/resumes" element={<ResumesPage />} />
				<Route path="/resumes/new" element={<Navigate to="/resumes" replace />} />
				<Route path="/resumes/:resumeId/edit" element={<ResumeEditPage />} />
				<Route path="/analyses/:id" element={<ResultPage />} />
				<Route path="/analyses/:id/rewrite" element={<RewritePage />} />
				<Route path="/preferences" element={<PreferencesPage />} />
				<Route path="/prompts" element={<PromptsPage />} />
				<Route path="/settings" element={<SettingsPage />} />
				<Route path="/settings/notifications" element={<SettingsPage />} />
				<Route path="/notifications" element={<NotificationsPage />} />
				<Route path="/calendar" element={<CalendarPage />} />
				<Route path="/processes/:processId" element={<ProcessRedirectPage />} />
				<Route path="*" element={<Navigate to="/upload" replace />} />
			</Routes>
		</>
	);
}

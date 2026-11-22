
import { BrowserRouter, Routes, Route } from "react-router-dom";

import App from "./app";
import AdminLayout from "./admin/AdminLayout";
import AdminDashboard from "./admin/AdminDashboard";
import AdminSection from "./admin/AdminSection";
import AdminLogin from "./admin/AdminLogin";
import AdminRoute from "./admin/AdminRoute";
import MediaLibrary from "./admin/MediaLibrary";
import ProjectsAdmin from "./admin/projects/ProjectsAdmin";
import HomeAdmin from "./admin/HomeAdmin";
import AboutAdmin from "./admin/AboutAdmin";
import SkillsAdmin from "./admin/SkillsAdmin";
import ExperienceAdmin from "./admin/ExperienceAdmin";
import EducationAdmin from "./admin/EducationAdmin";
import CertificationsAdmin from "./admin/CertificationsAdmin";
import ContactAdmin from "./admin/ContactAdmin";
import NavigationAdmin from "./admin/NavigationAdmin";
import FooterAdmin from "./admin/FooterAdmin";
import ActivityHistory from "./admin/ActivityHistory";

function AppRouter() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<App />} />
                <Route path="/admin/login" element={<AdminLogin />} />

                <Route
                    path="/admin"
                    element={
                        <AdminRoute>
                            <AdminLayout />
                        </AdminRoute>
                    }
                >
                    <Route index element={<AdminDashboard />} />
                    <Route path="home" element={<HomeAdmin />} />
                    <Route path="about" element={<AboutAdmin />} />
                    <Route path="skills" element={<SkillsAdmin />} />
                    <Route path="experience" element={<ExperienceAdmin />} />
                    <Route path="projects" element={<ProjectsAdmin />} />
                    <Route path="education" element={<EducationAdmin />} />
                    <Route path="certifications" element={<CertificationsAdmin />} />
                    <Route path="contact" element={<ContactAdmin />} />
                    <Route path="navigation" element={<NavigationAdmin />} />
                    <Route path="footer" element={<FooterAdmin />} />
                    <Route path="media" element={<MediaLibrary />} />
                    <Route path="activity" element={<ActivityHistory />} />
                    <Route path="settings" element={<AdminSection />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default AppRouter;


import { useEffect, useState } from "react";
import Navbar from "./components/navbar";
import Home from "./pages/home";
import About from "./pages/about";
import Skills from "./pages/skills";
import Experience from "./pages/experience";
import Projects from "./pages/projects";
import Education from "./pages/education";
import Certifications from "./pages/certifications";
import Contact from "./pages/contact";
import { footerData } from "./data/footer";
import { supabase } from "./lib/supabase";

function App() {
    const [footer, setFooter] = useState(footerData);

    useEffect(() => {
        let cancelled = false;

        async function loadFooter() {
            try {
                const { data, error } = await supabase
                    .from("portfolio_sections")
                    .select("content")
                    .eq("section_key", "footer")
                    .eq("is_published", true)
                    .maybeSingle();

                if (error) throw error;
                console.log("FOOTER DATA FROM SUPABASE:", data);

                if (data?.content && !cancelled) {
                    setFooter({
                        ...footerData,
                        ...data.content,
                    });
                }
            } catch (error) {
                console.error("Unable to load footer settings:", error);
            }
        }

        loadFooter();

        return () => {
            cancelled = true;
        };
    }, []);

    return (
        <div className="min-h-screen overflow-hidden bg-[#080c14] text-slate-100">
            <Navbar />

            <main>
                <Home />
                <About />
                <Skills />
                <Experience />
                <Projects />
                <Education />
                <Certifications />
                <Contact />
            </main>

            <footer className="border-t border-white/5 py-8">
                <div className="container flex flex-col items-center justify-between gap-4 text-sm text-slate-500 sm:flex-row">
                    <p>
                        © {new Date().getFullYear()} {footer.name}. {footer.rights}
                    </p>

                    <a
                        href={footer.backToTopLink}
                        className="transition hover:text-white"
                    >
                        {footer.backToTop}
                    </a>
                </div>
            </footer>
        </div>
    );
}

export default App;

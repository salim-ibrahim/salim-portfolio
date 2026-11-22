
import { useEffect } from "react";
import { supabase } from "../lib/supabase";

const DEFAULT_SETTINGS = {
    site_title: "Salim Ibrahim | Personal Portfolio",
    meta_description:
        "The personal portfolio of Salim Ibrahim, showcasing projects in data analytics, finance, research and software development.",
    theme_color: "#080c14",
    favicon_url: "/favicon.svg",
    social_image_url: "",
};

function setMeta(attribute, key, content) {
    let element = document.head.querySelector(
        `meta[${attribute}="${key}"]`
    );

    if (!content) {
        element?.remove();
        return;
    }

    if (!element) {
        element = document.createElement("meta");
        element.setAttribute(attribute, key);
        document.head.appendChild(element);
    }

    element.setAttribute("content", content);
}

export default function SiteMetadata() {
    useEffect(() => {
        let cancelled = false;

        async function loadMetadata() {
            try {
                const { data, error } = await supabase
                    .from("portfolio_sections")
                    .select("content")
                    .eq("section_key", "settings")
                    .eq("is_published", true)
                    .maybeSingle();

                if (error) throw error;
                if (cancelled || !data?.content) return;

                const settings = {
                    ...DEFAULT_SETTINGS,
                    ...data.content,
                };

                document.title = settings.site_title;

                setMeta(
                    "name",
                    "description",
                    settings.meta_description
                );

                setMeta(
                    "name",
                    "theme-color",
                    settings.theme_color
                );

                setMeta("property", "og:title", settings.site_title);
                setMeta(
                    "property",
                    "og:description",
                    settings.meta_description
                );
                setMeta("property", "og:type", "website");

                setMeta(
                    "property",
                    "og:image",
                    settings.social_image_url
                );

                setMeta(
                    "name",
                    "twitter:card",
                    settings.social_image_url
                        ? "summary_large_image"
                        : "summary"
                );

                setMeta("name", "twitter:title", settings.site_title);
                setMeta(
                    "name",
                    "twitter:description",
                    settings.meta_description
                );

                setMeta(
                    "name",
                    "twitter:image",
                    settings.social_image_url
                );

                let favicon = document.head.querySelector(
                    'link[rel="icon"]'
                );

                if (!favicon) {
                    favicon = document.createElement("link");
                    favicon.rel = "icon";
                    document.head.appendChild(favicon);
                }

                favicon.href =
                    settings.favicon_url || DEFAULT_SETTINGS.favicon_url;
            } catch (error) {
                console.error("Unable to load public site metadata:", error);
            }
        }

        loadMetadata();

        return () => {
            cancelled = true;
        };
    }, []);

    return null;
}

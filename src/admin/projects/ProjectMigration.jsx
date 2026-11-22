import { useState } from "react";
import { supabase } from "../../lib/supabase";
import {
    analyticsProjects,
    featuredProject,
    reconSections,
    webAppProjects,
    websiteProjects,
} from "../../data/projects";

import cafeCleaningVideo from "../../assets/projects/cafe/cafe-sales-data-cleaning.mp4";
import cafeDashboardVideo from "../../assets/projects/cafe/cafe-dashboard.mp4";
import cafeFront from "../../assets/projects/cafe/front.jpg";
import cafeReport from "../../assets/projects/cafe/Cafe_Sales Analysis_Report.pdf";
import nikePowerQuery from "../../assets/projects/nike/power-query.mp4";
import nikeDax from "../../assets/projects/nike/dax-function.mp4";
import nikeDashboard from "../../assets/projects/nike/nike-sales-dashboard.mp4";
import nikeFront from "../../assets/projects/nike/front.jpg";
import nikeReport from "../../assets/projects/nike/Nike Sales Performance Analysis Report.pdf";
import f1PythonSql from "../../assets/projects/f1/python-sql.mp4";
import f1SqlFormulas from "../../assets/projects/f1/sql-formulas.mp4";
import f1PitAvg from "../../assets/projects/f1/clean-pit-avg.png";
import f1Dnf from "../../assets/projects/f1/dnf-by-circuit.png";
import f1Pole from "../../assets/projects/f1/pole-to-win.png";
import f1Comebacks from "../../assets/projects/f1/top-comebacks.png";
import f1Front from "../../assets/projects/f1/front.jpg";
import f1Report from "../../assets/projects/f1/F1 Race Strategy and Performance Analysis Report.pdf";
import aiAnalysisVideo from "../../assets/projects/ai/ai-analysis.mp4";
import aiChart1 from "../../assets/projects/ai/chart1-correlation-heatmap.png";
import aiChart2 from "../../assets/projects/ai/chart2-scatter-social-vs-mental.png";
import aiChart3 from "../../assets/projects/ai/chart3-high-vs-low.png";
import aiFront from "../../assets/projects/ai/front.jpg";
import aiReport from "../../assets/projects/ai/Impact of AI and Social Media on Student Mental Health Report.pdf";
import riskVideo from "../../assets/projects/financial-risk/risk-analysis.mp4";
import riskDashboard from "../../assets/projects/financial-risk/dashboard.png";
import riskCredit from "../../assets/projects/financial-risk/credit-score-segmentation.png";
import riskDti from "../../assets/projects/financial-risk/dti-segmentation.png";
import riskExposure from "../../assets/projects/financial-risk/potential-exposure.png";
import riskProperty from "../../assets/projects/financial-risk/property-area-segmentation.png";
import riskFront from "../../assets/projects/financial-risk/front.jpg";
import riskReport from "../../assets/projects/financial-risk/Financial Risk Analysis and Loan Default Modelling Report.pdf";
import boatDashboard from "../../assets/projects/boat/dashboard.png";
import boatFront from "../../assets/projects/boat/front.jpg";
import boatReport from "../../assets/projects/boat/boAt E-Commerce Sales Analytics Report.pdf";
import foodFront from "../../assets/projects/food-inflation/front.jpg";
import foodReport from "../../assets/projects/food-inflation/Effects of Food Inflation and Non-food Inflation on Agricultural Output Report.pdf";
import reconTesting from "../../assets/projects/reconpro/reconpro-testing.mp4";
import reconFront from "../../assets/projects/reconpro/front.jpg";
import websiteFront from "../../assets/projects/website_salim/front.jpg";
import websiteWalkthrough from "../../assets/projects/website_salim/video.mp4";

const media = [
    [cafeCleaningVideo, "5045d4e0-1323-461b-a01b-26ff4484b27d", "projects/cafe/cafe-sales-data-cleaning.mp4"],
    [cafeDashboardVideo, "00d8ca11-b724-44cb-a4cc-5ab141012e53", "projects/cafe/cafe-dashboard.mp4"],
    [cafeFront, "7927280f-f9f3-42b2-a8e0-3fd3df2caa65", "projects/cafe/front.jpg"],
    [cafeReport, "9c42123a-b72f-484b-ab18-ff47441e1b64", "projects/cafe/Cafe_Sales Analysis_Report.pdf"],
    [nikePowerQuery, "3b0fd334-8ba9-4bac-a57e-3e86dc416a3a", "projects/nike/power-query.mp4"],
    [nikeDax, "3da0c339-df5a-4c02-92a7-b5426bd2ae7c", "projects/nike/dax-function.mp4"],
    [nikeDashboard, "296654ef-e75b-4694-bed1-7a8a97ee7649", "projects/nike/nike-sales-dashboard.mp4"],
    [nikeFront, "bf76d7c4-ab38-4eaf-b6f2-2fc50e358b23", "projects/nike/front.jpg"],
    [nikeReport, "e9ea4ee0-80f2-4df0-9c1a-423dcf3899c4", "projects/nike/Nike Sales Performance Analysis Report.pdf"],
    [f1PythonSql, "e6bf7a55-a7c9-46aa-b945-b2a2dfefc6d4", "projects/f1/python-sql.mp4"],
    [f1SqlFormulas, "9061e52b-749e-4674-b552-87dfe90e6eb3", "projects/f1/sql-formulas.mp4"],
    [f1PitAvg, "53d1cb7d-40ef-4008-ae26-f5a1f9d7c28a", "projects/f1/clean-pit-avg.png"],
    [f1Dnf, "9942452f-2b57-49b1-ae18-aabce0123c6b", "projects/f1/dnf-by-circuit.png"],
    [f1Pole, "fe7204f7-a83c-40c3-bc69-d9b14531cc47", "projects/f1/pole-to-win.png"],
    [f1Comebacks, "28fc3afc-60d4-40ba-bda0-effe385b4da6", "projects/f1/top-comebacks.png"],
    [f1Front, "d123fca7-977a-42f5-be45-4d122af6ca73", "projects/f1/front.jpg"],
    [f1Report, "3cec982f-86db-4037-89b0-323e06d5de4b", "projects/f1/F1 Race Strategy and Performance Analysis Report.pdf"],
    [aiAnalysisVideo, "6c4b637f-24a0-46f8-bb79-265c17ceac8f", "projects/ai/ai-analysis.mp4"],
    [aiChart1, "ffff0d49-8a94-4e54-b669-92e36c0d56ce", "projects/ai/chart1-correlation-heatmap.png"],
    [aiChart2, "a1794235-470b-472e-9cdb-8b588a20a74a", "projects/ai/chart2-scatter-social-vs-mental.png"],
    [aiChart3, "239b4628-a322-4cbd-849f-bafb0694c6b8", "projects/ai/chart3-high-vs-low.png"],
    [aiFront, "7c30be8b-4c83-493e-bfbd-c48300a92ee2", "projects/ai/front.jpg"],
    [aiReport, "e50ba0b2-9b81-4d52-883f-b8d249153313", "projects/ai/Impact of AI and Social Media on Student Mental Health Report.pdf"],
    [riskVideo, "6f222197-d2b2-49c5-a7f6-a59be2d3c5b5", "projects/financial-risk/risk-analysis.mp4"],
    [riskDashboard, "b1f46d13-eaca-4c20-b7f9-4056de550823", "projects/financial-risk/dashboard.png"],
    [riskCredit, "a985cc65-7f36-46d1-944a-4d8a5a48accf", "projects/financial-risk/credit-score-segmentation.png"],
    [riskDti, "c9275ee4-8e6e-45cd-99d3-3508e7762610", "projects/financial-risk/dti-segmentation.png"],
    [riskExposure, "7f0a5592-882f-4841-821d-98d7cc68e7c5", "projects/financial-risk/potential-exposure.png"],
    [riskProperty, "9518df98-cb4f-43bb-b898-3fe1be085e03", "projects/financial-risk/property-area-segmentation.png"],
    [riskFront, "93f0c828-3be2-46a1-9624-d384712e285d", "projects/financial-risk/front.jpg"],
    [riskReport, "a3dc7215-77b4-4ed6-8e21-a82e411bb0e1", "projects/financial-risk/Financial Risk Analysis and Loan Default Modelling Report.pdf"],
    [boatDashboard, "d5a3adaf-1512-4e20-af3c-d49b76f552ea", "projects/boat/dashboard.png"],
    [boatFront, "61bac4f4-a638-4950-8417-b0ed06be0031", "projects/boat/front.jpg"],
    [boatReport, "3c919d72-16b8-412f-91cc-8f5c03f3eac7", "projects/boat/boAt E-Commerce Sales Analytics Report.pdf"],
    [foodFront, "25af2d8e-1fec-485e-8f1e-9e1f7ebc1de5", "projects/food-inflation/front.jpg"],
    [foodReport, "c0aad666-695b-41a6-ad7e-4d21faf0d889", "projects/food-inflation/Effects of Food Inflation and Non-food Inflation on Agricultural Output Report.pdf"],
    [reconTesting, "45ef1e0b-3c82-408b-8c56-efda6e1a79e4", "projects/reconpro/reconpro-testing.mp4"],
    [reconFront, "69200544-690a-4814-a048-c6b17997615b", "projects/reconpro/front.jpg"],
    [websiteFront, "987bd0c1-ec84-41e3-9614-691355eb5a39", "projects/website_salim/front.jpg"],
    [websiteWalkthrough, "3d6fb76a-91e1-462a-b2ba-440b3a2c4aa3", "projects/website_salim/video.mp4"],
];

const coverIds = {
    "cafe-sales-performance-data-quality-audit": "7927280f-f9f3-42b2-a8e0-3fd3df2caa65",
    "nike-sales-performance-analysis": "bf76d7c4-ab38-4eaf-b6f2-2fc50e358b23",
    "f1-race-strategy-performance-analysis": "d123fca7-977a-42f5-be45-4d122af6ca73",
    "student-digital-wellness-analysis": "7c30be8b-4c83-493e-bfbd-c48300a92ee2",
    "financial-risk-analysis-loan-default-modelling": "93f0c828-3be2-46a1-9624-d384712e285d",
    "boat-ecommerce-sales-analytics": "61bac4f4-a638-4950-8417-b0ed06be0031",
    "food-inflation-agricultural-output-ghana": "25af2d8e-1fec-485e-8f1e-9e1f7ebc1de5",
    reconpro: "69200544-690a-4814-a048-c6b17997615b",
    "salim-ibrahim-portfolio": "987bd0c1-ec84-41e3-9614-691355eb5a39",
};

const reportIds = {
    "cafe-sales-performance-data-quality-audit": "9c42123a-b72f-484b-ab18-ff47441e1b64",
    "nike-sales-performance-analysis": "e9ea4ee0-80f2-4df0-9c1a-423dcf3899c4",
    "f1-race-strategy-performance-analysis": "3cec982f-86db-4037-89b0-323e06d5de4b",
    "student-digital-wellness-analysis": "e50ba0b2-9b81-4d52-883f-b8d249153313",
    "financial-risk-analysis-loan-default-modelling": "a3dc7215-77b4-4ed6-8e21-a82e411bb0e1",
    "boat-ecommerce-sales-analytics": "3c919d72-16b8-412f-91cc-8f5c03f3eac7",
    "food-inflation-agricultural-output-ghana": "c0aad666-695b-41a6-ad7e-4d21faf0d889",
};

const videoIds = {
    "cafe-sales-performance-data-quality-audit": "5045d4e0-1323-461b-a01b-26ff4484b27d",
    "nike-sales-performance-analysis": "3b0fd334-8ba9-4bac-a57e-3e86dc416a3a",
    "f1-race-strategy-performance-analysis": "e6bf7a55-a7c9-46aa-b945-b2a2dfefc6d4",
    "student-digital-wellness-analysis": "6c4b637f-24a0-46f8-bb79-265c17ceac8f",
    "financial-risk-analysis-loan-default-modelling": "6f222197-d2b2-49c5-a7f6-a59be2d3c5b5",
    reconpro: "45ef1e0b-3c82-408b-8c56-efda6e1a79e4",
    "salim-ibrahim-portfolio": "3d6fb76a-91e1-462a-b2ba-440b3a2c4aa3",
};

const projectKeys = {
    "Café Sales Performance & Data Quality Audit": "cafe-sales-performance-data-quality-audit",
    "NIKE SALES PERFORMANCE ANALYSIS": "nike-sales-performance-analysis",
    "F1 RACE STRATEGY & PERFORMANCE ANALYSIS": "f1-race-strategy-performance-analysis",
    "STUDENT DIGITAL WELLNESS ANALYSIS": "student-digital-wellness-analysis",
    "FINANCIAL RISK ANALYSIS & LOAN DEFAULT MODELLING": "financial-risk-analysis-loan-default-modelling",
    "boAt E-Commerce Sales Analytics": "boat-ecommerce-sales-analytics",
    "EFFECTS OF FOOD INFLATION & NON-FOOD INFLATION ON AGRICULTURAL OUTPUT IN GHANA": "food-inflation-agricultural-output-ghana",
    "ReconPro.": "reconpro",
    "Finance Dashboard Demo": "finance-dashboard-demo",
    "E-Commerce Platform Demo": "ecommerce-platform-demo",
    "Salim Ibrahim Portfolio": "salim-ibrahim-portfolio",
    "Café Website Demo": "cafe-website-demo",
    "Nike Storefront Demo": "nike-storefront-demo",
};

const iconNames = {
    "cafe-sales-performance-data-quality-audit": "coffee",
    "nike-sales-performance-analysis": "chart-bar",
    "f1-race-strategy-performance-analysis": "trending-up",
    "student-digital-wellness-analysis": "brain-circuit",
    "financial-risk-analysis-loan-default-modelling": "database",
    "boat-ecommerce-sales-analytics": "shopping-bag",
    "food-inflation-agricultural-output-ghana": "flask-conical",
};

const categoryMap = {
    "cafe-sales-performance-data-quality-audit": ["data-analytics"],
    "nike-sales-performance-analysis": ["data-analytics"],
    "f1-race-strategy-performance-analysis": ["data-analytics"],
    "student-digital-wellness-analysis": ["data-analytics"],
    "financial-risk-analysis-loan-default-modelling": ["data-analytics", "financial-analysis"],
    "boat-ecommerce-sales-analytics": ["data-analytics"],
    "food-inflation-agricultural-output-ghana": ["data-analytics", "research-economics"],
    reconpro: ["software-development", "financial-analysis"],
    "finance-dashboard-demo": ["software-development", "financial-analysis"],
    "ecommerce-platform-demo": ["software-development", "web-development"],
    "salim-ibrahim-portfolio": ["web-development", "software-development"],
    "cafe-website-demo": ["web-development"],
    "nike-storefront-demo": ["web-development"],
};

const placementMap = {
    reconpro: ["featured-projects", "web-applications"],
    "finance-dashboard-demo": ["web-applications"],
    "ecommerce-platform-demo": ["web-applications"],
    "salim-ibrahim-portfolio": ["websites"],
    "cafe-website-demo": ["websites"],
    "nike-storefront-demo": ["websites"],
    "cafe-sales-performance-data-quality-audit": ["data-analytics-projects"],
    "nike-sales-performance-analysis": ["data-analytics-projects"],
    "f1-race-strategy-performance-analysis": ["data-analytics-projects"],
    "student-digital-wellness-analysis": ["data-analytics-projects"],
    "financial-risk-analysis-loan-default-modelling": ["data-analytics-projects"],
    "boat-ecommerce-sales-analytics": ["data-analytics-projects"],
    "food-inflation-agricultural-output-ghana": ["data-analytics-projects"],
};

function slugify(value) {
    return String(value || "").toLowerCase().trim()
        .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function collectProjects() {
    const all = [
        ...analyticsProjects,
        featuredProject,
        ...webAppProjects,
        ...websiteProjects,
    ];

    const unique = new Map();

    all.forEach((project) => {
        const key = projectKeys[project.title] || slugify(project.title);
        if (!unique.has(key)) unique.set(key, { ...project, project_key: key });
    });

    return [...unique.values()];
}

function getDescription(project) {
    if (Array.isArray(project.sections)) {
        const overview = project.sections.find((section) =>
            section.heading?.toLowerCase().includes("overview")
        );
        if (overview?.paras) return overview.paras.join("\n\n");
    }
    if (project.title === featuredProject.title) {
        const overview = reconSections.find((section) =>
            section.heading?.toLowerCase().includes("overview")
        );
        if (overview?.paras) return overview.paras.join("\n\n");
    }
    return project.overview || project.subtitle || null;
}

function getContentBlocks(project) {
    if (Array.isArray(project.sections)) return project.sections;
    if (project.title === featuredProject.title) return reconSections;

    if (project.overview || project.features || project.contribution || project.challenges) {
        return [{
            heading: "Project Details",
            paras: project.overview ? [project.overview] : [],
            bullets: project.features || [],
            contribution: project.contribution || null,
            challenges: project.challenges || null,
        }];
    }

    return [];
}

function buildMediaLookup() {
    return new Map(media.map(([src, id, path]) => [
        src,
        { id, path },
    ]));
}

function transformMedia(value, lookup) {
    if (Array.isArray(value)) {
        return value.map((item) => transformMedia(item, lookup));
    }

    if (!value || typeof value !== "object") return value;

    const result = {};
    Object.entries(value).forEach(([key, item]) => {
        if (key === "src" && typeof item === "string" && lookup.has(item)) {
            const asset = lookup.get(item);
            const { data } = supabase.storage
                .from("portfolio-media")
                .getPublicUrl(asset.path);
            result.src = data.publicUrl;
            result.mediaAssetId = asset.id;
        } else {
            result[key] = transformMedia(item, lookup);
        }
    });

    return result;
}

function makeRecord(project, index, lookup) {
    const key = project.project_key;
    const source = project.dataSource || {};

    return {
        project_key: key,
        title: project.title,
        category: project.category || null,
        subtitle: project.subtitle || null,
        description: getDescription(project),
        technologies: Array.isArray(project.technologies) ? project.technologies : [],
        icon: iconNames[key] || null,
        project_number: Number(project.number) || null,
        github_url: project.github || null,
        live_url: project.live || null,
        data_source_label: source.label || null,
        data_source_url: source.url || null,
        content_blocks: transformMedia(getContentBlocks(project), lookup),
        cover_media_id: coverIds[key] || null,
        report_media_id: reportIds[key] || null,
        demo_video_media_id: videoIds[key] || null,
        is_featured: key === "reconpro",
        is_published: true,
        sort_order: index + 1,
    };
}

export default function ProjectMigration({ onComplete }) {
    const [preview, setPreview] = useState(false);
    const [running, setRunning] = useState(false);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const [report, setReport] = useState(null);

    const projects = collectProjects();

    async function runMigration() {
        setRunning(true);
        setError("");
        setMessage("");
        setReport(null);

        try {
            const [categoryResult, placementResult, mediaResult] = await Promise.all([
                supabase.from("project_categories").select("id, slug"),
                supabase.from("project_placements").select("id, placement_key"),
                supabase.from("media_assets").select("id, file_path"),
            ]);

            if (categoryResult.error) throw categoryResult.error;
            if (placementResult.error) throw placementResult.error;
            if (mediaResult.error) throw mediaResult.error;

            const categoryIds = Object.fromEntries(
                (categoryResult.data || []).map((item) => [item.slug, item.id])
            );
            const placementIds = Object.fromEntries(
                (placementResult.data || []).map((item) => [item.placement_key, item.id])
            );
            const mediaById = new Map((mediaResult.data || []).map((item) => [item.id, item.file_path]));
            const mediaIds = new Set(mediaById.keys());

            const lookup = buildMediaLookup();
            const records = projects.map((project, index) =>
                makeRecord(project, index, lookup)
            );

            const missingCategories = [...new Set(
                Object.values(categoryMap).flat().filter((slug) => !categoryIds[slug])
            )];
            const missingPlacements = [...new Set(
                Object.values(placementMap).flat().filter((key) => !placementIds[key])
            )];

            const referencedMedia = records.flatMap((record) => [
                record.cover_media_id,
                record.report_media_id,
                record.demo_video_media_id,
            ]).filter(Boolean);

            const missingMedia = [...new Set(referencedMedia.filter((id) => !mediaIds.has(id)))];
            const mismatchedMedia = media.filter(([src, id, path]) => mediaById.get(id) !== path).map(([src, id, path]) => `${id}: expected ${path}, found ${mediaById.get(id) || "missing"}`);

            if (missingCategories.length || missingPlacements.length || missingMedia.length || mismatchedMedia.length) {
                throw new Error(
                    [
                        missingCategories.length ? `Missing categories: ${missingCategories.join(", ")}` : "",
                        missingPlacements.length ? `Missing placements: ${missingPlacements.join(", ")}` : "",
                        missingMedia.length ? `Missing media records: ${missingMedia.join(", ")}` : "",
                        mismatchedMedia.length ? `Media path mismatches: ${mismatchedMedia.join("; ")}` : "",
                    ].filter(Boolean).join(" | ")
                );
            }

            let imported = 0;

            for (const [index, record] of records.entries()) {
                const { data, error: upsertError } = await supabase
                    .from("projects")
                    .upsert(record, { onConflict: "project_key" })
                    .select("id")
                    .single();

                if (upsertError) throw upsertError;

                const projectId = data.id;

                const { error: removeCategoryError } = await supabase
                    .from("project_category_assignments")
                    .delete()
                    .eq("project_id", projectId);
                if (removeCategoryError) throw removeCategoryError;

                const { error: removePlacementError } = await supabase
                    .from("project_placement_assignments")
                    .delete()
                    .eq("project_id", projectId);
                if (removePlacementError) throw removePlacementError;

                const categoryRows = (categoryMap[record.project_key] || [])
                    .map((slug) => categoryIds[slug])
                    .filter(Boolean)
                    .map((categoryId) => ({
                        project_id: projectId,
                        category_id: categoryId,
                    }));

                const placementRows = (placementMap[record.project_key] || [])
                    .map((key, order) => ({
                        project_id: projectId,
                        placement_id: placementIds[key],
                        sort_order: order,
                    }));

                if (categoryRows.length) {
                    const { error: assignmentError } = await supabase
                        .from("project_category_assignments")
                        .insert(categoryRows);
                    if (assignmentError) throw assignmentError;
                }

                if (placementRows.length) {
                    const { error: assignmentError } = await supabase
                        .from("project_placement_assignments")
                        .insert(placementRows);
                    if (assignmentError) throw assignmentError;
                }

                imported += 1;
                setMessage(`Imported ${imported} of ${records.length}: ${record.title}`);
            }

            setReport({
                total: records.length,
                imported,
                mediaReferences: referencedMedia.length,
            });
            setMessage("Project migration completed successfully.");
            if (onComplete) await onComplete();
        } catch (err) {
            setError(err.message || "Project migration failed.");
        } finally {
            setRunning(false);
        }
    }

    return (
        <section className="rounded-xl border border-amber-400/20 bg-[#11151f] p-5 space-y-4">
            <div>
                <h2 className="text-lg font-semibold text-white">Import existing portfolio projects</h2>
                <p className="mt-1 text-sm text-slate-400">
                    Import the original project content, link existing Media Library files,
                    and assign categories and placements. Existing projects with matching keys
                    will be updated instead of duplicated.
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-lg bg-white/[0.03] p-3">
                    <p className="text-xs text-slate-500">Projects to import</p>
                    <p className="mt-1 text-xl font-semibold text-white">{projects.length}</p>
                </div>
                <div className="rounded-lg bg-white/[0.03] p-3">
                    <p className="text-xs text-slate-500">Mapped media files</p>
                    <p className="mt-1 text-xl font-semibold text-white">{media.length}</p>
                </div>
                <div className="rounded-lg bg-white/[0.03] p-3">
                    <p className="text-xs text-slate-500">Existing ReconPro entries</p>
                    <p className="mt-1 text-xl font-semibold text-white">1 canonical record</p>
                </div>
            </div>

            {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                    {error}
                </div>
            )}

            {message && (
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-300">
                    {message}
                </div>
            )}

            {report && (
                <div className="rounded-lg border border-emerald-500/20 p-3 text-sm text-emerald-300">
                    Completed: {report.imported} of {report.total} projects imported.
                    {` ${report.mediaReferences} media references linked.`}
                </div>
            )}

            <div className="flex flex-wrap gap-2">
                <button
                    type="button"
                    onClick={() => setPreview((value) => !value)}
                    className="rounded-lg border border-white/10 px-4 py-2.5 text-sm text-slate-200 hover:bg-white/5"
                >
                    {preview ? "Hide project preview" : "Preview projects"}
                </button>
                <button
                    type="button"
                    disabled={running}
                    onClick={runMigration}
                    className="rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-semibold text-black hover:bg-amber-300 disabled:opacity-50"
                >
                    {running ? "Importing..." : "Import projects into Supabase"}
                </button>
            </div>

            {preview && (
                <div className="overflow-x-auto rounded-lg border border-white/10">
                    <table className="w-full min-w-[520px] text-left text-sm">
                        <thead className="bg-white/[0.03] text-xs uppercase text-slate-500">
                            <tr>
                                <th className="px-3 py-3">#</th>
                                <th className="px-3 py-3">Project</th>
                                <th className="px-3 py-3">Project key</th>
                                <th className="px-3 py-3">Content blocks</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {projects.map((project, index) => (
                                <tr key={project.project_key}>
                                    <td className="px-3 py-3 text-slate-500">{index + 1}</td>
                                    <td className="px-3 py-3 text-white">{project.title}</td>
                                    <td className="px-3 py-3 text-slate-400">{project.project_key}</td>
                                    <td className="px-3 py-3 text-slate-400">
                                        {getContentBlocks(project).length}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}


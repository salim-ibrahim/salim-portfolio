import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";

const ASSETS_DIR = path.resolve("src/assets");
const BUCKET = "portfolio-media";
const DRY_RUN = process.argv.includes("--dry-run");

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SECRET_KEY
);

const mimeTypes = {
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".mp4": "video/mp4",
    ".pdf": "application/pdf",
};

function getFiles(directory) {
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
        const fullPath = path.join(directory, entry.name);
        return entry.isDirectory() ? getFiles(fullPath) : [fullPath];
    });
}

function getFileType(extension) {
    if ([".jpg", ".jpeg", ".png"].includes(extension)) return "image";
    if (extension === ".mp4") return "video";
    if (extension === ".pdf") return "document";
    return "other";
}

async function migrate() {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SECRET_KEY) {
        throw new Error("Migration environment variables are missing.");
    }

    if (!fs.existsSync(ASSETS_DIR)) {
        throw new Error(`Assets folder not found: ${ASSETS_DIR}`);
    }

    const files = getFiles(ASSETS_DIR).filter(
        file => path.basename(file).toLowerCase() !== "desktop.ini"
    );
    const failures = [];

    console.log(`Mode: ${DRY_RUN ? "DRY RUN — no changes" : "LIVE MIGRATION"}`);
    console.log(`Files found: ${files.length}`);
    console.log(`Storage bucket: ${BUCKET}\n`);

    for (const file of files) {
        const relativePath = path.relative(ASSETS_DIR, file).split(path.sep).join("/");
        const extension = path.extname(file).toLowerCase();
        const mimeType = mimeTypes[extension];

        if (!mimeType) {
            failures.push({ file: relativePath, error: "Unsupported file type" });
            continue;
        }

        const stats = fs.statSync(file);
        const fileName = path.basename(file);
        const fileType = getFileType(extension);

        if (DRY_RUN) {
            console.log(
                `[CHECK] ${relativePath} | ${mimeType} | ${(stats.size / 1024 / 1024).toFixed(2)} MB`
            );
            continue;
        }

        try {
            const { error: uploadError } = await supabase.storage
                .from(BUCKET)
                .upload(relativePath, fs.readFileSync(file), {
                    contentType: mimeType,
                    upsert: true,
                    cacheControl: "3600",
                });

            if (uploadError) throw uploadError;

            const { data: existing, error: lookupError } = await supabase
                .from("media_assets")
                .select("id")
                .eq("file_path", relativePath)
                .maybeSingle();

            if (lookupError) throw lookupError;

            if (!existing) {
                const { error: insertError } = await supabase
                    .from("media_assets")
                    .insert({
                        file_name: fileName,
                        original_name: fileName,
                        file_path: relativePath,
                        bucket_name: BUCKET,
                        file_type: fileType,
                        mime_type: mimeType,
                        file_size: stats.size,
                        is_public: true,
                    });

                if (insertError) throw insertError;
            }

            console.log(`[OK] ${relativePath}`);
        } catch (error) {
            failures.push({
                file: relativePath,
                error: error.message,
            });
            console.error(`[FAILED] ${relativePath}: ${error.message}`);
        }
    }

    console.log("\n--- Migration summary ---");
    console.log(`Files scanned: ${files.length}`);

    if (DRY_RUN) {
        console.log("Dry run complete. No files or database records were changed.");
    } else {
        console.log(`Failures: ${failures.length}`);
        console.log(`Successful uploads: ${files.length - failures.length}`);
    }

    if (failures.length) {
        fs.writeFileSync(
            "media-migration-errors.json",
            JSON.stringify(failures, null, 2)
        );
        process.exitCode = 1;
    }
}

migrate().catch(error => {
    console.error("Migration stopped:", error.message);
    process.exitCode = 1;
});

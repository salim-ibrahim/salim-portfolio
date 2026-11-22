
import { supabase } from "./supabase";

const BUCKET_NAME = "portfolio-media";

/**
 * Retrieve media records from the database.
 */
export async function fetchMediaAssets() {
    const { data, error } = await supabase
        .from("media_assets")
        .select("*")
        .order("uploaded_at", { ascending: false });

    if (error) {
        throw new Error(`Unable to fetch media assets: ${error.message}`);
    }

    return data ?? [];
}

/**
 * Generate the public URL for a stored media file.
 */
export function getMediaPublicUrl(media) {
    if (!media?.file_path) {
        return null;
    }

    const bucket = media.bucket_name || BUCKET_NAME;

    const { data } = supabase.storage
        .from(bucket)
        .getPublicUrl(media.file_path);

    return data?.publicUrl ?? null;
}

/**
 * Determine the media category from its MIME type.
 */
function getMediaType(file) {
    if (file.type.startsWith("image/")) return "image";
    if (file.type.startsWith("video/")) return "video";

    return "document";
}

/**
 * Upload a file to Supabase Storage and register its metadata.
 */
export async function uploadMediaFile(file, folder = "uploads") {
    if (!file) {
        throw new Error("Please select a file to upload.");
    }

    const safeFolder = folder
        .trim()
        .replace(/^\/+|\/+$/g, "");

    const safeFileName = file.name.replace(
        /[^a-zA-Z0-9._-]/g,
        "_"
    );

    const uniqueFileName = `${crypto.randomUUID()}-${safeFileName}`;

    const filePath = safeFolder
        ? `${safeFolder}/${uniqueFileName}`
        : uniqueFileName;

    const { data: uploadData, error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
            contentType: file.type || "application/octet-stream",
        });

    if (uploadError) {
        throw new Error(`File upload failed: ${uploadError.message}`);
    }

    const metadata = {
        file_name: uniqueFileName,
        original_name: file.name,
        file_path: uploadData.path,
        bucket_name: BUCKET_NAME,
        file_type: getMediaType(file),
        mime_type: file.type || null,
        file_size: file.size,
        is_public: true,
    };

    const { data: mediaRecord, error: metadataError } = await supabase
        .from("media_assets")
        .insert(metadata)
        .select()
        .single();

    if (metadataError) {
        const { error: cleanupError } = await supabase.storage
            .from(BUCKET_NAME)
            .remove([uploadData.path]);

        if (cleanupError) {
            throw new Error(
                `Metadata registration failed: ${metadataError.message}. Storage cleanup also failed: ${cleanupError.message}`
            );
        }

        throw new Error(
            `Metadata registration failed: ${metadataError.message}. Uploaded file was removed from Storage.`
        );
    }

    return mediaRecord;
}

/**
 * Update editable media metadata without changing the stored file.
 */
export async function updateMediaAsset(id, updates) {
    const allowedFields = ["original_name", "alt_text", "caption"];

    const metadata = Object.fromEntries(
        Object.entries(updates).filter(([key]) =>
            allowedFields.includes(key)
        )
    );

    const { data, error } = await supabase
        .from("media_assets")
        .update(metadata)
        .eq("id", id)
        .select()
        .single();

    if (error) {
        throw new Error(`Unable to update media details: ${error.message}`);
    }

    return data;
}

/**
 * Delete a media database record first, then its Storage file.
 *
 * Foreign-key references are configured with ON DELETE SET NULL,
 * so associated portfolio records remain intact.
 */
export async function deleteMediaAsset(media) {
    if (!media?.id || !media?.file_path) {
        throw new Error("Invalid media asset. Cannot delete.");
    }

    const bucket = media.bucket_name || BUCKET_NAME;

    // Delete the database record first.
    const { data, error: databaseError } = await supabase
        .from("media_assets")
        .delete()
        .eq("id", media.id)
        .select("id");

    if (databaseError) {
        throw new Error(
            `Unable to delete media record: ${databaseError.message}`
        );
    }

    if (!data || data.length === 0) {
        throw new Error(
            "The media record was not deleted. Please refresh the library and try again."
        );
    }

    // Remove the stored file after the database deletion succeeds.
    const { error: storageError } = await supabase.storage
        .from(bucket)
        .remove([media.file_path]);

    if (storageError) {
        throw new Error(
            `The media record and its portfolio references were deleted successfully, but the Storage file could not be removed: ${storageError.message}. The file may need manual cleanup.`
        );
    }

    return true;
}

import { useEffect, useState } from "react";
import {
    Image,
    FileText,
    Film,
    RefreshCw,
    Search,
    FolderOpen,
    X,
    Upload,
    CheckCircle2,
    Copy,
    Pencil,
    Trash2,
} from "lucide-react";
import { fetchMediaAssets, getMediaPublicUrl, uploadMediaFile, updateMediaAsset, deleteMediaAsset } from "../lib/media";

function formatFileSize(bytes) {
    if (!bytes) return "0 KB";

    return bytes >= 1024 * 1024
        ? `${(bytes / (1024 * 1024)).toFixed(2)} MB`
        : `${(bytes / 1024).toFixed(1)} KB`;
}

function getFolder(filePath) {
    if (!filePath || !filePath.includes("/")) return "Root";

    return filePath.substring(0, filePath.lastIndexOf("/"));
}

function MediaLibrary() {
    const [media, setMedia] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [search, setSearch] = useState("");
    const [typeFilter, setTypeFilter] = useState("all");
    const [folderFilter, setFolderFilter] = useState("all");
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [uploadFolder, setUploadFolder] = useState("uploads");
    const [uploading, setUploading] = useState(false);
    const [uploadMessage, setUploadMessage] = useState("");
    const [uploadError, setUploadError] = useState("");
    const [selectedMedia, setSelectedMedia] = useState(null);
    const [copiedUrl, setCopiedUrl] = useState(false);
    const [editingMedia, setEditingMedia] = useState(null);
    const [editForm, setEditForm] = useState({
        original_name: "",
        alt_text: "",
        caption: "",
    });
    const [savingEdit, setSavingEdit] = useState(false);
    const [editMessage, setEditMessage] = useState("");
    const [editError, setEditError] = useState("");
    const [deletingMedia, setDeletingMedia] = useState(null);
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState("");

    function startEditing(item) {
        setEditingMedia(item);
        setEditForm({
            original_name: item.original_name || "",
            alt_text: item.alt_text || "",
            caption: item.caption || "",
        });
        setEditMessage("");
        setEditError("");
    }

    async function handleSaveEdit() {
        if (!editingMedia) return;

        if (!editForm.original_name.trim()) {
            setEditError("Please enter a file display name.");
            return;
        }

        try {
            setSavingEdit(true);
            setEditError("");
            setEditMessage("");

            const updated = await updateMediaAsset(editingMedia.id, {
                ...editForm,
                original_name: editForm.original_name.trim(),
                alt_text: editForm.alt_text.trim(),
                caption: editForm.caption.trim(),
            });

            setMedia((current) =>
                current.map((item) =>
                    item.id === updated.id ? updated : item
                )
            );

            if (selectedMedia?.id === updated.id) {
                setSelectedMedia(updated);
            }

            setEditingMedia(null);
            setEditMessage("Media details updated successfully.");
        } catch (err) {
            setEditError(err.message || "Unable to update media details.");
        } finally {
            setSavingEdit(false);
        }
    }

    async function handleDeleteMedia() {
        if (!deletingMedia) return;

        try {
            setDeleting(true);
            setDeleteError("");

            await deleteMediaAsset(deletingMedia);

            setMedia((current) =>
                current.filter((item) => item.id !== deletingMedia.id)
            );

            if (selectedMedia?.id === deletingMedia.id) {
                setSelectedMedia(null);
            }

            setDeletingMedia(null);
        } catch (err) {
            setDeleteError(
                err.message || "Unable to delete media asset."
            );
        } finally {
            setDeleting(false);
        }
    }

    async function handleCopyUrl() {
        const publicUrl = selectedMedia
            ? getMediaPublicUrl(selectedMedia)
            : null;

        if (!publicUrl) return;

        try {
            await navigator.clipboard.writeText(publicUrl);
            setCopiedUrl(true);
        } catch {
            setUploadError("Unable to copy the URL. Please copy it manually.");
        }
    }
    async function loadMedia() {
        try {
            setLoading(true);
            setError("");

            const records = await fetchMediaAssets();
            setMedia(records);
        } catch (err) {
            setError(err.message || "Unable to load media.");
        } finally {
            setLoading(false);
        }
    }

    async function handleUpload() {
        if (selectedFiles.length === 0) {
            setUploadError("Please select at least one file.");
            return;
        }

        try {
            setUploading(true);
            setUploadError("");
            setUploadMessage("");

            let successful = 0;
            const failures = [];

            for (const file of selectedFiles) {
                try {
                    await uploadMediaFile(file, uploadFolder);
                    successful++;
                } catch (err) {
                    failures.push(`${file.name}: ${err.message}`);
                }
            }

            if (successful > 0) {
                await loadMedia();
                setSelectedFiles([]);
            }

            if (failures.length > 0) {
                setUploadError(
                    `${successful} file(s) uploaded successfully. ${failures.length} failed: ${failures.join(" | ")}`
                );
            } else {
                setUploadMessage(
                    `Successfully uploaded ${successful} file(s).`
                );
            }
        } catch (err) {
            setUploadError(err.message || "Upload failed.");
        } finally {
            setUploading(false);
        }
    }

    useEffect(() => {
        loadMedia();
    }, []);

    const imageCount = media.filter((item) => item.file_type === "image").length;
    const documentCount = media.filter((item) => item.file_type === "document").length;
    const videoCount = media.filter((item) => item.file_type === "video").length;

    const folders = [
        ...new Set(media.map((item) => getFolder(item.file_path))),
    ].sort();

    const filteredMedia = media.filter((item) => {
        const searchText = search.trim().toLowerCase();

        const matchesSearch =
            !searchText ||
            [
                item.original_name,
                item.file_name,
                item.file_path,
                item.alt_text,
                item.caption,
            ].some((value) => value?.toLowerCase().includes(searchText));

        const matchesType =
            typeFilter === "all" || item.file_type === typeFilter;

        const matchesFolder =
            folderFilter === "all" ||
            getFolder(item.file_path) === folderFilter;

        return matchesSearch && matchesType && matchesFolder;
    });

    function clearFilters() {
        setSearch("");
        setTypeFilter("all");
        setFolderFilter("all");
    }

    const hasActiveFilters =
        search.trim() !== "" ||
        typeFilter !== "all" ||
        folderFilter !== "all";

    return (
        <div className="space-y-8">
            <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h2 className="text-2xl font-semibold text-white">
                        Media Library
                    </h2>
                    <p className="mt-2 text-sm text-slate-400">
                        Manage images, documents and other files used across your portfolio.
                    </p>
                </div>

                <button
                    type="button"
                    onClick={loadMedia}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
                >
                    <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    Refresh
                </button>
            </section>

            <section className="rounded-2xl border border-white/[0.07] bg-[#11151f] p-5">
                <div className="mb-5">
                    <h3 className="text-lg font-semibold text-white">
                        Upload Media
                    </h3>
                    <p className="mt-1 text-sm text-slate-400">
                        Add images, documents and videos to your portfolio media library.
                    </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-2 block text-sm text-slate-300">
                            Select files
                        </label>
                        <input
                            type="file"
                            multiple
                            onChange={(event) =>
                                setSelectedFiles(Array.from(event.target.files || []))
                            }
                            className="block w-full rounded-xl border border-white/10 bg-[#090c13] p-3 text-sm text-slate-300 file:mr-4 file:rounded-lg file:border-0 file:bg-violet-500/15 file:px-3 file:py-2 file:text-sm file:font-medium file:text-violet-300"
                        />
                        <p className="mt-2 text-xs text-slate-500">
                            {selectedFiles.length} file(s) selected
                        </p>
                    </div>

                    <div>
                        <label className="mb-2 block text-sm text-slate-300">
                            Storage folder
                        </label>
                        <input
                            type="text"
                            value={uploadFolder}
                            onChange={(event) => setUploadFolder(event.target.value)}
                            placeholder="e.g. projects, about, documents"
                            className="w-full rounded-xl border border-white/10 bg-[#090c13] px-4 py-3 text-sm text-white outline-none focus:border-violet-500"
                        />
                        <p className="mt-2 text-xs text-slate-500">
                            Files will be organised under this folder.
                        </p>
                    </div>
                </div>

                {selectedFiles.length > 0 && (
                    <div className="mt-4 rounded-xl bg-[#090c13] p-3">
                        <p className="mb-2 text-xs font-medium text-slate-400">
                            Selected files
                        </p>
                        <div className="space-y-1">
                            {selectedFiles.map((file, index) => (
                                <p
                                    key={`${file.name}-${index}`}
                                    className="truncate text-sm text-slate-300"
                                >
                                    {file.name}
                                </p>
                            ))}
                        </div>
                    </div>
                )}

                {uploadMessage && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-emerald-400">
                        <CheckCircle2 size={17} />
                        {uploadMessage}
                    </div>
                )}

                {uploadError && (
                    <p className="mt-4 text-sm text-red-400">
                        {uploadError}
                    </p>
                )}

                <div className="mt-5 flex justify-end">
                    <button
                        type="button"
                        onClick={handleUpload}
                        disabled={uploading || selectedFiles.length === 0}
                        className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <Upload size={16} />
                        {uploading ? "Uploading..." : "Upload Files"}
                    </button>
                </div>
            </section>
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                    { label: "Total Assets", value: media.length, icon: Image },
                    { label: "Images", value: imageCount, icon: Image },
                    { label: "Documents", value: documentCount, icon: FileText },
                    { label: "Videos", value: videoCount, icon: Film },
                ].map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <div
                            key={stat.label}
                            className="rounded-2xl border border-white/[0.07] bg-[#11151f] p-5"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-slate-400">
                                    {stat.label}
                                </span>
                                <Icon size={19} className="text-violet-400" />
                            </div>
                            <p className="mt-5 text-3xl font-semibold text-white">
                                {loading ? "ÃƒÆ’Ã†â€™Ãƒâ€ Ã¢â‚¬â„¢ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â‚¬Å¡Ã‚Â¬Ãƒâ€¦Ã‚Â¡ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã†â€™Ãƒâ€šÃ‚Â¢ÃƒÆ’Ã‚Â¢ÃƒÂ¢Ã¢â€šÂ¬Ã…Â¡Ãƒâ€šÃ‚Â¬ÃƒÆ’Ã¢â‚¬Å¡Ãƒâ€šÃ‚Â" : stat.value}
                            </p>
                        </div>
                    );
                })}
            </section>

            {error && (
                <div className="rounded-xl border border-red-400/20 bg-red-400/5 p-4 text-sm text-red-300">
                    {error}
                </div>
            )}

            {loading ? (
                <div className="rounded-2xl border border-white/[0.07] bg-[#11151f] p-12 text-center text-sm text-slate-400">
                    Loading your media library...
                </div>
            ) : media.length === 0 && !error ? (
                <div className="rounded-2xl border border-white/[0.07] bg-[#11151f] p-12 text-center">
                    <Image size={32} className="mx-auto text-slate-500" />
                    <p className="mt-4 text-sm text-slate-300">
                        No media assets found.
                    </p>
                </div>
            ) : (
                <section>
                    <div className="mb-5">
                        <div className="mb-4 flex flex-col gap-3 lg:flex-row">
                            <div className="relative flex-1">
                                <Search
                                    size={17}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                                />
                                <input
                                    type="search"
                                    value={search}
                                    onChange={(event) => setSearch(event.target.value)}
                                    placeholder="Search files by name, path or description..."
                                    className="w-full rounded-xl border border-white/10 bg-[#11151f] py-3 pl-10 pr-4 text-sm text-white outline-none transition placeholder:text-slate-500 focus:border-violet-500/50"
                                />
                            </div>

                            <select
                                value={typeFilter}
                                onChange={(event) => setTypeFilter(event.target.value)}
                                className="rounded-xl border border-white/10 bg-[#11151f] px-4 py-3 text-sm text-slate-300 outline-none focus:border-violet-500/50"
                            >
                                <option value="all">All file types</option>
                                <option value="image">Images</option>
                                <option value="document">Documents</option>
                                <option value="video">Videos</option>
                            </select>

                            <select
                                value={folderFilter}
                                onChange={(event) => setFolderFilter(event.target.value)}
                                className="rounded-xl border border-white/10 bg-[#11151f] px-4 py-3 text-sm text-slate-300 outline-none focus:border-violet-500/50"
                            >
                                <option value="all">All folders</option>
                                {folders.map((folder) => (
                                    <option key={folder} value={folder}>
                                        {folder}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div className="flex items-center gap-2 text-xs text-slate-400">
                                <FolderOpen size={15} />
                                Showing {filteredMedia.length} of {media.length} files
                            </div>

                            {hasActiveFilters && (
                                <button
                                    type="button"
                                    onClick={clearFilters}
                                    className="inline-flex items-center gap-1.5 text-xs text-violet-400 transition hover:text-violet-300"
                                >
                                    <X size={14} />
                                    Clear filters
                                </button>
                            )}
                        </div>
                    </div>

                    {filteredMedia.length === 0 ? (
                        <div className="rounded-2xl border border-white/[0.07] bg-[#11151f] p-12 text-center">
                            <Search size={30} className="mx-auto text-slate-500" />
                            <p className="mt-4 text-sm text-slate-300">
                                No matching files found.
                            </p>
                            <p className="mt-2 text-xs text-slate-500">
                                Try changing your search or filters.
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                            {filteredMedia.map((item) => {
                                const publicUrl = getMediaPublicUrl(item);

                                return (
                                    <article
                                        key={item.id}
                                        onClick={() => setSelectedMedia(item)}
                                        role="button"
                                        tabIndex={0}
                                        onKeyDown={(event) => {
                                            if (event.key === "Enter" || event.key === " ") {
                                                event.preventDefault();
                                                setSelectedMedia(item);
                                            }
                                        }}
                                        className="cursor-pointer overflow-hidden rounded-xl border border-white/[0.07] bg-[#11151f] transition hover:border-violet-500/50"
                                    >
                                        <div className="flex aspect-square items-center justify-center overflow-hidden bg-[#090c13]">
                                            {item.file_type === "image" && publicUrl ? (
                                                <img
                                                    src={publicUrl}
                                                    alt={item.alt_text || item.original_name}
                                                    loading="lazy"
                                                    className="h-full w-full object-contain"
                                                />
                                            ) : (
                                                <FileText size={36} className="text-slate-500" />
                                            )}
                                        </div>

                                        <div className="p-3">
                                            <p className="truncate text-xs font-medium text-slate-200">
                                                {item.original_name}
                                            </p>
                                            <p className="mt-1 text-[11px] text-slate-500">
                                                {item.file_type} | {formatFileSize(item.file_size)}
                                            </p>
                                            <p className="mt-1 truncate text-[10px] text-slate-600">
                                                {item.file_path}
                                            </p>

                                            <button
                                                type="button"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    startEditing(item);
                                                }}
                                                className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-slate-300 transition hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-violet-300"
                                            >
                                                <Pencil size={13} />
                                                Edit details
                                            </button>
                                            <button
                                                type="button"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    setDeletingMedia(item);
                                                    setDeleteError("");
                                                }}
                                                className="mt-3 ml-2 inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 px-3 py-1.5 text-xs font-medium text-red-300 transition hover:bg-red-500/10"
                                            >
                                                <Trash2 size={13} />
                                                Delete
                                            </button>
                                        </div>
                                    </article>
                                );
                            })}
                        </div>
                    )}
                </section>
            )}
            {selectedMedia && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
                    onClick={() => setSelectedMedia(null)}
                >
                    <div
                        className="flex max-h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-[#11151f] shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-center justify-between gap-4 border-b border-white/10 p-4">
                            <div className="min-w-0">
                                <h3 className="truncate text-sm font-semibold text-white">
                                    {selectedMedia.original_name}
                                </h3>
                                <p className="mt-1 text-xs text-slate-400">
                                    {selectedMedia.file_type} | {formatFileSize(selectedMedia.file_size)}
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedMedia(null)}
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                                aria-label="Close preview"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <div className="flex min-h-[300px] flex-1 items-center justify-center overflow-auto bg-[#090c13] p-4">
                            {selectedMedia.file_type === "image" ? (
                                <img
                                    src={getMediaPublicUrl(selectedMedia)}
                                    alt={selectedMedia.alt_text || selectedMedia.original_name}
                                    className="max-h-[65vh] max-w-full object-contain"
                                />
                            ) : selectedMedia.file_type === "video" ? (
                                <video
                                    src={getMediaPublicUrl(selectedMedia)}
                                    controls
                                    autoPlay
                                    className="max-h-[65vh] max-w-full"
                                >
                                    Your browser does not support video playback.
                                </video>
                            ) : (
                                <iframe
                                    src={getMediaPublicUrl(selectedMedia)}
                                    title={selectedMedia.original_name}
                                    className="h-[65vh] w-full rounded-lg bg-white"
                                />
                            )}
                        </div>

                        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 p-4">
                            <p className="truncate text-xs text-slate-500">
                                {selectedMedia.file_path}
                            </p>

                            <div className="flex shrink-0 items-center gap-2">
    <button
        type="button"
        onClick={handleCopyUrl}
        className="inline-flex items-center gap-2 rounded-lg border border-white/10 px-4 py-2 text-xs font-medium text-slate-200 transition hover:bg-white/5"
    >
        <Copy size={14} />
        {copiedUrl ? "Copied!" : "Copy URL"}
    </button>

    <a
        href={getMediaPublicUrl(selectedMedia)}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 rounded-lg bg-violet-600 px-4 py-2 text-xs font-medium text-white transition hover:bg-violet-500"
    >
        Open in new tab
    </a>
</div>
                        </div>
                    </div>
                </div>
            )}

            {editingMedia && (
                <div
                    className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
                    onClick={() => setEditingMedia(null)}
                >
                    <div
                        className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#11151f] shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-center justify-between border-b border-white/10 p-5">
                            <div>
                                <h3 className="text-base font-semibold text-white">
                                    Edit media details
                                </h3>
                                <p className="mt-1 text-xs text-slate-400">
                                    Update the information associated with this file.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setEditingMedia(null)}
                                className="rounded-lg p-2 text-slate-400 transition hover:bg-white/10 hover:text-white"
                                aria-label="Close editor"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form
                            onSubmit={(event) => {
                                event.preventDefault();
                                handleSaveEdit();
                            }}
                            className="space-y-5 p-5"
                        >
                            <div>
                                <label className="mb-2 block text-xs font-medium text-slate-300">
                                    Display name
                                </label>
                                <input
                                    type="text"
                                    value={editForm.original_name}
                                    onChange={(event) =>
                                        setEditForm((current) => ({
                                            ...current,
                                            original_name: event.target.value,
                                        }))
                                    }
                                    required
                                    className="w-full rounded-xl border border-white/10 bg-[#090c13] px-4 py-3 text-sm text-white outline-none focus:border-violet-500/50"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-medium text-slate-300">
                                    Alt text
                                </label>
                                <input
                                    type="text"
                                    value={editForm.alt_text}
                                    onChange={(event) =>
                                        setEditForm((current) => ({
                                            ...current,
                                            alt_text: event.target.value,
                                        }))
                                    }
                                    placeholder="Describe the image for accessibility..."
                                    className="w-full rounded-xl border border-white/10 bg-[#090c13] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500/50"
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-xs font-medium text-slate-300">
                                    Caption
                                </label>
                                <textarea
                                    rows={3}
                                    value={editForm.caption}
                                    onChange={(event) =>
                                        setEditForm((current) => ({
                                            ...current,
                                            caption: event.target.value,
                                        }))
                                    }
                                    placeholder="Add a caption or additional context..."
                                    className="w-full resize-y rounded-xl border border-white/10 bg-[#090c13] px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-violet-500/50"
                                />
                            </div>

                            {editError && (
                                <p className="text-xs text-red-400">
                                    {editError}
                                </p>
                            )}

                            <div className="flex justify-end gap-3 border-t border-white/10 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setEditingMedia(null)}
                                    disabled={savingEdit}
                                    className="rounded-lg border border-white/10 px-4 py-2.5 text-xs font-medium text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={savingEdit}
                                    className="rounded-lg bg-violet-600 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {savingEdit ? "Saving..." : "Save changes"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {deletingMedia && (
                <div
                    className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
                    onClick={() => {
                        if (!deleting) setDeletingMedia(null);
                    }}
                >
                    <div
                        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#11151f] p-6 shadow-2xl"
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="flex items-center gap-3">
                            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-500/10 text-red-400">
                                <Trash2 size={21} />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-white">
                                    Delete media file?
                                </h2>
                                <p className="text-xs text-slate-500">
                                    Permanent deletion
                                </p>
                            </div>
                        </div>

                        <p className="mt-5 text-sm leading-6 text-slate-300">
                            Are you sure you want to permanently delete
                            <span className="font-semibold text-white">
                                {" "}{deletingMedia.original_name || deletingMedia.file_name}
                            </span>
                            ? This will remove the stored file and its database record.
                            This action cannot be undone.
                        </p>

                        {deleteError && (
                            <p className="mt-4 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-300">
                                {deleteError}
                            </p>
                        )}

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setDeletingMedia(null)}
                                disabled={deleting}
                                className="rounded-lg border border-white/10 px-4 py-2.5 text-xs font-medium text-slate-300 transition hover:bg-white/5 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={handleDeleteMedia}
                                disabled={deleting}
                                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <Trash2 size={14} />
                                {deleting ? "Deleting..." : "Delete permanently"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}

export default MediaLibrary;














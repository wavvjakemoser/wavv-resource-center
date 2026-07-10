/**
 * NativeArticleEditor
 *
 * A Tiptap-based rich text editor modal for creating/editing native (portal-authored)
 * help articles. Admin-only. Source flag is never exposed to customers.
 *
 * Supports two content modes:
 *   - "text"  — Tiptap rich text editor (default)
 *   - "file"  — Upload a PDF/DOCX/XLSX that renders inline in the side panel
 */

import { useState, useEffect } from "react";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Link as LinkIcon,
  Undo,
  Redo,
  Code,
  Quote,
  FileDown,
  CheckCircle2,
  X,
} from "lucide-react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

const ACCENT = "#8B5CF6";

interface NativeArticleEditorProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { title: string; nativeBody: string; sectionName: string; fileUrl?: string | null }) => void;
  isSaving?: boolean;
  sections: string[];
  /** Pre-fill for editing an existing article */
  initial?: {
    title: string;
    nativeBody: string;
    sectionName: string;
    fileUrl?: string | null;
  };
  mode?: "create" | "edit";
}

export default function NativeArticleEditor({
  open,
  onClose,
  onSave,
  isSaving = false,
  sections,
  initial,
  mode = "create",
}: NativeArticleEditorProps) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [sectionName, setSectionName] = useState(initial?.sectionName ?? sections[0] ?? "");
  // "text" = rich text editor, "file" = file attachment
  const [contentMode, setContentMode] = useState<"text" | "file">(
    initial?.fileUrl ? "file" : "text"
  );
  const [attachedFileUrl, setAttachedFileUrl] = useState<string | null>(initial?.fileUrl ?? null);
  const [attachedFileName, setAttachedFileName] = useState<string | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  const uploadFileMutation = trpc.helpArticles.uploadFile.useMutation({
    onError: (e) => toast.error("Upload failed: " + e.message),
  });

  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { class: "text-blue-400 underline" } }),
    ],
    content: initial?.nativeBody ?? "",
    editorProps: {
      attributes: {
        class: "prose prose-invert max-w-none min-h-[200px] px-4 py-3 focus:outline-none text-sm text-gray-200",
      },
    },
  });

  // Reset when modal opens with new initial data
  useEffect(() => {
    if (open) {
      setTitle(initial?.title ?? "");
      setSectionName(initial?.sectionName ?? sections[0] ?? "");
      editor?.commands.setContent(initial?.nativeBody ?? "");
      const hasFile = !!(initial?.fileUrl);
      setContentMode(hasFile ? "file" : "text");
      setAttachedFileUrl(initial?.fileUrl ?? null);
      setAttachedFileName(null);
    }
  }, [open, initial?.title, initial?.nativeBody, initial?.sectionName, initial?.fileUrl]);

  // Sync sectionName default when sections list loads
  useEffect(() => {
    if (!sectionName && sections.length > 0) setSectionName(sections[0]);
  }, [sections]);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 16 * 1024 * 1024) { toast.error("File too large — max 16 MB"); return; }
    const ext = file.name.split(".").pop()?.toLowerCase() ?? "pdf";
    type AllowedMime = "application/pdf" | "application/vnd.openxmlformats-officedocument.wordprocessingml.document" | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    const mimeMap: Record<string, AllowedMime> = {
      pdf: "application/pdf",
      docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };
    const mimeType = mimeMap[ext];
    if (!mimeType) { toast.error("Unsupported format — use PDF, DOCX, or XLSX"); return; }
    setUploadingFile(true);
    try {
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve((reader.result as string).split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const result = await uploadFileMutation.mutateAsync({ base64, mimeType, fileName: file.name });
      setAttachedFileUrl(result.url);
      setAttachedFileName(file.name);
      toast.success("File uploaded successfully");
    } catch { /* handled by onError */ } finally {
      setUploadingFile(false);
      // Reset input so the same file can be re-selected
      e.target.value = "";
    }
  }

  function handleSave() {
    if (!title.trim()) return;
    if (contentMode === "file") {
      if (!attachedFileUrl) { toast.error("Please upload a file or switch to text mode"); return; }
      onSave({ title: title.trim(), nativeBody: " ", sectionName, fileUrl: attachedFileUrl });
    } else {
      const body = editor?.getHTML() ?? "";
      onSave({ title: title.trim(), nativeBody: body || " ", sectionName, fileUrl: null });
    }
  }

  const inputStyle: React.CSSProperties = {
    background: "#111",
    border: "1px solid #2a2a2a",
    borderRadius: "8px",
    color: "#fff",
    padding: "8px 12px",
    fontSize: "13px",
    width: "100%",
    outline: "none",
  };

  function ToolbarButton({
    onClick,
    active,
    title: btnTitle,
    children,
  }: {
    onClick: () => void;
    active?: boolean;
    title: string;
    children: React.ReactNode;
  }) {
    return (
      <button
        type="button"
        onClick={onClick}
        title={btnTitle}
        className="p-1.5 rounded transition"
        style={{
          background: active ? `${ACCENT}25` : "transparent",
          color: active ? ACCENT : "#9ca3af",
          border: "none",
          cursor: "pointer",
        }}
        onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLElement).style.color = "#fff"; }}
        onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLElement).style.color = "#9ca3af"; }}
      >
        {children}
      </button>
    );
  }

  function setLink() {
    const url = window.prompt("Enter URL:", "https://");
    if (url === null) return;
    if (url === "") {
      editor?.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor?.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent
        className="max-w-2xl"
        style={{ background: "#1d2230", border: "1px solid #2a2a2a", maxHeight: "90vh", overflow: "auto" }}
      >
        <DialogHeader>
          <DialogTitle className="text-white flex items-center gap-2">
            {mode === "edit" ? "Edit Article" : "New Help Article"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Title */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Title *</label>
            <input
              style={inputStyle}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Article title"
              autoFocus
            />
          </div>

          {/* Section */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Section *</label>
            {sections.length > 0 ? (
              <select
                style={{ ...inputStyle, cursor: "pointer" }}
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
              >
                {sections.map((s) => (
                  <option key={s} value={s} style={{ background: "#1d2230" }}>
                    {s}
                  </option>
                ))}
              </select>
            ) : (
              <input
                style={inputStyle}
                value={sectionName}
                onChange={(e) => setSectionName(e.target.value)}
                placeholder="Section name (e.g. Dialer Settings)"
              />
            )}
          </div>

          {/* Content mode toggle */}
          <div>
            <label className="block text-xs text-gray-400 mb-2">Content Type</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setContentMode("text")}
                className="flex-1 py-2 rounded-lg text-xs font-semibold transition"
                style={contentMode === "text"
                  ? { background: `${ACCENT}25`, color: ACCENT, border: `1px solid ${ACCENT}50` }
                  : { background: "#111", color: "#6b7280", border: "1px solid #2a2a2a" }}
              >
                Rich Text
              </button>
              <button
                type="button"
                onClick={() => setContentMode("file")}
                className="flex-1 py-2 rounded-lg text-xs font-semibold transition"
                style={contentMode === "file"
                  ? { background: `${ACCENT}25`, color: ACCENT, border: `1px solid ${ACCENT}50` }
                  : { background: "#111", color: "#6b7280", border: "1px solid #2a2a2a" }}
              >
                PDF / File Attachment
              </button>
            </div>
          </div>

          {/* Rich text editor */}
          {contentMode === "text" && (
            <div>
              <label className="block text-xs text-gray-400 mb-1">Content</label>
              <div
                className="rounded-xl overflow-hidden"
                style={{ border: "1px solid #2a2a2a" }}
              >
                {/* Toolbar */}
                <div
                  className="flex items-center flex-wrap gap-0.5 px-2 py-1.5"
                  style={{ background: "#161b27", borderBottom: "1px solid #2a2a2a" }}
                >
                  <ToolbarButton
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                    active={editor?.isActive("bold")}
                    title="Bold"
                  >
                    <Bold size={14} />
                  </ToolbarButton>
                  <ToolbarButton
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                    active={editor?.isActive("italic")}
                    title="Italic"
                  >
                    <Italic size={14} />
                  </ToolbarButton>
                  <ToolbarButton
                    onClick={() => editor?.chain().focus().toggleUnderline().run()}
                    active={editor?.isActive("underline")}
                    title="Underline"
                  >
                    <UnderlineIcon size={14} />
                  </ToolbarButton>
                  <div className="w-px h-4 mx-1" style={{ background: "#2a2a2a" }} />
                  <ToolbarButton
                    onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                    active={editor?.isActive("heading", { level: 2 })}
                    title="Heading 2"
                  >
                    <Heading2 size={14} />
                  </ToolbarButton>
                  <ToolbarButton
                    onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
                    active={editor?.isActive("heading", { level: 3 })}
                    title="Heading 3"
                  >
                    <Heading3 size={14} />
                  </ToolbarButton>
                  <div className="w-px h-4 mx-1" style={{ background: "#2a2a2a" }} />
                  <ToolbarButton
                    onClick={() => editor?.chain().focus().toggleBulletList().run()}
                    active={editor?.isActive("bulletList")}
                    title="Bullet list"
                  >
                    <List size={14} />
                  </ToolbarButton>
                  <ToolbarButton
                    onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                    active={editor?.isActive("orderedList")}
                    title="Numbered list"
                  >
                    <ListOrdered size={14} />
                  </ToolbarButton>
                  <ToolbarButton
                    onClick={() => editor?.chain().focus().toggleBlockquote().run()}
                    active={editor?.isActive("blockquote")}
                    title="Blockquote"
                  >
                    <Quote size={14} />
                  </ToolbarButton>
                  <ToolbarButton
                    onClick={() => editor?.chain().focus().toggleCode().run()}
                    active={editor?.isActive("code")}
                    title="Inline code"
                  >
                    <Code size={14} />
                  </ToolbarButton>
                  <div className="w-px h-4 mx-1" style={{ background: "#2a2a2a" }} />
                  <ToolbarButton onClick={setLink} active={editor?.isActive("link")} title="Add link">
                    <LinkIcon size={14} />
                  </ToolbarButton>
                  <div className="w-px h-4 mx-1" style={{ background: "#2a2a2a" }} />
                  <ToolbarButton
                    onClick={() => editor?.chain().focus().undo().run()}
                    title="Undo"
                  >
                    <Undo size={14} />
                  </ToolbarButton>
                  <ToolbarButton
                    onClick={() => editor?.chain().focus().redo().run()}
                    title="Redo"
                  >
                    <Redo size={14} />
                  </ToolbarButton>
                </div>
                {/* Editor area */}
                <div style={{ background: "#111", minHeight: "200px" }}>
                  <EditorContent editor={editor} />
                </div>
              </div>
            </div>
          )}

          {/* File attachment */}
          {contentMode === "file" && (
            <div>
              <label className="block text-xs text-gray-400 mb-2">
                File Attachment <span className="text-gray-600 ml-1">(PDF renders inline in the side panel; DOCX/XLSX open in a new tab)</span>
              </label>
              <div
                className="rounded-xl p-4 space-y-3"
                style={{ background: "#111", border: "1px solid #2a2a2a" }}
              >
                {/* Current attachment */}
                {attachedFileUrl ? (
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: "#1d2230", border: "1px solid #2a2a2a" }}>
                    <CheckCircle2 size={14} style={{ color: "#67C728", flexShrink: 0 }} />
                    <span className="text-xs text-green-400 flex-1 truncate">
                      {attachedFileName ?? "File attached"}
                    </span>
                    <a
                      href={attachedFileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-400 hover:underline flex-shrink-0"
                    >
                      Preview
                    </a>
                    <button
                      type="button"
                      onClick={() => { setAttachedFileUrl(null); setAttachedFileName(null); }}
                      className="text-gray-600 hover:text-red-400 transition flex-shrink-0"
                      title="Remove attachment"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-gray-600">No file attached yet</p>
                )}

                {/* Upload button */}
                <label
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition hover:opacity-90 w-fit"
                  style={{
                    background: uploadingFile ? "#252d3d" : "#1d2230",
                    border: "1px solid #3a3a3a",
                    color: uploadingFile ? "#9ca3af" : "#fff",
                  }}
                >
                  {uploadingFile ? (
                    <><span className="animate-spin w-3 h-3 border border-gray-400 border-t-transparent rounded-full inline-block" /> Uploading...</>
                  ) : (
                    <><FileDown size={13} /> {attachedFileUrl ? "Replace File" : "Choose File"}</>
                  )}
                  <input
                    type="file"
                    accept=".pdf,.docx,.xlsx"
                    className="hidden"
                    onChange={handleFileChange}
                    disabled={uploadingFile}
                  />
                </label>

                <p className="text-xs text-gray-600">Supported formats: PDF, DOCX, XLSX · Max 16 MB</p>
              </div>
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose} className="text-gray-400">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || uploadingFile || !title.trim() || (contentMode === "file" && !attachedFileUrl)}
            style={{ background: ACCENT, color: "#fff" }}
          >
            {isSaving ? "Saving…" : mode === "edit" ? "Save Changes" : "Publish Article"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

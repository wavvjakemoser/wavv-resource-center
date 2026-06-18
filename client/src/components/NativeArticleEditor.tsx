/**
 * NativeArticleEditor
 *
 * A Tiptap-based rich text editor modal for creating/editing native (portal-authored)
 * help articles. Admin-only. Source flag is never exposed to customers.
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
} from "lucide-react";

const ACCENT = "#8B5CF6";

interface NativeArticleEditorProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: { title: string; nativeBody: string; sectionName: string }) => void;
  isSaving?: boolean;
  sections: string[];
  /** Pre-fill for editing an existing article */
  initial?: {
    title: string;
    nativeBody: string;
    sectionName: string;
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
    }
  }, [open, initial?.title, initial?.nativeBody, initial?.sectionName]);

  // Sync sectionName default when sections list loads
  useEffect(() => {
    if (!sectionName && sections.length > 0) setSectionName(sections[0]);
  }, [sections]);

  function handleSave() {
    const body = editor?.getHTML() ?? "";
    if (!title.trim() || !body.trim() || body === "<p></p>") return;
    onSave({ title: title.trim(), nativeBody: body, sectionName });
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
            {mode === "edit" ? "Edit Article" : "New Native Article"}
            <span
              className="text-xs px-2 py-0.5 rounded-full font-semibold"
              style={{ background: `${ACCENT}20`, color: ACCENT }}
            >
              Admin Only
            </span>
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

          {/* Rich text editor */}
          <div>
            <label className="block text-xs text-gray-400 mb-1">Content *</label>
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
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={onClose} className="text-gray-400">
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !title.trim()}
            style={{ background: ACCENT, color: "#fff" }}
          >
            {isSaving ? "Saving…" : mode === "edit" ? "Save Changes" : "Publish Article"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

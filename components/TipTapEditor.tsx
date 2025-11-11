"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading2,
  Heading3,
  Quote,
  Undo,
  Redo,
} from "lucide-react";

interface TipTapEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

export default function TipTapEditor({
  content,
  onChange,
  placeholder = "Escribe el contenido del post aquí...",
}: TipTapEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder,
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "prose prose-lg max-w-none focus:outline-none min-h-[400px] p-4 border-4 border-black bg-white",
      },
    },
  });

  if (!editor) {
    return null;
  }

  return (
    <div className="border-4 border-black bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-2 border-b-4 border-black bg-gray-50 p-3">
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`rounded border-2 border-black p-2 transition-all hover:bg-gray-100 ${
            editor.isActive("bold") ? "bg-red-600 text-white" : "bg-white"
          }`}
          title="Negrita"
        >
          <Bold className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`rounded border-2 border-black p-2 transition-all hover:bg-gray-100 ${
            editor.isActive("italic") ? "bg-red-600 text-white" : "bg-white"
          }`}
          title="Cursiva"
        >
          <Italic className="h-4 w-4" />
        </button>

        <div className="h-8 w-px bg-black" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          className={`rounded border-2 border-black px-3 py-2 font-bold transition-all hover:bg-gray-100 ${
            editor.isActive("heading", { level: 2 })
              ? "bg-red-600 text-white"
              : "bg-white"
          }`}
          title="Título 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          className={`rounded border-2 border-black px-3 py-2 font-bold transition-all hover:bg-gray-100 ${
            editor.isActive("heading", { level: 3 })
              ? "bg-red-600 text-white"
              : "bg-white"
          }`}
          title="Título 3"
        >
          H3
        </button>

        <div className="h-8 w-px bg-black" />

        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`rounded border-2 border-black p-2 transition-all hover:bg-gray-100 ${
            editor.isActive("bulletList") ? "bg-red-600 text-white" : "bg-white"
          }`}
          title="Lista"
        >
          <List className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`rounded border-2 border-black p-2 transition-all hover:bg-gray-100 ${
            editor.isActive("orderedList") ? "bg-red-600 text-white" : "bg-white"
          }`}
          title="Lista numerada"
        >
          <ListOrdered className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          className={`rounded border-2 border-black p-2 transition-all hover:bg-gray-100 ${
            editor.isActive("blockquote") ? "bg-red-600 text-white" : "bg-white"
          }`}
          title="Cita"
        >
          <Quote className="h-4 w-4" />
        </button>

        <div className="h-8 w-px bg-black" />

        <button
          type="button"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="rounded border-2 border-black bg-white p-2 transition-all hover:bg-gray-100 disabled:opacity-50"
          title="Deshacer"
        >
          <Undo className="h-4 w-4" />
        </button>
        <button
          type="button"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="rounded border-2 border-black bg-white p-2 transition-all hover:bg-gray-100 disabled:opacity-50"
          title="Rehacer"
        >
          <Redo className="h-4 w-4" />
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}

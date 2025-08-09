"use client"

import * as React from "react"
import { EditorContent, EditorContext, useEditor } from "@tiptap/react"

// --- Tiptap Core Extensions ---
import { StarterKit } from "@tiptap/starter-kit"
import { Image } from "@tiptap/extension-image"
import { TaskItem, TaskList } from "@tiptap/extension-list"
import { TextAlign } from "@tiptap/extension-text-align"
import { Typography } from "@tiptap/extension-typography"
import { Highlight } from "@tiptap/extension-highlight"
import { Subscript } from "@tiptap/extension-subscript"
import { Superscript } from "@tiptap/extension-superscript"

// --- UI Primitives ---
import { Button } from "@/components/tiptap-ui-primitive/button"
import { Button as UIButton } from "@/components/ui/button"
import {
  Toolbar,
  ToolbarGroup,
  ToolbarSeparator,
} from "@/components/tiptap-ui-primitive/toolbar"

// --- Tiptap Node ---
import { ImageUploadNode } from "@/components/tiptap-node/image-upload-node/image-upload-node-extension"
import { HorizontalRule } from "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension"

// --- Tiptap UI ---
import { HeadingDropdownMenu } from "@/components/tiptap-ui/heading-dropdown-menu"
import { ImageUploadButton } from "@/components/tiptap-ui/image-upload-button"
import { ListDropdownMenu } from "@/components/tiptap-ui/list-dropdown-menu"
import { BlockquoteButton } from "@/components/tiptap-ui/blockquote-button"
import { CodeBlockButton } from "@/components/tiptap-ui/code-block-button"
import { MarkButton } from "@/components/tiptap-ui/mark-button"
import { TextAlignButton } from "@/components/tiptap-ui/text-align-button"
import { UndoRedoButton } from "@/components/tiptap-ui/undo-redo-button"
import { LinkPopover } from "@/components/tiptap-ui/link-popover"
import { KeyboardShortcutsHelp } from "./keyboard-shortcuts-help"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { HelpCircle } from "lucide-react"

// Import the styles
import "@/components/tiptap-node/blockquote-node/blockquote-node.scss"
import "@/components/tiptap-node/code-block-node/code-block-node.scss"
import "@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss"
import "@/components/tiptap-node/list-node/list-node.scss"
import "@/components/tiptap-node/image-node/image-node.scss"
import "@/components/tiptap-node/heading-node/heading-node.scss"
import "@/components/tiptap-node/paragraph-node/paragraph-node.scss"
import styles from "./form-editor.module.css"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB

// Real image upload function
const handleImageUpload = async (file: File): Promise<string> => {
  try {
    // 构建 API URL
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000');
    
    // 上传文件到服务器
    const response = await fetch(`${baseUrl}/api/upload/image?filename=${encodeURIComponent(file.name)}`, {
      method: 'POST',
      credentials: 'include',
      body: file,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || 'Failed to upload image');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

interface FormEditorProps {
  content?: string
  onUpdate?: (content: string) => void
  placeholder?: string
  minHeight?: number
  maxHeight?: number // 新增：最大高度，设置后将固定高度并允许滚动
}

export function FormEditor({ 
  content = "", 
  onUpdate, 
  placeholder = "Start writing your article...",
  minHeight = 300,
  maxHeight
}: FormEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    editorProps: {
      attributes: {
        autocomplete: "off",
        autocorrect: "off",
        autocapitalize: "off",
        "aria-label": "Article content editor",
        class: "form-editor prose prose-sm sm:prose lg:prose-lg mx-auto focus:outline-none",
        style: maxHeight 
          ? `min-height: ${minHeight}px; max-height: ${maxHeight}px; overflow-y: auto;`
          : `min-height: ${minHeight}px;`,
        spellcheck: "false",
      },
      handleKeyDown: (view, event) => {
        // 确保快捷键正常工作
        const { key, ctrlKey, metaKey, shiftKey } = event;
        const cmdKey = ctrlKey || metaKey;

        // 全选 (Ctrl/Cmd + A)
        if (cmdKey && key === 'a' && !shiftKey) {
          // 让 TipTap 处理全选
          return false;
        }

        // 其他快捷键也让编辑器处理
        return false;
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
          HTMLAttributes: {
            class: 'text-blue-600 underline hover:text-blue-800',
          },
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      ImageUploadNode.configure({
        accept: "image/*",
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: handleImageUpload,
        onError: (error) => console.error("Upload failed:", error),
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onUpdate?.(html)
    },
  })

  React.useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) {
    return (
      <div className="border rounded-lg p-4 min-h-[300px] flex items-center justify-center">
        <div className="text-muted-foreground">Loading editor...</div>
      </div>
    )
  }

  return (
    <>
      <div 
        className={`border rounded-lg overflow-hidden ${styles.formEditor}`}
        style={maxHeight ? { height: `${maxHeight + 60}px`, display: 'flex', flexDirection: 'column' } : {}}
      >
        <EditorContext.Provider value={{ editor }}>
          {/* 固定的工具栏 */}
          <Toolbar className="border-b flex-shrink-0">
            <ToolbarGroup>
              <HeadingDropdownMenu />
              <ToolbarSeparator />
              <MarkButton type="bold" />
              <MarkButton type="italic" />
              <MarkButton type="strike" />
              <ToolbarSeparator />
              <LinkPopover />
              <ToolbarSeparator />
              <ListDropdownMenu />
              <ToolbarSeparator />
              <TextAlignButton align="left" />
              <TextAlignButton align="center" />
              <TextAlignButton align="right" />
              <ToolbarSeparator />
              <BlockquoteButton />
              <CodeBlockButton />
              <ToolbarSeparator />
              <ImageUploadButton />
              <ToolbarSeparator />
              <UndoRedoButton action="undo" />
              <UndoRedoButton action="redo" />
              <ToolbarSeparator />
              <Dialog>
                <DialogTrigger asChild>
                  <UIButton variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <HelpCircle className="w-4 h-4" />
                  </UIButton>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                  <KeyboardShortcutsHelp />
                </DialogContent>
              </Dialog>
            </ToolbarGroup>
          </Toolbar>

          {/* 可滚动的编辑区域 */}
          <div 
            className={maxHeight ? "flex-1 overflow-y-auto" : ""}
            style={maxHeight ? { maxHeight: `${maxHeight}px` } : {}}
          >
            <EditorContent
              editor={editor}
              className="p-4"
              placeholder={placeholder}
            />
          </div>
        </EditorContext.Provider>
      </div>
    </>
  )
}

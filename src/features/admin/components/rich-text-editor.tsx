import { useEffect, useImperativeHandle, forwardRef } from 'react'
import { useEditor, EditorContent, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import {
  TextB, TextItalic, TextUnderline, TextStrikethrough, ListBullets, ListNumbers,
  Quotes, LinkSimple, ArrowCounterClockwise, ArrowClockwise, TextHOne, TextHTwo, Code,
} from '@phosphor-icons/react'
import { cn } from 'src/lib/cn'

export interface RichTextEditorHandle {
  insertText: (text: string) => void
  getHTML: () => string
}

interface Props {
  value: string
  onChange: (html: string) => void
  className?: string
}

export const RichTextEditor = forwardRef<RichTextEditorHandle, Props>(function RichTextEditor(
  { value, onChange, className },
  ref,
) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Désactive certaines extensions par défaut qu'on veut customiser ailleurs.
        codeBlock: false,
      }),
      Underline,
      Link.configure({ openOnClick: false, HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' } }),
    ],
    content: value,
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[280px] px-4 py-3 [&_p]:my-2 [&_h1]:my-3 [&_h2]:my-3 [&_ul]:my-2 [&_ol]:my-2 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground',
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  })

  // Sync external value change (ex : sélection d'un autre template)
  useEffect(() => {
    if (!editor) return
    if (editor.getHTML() !== value) editor.commands.setContent(value, { emitUpdate: false })
  }, [value, editor])

  useImperativeHandle(ref, () => ({
    insertText: (text: string) => editor?.chain().focus().insertContent(text).run(),
    getHTML: () => editor?.getHTML() ?? '',
  }), [editor])

  if (!editor) return null

  return (
    <div className={cn('rounded-lg border border-border/60 bg-card overflow-hidden flex flex-col', className)}>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} className="flex-1 overflow-y-auto bg-card text-[14px] text-foreground" />
    </div>
  )
})

function Toolbar({ editor }: { editor: Editor }) {
  function setLink() {
    const previous = editor.getAttributes('link').href
    const url = window.prompt('URL du lien', previous || 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  return (
    <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-border/60 bg-sunken/50 flex-wrap">
      <ToolbarBtn label="Gras (Cmd+B)" onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
        <TextB className="h-4 w-4" weight="bold" />
      </ToolbarBtn>
      <ToolbarBtn label="Italique (Cmd+I)" onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
        <TextItalic className="h-4 w-4" weight="bold" />
      </ToolbarBtn>
      <ToolbarBtn label="Souligné (Cmd+U)" onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')}>
        <TextUnderline className="h-4 w-4" weight="bold" />
      </ToolbarBtn>
      <ToolbarBtn label="Barré" onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')}>
        <TextStrikethrough className="h-4 w-4" weight="bold" />
      </ToolbarBtn>
      <Sep />
      <ToolbarBtn label="Titre 1" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} active={editor.isActive('heading', { level: 1 })}>
        <TextHOne className="h-4 w-4" weight="bold" />
      </ToolbarBtn>
      <ToolbarBtn label="Titre 2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })}>
        <TextHTwo className="h-4 w-4" weight="bold" />
      </ToolbarBtn>
      <Sep />
      <ToolbarBtn label="Liste à puces" onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
        <ListBullets className="h-4 w-4" weight="bold" />
      </ToolbarBtn>
      <ToolbarBtn label="Liste numérotée" onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
        <ListNumbers className="h-4 w-4" weight="bold" />
      </ToolbarBtn>
      <ToolbarBtn label="Citation" onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')}>
        <Quotes className="h-4 w-4" weight="bold" />
      </ToolbarBtn>
      <ToolbarBtn label="Code inline" onClick={() => editor.chain().focus().toggleCode().run()} active={editor.isActive('code')}>
        <Code className="h-4 w-4" weight="bold" />
      </ToolbarBtn>
      <Sep />
      <ToolbarBtn label="Insérer un lien" onClick={setLink} active={editor.isActive('link')}>
        <LinkSimple className="h-4 w-4" weight="bold" />
      </ToolbarBtn>
      <Sep />
      <ToolbarBtn label="Annuler (Cmd+Z)" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
        <ArrowCounterClockwise className="h-4 w-4" weight="bold" />
      </ToolbarBtn>
      <ToolbarBtn label="Refaire (Cmd+Shift+Z)" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
        <ArrowClockwise className="h-4 w-4" weight="bold" />
      </ToolbarBtn>
    </div>
  )
}

function ToolbarBtn({
  children, onClick, active, disabled, label,
}: { children: React.ReactNode; onClick: () => void; active?: boolean; disabled?: boolean; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className={cn(
        'inline-flex items-center justify-center h-7 w-7 rounded-md text-muted-foreground transition-colors',
        active && 'bg-primary/10 text-primary',
        !active && !disabled && 'hover:bg-muted/60 hover:text-foreground',
        disabled && 'opacity-30 cursor-not-allowed',
      )}
    >
      {children}
    </button>
  )
}

function Sep() {
  return <span className="w-px h-5 bg-border/60 mx-0.5" />
}

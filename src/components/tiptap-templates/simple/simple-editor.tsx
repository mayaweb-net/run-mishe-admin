'use client';

import { useEffect, useRef, useState } from 'react';
import { EditorContent, EditorContext, useEditor, useEditorState } from '@tiptap/react';
import type { Editor } from '@tiptap/react';
import { NodeSelection } from '@tiptap/pm/state';

// --- Tiptap Core Extensions ---
import { StarterKit } from '@tiptap/starter-kit';
import { Image } from '@tiptap/extension-image';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { TextAlign } from '@tiptap/extension-text-align';
import { TextDirection } from '@/components/tiptap-extensions/text-direction-extension';
import { Typography } from '@tiptap/extension-typography';
import { Highlight } from '@tiptap/extension-highlight';
import { Subscript } from '@tiptap/extension-subscript';
import { Superscript } from '@tiptap/extension-superscript';
import { Selection } from '@tiptap/extensions';

// --- UI Primitives ---
import { Button } from '@/components/tiptap-ui-primitive/button';
import {
  Card,
  CardBody,
  CardItemGroup,
} from '@/components/tiptap-ui-primitive/card';
import { ButtonGroup } from '@/components/tiptap-ui-primitive/button-group';
import { Input } from '@/components/tiptap-ui-primitive/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/tiptap-ui-primitive/popover';
import { Spacer } from '@/components/tiptap-ui-primitive/spacer';
import { Toolbar, ToolbarGroup, ToolbarSeparator } from '@/components/tiptap-ui-primitive/toolbar';

// --- Tiptap Node ---
import { ImageUploadNode } from '@/components/tiptap-node/image-upload-node/image-upload-node-extension';
import { HorizontalRule } from '@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node-extension';
import '@/components/tiptap-node/blockquote-node/blockquote-node.scss';
import '@/components/tiptap-node/code-block-node/code-block-node.scss';
import '@/components/tiptap-node/horizontal-rule-node/horizontal-rule-node.scss';
import '@/components/tiptap-node/list-node/list-node.scss';
import '@/components/tiptap-node/image-node/image-node.scss';
import '@/components/tiptap-node/heading-node/heading-node.scss';
import '@/components/tiptap-node/paragraph-node/paragraph-node.scss';

// --- Tiptap UI ---
import { HeadingDropdownMenu } from '@/components/tiptap-ui/heading-dropdown-menu';
import { ImageUploadButton } from '@/components/tiptap-ui/image-upload-button';
import { ListDropdownMenu } from '@/components/tiptap-ui/list-dropdown-menu';
import { BlockquoteButton } from '@/components/tiptap-ui/blockquote-button';
import { CodeBlockButton } from '@/components/tiptap-ui/code-block-button';
import {
  ColorHighlightPopover,
  ColorHighlightPopoverContent,
  ColorHighlightPopoverButton,
} from '@/components/tiptap-ui/color-highlight-popover';
import { LinkPopover, LinkContent, LinkButton } from '@/components/tiptap-ui/link-popover';
import { MarkButton } from '@/components/tiptap-ui/mark-button';
import { TextAlignButton } from '@/components/tiptap-ui/text-align-button';
import { TextDirectionButton } from '@/components/tiptap-ui/text-direction-button';
import { UndoRedoButton } from '@/components/tiptap-ui/undo-redo-button';

// --- Icons ---
import { ArrowLeftIcon } from '@/components/tiptap-icons/arrow-left-icon';
import { CheckIcon } from '@/components/tiptap-icons/check-icon';
import { HighlighterIcon } from '@/components/tiptap-icons/highlighter-icon';
import { ImageAltIcon } from '@/components/tiptap-icons/image-alt-icon';
import { LinkIcon } from '@/components/tiptap-icons/link-icon';
import { TextDirectionLtrIcon } from '@/components/tiptap-icons/text-direction-ltr-icon';
import { TextDirectionRtlIcon } from '@/components/tiptap-icons/text-direction-rtl-icon';

// --- Hooks ---
import { useIsBreakpoint } from '@/hooks/use-is-breakpoint';
import { useWindowSize } from '@/hooks/use-window-size';
import { useCursorVisibility } from '@/hooks/use-cursor-visibility';

// --- Components ---

// --- Lib ---
import { handleImageUpload, MAX_FILE_SIZE } from '@/lib/tiptap-utils';

// --- Styles ---
import '@/components/tiptap-templates/simple/simple-editor.scss';

const MainToolbarContent = ({
  editor,
  onHighlighterClick,
  onLinkClick,
  isMobile,
}: {
  editor: Editor | null;
  onHighlighterClick: () => void;
  onLinkClick: () => void;
  isMobile: boolean;
}) => {
  return (
    <>
      <Spacer />

      <ToolbarGroup>
        <UndoRedoButton action="undo" />
        <UndoRedoButton action="redo" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <HeadingDropdownMenu modal={false} levels={[1, 2, 3, 4]} />
        <ListDropdownMenu modal={false} types={['bulletList', 'orderedList', 'taskList']} />
        <BlockquoteButton />
        <CodeBlockButton />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="bold" />
        <MarkButton type="italic" />
        <MarkButton type="strike" />
        <MarkButton type="code" />
        <MarkButton type="underline" />
        {!isMobile ? (
          <ColorHighlightPopover />
        ) : (
          <ColorHighlightPopoverButton onClick={onHighlighterClick} />
        )}
        {!isMobile ? <LinkPopover /> : <LinkButton onClick={onLinkClick} />}
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <MarkButton type="superscript" />
        <MarkButton type="subscript" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextAlignButton align="left" />
        <TextAlignButton align="center" />
        <TextAlignButton align="right" />
        <TextAlignButton align="justify" />
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <TextDirectionButton direction="rtl">
          <TextDirectionRtlIcon className="tiptap-button-icon" />
        </TextDirectionButton>
        <TextDirectionButton direction="ltr">
          <TextDirectionLtrIcon className="tiptap-button-icon" />
        </TextDirectionButton>
      </ToolbarGroup>

      <ToolbarSeparator />

      <ToolbarGroup>
        <ImageUploadButton text="تصویر" />
        <ImageAltPopover editor={editor} />
      </ToolbarGroup>

      <Spacer />

      {isMobile && <ToolbarSeparator />}
    </>
  );
};

const MobileToolbarContent = ({
  type,
  onBack,
}: {
  type: 'highlighter' | 'link';
  onBack: () => void;
}) => (
  <>
    <ToolbarGroup>
      <Button variant="ghost" onClick={onBack}>
        <ArrowLeftIcon className="tiptap-button-icon" />
        {type === 'highlighter' ? (
          <HighlighterIcon className="tiptap-button-icon" />
        ) : (
          <LinkIcon className="tiptap-button-icon" />
        )}
      </Button>
    </ToolbarGroup>

    <ToolbarSeparator />

    {type === 'highlighter' ? <ColorHighlightPopoverContent /> : <LinkContent />}
  </>
);

interface ImageAltPopoverProps {
  editor: Editor | null;
}

function ImageAltPopover({ editor }: ImageAltPopoverProps) {
  const [imagePos, setImagePos] = useState<number | null>(null);
  const [altText, setAltText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const isMobile = useIsBreakpoint();

  const selectedImage = useEditorState({
    editor,
    selector: ({ editor }) => {
      if (!editor) return { alt: '', pos: null };

      const { selection } = editor.state;
      if (!(selection instanceof NodeSelection) || selection.node.type.name !== 'image') {
        return { alt: '', pos: null };
      }

      return {
        alt: selection.node.attrs.alt ?? '',
        pos: selection.from,
      };
    },
  }) ?? { alt: '', pos: null };

  useEffect(() => {
    if (selectedImage.pos !== null) {
      setImagePos(selectedImage.pos);
      setAltText(selectedImage.alt);
      return;
    }

    if (!isOpen) {
      setImagePos(null);
      setAltText('');
    }
  }, [isOpen, selectedImage.alt, selectedImage.pos]);

  const updateImageAlt = (nextAltText: string) => {
    setAltText(nextAltText);

    if (!editor || imagePos === null) return;

    const imageNode = editor.state.doc.nodeAt(imagePos);
    if (!imageNode || imageNode.type.name !== 'image') return;

    editor.view.dispatch(
      editor.state.tr.setNodeMarkup(imagePos, undefined, {
        ...imageNode.attrs,
        alt: nextAltText,
        title: nextAltText,
      })
    );
  };

  const canEditAlt = Boolean(
    editor && imagePos !== null && editor.state.doc.nodeAt(imagePos)?.type.name === 'image'
  );

  const handleOpenChange = (nextIsOpen: boolean) => {
    if (!canEditAlt) {
      setIsOpen(false);
      return;
    }

    setIsOpen(nextIsOpen);
  };

  const handleApply = () => {
    updateImageAlt(altText.trim());
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            role="button"
            tabIndex={-1}
            disabled={!canEditAlt}
            data-disabled={!canEditAlt}
            data-active-state={isOpen ? 'on' : 'off'}
            aria-label="متن جایگزین تصویر"
            aria-pressed={isOpen}
            tooltip="alt تصویر"
          />
        }
      >
        <ImageAltIcon className="tiptap-button-icon" />
      </PopoverTrigger>

      <PopoverContent aria-label="متن جایگزین تصویر">
        <Card style={isMobile ? { boxShadow: 'none', border: 0 } : {}}>
          <CardBody style={isMobile ? { padding: 0 } : {}}>
            <CardItemGroup orientation="horizontal">
              <Input
                type="text"
                value={altText}
                placeholder="alt تصویر"
                onChange={(event) => updateImageAlt(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    handleApply();
                  }
                }}
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                className="simple-editor-image-alt-input"
              />

              <ButtonGroup>
                <Button
                  type="button"
                  onClick={handleApply}
                  title="اعمال متن جایگزین"
                  variant="ghost"
                >
                  <CheckIcon className="tiptap-button-icon" />
                </Button>
              </ButtonGroup>
            </CardItemGroup>
          </CardBody>
        </Card>
      </PopoverContent>
    </Popover>
  );
}

interface SimpleEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  /** @deprecated Prefer uploadTarget */
  articleId?: string;
  uploadTarget?: {
    folder: 'articles' | 'games';
    ownerId: string;
    scope?: 'cover' | 'content' | 'gallery';
  };
}

export function SimpleEditor({
  value = '',
  onChange,
  articleId,
  uploadTarget,
}: SimpleEditorProps) {
  const isMobile = useIsBreakpoint();
  const { height } = useWindowSize();
  const [mobileView, setMobileView] = useState<'main' | 'highlighter' | 'link'>('main');
  const toolbarRef = useRef<HTMLDivElement>(null);
  const uploadTargetRef = useRef(
    uploadTarget ??
      (articleId
        ? { folder: 'articles' as const, ownerId: articleId, scope: 'content' as const }
        : undefined),
  );
  uploadTargetRef.current =
    uploadTarget ??
    (articleId
      ? { folder: 'articles' as const, ownerId: articleId, scope: 'content' as const }
      : undefined);

  const lastEmittedHtmlRef = useRef(value);

  const editor = useEditor({
    immediatelyRender: false,
    shouldRerenderOnTransaction: false,
    textDirection: 'rtl',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      lastEmittedHtmlRef.current = html;
      onChange?.(html);
    },
    editorProps: {
      attributes: {
        autocomplete: 'off',
        autocorrect: 'off',
        autocapitalize: 'off',
        'aria-label': 'محتوای اصلی، برای نوشتن شروع کنید.',
        class: 'simple-editor',
      },
    },
    extensions: [
      StarterKit.configure({
        horizontalRule: false,
        link: {
          openOnClick: false,
          enableClickSelection: true,
        },
      }),
      HorizontalRule,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextDirection.configure({ types: ['heading', 'paragraph'] }),
      TaskList,
      TaskItem.configure({ nested: true }),
      Highlight.configure({ multicolor: true }),
      Image,
      Typography,
      Superscript,
      Subscript,
      Selection,
      ImageUploadNode.configure({
        accept: 'image/*',
        maxSize: MAX_FILE_SIZE,
        limit: 3,
        upload: (file, onProgress, abortSignal) =>
          handleImageUpload(file, onProgress, abortSignal, uploadTargetRef.current),
        onError: (error) => console.error('Upload failed:', error),
      }),
    ],
    content: value,
  });

  useEffect(() => {
    if (!editor) return;
    // Skip echo updates from our own onChange — setContent resets selection
    // and can make toolbar actions appear to apply to the whole document.
    if (value === lastEmittedHtmlRef.current) return;
    if (editor.getHTML() === value) {
      lastEmittedHtmlRef.current = value;
      return;
    }
    if (editor.isFocused) return;
    editor.commands.setContent(value, { emitUpdate: false });
    lastEmittedHtmlRef.current = value;
  }, [editor, value]);

  const rect = useCursorVisibility({
    editor,
    overlayHeight: toolbarRef.current?.getBoundingClientRect().height ?? 0,
  });

  useEffect(() => {
    if (!isMobile && mobileView !== 'main') {
      setMobileView('main');
    }
  }, [isMobile, mobileView]);

  return (
    <div className="simple-editor-wrapper">
      <EditorContext.Provider value={{ editor }}>
        <Toolbar
          ref={toolbarRef}
          style={{
            ...(isMobile
              ? {
                  bottom: `calc(100% - ${height - rect.y}px)`,
                }
              : {}),
          }}
        >
          {mobileView === 'main' ? (
            <MainToolbarContent
              onHighlighterClick={() => setMobileView('highlighter')}
              onLinkClick={() => setMobileView('link')}
              isMobile={isMobile}
              editor={editor}
            />
          ) : (
            <MobileToolbarContent
              type={mobileView === 'highlighter' ? 'highlighter' : 'link'}
              onBack={() => setMobileView('main')}
            />
          )}
        </Toolbar>

        <EditorContent editor={editor} role="presentation" className="simple-editor-content" />
      </EditorContext.Provider>
    </div>
  );
}

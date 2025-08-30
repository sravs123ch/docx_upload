// Enhanced PageBreakPlugin.js
import { INSERT_PAGE_BREAK_COMMAND } from './commands';
import { $insertNodes } from 'lexical';

export function PageBreakPlugin() {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const unregister = editor.registerCommand(
      INSERT_PAGE_BREAK_COMMAND,
      () => {
        editor.update(() => {
          const pageBreak = $createPageBreakNode();
          $insertNodes([pageBreak]);
        });
        return true;
      },
      1
    );

    return unregister;
  }, [editor]);

  return null;
}
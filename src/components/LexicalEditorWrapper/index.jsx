

import { $getRoot, $getSelection, $isRangeSelection } from "lexical";
import { useEffect, useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { MuiContentEditable, placeHolderSx } from "./styles";
import { Box, Divider, CircularProgress } from "@mui/material";
import { lexicalEditorConfig } from "../../config/lexicalEditorConfig";
import LexicalEditorTopBar from "../LexicalEditorTopBar";
import TreeViewPlugin from "../CustomPlugins/TreeViewPlugin";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import ImagesPlugin from "../CustomPlugins/ImagePlugin";
import FloatingTextFormatToolbarPlugin from "../CustomPlugins/FloatingTextFormatPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  AlignmentType,
  HeadingLevel,
  ExternalHyperlink,
  ShadingType,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  TableLayoutType,
} from "docx";
import { saveAs } from "file-saver";
import ColorPlugin from "../CustomPlugins/ColorPlugin";
import {
  $patchStyleText,
  $getSelectionStyleValueForProperty,
} from "@lexical/selection";
import { TablePlugin } from "@lexical/react/LexicalTablePlugin";
import TableResizePlugin from "../CustomPlugins/TableResizePlugin";
import TableActionMenuPlugin from "../CustomPlugins/TableActionMenuPlugin";

function LexicalEditorWrapper(props) {
  const [isLoading, setIsLoading] = useState(false);

  // Function to handle importing from URL
  const handleImportFromUrl = async (url) => {
    setIsLoading(true);
    
    try {
      const response = await fetch(`http://localhost:3001/api/convert-docx-to-html?url=${encodeURIComponent(url)}`);
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Conversion failed');
      }

      // Update Lexical editor with the converted HTML
      const [editor] = useLexicalComposerContext();
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(result.html, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);
        const root = $getRoot();
        root.clear();
        if (Array.isArray(nodes) && nodes.length > 0) {
          root.append(...nodes);
        }
      });
      
    } catch (error) {
      console.error('Error importing from URL:', error);
      alert(`Error importing from URL: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

	// Function to handle DOCX download
	const handleDownloadDocx = async (editor) => {
    // ... (keep the existing handleDownloadDocx function unchanged)
    // This function is quite long, so I'm not reproducing it here
    // but it should remain exactly as it was in your original code
	};

  return (
    <LexicalComposer initialConfig={lexicalEditorConfig}>
      {/* 🔹 Full width top bar */}
      <Box
        sx={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          width: "100%",
          background: "white",
          boxShadow: 2,
        }}
      >
        <LexicalEditorTopBar 
          onDownloadDocx={handleDownloadDocx} 
          onImportFromUrl={handleImportFromUrl} 
        />
      </Box>

      {/* 🔹 Editor background */}
      <Box
        sx={{
          flex: 1,
          background: "#f3f3f3",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
          py: 4,
          position: 'relative',
        }}
      >
        {isLoading && (
          <Box
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.7)',
              zIndex: 10,
            }}
          >
            <CircularProgress size={60} />
          </Box>
        )}
        
        {/* 🔹 Page-like editor */}
        <Box
          sx={{
            background: "white",
            width: "794px",
            minHeight: "1123px",
            p: 4,
            boxShadow: 3,
          }}
          data-lexical-page
        >
          <RichTextPlugin
            contentEditable={<MuiContentEditable />}
            placeholder={<Box sx={placeHolderSx}>Enter some text...</Box>}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <HistoryPlugin />
          <ListPlugin />
          <LinkPlugin />
          <ImagesPlugin captionsEnabled={false} />
          <FloatingTextFormatToolbarPlugin />
          <TablePlugin />
          <TableResizePlugin />
          <TableActionMenuPlugin />
          <MyCustomAutoFocusPlugin />
        </Box>
      </Box>
    </LexicalComposer>
  );
}

function MyCustomAutoFocusPlugin() {
	const [editor] = useLexicalComposerContext();

	useEffect(() => {
		editor.focus();
	}, [editor]);

	return null;
}

export default LexicalEditorWrapper;
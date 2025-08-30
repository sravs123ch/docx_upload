

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
import { $generateNodesFromDOM } from "@lexical/html";
import PageBreakPlugin from "../CustomPlugins/PageBreakPlugin";
import FontPlugin from "../CustomPlugins/FontPlugin";
import "./editor.css";

function LexicalEditorWrapper(props) {
  const [isLoading, setIsLoading] = useState(false);

	// Function to handle DOCX download
	const handleDownloadDocx = async (editor) => {
    setIsLoading(true);
    
    try {
      const editorState = editor.getEditorState();
      const htmlString = editorState.read(() => {
        const root = $getRoot();
        return root.getTextContent(); // This is a simplified version
      });

      // Create a simple DOCX document
      const doc = new Document({
        sections: [{
          properties: {},
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: htmlString,
                  size: 24,
                }),
              ],
            }),
          ],
        }],
      });

      const buffer = await Packer.toBuffer(doc);
      const blob = new Blob([buffer], { 
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" 
      });
      
      saveAs(blob, "document.docx");
    } catch (error) {
      console.error('Error exporting DOCX:', error);
      alert(`Error exporting DOCX: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
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
          <ColorPlugin />
          <FontPlugin />
          <TablePlugin />
          <TableResizePlugin />
          <TableActionMenuPlugin />
          <PageBreakPlugin />
          <MyCustomAutoFocusPlugin />
          <OnChangePlugin onChange={(editorState) => {
            // Optional: Log changes for debugging
            // console.log('Editor state changed:', editorState);
          }} />
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
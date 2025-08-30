import React, { useState } from "react";
import { createContext } from "react";
import {
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
} from "@mui/material";
import TableChartIcon from "@mui/icons-material/TableChart";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { 
  $createTableNodeWithDimensions,
  $insertTableRow__EXPERIMENTAL,
  $insertTableColumn__EXPERIMENTAL,
  $deleteTableRow__EXPERIMENTAL,
  $deleteTableColumn__EXPERIMENTAL,
} from "@lexical/table";
import { $insertNodeToNearestRoot } from "@lexical/utils";
import { $getSelection, $isRangeSelection } from "lexical";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";

export const CellContext = createContext({
  cellEditorConfig: null,
  cellEditorPlugins: null,
});

function CellEditor() {
  return (
    <>
      <RichTextPlugin
        contentEditable={
          <ContentEditable className="TableNode__contentEditable" />
        }
        placeholder={
          <div className="TableNode__placeholder">Enter some text...</div>
        }
        ErrorBoundary={LexicalErrorBoundary}
      />
      <HistoryPlugin />
    </>
  );
}
export default function TablePlugin() {
  const [isOpen, setIsOpen] = useState(false);
  const [rows, setRows] = useState("");
  const [columns, setColumns] = useState("");
  const [editor] = useLexicalComposerContext();

  const cellEditorConfig = {
    namespace: "TableCellEditor",
    theme: {
      paragraph: "editor-paragraph",
      text: {
        bold: "editor-text-bold",
        italic: "editor-text-italic",
        underline: "editor-text-underline",
      },
    },
    onError: (error) => {
      console.error("Cell editor error:", error);
    },
    nodes: [],
  };
  const onAddTable = () => {
    if (!rows || !columns) return;
    
    editor.update(() => {
      const selection = $getSelection();
      const tableNode = $createTableNodeWithDimensions(
        parseInt(rows, 10),
        parseInt(columns, 10),
        false // No headers by default
      );
      
      if ($isRangeSelection(selection)) {
        $insertNodeToNearestRoot(tableNode);
      }
    });
    
    setRows("");
    setColumns("");
    setIsOpen(false);
  };

  return (
    <CellContext.Provider
      value={{
        cellEditorConfig,
        cellEditorPlugins: <CellEditor />,
      }}
    >
      <Dialog open={isOpen} onClose={() => setIsOpen(false)}>
        <DialogTitle>Add Table</DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              type="number"
              label="Rows"
              value={rows}
              onChange={(e) => setRows(e.target.value)}
              autoFocus
              fullWidth
            />
            <TextField
              type="number"
              label="Columns"
              value={columns}
              onChange={(e) => setColumns(e.target.value)}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button
            onClick={onAddTable}
            disabled={!rows || !columns || isNaN(rows) || isNaN(columns) || rows <= 0 || columns <= 0}
            variant="contained"
          >
            Insert Table
          </Button>
        </DialogActions>
      </Dialog>

      <IconButton
        aria-label="Add Table"
        size="small"
        onClick={() => setIsOpen(true)}
      >
        <TableChartIcon style={{ color: "black" }} />
      </IconButton>

    </CellContext.Provider>
  );
}
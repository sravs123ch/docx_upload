import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $getRoot } from "lexical";
import { $generateNodesFromDOM } from "@lexical/html";
import { useState } from "react";
import { Grid, Button, Box, Popover, CircularProgress, TextField } from '@mui/material';

const LexicalEditorTopBar = ({ onDownloadDocx, onImportFromUrl }) => {
  const [editor] = useLexicalComposerContext();
  const [isLoading, setIsLoading] = useState(false);
  const [urlInputOpen, setUrlInputOpen] = useState(false);
  const [urlValue, setUrlValue] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);

  // Enhanced HTML processing to preserve formatting
  const processImportedHTML = (htmlString) => {
    // Create a temporary container to process the HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlString;
    
    // Process images to ensure they have proper URLs
    const images = tempDiv.querySelectorAll('img');
    images.forEach(img => {
      const src = img.getAttribute('src');
      if (src && src.startsWith('/uploads/images/')) {
        // Convert relative URLs to absolute URLs for the backend
        img.setAttribute('src', `http://localhost:3001${src}`);
      }
    });
    
    // Preserve all inline styles by adding data attributes
    const elementsWithStyle = tempDiv.querySelectorAll('[style]');
    elementsWithStyle.forEach(element => {
      const style = element.getAttribute('style');
      element.setAttribute('data-original-style', style);
    });
    
    return tempDiv.innerHTML;
  };
  const handleImportDocx = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('http://localhost:3001/api/convert-docx-to-html', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Conversion failed');
      }

      // Process the HTML to preserve formatting
      const processedHTML = processImportedHTML(result.html);

      // Update Lexical editor with the converted HTML
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(processedHTML, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);
        const root = $getRoot();
        root.clear();
        if (Array.isArray(nodes) && nodes.length > 0) {
          root.append(...nodes);
        }
      });

    } catch (error) {
      console.error('Error importing DOCX:', error);
      alert(`Error importing DOCX file: ${error.message}`);
    } finally {
      setIsLoading(false);
      event.target.value = '';
    }
  };

  const handleUrlImportClick = (event) => {
    setAnchorEl(event.currentTarget);
    setUrlInputOpen(true);
  };

  const handleUrlImport = async () => {
    if (!urlValue) return;
    
    setIsLoading(true);
    setUrlInputOpen(false);
    
    try {
      const response = await fetch(`http://localhost:3001/api/convert-docx-to-html?url=${encodeURIComponent(urlValue)}`);
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Conversion failed');
      }

      // Process the HTML to preserve formatting
      const processedHTML = processImportedHTML(result.html);

      // Update Lexical editor with the converted HTML
      editor.update(() => {
        const parser = new DOMParser();
        const dom = parser.parseFromString(processedHTML, 'text/html');
        const nodes = $generateNodesFromDOM(editor, dom);
        const root = $getRoot();
        root.clear();
        if (Array.isArray(nodes) && nodes.length > 0) {
          root.append(...nodes);
        }
      });
      
      setUrlValue('');
      
    } catch (error) {
      console.error('Error importing from URL:', error);
      alert(`Error importing from URL: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Grid
        container
        justifyContent="flex-end"
        alignItems="center"
        sx={{
          background: "white",
          py: 1,
          px: 2,
          borderBottom: "1px solid #e0e0e0",
        }}
      >
        <Button 
          variant="outlined" 
          onClick={handleUrlImportClick}
          disabled={isLoading}
          sx={{ mr: 1 }}
        >
          Import from URL
        </Button>
        
        <Button variant="outlined" component="label" disabled={isLoading}>
          {isLoading ? (
            <>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              Importing...
            </>
          ) : (
            'Import DOCX File'
          )}
          <input 
            type="file" 
            accept=".docx,.doc" 
            hidden 
            onChange={handleImportDocx} 
          />
        </Button>
        
        <Button
          sx={{ ml: 1 }}
          variant="contained"
          onClick={() => onDownloadDocx(editor)}
          disabled={isLoading}
        >
          {isLoading ? 'Exporting...' : 'Export DOCX'}
        </Button>
      </Grid>
      
      <Popover
        open={urlInputOpen}
        anchorEl={anchorEl}
        onClose={() => setUrlInputOpen(false)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Box sx={{ p: 2, minWidth: 300 }}>
          <TextField
            label="Document URL"
            variant="outlined"
            fullWidth
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            placeholder="https://example.com/document.docx"
            sx={{ mb: 2 }}
          />
          <Button 
            variant="contained" 
            onClick={handleUrlImport}
            disabled={!urlValue}
            fullWidth
          >
            Import
          </Button>
        </Box>
      </Popover>
    </>
  );
};

export default LexicalEditorTopBar;
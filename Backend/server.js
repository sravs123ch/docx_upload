// // server.js
// const express = require('express');
// const multer = require('multer');
// const mammoth = require('mammoth');
// const path = require('path');
// const fs = require('fs');
// const cors = require('cors');
// const { JSDOM } = require('jsdom');

// const app = express();
// const PORT = process.env.PORT || 3001;

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.static('public'));

// // Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadDir = 'uploads/';
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + '-' + file.originalname);
//   }
// });

// const upload = multer({
//   storage: storage,
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = [
//       'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//       'application/msword'
//     ];
//     const validExtensions = ['.docx', '.doc'];
    
//     const hasValidType = allowedTypes.includes(file.mimetype);
//     const hasValidExtension = validExtensions.some(ext => 
//       file.originalname.toLowerCase().endsWith(ext)
//     );
    
//     if (hasValidType || hasValidExtension) {
//       cb(null, true);
//     } else {
//       cb(new Error('Invalid file type. Please upload a DOCX or DOC file.'));
//     }
//   },
//   limits: {
//     fileSize: 10 * 1024 * 1024 // 10MB limit
//   }
// });

// // POST endpoint for file upload and conversion
// app.post('/api/convert-docx-to-html', upload.single('file'), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No file uploaded' });
//     }

//     const filePath = req.file.path;
    
//     // Convert DOCX to HTML using mammoth
//     const result = await mammoth.convertToHtml({ path: filePath });
    
//     // Clean up the uploaded file
//     fs.unlinkSync(filePath);
    
//     // Process the HTML to make it more compatible with Lexical
//     const processedHtml = processHtmlForLexical(result.value);
    
//     res.json({
//       success: true,
//       html: processedHtml,
//       messages: result.messages
//     });
    
//   } catch (error) {
//     console.error('Conversion error:', error);
    
//     // Clean up file if it exists
//     if (req.file && fs.existsSync(req.file.path)) {
//       fs.unlinkSync(req.file.path);
//     }
    
//     res.status(500).json({ 
//       error: 'Failed to convert document', 
//       details: error.message 
//     });
//   }
// });

// // GET endpoint for file conversion (using query parameter)
// app.get('/api/convert-docx-to-html', async (req, res) => {
//   try {
//     const fileUrl = req.query.url;
    
//     if (!fileUrl) {
//       return res.status(400).json({ error: 'No file URL provided' });
//     }

//     // Download the file
//     const response = await fetch(fileUrl);
//     if (!response.ok) {
//       throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
//     }
    
//     const arrayBuffer = await response.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);
    
//     // Save to temporary file
//     const tempFilePath = path.join('uploads', `temp-${Date.now()}.docx`);
//     fs.writeFileSync(tempFilePath, buffer);
    
//     // Convert DOCX to HTML using mammoth
//     const result = await mammoth.convertToHtml({ path: tempFilePath });
    
//     // Clean up the temporary file
//     fs.unlinkSync(tempFilePath);
    
//     // Process the HTML to make it more compatible with Lexical
//     const processedHtml = processHtmlForLexical(result.value);
    
//     res.json({
//       success: true,
//       html: processedHtml,
//       messages: result.messages
//     });
    
//   } catch (error) {
//     console.error('Conversion error:', error);
//     res.status(500).json({ 
//       error: 'Failed to convert document', 
//       details: error.message 
//     });
//   }
// });

// // Helper function to process HTML for better Lexical compatibility
// function processHtmlForLexical(html) {
//   // Create a DOM environment using jsdom
//   const dom = new JSDOM(html);
//   const document = dom.window.document;
  
//   // Process images
//   const images = document.querySelectorAll('img');
//   images.forEach(img => {
//     if (!img.style.maxWidth) img.style.maxWidth = '100%';
//     if (!img.style.height) img.style.height = 'auto';
//     if (!img.style.display) img.style.display = 'block';
//     if (!img.alt) img.alt = 'Document image';
//   });
  
//   // Process tables
//   const tables = document.querySelectorAll('table');
//   tables.forEach(table => {
//     if (!table.style.width) table.style.width = '100%';
//     table.style.borderCollapse = 'collapse';
//   });
  
//   // Process paragraphs and headings
//   const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, td, th');
//   textElements.forEach(el => {
//     // Ensure proper spacing
//     if (!el.style.marginTop) el.style.marginTop = '8px';
//     if (!el.style.marginBottom) el.style.marginBottom = '8px';
//   });
  
//   return document.body.innerHTML;
// }

// // Health check endpoint
// app.get('/api/health', (req, res) => {
//   res.json({ status: 'OK', message: 'DOCX to HTML converter is running' });
// });

// // Error handling middleware
// app.use((error, req, res, next) => {
//   if (error instanceof multer.MulterError) {
//     if (error.code === 'LIMIT_FILE_SIZE') {
//       return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
//     }
//   }
//   res.status(500).json({ error: error.message });
// });

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// module.exports = app;


// const express = require('express');
// const multer = require('multer');
// const mammoth = require('mammoth');
// const path = require('path');
// const fs = require('fs');
// const cors = require('cors');
// const { JSDOM } = require('jsdom');
// const docx2html = require('docx2html'); // Using docx2html package

// const app = express();
// const PORT = process.env.PORT || 3001;

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.static('public'));

// // Configure multer for file uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadDir = 'uploads/';
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + '-' + file.originalname);
//   }
// });

// const upload = multer({
//   storage: storage,
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = [
//       'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
//       'application/msword'
//     ];
//     const validExtensions = ['.docx', '.doc'];
    
//     const hasValidType = allowedTypes.includes(file.mimetype);
//     const hasValidExtension = validExtensions.some(ext => 
//       file.originalname.toLowerCase().endsWith(ext)
//     );
    
//     if (hasValidType || hasValidExtension) {
//       cb(null, true);
//     } else {
//       cb(new Error('Invalid file type. Please upload a DOCX or DOC file.'));
//     }
//   },
//   limits: {
//     fileSize: 10 * 1024 * 1024 // 10MB limit
//   }
// });

// // POST endpoint for file upload and conversion
// app.post('/api/convert-docx-to-html', upload.single('file'), async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: 'No file uploaded' });
//     }

//     const filePath = req.file.path;
    
//     // Convert DOCX to HTML using docx2html
//     const html = await docx2html(filePath, { 
//       container: false, // Don't wrap in container div
//       ignoreStyles: false,
//       ignoreImages: false
//     });
    
//     // Clean up the uploaded file
//     fs.unlinkSync(filePath);
    
//     // Process the HTML to make it more compatible with Lexical
//     const processedHtml = processHtmlForLexical(html);
    
//     res.json({
//       success: true,
//       html: processedHtml
//     });
    
//   } catch (error) {
//     console.error('Conversion error:', error);
    
//     // Clean up file if it exists
//     if (req.file && fs.existsSync(req.file.path)) {
//       fs.unlinkSync(req.file.path);
//     }
    
//     res.status(500).json({ 
//       error: 'Failed to convert document', 
//       details: error.message 
//     });
//   }
// });

// // GET endpoint for file conversion (using query parameter)
// app.get('/api/convert-docx-to-html', async (req, res) => {
//   try {
//     const fileUrl = req.query.url;
    
//     if (!fileUrl) {
//       return res.status(400).json({ error: 'No file URL provided' });
//     }

//     // Download the file
//     const response = await fetch(fileUrl);
//     if (!response.ok) {
//       throw new Error(`Failed to download file: ${response.status} ${response.statusText}`);
//     }
    
//     const arrayBuffer = await response.arrayBuffer();
//     const buffer = Buffer.from(arrayBuffer);
    
//     // Save to temporary file
//     const tempFilePath = path.join('uploads', `temp-${Date.now()}.docx`);
//     fs.writeFileSync(tempFilePath, buffer);
    
//     // Convert DOCX to HTML using docx2html
//     const html = await docx2html(tempFilePath, { 
//       container: false,
//       ignoreStyles: false,
//       ignoreImages: false
//     });
    
//     // Clean up the temporary file
//     fs.unlinkSync(tempFilePath);
    
//     // Process the HTML to make it more compatible with Lexical
//     const processedHtml = processHtmlForLexical(html);
    
//     res.json({
//       success: true,
//       html: processedHtml
//     });
    
//   } catch (error) {
//     console.error('Conversion error:', error);
//     res.status(500).json({ 
//       error: 'Failed to convert document', 
//       details: error.message 
//     });
//   }
// });

// // Helper function to process HTML for better Lexical compatibility
// function processHtmlForLexical(html) {
//   // Create a DOM environment using jsdom
//   const dom = new JSDOM(html);
//   const document = dom.window.document;
  
//   // Process images
//   const images = document.querySelectorAll('img');
//   images.forEach(img => {
//     if (!img.style.maxWidth) img.style.maxWidth = '100%';
//     if (!img.style.height) img.style.height = 'auto';
//     if (!img.style.display) img.style.display = 'block';
//     if (!img.alt) img.alt = 'Document image';
//   });
  
//   // Process tables
//   const tables = document.querySelectorAll('table');
//   tables.forEach(table => {
//     if (!table.style.width) table.style.width = '100%';
//     table.style.borderCollapse = 'collapse';
//   });
  
//   // Process paragraphs and headings
//   const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, li, td, th');
//   textElements.forEach(el => {
//     // Ensure proper spacing
//     if (!el.style.marginTop) el.style.marginTop = '8px';
//     if (!el.style.marginBottom) el.style.marginBottom = '8px';
//   });
  
//   return document.body.innerHTML;
// }

// // Health check endpoint
// app.get('/api/health', (req, res) => {
//   res.json({ status: 'OK', message: 'DOCX to HTML converter is running' });
// });

// // Error handling middleware
// app.use((error, req, res, next) => {
//   if (error instanceof multer.MulterError) {
//     if (error.code === 'LIMIT_FILE_SIZE') {
//       return res.status(400).json({ error: 'File too large. Maximum size is 10MB.' });
//     }
//   }
//   res.status(500).json({ error: error.message });
// });

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// module.exports = app;


// const express = require("express");
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
// const cors = require("cors");
// const { JSDOM } = require("jsdom");
// const docx2html = require("docx2html");
// const AdmZip = require("adm-zip");
// const mammoth = require("mammoth");
// const fetch = require("node-fetch");

// const app = express();
// const PORT = process.env.PORT || 3001;

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.static("public"));

// // Configure Multer for uploads
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadDir = "uploads/";
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// const upload = multer({
//   storage: storage,
//   fileFilter: (req, file, cb) => {
//     const allowedTypes = [
//       "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//       "application/msword",
//     ];
//     const validExtensions = [".docx", ".doc"];

//     const hasValidType = allowedTypes.includes(file.mimetype);
//     const hasValidExtension = validExtensions.some((ext) =>
//       file.originalname.toLowerCase().endsWith(ext)
//     );

//     if (hasValidType || hasValidExtension) {
//       cb(null, true);
//     } else {
//       cb(new Error("Invalid file type. Please upload a DOCX or DOC file."));
//     }
//   },
//   limits: {
//     fileSize: 10 * 1024 * 1024, // 10MB
//   },
// });

// // Validate DOCX file
// function isValidDocxFile(filePath) {
//   try {
//     const stats = fs.statSync(filePath);
//     if (stats.size === 0) return false;

//     const buffer = Buffer.alloc(4);
//     const fd = fs.openSync(filePath, "r");
//     fs.readSync(fd, buffer, 0, 4, 0);
//     fs.closeSync(fd);

//     const isZipFile = buffer[0] === 0x50 && buffer[1] === 0x4b;
//     if (!isZipFile) return false;

//     const zip = new AdmZip(filePath);
//     const entries = zip.getEntries();

//     const hasContentTypes = entries.some(
//       (e) => e.entryName === "[Content_Types].xml"
//     );
//     const hasDocument = entries.some((e) => e.entryName === "word/document.xml");

//     return hasContentTypes && hasDocument;
//   } catch {
//     return false;
//   }
// }

// // Convert DOCX → HTML (tries docx2html then mammoth)
// async function convertDocxToHtml(filePath) {
//   if (!isValidDocxFile(filePath)) {
//     throw new Error("Invalid or corrupted DOCX file.");
//   }

//   try {
//     const result = await docx2html(filePath, {
//       container: false,
//       ignoreStyles: false,
//       ignoreImages: false,
//     });

//     if (result && result.value) {
//       return result.value;
//     }
//     throw new Error("docx2html returned no HTML");
//   } catch (err) {
//     console.warn("docx2html failed, trying mammoth:", err.message);

//     const mammothResult = await mammoth.convertToHtml({ path: filePath });
//     if (mammothResult.value) {
//       return mammothResult.value;
//     }

//     throw new Error("Both docx2html and mammoth failed.");
//   }
// }

// // Process HTML for Lexical
// function processHtmlForLexical(html) {
//   try {
//     if (typeof html !== "string") return "";

//     const dom = new JSDOM(html);
//     const document = dom.window.document;

//     if (!document || !document.documentElement) {
//       throw new Error("Invalid HTML content");
//     }

//     // Images
//     document.querySelectorAll("img").forEach((img) => {
//       img.style.maxWidth = "100%";
//       img.style.height = "auto";
//       img.style.display = "block";
//       if (!img.alt) img.alt = "Document image";
//     });

//     // Tables
//     document.querySelectorAll("table").forEach((table) => {
//       table.style.width = "100%";
//       table.style.borderCollapse = "collapse";
//       table.querySelectorAll("td, th").forEach((cell) => {
//         cell.style.border = "1px solid #ddd";
//         cell.style.padding = "8px";
//       });
//     });

//     // Spacing
//     document
//       .querySelectorAll("p,h1,h2,h3,h4,h5,h6,li,td,th")
//       .forEach((el) => {
//         el.style.marginTop = "8px";
//         el.style.marginBottom = "8px";
//       });

//     return document.body.innerHTML;
//   } catch (error) {
//     console.warn("HTML processing failed:", error.message);
//     return html;
//   }
// }

// // POST upload & convert
// app.post("/api/convert-docx-to-html", upload.single("file"), async (req, res) => {
//   let filePath;
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     filePath = req.file.path;
//     const htmlString = await convertDocxToHtml(filePath);
//     const processedHtml = processHtmlForLexical(htmlString);

//     res.json({ success: true, html: processedHtml });
//   } catch (error) {
//     res.status(500).json({
//       error: "Failed to convert document",
//       details: error.message,
//       suggestion: "Please try with a valid DOCX file",
//     });
//   } finally {
//     if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
//   }
// });

// // GET convert from URL
// app.get("/api/convert-docx-to-html", async (req, res) => {
//   let tempFilePath;
//   try {
//     const fileUrl = req.query.url;
//     if (!fileUrl) {
//       return res.status(400).json({ error: "No file URL provided" });
//     }

//     const response = await fetch(fileUrl);
//     if (!response.ok)
//       throw new Error(`Failed to download file: ${response.status}`);

//     const buffer = Buffer.from(await response.arrayBuffer());
//     const uploadDir = "uploads/";
//     if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

//     tempFilePath = path.join(uploadDir, `temp-${Date.now()}.docx`);
//     fs.writeFileSync(tempFilePath, buffer);

//     const htmlString = await convertDocxToHtml(tempFilePath);
//     const processedHtml = processHtmlForLexical(htmlString);

//     res.json({ success: true, html: processedHtml });
//   } catch (error) {
//     res
//       .status(500)
//       .json({ error: "Failed to convert document", details: error.message });
//   } finally {
//     if (tempFilePath && fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
//   }
// });

// // Health check
// app.get("/api/health", (req, res) => {
//   res.json({ status: "OK", message: "DOCX to HTML converter is running" });
// });

// // Error handling
// app.use((error, req, res, next) => {
//   if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
//     return res
//       .status(400)
//       .json({ error: "File too large. Max size is 10MB." });
//   }
//   res.status(500).json({ error: error.message });
// });

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// module.exports = app;

// const express = require("express");
// const multer = require("multer");
// const path = require("path");
// const fs = require("fs");
// const cors = require("cors");
// const mammoth = require("mammoth");
// const fetch = require("node-fetch");

// const app = express();
// const PORT = process.env.PORT || 3001;

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.static("public"));
// app.use("/uploads/images", express.static(path.join(__dirname, "uploads/images")));

// // Configure Multer
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const uploadDir = "uploads/";
//     if (!fs.existsSync(uploadDir)) {
//       fs.mkdirSync(uploadDir, { recursive: true });
//     }
//     cb(null, uploadDir);
//   },
//   filename: (req, file, cb) => {
//     cb(null, Date.now() + "-" + file.originalname);
//   },
// });

// const upload = multer({
//   storage: storage,
//   fileFilter: (req, file, cb) => {
//     const validExtensions = [".docx"];
//     const hasValidExtension = validExtensions.some((ext) =>
//       file.originalname.toLowerCase().endsWith(ext)
//     );

//     if (hasValidExtension) cb(null, true);
//     else cb(new Error("Invalid file type. Please upload a DOCX file."));
//   },
//   limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
// });

// // Convert DOCX → HTML with Mammoth (handles images)
// async function convertDocxToHtml(filePath) {
//   const imageDir = path.join(__dirname, "uploads/images");
//   if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });

//   const result = await mammoth.convertToHtml({ path: filePath }, {
//     convertImage: mammoth.images.imgElement(function (image) {
//       return image.read("base64").then((imageBuffer) => {
//         const imageName = `image-${Date.now()}-${Math.floor(Math.random() * 10000)}.png`;
//         const imagePath = path.join(imageDir, imageName);

//         fs.writeFileSync(imagePath, Buffer.from(imageBuffer, "base64"));

//         // Return <img src="..."> pointing to our server
//         return { src: `/uploads/images/${imageName}` };
//       });
//     }),
//   });

//   return result.value; // HTML string
// }

// // POST upload & convert
// app.post("/api/convert-docx-to-html", upload.single("file"), async (req, res) => {
//   let filePath;
//   try {
//     if (!req.file) {
//       return res.status(400).json({ error: "No file uploaded" });
//     }

//     filePath = req.file.path;
//     const htmlString = await convertDocxToHtml(filePath);

//     res.json({ success: true, html: htmlString });
//   } catch (error) {
//     console.error("Conversion error:", error);
//     res.status(500).json({
//       error: "Failed to convert document",
//       details: error.message,
//     });
//   } finally {
//     if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
//   }
// });

// // GET convert from URL
// app.get("/api/convert-docx-to-html", async (req, res) => {
//   let tempFilePath;
//   try {
//     const fileUrl = req.query.url;
//     if (!fileUrl) {
//       return res.status(400).json({ error: "No file URL provided" });
//     }

//     const response = await fetch(fileUrl);
//     if (!response.ok) throw new Error(`Failed to download file: ${response.status}`);

//     const buffer = Buffer.from(await response.arrayBuffer());
//     const uploadDir = "uploads/";
//     if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

//     tempFilePath = path.join(uploadDir, `temp-${Date.now()}.docx`);
//     fs.writeFileSync(tempFilePath, buffer);

//     const htmlString = await convertDocxToHtml(tempFilePath);

//     res.json({ success: true, html: htmlString });
//   } catch (error) {
//     res.status(500).json({ error: "Failed to convert document", details: error.message });
//   } finally {
//     if (tempFilePath && fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
//   }
// });

// // Health check
// app.get("/api/health", (req, res) => {
//   res.json({ status: "OK", message: "DOCX to HTML converter is running" });
// });

// // Error handling
// app.use((error, req, res, next) => {
//   if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
//     return res.status(400).json({ error: "File too large. Max size is 10MB." });
//   }
//   res.status(500).json({ error: error.message });
// });

// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });

// module.exports = app;


const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const cors = require("cors");
const mammoth = require("mammoth");
const fetch = require("node-fetch");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static images from /uploads/images
app.use("/uploads/images", express.static(path.join(__dirname, "uploads/images")));

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const validExtensions = [".docx"];
    const hasValidExtension = validExtensions.some((ext) =>
      file.originalname.toLowerCase().endsWith(ext)
    );

    if (hasValidExtension) cb(null, true);
    else cb(new Error("Invalid file type. Please upload a DOCX file."));
  },
  limits: { fileSize: 50 * 1024 * 1024 }, // ✅ Increased to 50MB
});

// Convert DOCX → HTML with Mammoth (handles images)
async function convertDocxToHtml(filePath) {
  const imageDir = path.join(__dirname, "uploads/images");
  if (!fs.existsSync(imageDir)) fs.mkdirSync(imageDir, { recursive: true });

  const result = await mammoth.convertToHtml({ path: filePath }, {
    convertImage: mammoth.images.imgElement(function (image) {
      return image.read("base64").then((imageBuffer) => {
        const imageName = `image-${Date.now()}-${Math.floor(Math.random() * 10000)}.png`;
        const imagePath = path.join(imageDir, imageName);

        fs.writeFileSync(imagePath, Buffer.from(imageBuffer, "base64"));

        // ✅ Return correct public URL for frontend
        return { src: `/uploads/images/${imageName}` };
      });
    }),
  });

  return result.value; // HTML string
}

// POST upload & convert
app.post("/api/convert-docx-to-html", upload.single("file"), async (req, res) => {
  let filePath;
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    filePath = req.file.path;
    const htmlString = await convertDocxToHtml(filePath);

    res.json({ success: true, html: htmlString });
  } catch (error) {
    console.error("Conversion error:", error);
    res.status(500).json({
      error: "Failed to convert document",
      details: error.message,
    });
  } finally {
    if (filePath && fs.existsSync(filePath)) fs.unlinkSync(filePath);
  }
});

// GET convert from URL
app.get("/api/convert-docx-to-html", async (req, res) => {
  let tempFilePath;
  try {
    const fileUrl = req.query.url;
    if (!fileUrl) {
      return res.status(400).json({ error: "No file URL provided" });
    }

    const response = await fetch(fileUrl);
    if (!response.ok) throw new Error(`Failed to download file: ${response.status}`);

    const buffer = Buffer.from(await response.arrayBuffer());
    const uploadDir = "uploads/";
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    tempFilePath = path.join(uploadDir, `temp-${Date.now()}.docx`);
    fs.writeFileSync(tempFilePath, buffer);

    const htmlString = await convertDocxToHtml(tempFilePath);

    res.json({ success: true, html: htmlString });
  } catch (error) {
    res.status(500).json({ error: "Failed to convert document", details: error.message });
  } finally {
    if (tempFilePath && fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "DOCX to HTML converter is running" });
});

// Error handling
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError && error.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({ error: "File too large. Max size is 50MB." }); // ✅ updated
  }
  res.status(500).json({ error: error.message });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;

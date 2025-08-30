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
    styleMap: [
      "p[style-name='Heading 1'] => h1:fresh",
      "p[style-name='Heading 2'] => h2:fresh",
      "p[style-name='Heading 3'] => h3:fresh",
      "p[style-name='Title'] => h1.title:fresh",
      "p[style-name='Subtitle'] => h2.subtitle:fresh",
    ],
    includeDefaultStyleMap: true,
    preserveEmptyParagraphs: true,
    convertImage: mammoth.images.imgElement(function (image) {
      return image.read("base64").then((imageBuffer) => {
        const imageName = `image-${Date.now()}-${Math.floor(Math.random() * 10000)}.png`;
        const imagePath = path.join(imageDir, imageName);

        fs.writeFileSync(imagePath, Buffer.from(imageBuffer, "base64"));

        // ✅ Return correct public URL for frontend
        return { src: `/uploads/images/${imageName}` };
      });
    }),
    transformDocument: mammoth.transforms.paragraph(function(element) {
      // Preserve paragraph spacing and formatting
      if (element.styleId) {
        element.styleName = element.styleId;
      }
      return element;
    }),
  });

  // Post-process the HTML to enhance table formatting
  let processedHtml = result.value;
  
  // Enhance table styling
  processedHtml = processedHtml.replace(
    /<table/g, 
    '<table style="border-collapse: collapse; width: 100%; margin: 16px 0;"'
  );
  
  processedHtml = processedHtml.replace(
    /<td/g, 
    '<td style="border: 1px solid #ccc; padding: 8px; vertical-align: top;"'
  );
  
  processedHtml = processedHtml.replace(
    /<th/g, 
    '<th style="border: 1px solid #ccc; padding: 8px; background-color: #f5f5f5; font-weight: bold; vertical-align: top;"'
  );
  return processedHtml; // Enhanced HTML string
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

# PDF Editor - Quick Start Guide

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn package manager

### Installation & Running

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Start Development Server**

   ```bash
   npm run dev
   ```

3. **Open in Browser**
   - Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 How to Use

### 1. Upload a PDF

- **Drag & Drop**: Simply drag a PDF file from your computer into the upload area
- **Browse**: Click "Choose File" button to browse and select a PDF
- Supports PDF files up to 50MB

### 2. Navigate Your Document

- **Page Navigation**: Use arrow buttons at the top to move between pages
- **Zoom Controls**: Click + / - buttons to zoom in and out
- **Current View**: See your current page number and total pages

### 3. Add Text Annotations

1. Click the **Text Tool** (T icon) in the left toolbar
2. Click anywhere on the PDF where you want to add text
3. A text box with "Click to edit" will appear
4. **Move Text**:
   - Click the **Select Tool** (cursor icon)
   - Click and drag the text to reposition
5. **Edit Text**: Double-click any text to edit its content
6. **Customize Text**: When text is selected, a properties panel appears on the right:
   - Change font size (10px - 48px)
   - Choose text color from presets or custom color picker
   - Edit text content directly

### 4. Add Your Signature

1. Click the **Signature Tool** (pen icon) in the left toolbar
2. Choose from three signature methods:

   **Draw Signature**

   - Use your mouse or touchscreen to draw your signature
   - Click "Clear" to start over
   - Click "Save Signature" when done

   **Type Signature**

   - Enter your name in the text field
   - Choose from 5 elegant font styles
   - Preview updates in real-time
   - Click "Save Signature" when satisfied

   **Upload Signature**

   - Click "Save Signature" to open file picker
   - Select a signature image (PNG, JPG, etc.)
   - Image will be added to your PDF

3. **Reposition Signature**:
   - Click the **Select Tool**
   - Click and drag the signature to move it

### 5. Manage Annotations

- **Select**: Click the Select Tool (cursor icon) to move or select items
- **Delete**:
  - Select an annotation (text or signature)
  - Click the **Trash** icon at the bottom of the toolbar
- **Edit**: Double-click text annotations to modify content

### 6. Export Your PDF

1. Click **Download PDF** button in the top-right corner
2. Your edited PDF will download with all annotations embedded
3. Original PDF remains unchanged

## 💡 Pro Tips

- **Multi-Page Documents**: Annotations are tied to specific pages
- **Precision Placement**: Use zoom to position annotations precisely
- **Text Customization**: Select text annotations to access the properties panel
- **Signature Styles**: Try all three signature methods to find your favorite
- **Quick Delete**: Select and delete unwanted annotations anytime

## 🎨 Features Summary

✅ Drag-and-drop PDF upload  
✅ Multi-page navigation  
✅ Zoom controls (50% - 200%)  
✅ Text annotations with full customization  
✅ Multiple signature styles (draw, type, upload)  
✅ Drag-and-drop annotation positioning  
✅ Real-time property editing  
✅ Export to PDF with embedded annotations

## 🔧 Keyboard Shortcuts

- **Escape**: Close modals
- **Delete**: Remove selected annotation (when implemented)

## 🐛 Troubleshooting

**PDF Not Loading?**

- Ensure the file is a valid PDF
- Check file size is under 50MB
- Try refreshing the page

**Annotations Not Saving?**

- Make sure to click "Download PDF" to export
- Annotations only save when you download the PDF

**Signature Tool Not Working?**

- Ensure you've clicked "Save Signature" in the modal
- For uploaded signatures, check image format is supported

## 📝 Notes

- All editing happens locally in your browser
- No files are uploaded to any server
- Your data remains private and secure
- Original PDFs are never modified

---

**Need More Help?** Check the main README.md for technical details and project structure.

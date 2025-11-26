# PDF Editor - Development Notes

## 🏗️ Project Structure

### Directory Layout

```
pdf-editor/
├── app/
│   ├── layout.tsx          # Root layout with metadata & fonts
│   ├── page.tsx            # Home page with dynamic PDF editor
│   ├── globals.css         # Tailwind CSS imports
│   └── pdf-viewer.css      # Custom PDF viewer styles
├── components/
│   ├── PDFEditor.tsx       # Main orchestrator component
│   ├── PDFUpload.tsx       # Drag-and-drop file upload
│   ├── PDFViewer.tsx       # PDF rendering & annotations
│   ├── SignatureModal.tsx  # Multi-style signature creator
│   └── TextPropertiesPanel.tsx  # Text customization panel
├── public/                  # Static assets
├── next.config.ts          # Next.js configuration
├── package.json            # Dependencies & scripts
├── tsconfig.json           # TypeScript configuration
├── tailwind.config.ts      # Tailwind CSS configuration
└── README.md               # Project documentation
```

## 🔧 Key Technical Decisions

### 1. Client-Side Only Architecture

- **Why**: Privacy and performance - no server needed
- **Implementation**: 'use client' directives, dynamic imports
- **Benefit**: Files never leave user's device

### 2. Dynamic Imports for PDF Components

```typescript
const PDFEditor = dynamic(() => import('@/components/PDFEditor'), {
  ssr: false,
  loading: () => <div>Loading...</div>,
})
```

- **Why**: PDF.js requires browser APIs
- **Benefit**: Better initial load performance

### 3. TypeScript Throughout

- **Why**: Type safety prevents runtime errors
- **Implementation**: Interfaces for all data structures
- **Benefit**: Better IDE support and maintainability

### 4. State Management

- Local component state with React hooks
- No global state library needed (appropriate for this scale)
- useCallback for performance optimization

### 5. PDF Library Choices

- **react-pdf**: Best rendering quality
- **pdf-lib**: Best for PDF manipulation/export
- **pdfjs-dist@3.11.174**: Compatible version for react-pdf

## 📦 Dependencies Explained

### Core Dependencies

```json
{
  "next": "16.0.4", // Latest Next.js with App Router
  "react": "^19", // Latest React
  "typescript": "^5", // Type safety
  "tailwindcss": "^4" // Styling
}
```

### PDF Handling

```json
{
  "pdf-lib": "^1.17.1", // PDF creation/modification
  "react-pdf": "^9.1.1", // PDF rendering component
  "pdfjs-dist": "3.11.174" // PDF.js library (compatible version)
}
```

### UI Components

```json
{
  "react-signature-canvas": "^1.0.6", // Signature drawing
  "lucide-react": "^0.468.0" // Modern icon library
}
```

## 🎨 Design Patterns

### Component Composition

- Small, focused components
- Clear props interfaces
- Single responsibility principle

### State Flow

```
PDFEditor (parent)
  ├── State: annotations, currentTool, selectedId
  ├── Callbacks: handleAdd, handleUpdate, handleDelete
  └── Children:
      ├── PDFUpload (file selection)
      ├── PDFViewer (rendering & interaction)
      ├── SignatureModal (signature creation)
      └── TextPropertiesPanel (text editing)
```

### Event Handling

- useCallback for all event handlers
- Proper dependency arrays
- Event bubbling control (stopPropagation)

## 🐛 Common Issues & Solutions

### Issue 1: PDF.js Worker Errors

**Problem**: "Cannot find worker"  
**Solution**: CDN-hosted worker in PDFViewer.tsx:

```typescript
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`
```

### Issue 2: Canvas Not Found

**Problem**: Webpack tries to bundle 'canvas' module  
**Solution**: Alias canvas to false in next.config.ts:

```typescript
webpack: (config) => {
  config.resolve.alias.canvas = false
  return config
}
```

### Issue 3: SSR Errors with PDF Components

**Problem**: PDF.js requires browser APIs  
**Solution**: Dynamic import with ssr: false

### Issue 4: Turbopack Warning

**Problem**: Next.js 16 uses Turbopack by default  
**Solution**: Add empty turbopack config:

```typescript
turbopack: {},
```

## 🔄 Data Flow

### Annotation Management

1. User clicks tool (text/signature)
2. State updates currentTool
3. User clicks/interacts with PDF
4. New annotation added to state array
5. PDFViewer renders annotation overlay
6. User can select/drag with 'select' tool
7. Updates propagate through callbacks

### PDF Export Flow

1. Load original PDF with pdf-lib
2. Iterate through text annotations
3. Draw each text with PDFLib API
4. Iterate through signature annotations
5. Embed PNG images for signatures
6. Save modified PDF
7. Create blob and download

## 🚀 Performance Considerations

### Optimizations Implemented

- Memoized callbacks with useCallback
- Conditional rendering (current page only)
- CSS transforms for drag (not re-renders)
- Efficient array updates with functional setState

### Potential Improvements

- Virtual scrolling for large PDFs
- Web Workers for PDF processing
- IndexedDB for annotation caching
- Lazy loading of signature fonts

## 🧪 Testing Strategy

### Areas to Test

1. **File Upload**

   - Valid PDF files
   - Invalid file types
   - Large files
   - Corrupted PDFs

2. **Annotations**

   - Add/edit/delete text
   - Add/move signatures
   - Multi-page annotations
   - Zoom behavior

3. **Export**

   - Single page PDFs
   - Multi-page PDFs
   - Various annotation types
   - Large number of annotations

4. **Browser Compatibility**
   - Chrome/Edge
   - Firefox
   - Safari
   - Mobile browsers

## 📝 Code Style Guidelines

### TypeScript

- Explicit return types for functions
- Interface for all complex objects
- Avoid 'any' type
- Use const for immutable values

### React

- Functional components only
- Hooks for state management
- Props destructuring
- Clear component naming

### Styling

- Tailwind utility classes
- No inline styles (except dynamic values)
- Consistent spacing scale
- Mobile-first approach

## 🔐 Security Considerations

### Current Implementation

- All processing client-side
- No data transmission
- No external API calls
- Browser sandboxing

### Future Considerations

- Content Security Policy headers
- PDF size limits
- Input sanitization for export
- Prevent XSS in text annotations

## 📚 Learning Resources

### Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [pdf-lib Documentation](https://pdf-lib.js.org/)
- [react-pdf Guide](https://github.com/wojtekmaj/react-pdf)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Tutorials

- Next.js 15 App Router
- PDF manipulation with pdf-lib
- React Hooks patterns
- TypeScript with React

## 🎯 Future Development Roadmap

### Phase 1: Core Enhancements

- [ ] Undo/Redo functionality
- [ ] Keyboard shortcuts
- [ ] Text alignment options
- [ ] More font families

### Phase 2: Advanced Features

- [ ] Highlighting tool
- [ ] Drawing shapes (rectangles, circles)
- [ ] Sticky notes
- [ ] Image insertion

### Phase 3: User Experience

- [ ] Annotation templates
- [ ] Saved signature library
- [ ] Recent files list
- [ ] Dark mode

### Phase 4: Collaboration

- [ ] Share annotations
- [ ] Comment threads
- [ ] Version history
- [ ] Real-time collaboration

## 🛠️ Development Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Package Management
npm install          # Install dependencies
npm update           # Update dependencies
npm audit            # Check for vulnerabilities
```

## 📊 Bundle Analysis

### Current Bundle Size

- Main bundle: ~500KB (estimated)
- PDF.js worker: ~1.5MB
- Total initial load: <2MB

### Optimization Opportunities

- Code splitting by route
- Tree shaking unused code
- Compress images
- CDN for static assets

---

**Last Updated**: November 26, 2025  
**Version**: 1.0.0  
**Next.js Version**: 16.0.4

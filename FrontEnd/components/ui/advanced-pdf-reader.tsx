'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { 
  ChevronLeft, 
  ChevronRight, 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  Download, 
  Loader2, 
  Maximize,
  Minimize,
  Grid3X3,
  FileText
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
}

interface PDFDocument {
  numPages: number;
}

interface AdvancedPDFReaderProps {
  file?: string | File | null;
  className?: string;
  height?: string | number;
  width?: string | number;
  enableDownload?: boolean;
  enableRotate?: boolean;
  enableZoom?: boolean;
  enableFullscreen?: boolean;
  enableThumbnails?: boolean;
  onLoadSuccess?: (document: PDFDocument) => void;
  onLoadError?: (error: Error) => void;
}

export function AdvancedPDFReader({
  file,
  className,
  height = '600px',
  width = '100%',
  enableDownload = true,
  enableRotate = true,
  enableZoom = true,
  enableFullscreen = true,
  enableThumbnails = true,
  onLoadSuccess,
  onLoadError,
}: AdvancedPDFReaderProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showThumbnails, setShowThumbnails] = useState<boolean>(false);
  const [fitToWidth, setFitToWidth] = useState<boolean>(false);
  
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle successful document load
  const onDocumentLoadSuccess = useCallback(({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setPageNumber(1);
    setLoading(false);
    setError(null);
    onLoadSuccess?.({ numPages });
  }, [onLoadSuccess]);

  // Handle document load error
  const onDocumentLoadError = useCallback((error: Error) => {
    setLoading(false);
    setError(error.message);
    onLoadError?.(error);
    console.error('PDF Load Error:', error);
  }, [onLoadError]);

  // Page navigation
  const goToPreviousPage = useCallback(() => {
    setPageNumber(prev => Math.max(prev - 1, 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setPageNumber(prev => Math.min(prev + 1, numPages));
  }, [numPages]);

  const goToPage = useCallback((page: number) => {
    const pageNum = Math.max(1, Math.min(page, numPages));
    setPageNumber(pageNum);
  }, [numPages]);

  // Zoom controls
  const zoomIn = useCallback(() => {
    setScale(prev => Math.min(prev + 0.25, 3.0));
    setFitToWidth(false);
  }, []);

  const zoomOut = useCallback(() => {
    setScale(prev => Math.max(prev - 0.25, 0.5));
    setFitToWidth(false);
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1.0);
    setFitToWidth(false);
  }, []);

  const toggleFitToWidth = useCallback(() => {
    setFitToWidth(prev => !prev);
  }, []);

  // Rotation controls
  const rotateClockwise = useCallback(() => {
    setRotation(prev => (prev + 90) % 360);
  }, []);

  // Fullscreen toggle
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      containerRef.current.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  // Thumbnail toggle
  const toggleThumbnails = useCallback(() => {
    setShowThumbnails(prev => !prev);
  }, []);

  // Download functionality
  const downloadPDF = useCallback(() => {
    if (!file || typeof file === 'string') {
      if (typeof file === 'string') {
        window.open(file, '_blank');
      }
      return;
    }

    const url = URL.createObjectURL(file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name || 'document.pdf';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [file]);

  // Handle page input change
  const handlePageInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      goToPage(value);
    }
  }, [goToPage]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          goToPreviousPage();
          break;
        case 'ArrowRight':
          e.preventDefault();
          goToNextPage();
          break;
        case 'Home':
          e.preventDefault();
          goToPage(1);
          break;
        case 'End':
          e.preventDefault();
          goToPage(numPages);
          break;
        case '+':
        case '=':
          e.preventDefault();
          zoomIn();
          break;
        case '-':
          e.preventDefault();
          zoomOut();
          break;
        case '0':
          e.preventDefault();
          resetZoom();
          break;
        case 'f':
          if (enableFullscreen) {
            e.preventDefault();
            toggleFullscreen();
          }
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    goToPreviousPage, 
    goToNextPage, 
    goToPage, 
    numPages, 
    zoomIn, 
    zoomOut, 
    resetZoom, 
    toggleFullscreen, 
    enableFullscreen
  ]);

  // Set loading state when file changes
  useEffect(() => {
    if (file) {
      setLoading(true);
      setError(null);
    }
  }, [file]);

  // Handle fullscreen change
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  if (!file) {
    return (
      <div className={cn(
        "flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8",
        className
      )} style={{ height, width }}>
        <FileText className="w-12 h-12 text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg">No PDF file selected</p>
        <p className="text-gray-400 text-sm mt-2">Upload a file or provide a URL to get started</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className={cn(
        "flex bg-gray-50 rounded-lg overflow-hidden",
        isFullscreen ? "fixed inset-0 z-50 rounded-none" : "flex-col",
        className
      )}
      style={isFullscreen ? {} : { height, width }}
    >
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center space-x-2">
          {/* Page Navigation */}
          <Button
            variant="outline"
            size="sm"
            onClick={goToPreviousPage}
            disabled={pageNumber <= 1 || loading}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex items-center space-x-2">
            <Input
              type="number"
              value={pageNumber}
              onChange={handlePageInputChange}
              className="w-16 text-center text-sm"
              min={1}
              max={numPages}
              disabled={loading}
            />
            <span className="text-sm text-gray-500">/ {numPages}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={goToNextPage}
            disabled={pageNumber >= numPages || loading}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          {/* Thumbnails */}
          {enableThumbnails && (
            <Button
              variant={showThumbnails ? "default" : "outline"}
              size="sm"
              onClick={toggleThumbnails}
              disabled={loading}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
          )}

          {/* Zoom Controls */}
          {enableZoom && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={zoomOut}
                disabled={scale <= 0.5 || loading}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={resetZoom}
                disabled={loading}
                className="min-w-[60px]"
              >
                {Math.round(scale * 100)}%
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={zoomIn}
                disabled={scale >= 3.0 || loading}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>

              <Button
                variant={fitToWidth ? "default" : "outline"}
                size="sm"
                onClick={toggleFitToWidth}
                disabled={loading}
              >
                Fit Width
              </Button>
            </>
          )}

          {/* Rotation */}
          {enableRotate && (
            <Button
              variant="outline"
              size="sm"
              onClick={rotateClockwise}
              disabled={loading}
            >
              <RotateCw className="w-4 h-4" />
            </Button>
          )}

          {/* Fullscreen */}
          {enableFullscreen && (
            <Button
              variant="outline"
              size="sm"
              onClick={toggleFullscreen}
              disabled={loading}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </Button>
          )}

          {/* Download */}
          {enableDownload && (
            <Button
              variant="outline"
              size="sm"
              onClick={downloadPDF}
              disabled={loading}
            >
              <Download className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Thumbnails Panel */}
        {showThumbnails && (
          <div className="w-48 bg-white border-r border-gray-200 overflow-y-auto flex-shrink-0">
            <div className="p-2 space-y-2">
              {Array.from({ length: numPages }, (_, index) => (
                <div
                  key={index + 1}
                  className={cn(
                    "cursor-pointer border-2 rounded p-1 hover:border-blue-300",
                    pageNumber === index + 1 ? "border-blue-500 bg-blue-50" : "border-gray-200"
                  )}
                  onClick={() => goToPage(index + 1)}
                >
                  <Document file={file} loading={<div className="h-20 bg-gray-100" />}>
                    <Page
                      pageNumber={index + 1}
                      scale={0.2}
                      loading={<div className="h-20 bg-gray-100" />}
                    />
                  </Document>
                  <p className="text-xs text-center mt-1">{index + 1}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PDF Viewer */}
        <div className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center">
          {loading && (
            <div className="flex items-center space-x-2 text-gray-600">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span>Loading PDF...</span>
            </div>
          )}

          {error && (
            <div className="text-center text-red-600 p-4">
              <p className="font-medium">Error loading PDF</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
          )}

          {!loading && !error && (
            <Document
              file={file}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              loading={
                <div className="flex items-center space-x-2 text-gray-600">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Loading PDF...</span>
                </div>
              }
              error={
                <div className="text-center text-red-600 p-4">
                  <p className="font-medium">Failed to load PDF</p>
                  <p className="text-sm mt-1">Please check if the file is valid</p>
                </div>
              }
            >
              <Page
                pageNumber={pageNumber}
                scale={fitToWidth ? undefined : scale}
                width={fitToWidth ? containerRef.current?.clientWidth ? containerRef.current.clientWidth - (showThumbnails ? 200 : 40) : undefined : undefined}
                rotate={rotation}
                loading={
                  <div className="flex items-center space-x-2 text-gray-600 p-8">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span>Loading page...</span>
                  </div>
                }
                error={
                  <div className="text-center text-red-600 p-8">
                    <p className="font-medium">Failed to load page {pageNumber}</p>
                  </div>
                }
                className="shadow-lg max-w-full"
              />
            </Document>
          )}
        </div>
      </div>

      {/* Keyboard shortcuts info */}
      {isFullscreen && (
        <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white p-2 rounded text-xs">
          <div>← → Navigate | + - Zoom | F Fullscreen | ESC Exit</div>
        </div>
      )}
    </div>
  );
}

export default AdvancedPDFReader;
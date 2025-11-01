'use client';

import { useState, useCallback, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, RotateCw, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configure PDF.js worker
if (typeof window !== 'undefined') {
  // Use local worker file for reliability
  pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
  console.log('PDF.js worker configured with local file');
  console.log('PDF.js version:', pdfjs.version);
}

// ✅ ĐỪNG đặt `export const runtime = 'nodejs'` trong client component dùng DOM
// ❌ export const runtime = 'nodejs';

interface PDFDocument {
  numPages: number;
}

interface PDFReaderProps {
  file?: string | File | Blob | null;
  className?: string;
  height?: string | number;
  width?: string | number;
  enableDownload?: boolean;
  enableRotate?: boolean;
  enableZoom?: boolean;
  onLoadSuccess?: (document: PDFDocument) => void;
  onLoadError?: (error: Error) => void;
}

export default function PDFReader({
  file,
  className,
  height = '600px',
  width = '100%',
  enableDownload = true,
  enableRotate = true,
  enableZoom = true,
  onLoadSuccess,
  onLoadError,
}: PDFReaderProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [pdfData, setPdfData] = useState<ArrayBuffer | null>(null);



  // Handle successful document load
  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      console.log('PDF Reader - Document loaded successfully!', { numPages });
      setNumPages(numPages);
      setPageNumber(1);
      setLoading(false);
      setError(null);
      onLoadSuccess?.({ numPages });
    },
    [onLoadSuccess]
  );

  // Handle document load error
  const onDocumentLoadError = useCallback(
    (err: Error) => {
      setLoading(false);
      setError(err.message);
      onLoadError?.(err);
      console.error('PDF Load Error:', err);
      console.error('Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack,
        file: file,
        fileType: typeof file,
        fileSize: file instanceof File ? file.size : 'N/A'
      });
    },
    [onLoadError, file]
  );

  // Page navigation
  const goToPreviousPage = useCallback(() => {
    setPageNumber((prev) => Math.max(prev - 1, 1));
  }, []);

  const goToNextPage = useCallback(() => {
    setPageNumber((prev) => Math.min(prev + 1, numPages));
  }, [numPages]);

  const goToPage = useCallback(
    (page: number) => {
      const pageNum = Math.max(1, Math.min(page, numPages));
      setPageNumber(pageNum);
    },
    [numPages]
  );

  // Zoom controls
  const zoomIn = useCallback(() => {
    setScale((prev) => Math.min(prev + 0.25, 3.0));
  }, []);

  const zoomOut = useCallback(() => {
    setScale((prev) => Math.max(prev - 0.25, 0.5));
  }, []);

  const resetZoom = useCallback(() => {
    setScale(1.0);
  }, []);

  // Rotation controls
  const rotateClockwise = useCallback(() => {
    setRotation((prev) => (prev + 90) % 360);
  }, []);

  // Handle page input change
  const handlePageInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value);
      if (!isNaN(value)) goToPage(value);
    },
    [goToPage]
  );

  // Process file when it changes
  useEffect(() => {
    if (file) {
      setError(null);
      console.log('PDF Reader - File changed:', {
        fileType: typeof file,
        fileName: file instanceof File ? file.name : (file instanceof Blob ? 'Blob' : file),
        fileSize: (file instanceof File || file instanceof Blob) ? file.size : 'N/A',
        isFile: file instanceof File,
        isBlob: file instanceof Blob
      });

      // Convert File/Blob object to ArrayBuffer for react-pdf
      if (file instanceof File || file instanceof Blob) {
        // Don't set loading here since file is already downloaded
        file.arrayBuffer().then(buffer => {
          setPdfData(buffer);
          console.log('PDF Reader - ArrayBuffer ready:', buffer.byteLength, 'bytes');
          // Let react-pdf handle its own loading state
        }).catch(err => {
          console.error('PDF Reader - Failed to create ArrayBuffer:', err);
          setError('Failed to process PDF file');
        });
      } else if (typeof file === 'string') {
        // For string URLs, react-pdf will handle loading
        setPdfData(null);
      } else {
        setPdfData(null);
      }
    } else {
      setPdfData(null);
    }
  }, [file]);



  if (!file) {
    return (
      <div
        className={cn('flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg', className)}
        style={{ height, width }}
      >
        <p className="text-gray-500">No PDF file selected</p>
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col bg-gray-50 rounded-lg overflow-hidden', className)}>
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={goToPreviousPage} disabled={pageNumber <= 1 || loading}>
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

          <Button variant="outline" size="sm" onClick={goToNextPage} disabled={pageNumber >= numPages || loading}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          {enableZoom && (
            <>
              <Button variant="outline" size="sm" onClick={zoomOut} disabled={scale <= 0.5 || loading}>
                <ZoomOut className="w-4 h-4" />
              </Button>

              <Button variant="outline" size="sm" onClick={resetZoom} disabled={loading} className="min-w-[60px]">
                {Math.round(scale * 100)}%
              </Button>

              <Button variant="outline" size="sm" onClick={zoomIn} disabled={scale >= 3.0 || loading}>
                <ZoomIn className="w-4 h-4" />
              </Button>
            </>
          )}

          {enableRotate && (
            <Button variant="outline" size="sm" onClick={rotateClockwise} disabled={loading}>
              <RotateCw className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* PDF Viewer */}
      <div
        className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center"
        style={{ height: typeof height === 'string' ? `calc(${height} - 60px)` : height }}
      >


        {error && (
          <div className="text-center text-red-600 p-4">
            <p className="font-medium">Error loading PDF</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {!error && (pdfData || (typeof file === 'string' && file)) && (
          <Document
            file={pdfData || (typeof file === 'string' ? file : null)}
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
              scale={scale}
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
              className="shadow-lg"
            />
          </Document>
        )}
      </div>
    </div>
  );
}

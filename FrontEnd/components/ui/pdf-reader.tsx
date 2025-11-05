"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

interface PDFDocument {
  numPages: number;
}
interface PDFReaderProps {
  file?: string | File | Blob | null;
  className?: string;
  height?: string | number;
  width?: string | number;
  enableRotate?: boolean;
  enableZoom?: boolean;
  onLoadSuccess?: (document: PDFDocument) => void;
  onLoadError?: (error: Error) => void;
}

export default function PDFReader(props: PDFReaderProps) {
  const {
    file,
    className,
    height = "600px",
    width = "100%",
    enableRotate = true,
    enableZoom = true,
    onLoadSuccess,
    onLoadError,
  } = props;
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.0);
  const [rotation, setRotation] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [Document, setDocument] = useState<any>(null);
  const [Page, setPage] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  // Memoize PDF.js options to prevent unnecessary reloads
  const pdfOptions = useMemo(
    () => ({
      cMapUrl: 'https://unpkg.com/pdfjs-dist@latest/cmaps/',
      cMapPacked: true,
      standardFontDataUrl: 'https://unpkg.com/pdfjs-dist@latest/standard_fonts/',
    }),
    []
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Fix DOMMatrix polyfill for older browsers
    if (!(window as any).DOMMatrix) {
      (window as any).DOMMatrix = class {
        a = 1;
        b = 0;
        c = 0;
        d = 1;
        e = 0;
        f = 0;
      };
    }

    let mounted = true;

    const load = async () => {
      try {
        const reactPdf = await import("react-pdf");
        
        // Configure worker
        if (reactPdf.pdfjs) {
          // Use local worker file from public folder
          reactPdf.pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
          
          // Wait for worker to be ready - PDF.js creates worker lazily
          await new Promise(resolve => setTimeout(resolve, 400));
          
          // Verify worker source is set
          if (!reactPdf.pdfjs.GlobalWorkerOptions.workerSrc) {
            throw new Error("Worker source not configured");
          }
        } else {
          console.error("PDF.js not loaded correctly");
          throw new Error("PDF.js failed to load");
        }
        
        if (mounted) {
          setDocument(() => reactPdf.Document);
          setPage(() => reactPdf.Page);
          setIsReady(true);
        }
      } catch (e) {
        console.error("Failed to load react-pdf:", e);
        if (mounted) {
          setError("Failed to load PDF viewer. Please refresh the page.");
        }
      }
    };
    
    load();

    return () => {
      mounted = false;
    };
  }, []);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages(numPages);
      setPageNumber(1);
      setLoading(false);
      setError(null);
      onLoadSuccess?.({ numPages });
    },
    [onLoadSuccess]
  );
  const onDocumentLoadError = useCallback(
    (err: Error) => {
      console.error("PDF Document Load Error:", err);
      setLoading(false);
      setError(err.message || "Failed to load PDF document");
      onLoadError?.(err);
    },
    [onLoadError]
  );
  const goToPreviousPage = useCallback(
    () => setPageNumber((p) => Math.max(p - 1, 1)),
    []
  );
  const goToNextPage = useCallback(
    () => setPageNumber((p) => Math.min(p + 1, numPages)),
    [numPages]
  );
  const goToPage = useCallback(
    (page: number) => setPageNumber(Math.max(1, Math.min(page, numPages))),
    [numPages]
  );
  const zoomIn = useCallback(
    () => setScale((p) => Math.min(p + 0.25, 3.0)),
    []
  );
  const zoomOut = useCallback(
    () => setScale((p) => Math.max(p - 0.25, 0.5)),
    []
  );
  const resetZoom = useCallback(() => setScale(1.0), []);
  const rotateClockwise = useCallback(
    () => setRotation((p) => (p + 90) % 360),
    []
  );
  const handlePageInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = parseInt(e.target.value);
      if (!isNaN(v)) goToPage(v);
    },
    [goToPage]
  );

  useEffect(() => {
    if (file) {
      setError(null);
      
      let newFileUrl: string | null = null;

      if (file instanceof File || file instanceof Blob) {
        // Create object URL instead of ArrayBuffer to avoid detached buffer issues
        newFileUrl = URL.createObjectURL(file);
      } else if (typeof file === "string") {
        newFileUrl = file;
      }

      // Clean up previous URL before setting new one
      setFileUrl((prevUrl) => {
        if (prevUrl && prevUrl.startsWith('blob:')) {
          URL.revokeObjectURL(prevUrl);
        }
        return newFileUrl;
      });
    } else {
      // Clean up URL when file is removed
      setFileUrl((prevUrl) => {
        if (prevUrl && prevUrl.startsWith('blob:')) {
          URL.revokeObjectURL(prevUrl);
        }
        return null;
      });
    }

    // Cleanup function
    return () => {
      setFileUrl((prevUrl) => {
        if (prevUrl && prevUrl.startsWith('blob:')) {
          URL.revokeObjectURL(prevUrl);
        }
        return null;
      });
    };
  }, [file]);

  if (!file)
    return (
      <div
        className={cn(
          "flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg",
          className
        )}
        style={{ height, width }}
      >
        <p className="text-gray-500">No PDF file selected</p>
      </div>
    );
  
  if (!isReady || !Document || !Page)
    return (
      <div
        className={cn(
          "flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg",
          className
        )}
        style={{ height, width }}
      >
        <div className="flex items-center space-x-2 text-gray-600">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading PDF viewer...</span>
        </div>
      </div>
    );

  if (error) {
    return (
      <div
        className={cn(
          "flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg",
          className
        )}
        style={{ height, width }}
      >
        <div className="text-center text-red-600 p-4">
          <p className="font-medium">Error</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col bg-gray-50 rounded-lg overflow-hidden",
        className
      )}
    >
      <div className="flex items-center justify-between p-3 bg-white border-b border-gray-200">
        <div className="flex items-center space-x-2">
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
            </>
          )}
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
        </div>
      </div>
      <div
        className="flex-1 overflow-auto bg-gray-100 flex items-center justify-center"
        style={{
          height:
            typeof height === "string" ? `calc(${height} - 60px)` : height,
        }}
      >
        {error && (
          <div className="text-center text-red-600 p-4">
            <p className="font-medium">Error loading PDF</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}
        {!error &&
          fileUrl &&
          Document &&
          Page && (
            <Document
              file={fileUrl}
              onLoadSuccess={onDocumentLoadSuccess}
              onLoadError={onDocumentLoadError}
              options={pdfOptions}
              loading={
                <div className="flex items-center space-x-2 text-gray-600">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span>Loading PDF...</span>
                </div>
              }
              error={
                <div className="text-center text-red-600 p-4">
                  <p className="font-medium">Failed to load PDF</p>
                  <p className="text-sm mt-1">
                    Please check if the file is valid
                  </p>
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
                    <p className="font-medium">
                      Failed to load page {pageNumber}
                    </p>
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

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, Calendar, Download, Eye, FileText } from "lucide-react";

import { DownloadHistoryDTO } from "@/models/dtos/downloadHistoryDTO";
import { PagedResult } from "@/models/dtos/commonDTO";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import Badge from "@/components/ui/badge";
import { GetUserDownloadHistory } from "@/services/Activity/DownloadHistory";
import { PaginationBar } from "@/components/common/pagination";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DocumentService } from "@/services/document/Document";

const triggerFileDownload = (file: File, fallbackName: string): void => {
    const url = URL.createObjectURL(file);
    const link = window.document.createElement('a');
    link.href = url;
    link.download = file.name || fallbackName;
    window.document.body.appendChild(link);
    link.click();
    window.document.body.removeChild(link);
    URL.revokeObjectURL(url);
};

const formatDate = (dateString: string): string => {
    if (!dateString) return "";
    // If the API timestamp has no timezone, assume UTC to avoid local misinterpretation
    const hasTimeZone = /Z|[+-]\d{2}:?\d{2}$/.test(dateString);
    const safeIso = hasTimeZone ? dateString : `${dateString}Z`;
    const date = new Date(safeIso);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
};

export default function DownloadHistoryPage() {
    const router = useRouter();
    const [downloads, setDownloads] = useState<DownloadHistoryDTO[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    useEffect(() => {
        const fetchDownloadHistory = async () => {
            try {
                setLoading(true);
                setError(null);

                const skip = (currentPage - 1) * pageSize;
                const result: PagedResult<DownloadHistoryDTO> = await GetUserDownloadHistory({
                    $skip: skip,
                    $top: pageSize,
                    $count: true
                });
                
                setDownloads(result.items);
                setTotalCount(result.totalCount);
                setTotalPages(Math.ceil(result.totalCount / pageSize));
            } catch (err) {
                console.error('Error fetching download history:', err);
                setError('Failed to load download history');
            } finally {
                setLoading(false);
            }
        };

        fetchDownloadHistory();
    }, [currentPage, pageSize]);

    const handleViewDocument = (documentId: number) => {
        router.push(`/document/${documentId}`);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
        setCurrentPage(1); 
    };


    const handleDownload = async (docId: number, docFileName: string | null) => {
        if (!docFileName) return;

        try {
            const file = await DocumentService.downloadDocument(docId, docFileName);
            triggerFileDownload(file, `${docFileName}.pdf`);
        } catch (err) {
            console.error('Error downloading document:', err);
            setError('Failed to download document');
        }
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                    <div className="h-64 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card className="text-center">
                    <CardContent className="pt-6">
                        <Download className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{error}</h3>
                        <p className="text-gray-500">
                            Unable to load your download history. Please try again later.
                        </p>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Empty state
    if (downloads.length === 0) {
        return (
            <div className="container mx-auto px-4 py-8">
                <Card>
                    <CardHeader>
                        <CardTitle>My Download History</CardTitle>
                        <CardDescription>Track all your document downloads</CardDescription>
                    </CardHeader>
                    <CardContent className="text-center py-12">
                        <Download className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No downloads yet
                        </h3>
                        <p className="text-gray-500 mb-4">
                            Start downloading documents to see your history here.
                        </p>
                        <Button onClick={() => router.push('/')}>
                            Browse Documents
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Main content
    return (
        <div className="container mx-auto px-4 py-8">
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle>My Download History</CardTitle>
                            <CardDescription>
                                Showing {downloads.length} of {totalCount} download{totalCount !== 1 ? 's' : ''}
                            </CardDescription>
                        </div>
                        <Badge variant="default" className="flex items-center gap-1">
                            <Download className="w-3 h-3" />
                            {totalCount} Total Downloads
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent>
                    {/* Page Size Selector */}
                    <div className="mb-6 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">
                                Showing {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, totalCount)} of {totalCount} downloads
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-sm font-medium text-gray-700">Items per page:</label>
                            <Select
                                value={pageSize.toString()}
                                onValueChange={(value) => handlePageSizeChange(Number(value))}
                                disabled={loading}
                            >
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue placeholder="Select page size" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="5">5 items</SelectItem>
                                    <SelectItem value="10">10 items</SelectItem>
                                    <SelectItem value="20">20 items</SelectItem>
                                    <SelectItem value="50">50 items</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Downloads Table */}
                    {downloads.length === 0 ? (
                        <div className="text-center py-12">
                            <Download className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                            <p className="text-gray-500">
                                No downloads in this page
                            </p>
                        </div>
                    ) : (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Document</TableHead>
                                        <TableHead>Subject</TableHead>
                                        <TableHead>Downloaded Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {downloads.map((download) => (
                                        <TableRow key={`${download.documentID}-${download.downloadedDate}`}>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <FileText className="w-4 h-4 text-gray-400" />
                                                    <span className="font-medium">
                                                        {download.documentTitle}
                                                    </span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline">
                                                    {download.subjectName}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                    <Calendar className="w-4 h-4" />
                                                    {formatDate(download.downloadedDate)}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleViewDocument(download.documentID)}
                                                >
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    View
                                                </Button>
                                                <Button
                                                    variant="default"
                                                    size="sm"
                                                    onClick={() => handleDownload(download.documentID, download.fileURL)}
                                                >
                                                    <ArrowDown className="w-4 h-4 mr-1" />
                                                    Download
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <PaginationBar
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalCount={totalCount}
                            loading={loading}
                            onChange={handlePageChange}
                        />
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

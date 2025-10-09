export type Document = {
    DocumentId: number;
    Title: string;
    Description: string;
    FileUrl: string;
    ViewCount: number;
    DownloadCount: number;
    CategoryId: number;
    SubjectId: number;
    Status: 'Pending' | 'Accepted' | 'Rejected';
}

export type Category = {
    CategoryId: number;
    CategoryName: string;
    Description: string;
}

export type Subject = {
    SubjectId: number;
    SubjectName: string;
    ImageUrl: string;
    Description: string;
}
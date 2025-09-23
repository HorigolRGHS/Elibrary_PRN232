export type Comment = {
    CommentId: number;
    DocumentId: number;
    Content: string;
    CreatedDate: string;
    CreatedBy: string;
}

export type Rating = {
    RatingId: number;
    DocumentId: number;
    StarRating: number;
    Review: string;
    CreatedDate: string;
    CreatedBy: string;
}

export type Report = {
    ReportId: number;
    DocumentId: number;
    Reason: string;
    CreatedDate: string;
    CreatedBy: string;
    Status: 'Pending' | 'Resolved';
}

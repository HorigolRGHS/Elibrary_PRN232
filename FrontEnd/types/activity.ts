export type DownloadHistory = {
    DownloadId: number;
    DocumentId: number;
    DownloadedDate: string;
    DownloadedBy: string;
}

export type Notification = {
    NotificationId: number;
    Title: string;
    Content: string;
    CreatedBy: number;
    CreatedDate: string;
    ScheduledDate: string;
    Type: 'System' | 'Customer' | 'Custom';
    Status: 'Pending' | 'Sent' | 'Cancelled';
}

export type NotificationView = {
    NotificationId: number;
    ViewedBy: number;
    ViewedDate: string;
    Viewed: boolean;
}
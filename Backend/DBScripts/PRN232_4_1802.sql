USE master;
GO

-- Drop old databases if they exist
IF DB_ID(N'ELibrary_Identity') IS NOT NULL DROP DATABASE ELibrary_Identity;
GO
IF DB_ID(N'ELibrary_Catalog') IS NOT NULL DROP DATABASE ELibrary_Catalog;
GO
IF DB_ID(N'ELibrary_Interaction') IS NOT NULL DROP DATABASE ELibrary_Interaction;
GO
IF DB_ID(N'ELibrary_Activity') IS NOT NULL DROP DATABASE ELibrary_Activity;
GO

-- Create separated databases per service
CREATE DATABASE ELibrary_Identity;
GO
CREATE DATABASE ELibrary_Catalog;
GO
CREATE DATABASE ELibrary_Interaction;
GO
CREATE DATABASE ELibrary_Activity;
GO

/* ==============================
   1. Identity Service (ELibrary_Identity)
   ============================== */
USE ELibrary_Identity;
GO

CREATE TABLE [User] (
    UserID INT PRIMARY KEY IDENTITY(1,1),
    FullName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(255) UNIQUE NOT NULL,
    PasswordHash NVARCHAR(256) NOT NULL,
    ImageURL NVARCHAR(500),
    [Role] NVARCHAR(20) NOT NULL CHECK (Role IN ('Customer','Admin')),
    Active BIT NOT NULL DEFAULT 0,
    CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedDate DATETIME,
    DeletedDate DATETIME,
    DeletedBy INT NULL
);

CREATE INDEX IX_User_Email ON [User](Email);
CREATE INDEX IX_User_Role ON [User](Role);
CREATE INDEX IX_User_Active ON [User](Active);
GO

/* ==============================
   2. Catalog Service (ELibrary_Catalog)
   ============================== */
USE ELibrary_Catalog;
GO

CREATE TABLE [Subject] (
    SubjectID INT PRIMARY KEY IDENTITY(1,1),
    SubjectName NVARCHAR(100) NOT NULL,
    ImageURL NVARCHAR(500) NOT NULL,
    [Description] NVARCHAR(500),
    CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedDate DATETIME
);

CREATE TABLE [Category] (
    CategoryID INT PRIMARY KEY IDENTITY(1,1),
    CategoryName NVARCHAR(100) NOT NULL,
    [Description] NVARCHAR(500),
    CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedDate DATETIME
);

CREATE TABLE [Document] (
    DocumentID INT PRIMARY KEY IDENTITY(1,1),
    Title NVARCHAR(200) NOT NULL,
    [Description] NVARCHAR(1000),
    FileURL NVARCHAR(500) NOT NULL,
    ViewCount INT DEFAULT 0,
    DownloadCount INT DEFAULT 0,
    CategoryID INT,
    SubjectID INT,
    [Status] NVARCHAR(20) NOT NULL DEFAULT 'Pending'
        CHECK ([Status] IN ('Pending','Accepted','Rejected')),
    CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedDate DATETIME,
    DeletedDate DATETIME,
    DeletedBy INT NULL,
    CreatedBy INT NOT NULL,
    FOREIGN KEY (CategoryID) REFERENCES [Category](CategoryID) ON DELETE CASCADE,
    FOREIGN KEY (SubjectID) REFERENCES [Subject](SubjectID) ON DELETE CASCADE
);

CREATE INDEX IX_Document_Title ON [Document](Title);
CREATE INDEX IX_Document_CategoryID ON [Document](CategoryID);
CREATE INDEX IX_Document_SubjectID ON [Document](SubjectID);
CREATE INDEX IX_Document_Status ON [Document](Status);
CREATE INDEX IX_Document_CreatedDate ON [Document](CreatedDate);
GO

/* ==============================
   3. Interaction Service (ELibrary_Interaction)
   ============================== */
USE ELibrary_Interaction;
GO

CREATE TABLE [Comment] (
    CommentID INT PRIMARY KEY IDENTITY(1,1),
    DocumentID INT NOT NULL,
    Content NVARCHAR(1000) NOT NULL,
    CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedDate DATETIME,
    CreatedBy INT NULL
);

CREATE TABLE [Rating] (
    RatingID INT PRIMARY KEY IDENTITY(1,1),
    DocumentID INT NOT NULL,
    StarRating INT NOT NULL CHECK (StarRating BETWEEN 1 AND 5),
    Review NVARCHAR(1000),
    CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedDate DATETIME,
    CreatedBy INT NULL
);

CREATE TABLE [Report] (
    ReportID INT PRIMARY KEY IDENTITY(1,1),
    DocumentID INT NOT NULL,
    Reason NVARCHAR(1000) NOT NULL,
    CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedDate DATETIME,
    CreatedBy INT NULL,
    [Status] NVARCHAR(20) NOT NULL DEFAULT 'Pending'
        CHECK (Status IN ('Pending','Resolved'))
);

CREATE INDEX IX_Comment_DocumentID ON [Comment](DocumentID);
CREATE INDEX IX_Comment_CreatedDate ON [Comment](CreatedDate);
CREATE INDEX IX_Rating_DocumentID ON [Rating](DocumentID);
CREATE INDEX IX_Rating_StarRating ON [Rating](StarRating);
CREATE INDEX IX_Report_DocumentID ON [Report](DocumentID);
CREATE INDEX IX_Report_Status ON [Report](Status);
GO

/* ==============================
   4. Activity Service (ELibrary_Activity)
   ============================== */
USE ELibrary_Activity;
GO

CREATE TABLE [DownloadHistory] (
    DownloadID INT PRIMARY KEY IDENTITY(1,1),
    DocumentID INT NOT NULL,
    DownloadedBy INT NULL,
    DownloadedDate DATETIME NOT NULL DEFAULT GETDATE()
);

CREATE TABLE [Notification] (
    NotificationID INT PRIMARY KEY IDENTITY(1,1),
    Title NVARCHAR(200) NOT NULL,
    Content NVARCHAR(1000) NOT NULL,
    CreatedBy INT NULL,
    CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
    UpdatedDate DATETIME,
    ScheduledDate DATETIME NOT NULL,
    [Type] NVARCHAR(20) NOT NULL CHECK (Type IN ('System','Customer','Custom')),
    [Status] NVARCHAR(20) NOT NULL DEFAULT 'Pending'
        CHECK (Status IN ('Pending','Sent','Cancelled'))
);

CREATE TABLE [NotificationView] (
    NotificationID INT NOT NULL,
    ViewedBy INT NOT NULL,
    Viewed BIT NOT NULL DEFAULT 0,
    CreatedDate DATETIME NOT NULL DEFAULT GETDATE(),
    ViewedDate DATETIME NULL,
    PRIMARY KEY (NotificationID, ViewedBy)
);

CREATE INDEX IX_DownloadHistory_DocumentID ON [DownloadHistory](DocumentID);
CREATE INDEX IX_DownloadHistory_DownloadedDate ON [DownloadHistory](DownloadedDate);
CREATE INDEX IX_Notification_CreatedDate ON [Notification](CreatedDate);
CREATE INDEX IX_Notification_ScheduledDate ON [Notification](ScheduledDate);
CREATE INDEX IX_Notification_Status ON [Notification](Status);
GO

/* ==============================
   Bảng AuditLog trong Activity Service
   ============================== */
CREATE TABLE [AuditLog] (
    AuditID BIGINT PRIMARY KEY IDENTITY(1,1),
    ServiceName NVARCHAR(100) NOT NULL,
    TableName NVARCHAR(100) NOT NULL,
    Action NVARCHAR(20) NOT NULL
        CHECK (Action IN ('INSERT','UPDATE','DELETE')),
    RecordID NVARCHAR(100) NOT NULL,
    PerformedBy INT NULL,
    PerformedAt DATETIME NOT NULL DEFAULT GETDATE(),
    OldValues NVARCHAR(MAX) NULL,
    NewValues NVARCHAR(MAX) NULL,
    UpdatedDate DATETIME NULL
);

CREATE INDEX IX_AuditLog_ServiceName ON [AuditLog](ServiceName);
CREATE INDEX IX_AuditLog_TableName ON [AuditLog](TableName);
CREATE INDEX IX_AuditLog_PerformedAt ON [AuditLog](PerformedAt);
GO

/* ==============================
   Seed Identity Service
   ============================== */
USE ELibrary_Identity;
GO

INSERT INTO [User] (FullName, Email, PasswordHash, [Role], Active)
VALUES 
(N'Nguyễn Văn Admin', N'admin@example.com', N'$2a$12$fuP1SH5fbC61Y8zcejE9kO2aephowm7yCcG0LinkliG8Dz/CyHYj6', N'Admin', 1),
(N'Lê Thị Khách', N'customer1@example.com', N'$2a$12$fuP1SH5fbC61Y8zcejE9kO2aephowm7yCcG0LinkliG8Dz/CyHYj6', N'Customer', 1),
(N'Trần Văn Mua', N'customer2@example.com', N'$2a$12$fuP1SH5fbC61Y8zcejE9kO2aephowm7yCcG0LinkliG8Dz/CyHYj6', N'Customer', 1);
GO

/* ==============================
   Seed Catalog Service
   ============================== */
USE ELibrary_Catalog;
GO

INSERT INTO [Subject] (SubjectName, [Description], ImageURL)
VALUES 
(N'Mathematics', N'Includes topics such as algebra, geometry, and calculus.', 'https://i.ibb.co/SDyDWTsy/The-Power-of-Mathematics-and-Computing.jpg'),
(N'Literature', N'Contains classical and modern literary works, poetry, and prose.', 'https://i.ibb.co/ymrf2cmj/hoc-gioi-ngu-van-bang-tieng-anh.jpg'),
(N'Physics', N'Explore the fundamental laws of nature, including mechanics, thermodynamics, and quantum physics.', 'https://iecedu.vn/wp-content/uploads/2025/02/ten-cac-mon-hoc-bang-tieng-anh.jpg'),
(N'Chemistry', N'Learn about chemical reactions, organic and inorganic chemistry, and laboratory techniques.', 'https://oea-vietnam.com/wp-content/uploads/2023/09/cac-mon-hoc-bang-tieng-anh-1.jpg'),
(N'Biology', N'Study the science of life, including genetics, ecology, and human anatomy.', 'https://i.ibb.co/7Ck6yJp/biology.jpg'),
(N'History', N'Gain knowledge about world history, civilizations, and significant historical events.', 'https://i.ibb.co/6Xz6xQ8/history.jpg'),
(N'Computer Science', N'Introduction to algorithms, programming, and computer systems.', 'https://i.ibb.co/4Rh8Ys5C/Horikita-Suzune-full-2115088-jpg.jpg'),
(N'Geography', N'Explore the physical features of the Earth and human-environment interactions.', 'https://i.ibb.co/8x1pF6G/geography.jpg'),
(N'Art', N'Appreciate visual arts, painting, sculpture, and art history.', 'https://i.ibb.co/0c5q2Pz/art.jpg'),
(N'Music', N'Learn about music theory, instruments, and the history of music.', 'https://i.ibb.co/1v6tK1Z/music.jpg');

INSERT INTO [Category] (CategoryName, [Description])
VALUES
(N'Lectures', N'Comprehensive lectures on topics.'),
(N'Exercises', N'A collection of practice problems with answers.'),
(N'Solutions', N'Detailed solutions to common problems.');

-- Documents (CreatedBy = 3 nghĩa là userID=3 trong [User])
INSERT INTO [Document] (Title, Description, FileURL, ViewCount, DownloadCount, CategoryID, SubjectID, Status, CreatedBy, CreatedDate)
VALUES
(N'Introduction to Algebra', N'A comprehensive guide to basic algebra concepts.', 'Group3_ELT401_EL1802_Project1.pdf', 10, 5, 1, 1, 'Accepted', 3, '2025-06-10 10:00:00'),
(N'Poetry Analysis', N'Analysis of modern poetry techniques.', 'Group3_ELT401_EL1802_Project1.pdf', 8, 3, 2, 2, 'Accepted', 3, '2025-06-11 12:00:00'),
(N'Calculus Solutions', N'Detailed solutions to common calculus problems.', 'Group3_ELT401_EL1802_Project1.pdf', 15, 7, 3, 1, 'Pending', 3, '2025-06-12 14:00:00'),
(N'Introduction to Algorithms', 'A comprehensive guide to algorithms.', 'Group3_ELT401_EL1802_Project1.pdf', 100, 50, 1, 1, 'Accepted', 3, GETDATE()),
(N'Advanced Databases', 'Deep dive into database internals.', 'Group3_ELT401_EL1802_Project1.pdf', 80, 30, 2, 2, 'Accepted', 3, GETDATE()),
(N'Web Development Basics', 'HTML, CSS, and JS overview.', 'Group3_ELT401_EL1802_Project1.pdf', 120, 60, 3, 1, 'Accepted', 3, GETDATE()),
(N'C# for Beginners', 'Learn C# from scratch.', 'Group3_ELT401_EL1802_Project1.pdf', 90, 40, 1, 2, 'Accepted', 3, GETDATE()),
(N'Design Patterns', 'Common design patterns explained.', 'Group3_ELT401_EL1802_Project1.pdf', 110, 55, 2, 1, 'Accepted', 3, GETDATE()),
(N'Operating Systems', 'Concepts and principles.', 'Group3_ELT401_EL1802_Project1.pdf', 70, 25, 3, 2, 'Accepted', 3, GETDATE()),
(N'Machine Learning Intro', 'Basics of ML and models.', 'Group3_ELT401_EL1802_Project1.pdf', 150, 70, 1, 1, 'Accepted', 3, GETDATE()),
(N'Computer Networks', 'Networking essentials.', 'Group3_ELT401_EL1802_Project1.pdf', 65, 22, 2, 2, 'Accepted', 3, GETDATE()),
(N'Cybersecurity 101', 'Foundations of digital security.', 'Group3_ELT401_EL1802_Project1.pdf', 85, 45, 3, 1, 'Accepted', 3, GETDATE()),
(N'Data Structures', 'Stacks, queues, trees, and more.', 'Group3_ELT401_EL1802_Project1.pdf', 95, 50, 1, 2, 'Accepted', 3, GETDATE());
GO

/* ==============================
   Seed Interaction Service
   ============================== */
USE ELibrary_Interaction;
GO

INSERT INTO [Comment] (DocumentID, Content, CreatedBy, CreatedDate)
VALUES
(1, N'Excellent resource for algebra beginners!', 1, '2025-06-10 14:30:00'),
(2, N'Really clear explanations, thanks!', 1, '2025-06-11 09:15:00'),
(3, N'Helpful examples, highly recommend!', 1, '2025-06-12 16:45:00'),
(2, N'Great job on this guide!', 1, '2025-06-13 10:20:00'),
(1, N'Very useful for my studies!', 1, '2025-06-14 13:50:00'),
(2, N'Love the step-by-step approach!', 1, '2025-06-15 15:10:00'),
(3, N'Fantastic algebra content!', 1, '2025-06-16 08:30:00'),
(1, N'Looking forward to more guides!', 1, '2025-06-16 18:00:00');

INSERT INTO [Rating] (DocumentID, StarRating, Review, CreatedBy, CreatedDate)
VALUES
(1, 5, N'Excellent resource for beginners.', 3, '2025-06-10 11:30:00'),
(1, 4, N'Good content, but could be more detailed.', 3, '2025-06-11 13:30:00');
GO

/* ==============================
   Seed Activity Service
   ============================== */
USE ELibrary_Activity;
GO

INSERT INTO [DownloadHistory] (DocumentID, DownloadedBy, DownloadedDate)
VALUES
(3, 3, '2025-06-10 12:00:00'),
(2, 3, '2025-06-10 12:30:00'),
(1, 3, '2025-06-11 14:00:00');

INSERT INTO [Notification] (Title, Content, CreatedBy, CreatedDate, ScheduledDate, [Type], [Status])
VALUES
('System Update', 'System maintenance scheduled for next week.', 1, '2025-06-01 10:00:00', '2025-06-02 09:00:00', 'System', 'Sent'),
('Welcome Offer', 'New customers get 10% off their first order!', 1, '2025-06-02 12:00:00', '2025-06-03 10:00:00', 'Customer', 'Sent'),
('Custom Reminder', 'Your subscription is about to renew.', 1, '2025-06-03 15:00:00', '2025-06-04 08:00:00', 'Custom', 'Pending'),
('Security Alert', 'Update your password for enhanced security.', 1, '2025-06-04 09:00:00', '2025-06-05 11:00:00', 'System', 'Sent'),
('Promotional Event', 'Join our summer sale event this weekend!', 1, '2025-06-05 14:00:00', '2025-06-06 12:00:00', 'Customer', 'Sent'),
('Account Update', 'Please verify your email address.', 1, '2025-06-06 11:00:00', '2025-06-07 09:00:00', 'Custom', 'Pending');
GO


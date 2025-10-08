using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace Elib.Activity.Service.Models;

public partial class ActivityDb : DbContext
{
    private readonly string _schema = "activity_svc";
    public ActivityDb()
    {
    }

    public ActivityDb(DbContextOptions<ActivityDb> options)
        : base(options)
    {
    }

    public virtual DbSet<AuditLog> AuditLogs { get; set; }

    public virtual DbSet<DownloadHistory> DownloadHistories { get; set; }

    public virtual DbSet<Notification> Notifications { get; set; }

    public virtual DbSet<NotificationView> NotificationViews { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<AuditLog>(entity =>
        {
            entity.HasKey(e => e.AuditId).HasName("PK__AuditLog__A17F23B805140108");

            entity.ToTable("AuditLog", _schema);

            entity.HasIndex(e => e.PerformedAt, "IX_AuditLog_PerformedAt");

            entity.HasIndex(e => e.ServiceName, "IX_AuditLog_ServiceName");

            entity.HasIndex(e => e.TableName, "IX_AuditLog_TableName");

            entity.Property(e => e.AuditId).HasColumnName("AuditID");
            entity.Property(e => e.Action).HasMaxLength(20);
            entity.Property(e => e.PerformedAt)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.RecordId)
                .HasMaxLength(100)
                .HasColumnName("RecordID");
            entity.Property(e => e.ServiceName).HasMaxLength(100);
            entity.Property(e => e.TableName).HasMaxLength(100);
            entity.Property(e => e.UpdatedDate).HasColumnType("datetime");
        });

        modelBuilder.Entity<DownloadHistory>(entity =>
        {
            entity.HasKey(e => e.DownloadId).HasName("PK__Download__73D5A710234B6DDD");

            entity.ToTable("DownloadHistory", _schema);

            entity.HasIndex(e => e.DocumentId, "IX_DownloadHistory_DocumentID");

            entity.HasIndex(e => e.DownloadedDate, "IX_DownloadHistory_DownloadedDate");

            entity.Property(e => e.DownloadId).HasColumnName("DownloadID");
            entity.Property(e => e.DocumentId).HasColumnName("DocumentID");
            entity.Property(e => e.DownloadedDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasKey(e => e.NotificationId).HasName("PK__Notifica__20CF2E32D82C7FE9");

            entity.ToTable("Notification", _schema);

            entity.HasIndex(e => e.CreatedDate, "IX_Notification_CreatedDate");

            entity.HasIndex(e => e.ScheduledDate, "IX_Notification_ScheduledDate");

            entity.HasIndex(e => e.Status, "IX_Notification_Status");

            entity.Property(e => e.NotificationId).HasColumnName("NotificationID");
            entity.Property(e => e.Content).HasMaxLength(1000);
            entity.Property(e => e.CreatedDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.ScheduledDate).HasColumnType("datetime");
            entity.Property(e => e.Status)
                .HasMaxLength(20)
                .HasDefaultValue("Pending");
            entity.Property(e => e.Title).HasMaxLength(200);
            entity.Property(e => e.Type).HasMaxLength(20);
            entity.Property(e => e.UpdatedDate).HasColumnType("datetime");
        });

        modelBuilder.Entity<NotificationView>(entity =>
        {
            entity.HasKey(e => new { e.NotificationId, e.ViewedBy }).HasName("PK__Notifica__E1992FEA7F1C7C36");

            entity.ToTable("NotificationView", _schema);

            entity.Property(e => e.NotificationId).HasColumnName("NotificationID");
            entity.Property(e => e.CreatedDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.ViewedDate).HasColumnType("datetime");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}

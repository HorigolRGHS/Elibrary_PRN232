using Elib.Interaction.Service.Models;
using Microsoft.EntityFrameworkCore;

namespace Elib.Interaction.Service.Data
{
    public partial class InteractionDb : DbContext
    {
        public InteractionDb()
        {
        }

        public InteractionDb(DbContextOptions<InteractionDb> options)
            : base(options)
        {
        }

        public virtual DbSet<Comment> Comments { get; set; }

        public virtual DbSet<Rating> Ratings { get; set; }

        public virtual DbSet<Report> Reports { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Comment>(entity =>
            {
                entity.HasKey(e => e.CommentId).HasName("PK__Comment__C3B4DFAAFF8AB0F2");

                entity.ToTable("Comment", "interaction_svc");

                entity.HasIndex(e => e.CreatedDate, "IX_Comment_CreatedDate");

                entity.HasIndex(e => e.DocumentId, "IX_Comment_DocumentID");

                entity.Property(e => e.CommentId).HasColumnName("CommentID");
                entity.Property(e => e.Content).HasMaxLength(1000);
                entity.Property(e => e.CreatedDate)
                    .HasDefaultValueSql("(getdate())")
                    .HasColumnType("datetime");
                entity.Property(e => e.DocumentId).HasColumnName("DocumentID");
                entity.Property(e => e.UpdatedDate).HasColumnType("datetime");
            });

            modelBuilder.Entity<Rating>(entity =>
            {
                entity.HasKey(e => e.RatingId).HasName("PK__Rating__FCCDF85CF5554654");

                entity.ToTable("Rating", "interaction_svc");

                entity.HasIndex(e => e.DocumentId, "IX_Rating_DocumentID");

                entity.HasIndex(e => e.StarRating, "IX_Rating_StarRating");

                entity.Property(e => e.RatingId).HasColumnName("RatingID");
                entity.Property(e => e.CreatedDate)
                    .HasDefaultValueSql("(getdate())")
                    .HasColumnType("datetime");
                entity.Property(e => e.DocumentId).HasColumnName("DocumentID");
                entity.Property(e => e.Review).HasMaxLength(1000);
                entity.Property(e => e.UpdatedDate).HasColumnType("datetime");
            });

            modelBuilder.Entity<Report>(entity =>
            {
                entity.HasKey(e => e.ReportId).HasName("PK__Report__D5BD48E52558E370");

                entity.ToTable("Report", "interaction_svc");

                entity.HasIndex(e => e.DocumentId, "IX_Report_DocumentID");

                entity.HasIndex(e => e.Status, "IX_Report_Status");

                entity.Property(e => e.ReportId).HasColumnName("ReportID");
                entity.Property(e => e.CreatedDate)
                    .HasDefaultValueSql("(getdate())")
                    .HasColumnType("datetime");
                entity.Property(e => e.DocumentId).HasColumnName("DocumentID");
                entity.Property(e => e.Reason).HasMaxLength(1000);
                entity.Property(e => e.Status)
                    .HasMaxLength(20)
                    .HasDefaultValue("Pending");
                entity.Property(e => e.UpdatedDate).HasColumnType("datetime");
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
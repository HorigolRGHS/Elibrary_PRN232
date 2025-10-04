using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace Elib.Auth.Service.Models;

public partial class IdentityDb : DbContext
{
    private readonly string _schema = "identity_svc";
    public IdentityDb()
    {
    }

    public IdentityDb(DbContextOptions<IdentityDb> options)
        : base(options)
    {
    }

    public virtual DbSet<User> Users { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
#warning To protect potentially sensitive information in your connection string, you should move it out of source code. You can avoid scaffolding the connection string by using the Name= syntax to read it from configuration - see https://go.microsoft.com/fwlink/?linkid=2131148. For more guidance on storing connection strings, see https://go.microsoft.com/fwlink/?LinkId=723263.
        => optionsBuilder.UseSqlServer("Server=.;Database=ELibrary;Trusted_Connection=True;TrustServerCertificate=True");

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.UserId).HasName("PK__User__1788CCAC5C0359CC");

            entity.ToTable("User", _schema);

            entity.HasIndex(e => e.Active, "IX_User_Active");

            entity.HasIndex(e => e.Email, "IX_User_Email");

            entity.HasIndex(e => e.Role, "IX_User_Role");

            entity.HasIndex(e => e.Email, "UQ__User__A9D10534DDA428F3").IsUnique();

            entity.Property(e => e.UserId).HasColumnName("UserID");
            entity.Property(e => e.CreatedDate)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.DeletedDate).HasColumnType("datetime");
            entity.Property(e => e.Email).HasMaxLength(255);
            entity.Property(e => e.FullName).HasMaxLength(100);
            entity.Property(e => e.ImageUrl)
                .HasMaxLength(500)
                .HasColumnName("ImageURL");
            entity.Property(e => e.PasswordHash).HasMaxLength(256);
            //
            entity.Property(e => e.Role)
                  .HasConversion<string>()
                  .HasMaxLength(20);
            entity.Property(e => e.UpdatedDate).HasColumnType("datetime");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}

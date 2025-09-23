using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Elib.Auth.Service.Models;

public partial class User
{
    [Key]
    public int UserId { get; set; }

    [Required(ErrorMessage ="Full Name is Required")]
    public string FullName { get; set; } = null!;

    [Required(ErrorMessage ="Email is Required")]
    [DataType(DataType.EmailAddress)]
    public string Email { get; set; } = null!;

    public string PasswordHash { get; set; } = null!;

    public string? ImageUrl { get; set; }

    public UserRole Role { get; set; } = UserRole.Customer!;

    public bool Active { get; set; }

    public DateTime CreatedDate { get; set; }

    public DateTime? UpdatedDate { get; set; }

    public DateTime? DeletedDate { get; set; }

    public int? DeletedBy { get; set; }
}

public enum UserRole
{
    Customer,
    Admin
}

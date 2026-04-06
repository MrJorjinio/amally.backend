using Amally.Core.Entities;
using Microsoft.EntityFrameworkCore;

namespace Amally.Infrastructure.Data.Seed;

public static class DataSeeder
{
    public static void Seed(ModelBuilder modelBuilder)
    {
        SeedCategories(modelBuilder);
        SeedRegions(modelBuilder);
    }

    private static void SeedCategories(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Category>().HasData(
            new Category { Id = 1, Name = "Student Engagement", Slug = "student-engagement", Description = "Strategies for keeping students actively involved in learning" },
            new Category { Id = 2, Name = "Classroom Management", Slug = "classroom-management", Description = "Techniques for maintaining an orderly and productive classroom" },
            new Category { Id = 3, Name = "Teaching Methods", Slug = "teaching-methods", Description = "Innovative and effective teaching approaches" },
            new Category { Id = 4, Name = "Lesson Planning", Slug = "lesson-planning", Description = "Tips and strategies for effective lesson design" },
            new Category { Id = 5, Name = "Assessment & Grading", Slug = "assessment-grading", Description = "Methods for evaluating student performance" },
            new Category { Id = 6, Name = "Technology in Education", Slug = "technology-in-education", Description = "Using digital tools and technology in the classroom" },
            new Category { Id = 7, Name = "Special Education", Slug = "special-education", Description = "Teaching students with special needs and learning differences" },
            new Category { Id = 8, Name = "Parent Communication", Slug = "parent-communication", Description = "Building effective relationships with parents and guardians" },
            new Category { Id = 9, Name = "Professional Development", Slug = "professional-development", Description = "Growing as an educator through training and self-improvement" },
            new Category { Id = 10, Name = "Curriculum Design", Slug = "curriculum-design", Description = "Creating and structuring educational curricula" },
            new Category { Id = 11, Name = "Motivation & Inspiration", Slug = "motivation-inspiration", Description = "Inspiring students and staying motivated as a teacher" },
            new Category { Id = 12, Name = "First Year Teaching", Slug = "first-year-teaching", Description = "Advice and experiences for new teachers" },
            new Category { Id = 13, Name = "Remote Teaching", Slug = "remote-teaching", Description = "Online and distance learning strategies" },
            new Category { Id = 14, Name = "Inclusive Education", Slug = "inclusive-education", Description = "Creating equitable learning environments for all students" },
            new Category { Id = 15, Name = "STEM Education", Slug = "stem-education", Description = "Science, technology, engineering, and math teaching" }
        );
    }

    private static void SeedRegions(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Region>().HasData(
            new Region { Id = 1, Name = "Tashkent City" },
            new Region { Id = 2, Name = "Tashkent Region" },
            new Region { Id = 3, Name = "Samarkand" },
            new Region { Id = 4, Name = "Bukhara" },
            new Region { Id = 5, Name = "Fergana" },
            new Region { Id = 6, Name = "Andijan" },
            new Region { Id = 7, Name = "Namangan" },
            new Region { Id = 8, Name = "Kashkadarya" },
            new Region { Id = 9, Name = "Surkhandarya" },
            new Region { Id = 10, Name = "Sirdarya" },
            new Region { Id = 11, Name = "Jizzakh" },
            new Region { Id = 12, Name = "Navoi" },
            new Region { Id = 13, Name = "Khorezm" },
            new Region { Id = 14, Name = "Karakalpakstan" }
        );
    }
}

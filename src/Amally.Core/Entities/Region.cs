namespace Amally.Core.Entities;

public class Region
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public ICollection<Post> Posts { get; set; } = [];
}

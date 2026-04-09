using Amally.Application.Interfaces;
using Microsoft.Extensions.Configuration;
using Minio;
using Minio.DataModel.Args;

namespace Amally.Infrastructure.Services;

public class MinioStorageService : IStorageService
{
    private readonly IMinioClient _minio;
    private readonly string _bucket;
    private readonly string _publicUrl;

    public MinioStorageService(IConfiguration config)
    {
        var endpoint = config["Minio:Endpoint"] ?? "localhost:9000";
        var accessKey = config["Minio:AccessKey"] ?? "minioadmin";
        var secretKey = config["Minio:SecretKey"] ?? "minioadmin";
        var useSsl = config.GetValue<bool>("Minio:UseSsl", true);
        var region = config["Minio:Region"] ?? "auto";
        _bucket = config["Minio:Bucket"] ?? "amally";
        _publicUrl = config["Minio:PublicUrl"] ?? $"https://{endpoint}/{_bucket}";

        var client = new MinioClient()
            .WithEndpoint(endpoint)
            .WithCredentials(accessKey, secretKey)
            .WithRegion(region);

        if (useSsl) client = client.WithSSL();

        _minio = client.Build();
    }

    public async Task<string> UploadAsync(Stream stream, string fileName, string contentType)
    {
        // Check if bucket exists, create if not (works for MinIO, may fail on R2 — create bucket manually there)
        try
        {
            var exists = await _minio.BucketExistsAsync(new BucketExistsArgs().WithBucket(_bucket));
            if (!exists)
            {
                await _minio.MakeBucketAsync(new MakeBucketArgs().WithBucket(_bucket));
            }
        }
        catch
        {
            // R2 or other providers may not support bucket operations — ignore
        }

        var objectName = $"images/{fileName}";

        await _minio.PutObjectAsync(new PutObjectArgs()
            .WithBucket(_bucket)
            .WithObject(objectName)
            .WithStreamData(stream)
            .WithObjectSize(stream.Length)
            .WithContentType(contentType));

        return $"{_publicUrl}/{objectName}";
    }
}

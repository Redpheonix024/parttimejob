import {
  S3Client,
  DeleteObjectCommand,
  PutObjectCommand,
} from "@aws-sdk/client-s3";
import { Upload } from "@aws-sdk/lib-storage";

if (
  !process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID ||
  !process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY ||
  !process.env.NEXT_PUBLIC_AWS_BUCKET_NAME
) {
  throw new Error("Missing required AWS configuration");
}

// Ensure region is lowercase and properly formatted
const region = "ap-south-1"; // Hardcode the region for now

export const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY!,
  },
  endpoint: undefined, // Let AWS SDK handle the endpoint
});

export const uploadToS3 = async (file: File, key: string) => {
  try {
    console.log("Starting upload:", { key, type: file.type, size: file.size });

    // Convert File to ArrayBuffer instead of using it directly
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const command = new PutObjectCommand({
      Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME!,
      Key: key,
      Body: buffer, // Use buffer instead of file directly
      ContentType: file.type,
      ACL: "public-read",
    });

    await s3Client.send(command);
    console.log("Upload successful");

    // Construct the URL using the bucket name and key
    return `https://${process.env.NEXT_PUBLIC_AWS_BUCKET_NAME}.s3.${region}.amazonaws.com/${key}`;
  } catch (error) {
    console.error("Upload failed:", error);
    throw new Error(`Failed to upload file: ${(error as Error).message}`);
  }
};

export const deleteFromS3 = async (key: string) => {
  try {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: process.env.NEXT_PUBLIC_AWS_BUCKET_NAME!,
        Key: key,
      })
    );
    return true;
  } catch (error) {
    console.error("Error deleting from S3:", error);
    return false;
  }
};

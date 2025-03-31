import { Upload } from "@aws-sdk/lib-storage";
import { s3Client } from "./s3Config";

export const uploadToS3 = async (file: File, key: string) => {
  try {
    if (!process.env.NEXT_PUBLIC_S3_BUCKET) {
      throw new Error("S3 bucket name not found in environment variables");
    }

    const upload = new Upload({
      client: s3Client,
      params: {
        Bucket: process.env.NEXT_PUBLIC_S3_BUCKET,
        Key: key,
        Body: file,
        ContentType: file.type,
      },
    });

    const result = await upload.done();
    return result.Location;
  } catch (error: any) {
    console.error("S3 Upload Error:", error);
    if (error.name === "InvalidAccessKeyId") {
      throw new Error(
        "Invalid AWS credentials. Please check your access keys."
      );
    }
    throw error;
  }
};

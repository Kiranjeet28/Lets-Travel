"use server";

import { db } from "@/core/client/db";
import getSessionorRedirect from "@/core/utils/getSessionorRedirect";
import { HotelSchema } from "@/components/hotel/hotelSchema";
import { z } from "zod";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

// ✅ Configure Cloudinary (ensure these env vars exist)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

//
// ---------- Helper: Upload a single file buffer ----------
const uploadFileToCloudinary = async (
  buffer: Buffer,
  options: {
    public_id?: string;
    folder?: string;
    resource_type?: "image" | "raw" | "video";
  }
): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: options.resource_type ?? "image",
        folder: options.folder,
        public_id: options.public_id,
      },
      (error, result) => {
        if (error) return reject(error);
        if (!result) return reject(new Error("Cloudinary upload returned no result"));
        resolve(result);
      }
    );
    stream.end(buffer);
  });
};

//
// ---------- Helper: Upload all hotel files ----------
const uploadFiles = async (
  userId: string,
  businessLicenseUpload: File,
  insuranceCertificateUpload: File,
  images: File
) => {
  const [businessArrayBuffer, insuranceArrayBuffer, imagesArrayBuffer] =
    await Promise.all([
      businessLicenseUpload.arrayBuffer(),
      insuranceCertificateUpload.arrayBuffer(),
      images.arrayBuffer(),
    ]);

  const businessBuffer = Buffer.from(businessArrayBuffer);
  const insuranceBuffer = Buffer.from(insuranceArrayBuffer);
  const imagesBuffer = Buffer.from(imagesArrayBuffer);

  const businessPromise = uploadFileToCloudinary(businessBuffer, {
    public_id: `hotel-${userId}-businessLicense`,
    folder: "hotels/businessLicenses",
    resource_type: "raw",
  });

  const insurancePromise = uploadFileToCloudinary(insuranceBuffer, {
    public_id: `hotel-${userId}-insurance`,
    folder: "hotels/insuranceCertificates",
    resource_type: "raw",
  });

  const imagePromise = uploadFileToCloudinary(imagesBuffer, {
    folder: "hotels/images",
    resource_type: "image",
  });

  const [businessUpload, insuranceUpload, imageUpload] = await Promise.all([
    businessPromise,
    insurancePromise,
    imagePromise,
  ]);

  console.log("Files uploaded successfully");

  return {
    businessUrl: businessUpload.secure_url,
    insuranceUrl: insuranceUpload.secure_url,
    imageUrl: imageUpload.secure_url,
  };
};

//
// ---------- Main Hotel Creation Action ----------
export const createHotelAction = async ({
  values,
  formData,
}: {
  values: any;
  formData: FormData;
}) => {
  const session = await getSessionorRedirect();

  // ✅ Validate data using Zod schema
  const { success, data, error } = HotelSchema.partial({
    businessLicenseUpload: true,
    insuranceCertificateUpload: true,
    images: true,
  }).safeParse(values);

  if (!success) {
    console.error("Validation error:", error);
    return { error: "Invalid input data" };
  }

  try {
    // ✅ Ensure files exist in FormData
    const businessFile = formData.get("businessLicenseUpload");
    const insuranceFile = formData.get("insuranceCertificateUpload");
    const imagesFile = formData.get("images");

    if (
      !(businessFile instanceof File) ||
      !(insuranceFile instanceof File) ||
      !(imagesFile instanceof File)
    ) {
      return { error: "All files are required" };
    }

    // ✅ Upload to Cloudinary
    const { businessUrl, insuranceUrl, imageUrl } = await uploadFiles(
      session.user.id,
      businessFile,
      insuranceFile,
      imagesFile
    );

    // ✅ Create Hotel entry in Prisma DB
    await db.hotel.create({
      data: {
        ...data,
        businessLicenseUpload: businessUrl,
        insuranceCertificateUpload: insuranceUrl,
        images: [imageUrl],
        User: { connect: { id: session.user.id } },
        socialMediaLinks: { create: data.socialMediaLinks ?? [] },
      },
    });

    return { success: "Hotel created successfully" };
  } catch (err: any) {
    console.error("Error creating hotel:", err);
    return { error: "Error creating hotel" };
  }
};

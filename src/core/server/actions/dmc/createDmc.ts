"use server";

import { db } from "@/core/client/db";
import getSessionorRedirect from "@/core/utils/getSessionorRedirect";
import { DmcSchema } from "@/components/dmc/dmcSchema";
import { z } from "zod";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";

// ✅ Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

//
// ---------- Helper to Upload a File Buffer ----------
//
const uploadFileToCloudinary = async (
  buffer: Buffer,
  options: { public_id?: string; folder?: string; resource_type?: "image" | "raw" | "video" }
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
// ---------- Upload All Files ----------
//
const uploadFiles = async (
  userId: string,
  businessLicenseUpload: File,
  insuranceCertificateUpload: File,
  images: File
) => {
  const [businessArrayBuffer, insuranceArrayBuffer, imagesArrayBuffer] = await Promise.all([
    businessLicenseUpload.arrayBuffer(),
    insuranceCertificateUpload.arrayBuffer(),
    images.arrayBuffer(),
  ]);

  const businessBuffer = Buffer.from(businessArrayBuffer);
  const insuranceBuffer = Buffer.from(insuranceArrayBuffer);
  const imagesBuffer = Buffer.from(imagesArrayBuffer);

  const businessPromise = uploadFileToCloudinary(businessBuffer, {
    public_id: `dmc-${userId}-businessLicense`,
    folder: "dmc/businessLicenses",
    resource_type: "raw",
  });

  const insurancePromise = uploadFileToCloudinary(insuranceBuffer, {
    public_id: `dmc-${userId}-insurance`,
    folder: "dmc/insuranceCertificates",
    resource_type: "raw",
  });

  const imagePromise = uploadFileToCloudinary(imagesBuffer, {
    folder: "dmc/images",
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
// ---------- Main Action ----------
//
export const createDmcAction = async ({
  values,
  formData,
}: {
  values: any;
  formData: FormData;
}) => {
  const session = await getSessionorRedirect();

  // ✅ Validate incoming data
  const { success, data, error } = DmcSchema.partial({
    businessLicenseUpload: true,
    insuranceCertificateUpload: true,
    images: true,
  }).safeParse(values);

  if (!success) {
    console.error("Validation error:", error);
    return { error: "Invalid input data" };
  }

  try {
    // ✅ Get files safely from FormData
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

    // ✅ Create DMC entry in database
    await db.dMC.create({
      data: {
        ...data,
        businessLicenseUpload: businessUrl,
        insuranceCertificateUpload: insuranceUrl,
        images: [imageUrl],
        User: { connect: { id: session.user.id } },
        keyPersonnel: { create: data.keyPersonnel ?? [] },
        pastProjects: { create: data.pastProjects ?? [] },
        clientReferences: { create: data.clientReferences ?? [] },
        socialMediaLinks: { create: data.socialMediaLinks ?? [] },
        caseStudyPdf: undefined,
      },
    });

    return { success: "DMC created successfully" };
  } catch (err: any) {
    console.error("Error creating DMC:", err);
    return { error: "Error creating DMC" };
  }
};

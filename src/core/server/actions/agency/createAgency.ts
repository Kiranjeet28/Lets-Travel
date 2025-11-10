"use server";

import { AgencySchema } from "@/components/agency/agencySchema";
import { db } from "@/core/client/db";
import getSessionorRedirect from "@/core/utils/getSessionorRedirect";
import { v2 as cloudinary } from "cloudinary";
import { z } from "zod";

// configure cloudinary (you may already have this configured elsewhere)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
type UploadApiResponse = {
  secure_url: string;
  public_id: string;
  resource_type: string;
  [key: string]: any;
};
const uploadFileToCloudinary = async (
  buffer: Buffer,
  options: { public_id?: string; folder?: string; resource_type?: "image" | "raw" | "video" }
) => {
  // Since we have a Buffer, use upload_stream
  return new Promise<UploadApiResponse>((resolve, reject) => {
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
    public_id: `agency-${userId}-businessLicense`,
    folder: "agencies/businessLicenses",
    resource_type: "raw",
  });
  const insurancePromise = uploadFileToCloudinary(insuranceBuffer, {
    public_id: `agency-${userId}-insurance`,
    folder: "agencies/insuranceCertificates",
    resource_type: "raw",
  });
  const imagePromise = uploadFileToCloudinary(imagesBuffer, {
    // no explicit public_id or folder if you don’t need it
    folder: "agencies/images",
    resource_type: "image",
  });

  const [businessUpload, insuranceUpload, imageUpload] = await Promise.all([
    businessPromise,
    insurancePromise,
    imagePromise,
  ]);

  console.log("Files uploaded");
  return {
    businessUrl: businessUpload.secure_url,
    insuranceUrl: insuranceUpload.secure_url,
    imageUrl: imageUpload.secure_url,
  };
};

export const createAgencyAction = async ({
  values,
  formData,
}: {
  values: any;
  formData: FormData;
}) => {
  const session = await getSessionorRedirect();
  const { success, data, error } = AgencySchema.partial({
    businessLicenseUpload: true,
    insuranceCertificateUpload: true,
    images: true,
  }).safeParse(values);

  if (!success) {
    console.error(error);
    return { error: "Validation failed" };
  }

  try {
    const businessFile = formData.get("businessLicenseUpload");
    const insuranceFile = formData.get("insuranceCertificateUpload");
    const imagesFile = formData.get("images");

    if (
      !(businessFile instanceof File) ||
      !(insuranceFile instanceof File) ||
      !(imagesFile instanceof File)
    ) {
      return { error: "Files are required" };
    }

    const { businessUrl, insuranceUrl, imageUrl } = await uploadFiles(
      session.user.id,
      businessFile,
      insuranceFile,
      imagesFile
    );

    await db.agency.create({
      data: {
        ...data,
        businessLicenseUpload: businessUrl,
        insuranceCertificateUpload: insuranceUrl,
        images: [imageUrl],
        User: { connect: { id: session.user.id } },
        keyPersonnel: { create: data.keyPersonnel },
        pastProjects: { create: data.pastProjects },
        clientReferences: { create: data.clientReferences },
        socialMediaLinks: { create: data.socialMediaLinks },
        caseStudyPdf: undefined,
      },
    });

    return { success: "Agency created successfully" };
  } catch (err: any) {
    console.error("Error creating agency:", err);
    return { error: "Error creating agency" };
  }
};

"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { db } from "@/core/client/db";
import { Prisma } from "@prisma/client";
import getSessionorRedirect from "@/core/utils/getSessionorRedirect";

export const deleteCompany = async ({
  id,
  type,
}: {
  id: string;
  type: "Agency" | "Dmc" | "Hotel";
}) => {
  const session = await getSessionorRedirect();
  if (session.user.role !== "ADMIN")
    return { error: "Unauthorized! Admin only" };
  try {
    if (type === "Agency") {
      await db.agency.delete({ where: { id } });
    } else if (type === "Dmc") await db.dMC.delete({ where: { id } });
    else if (type === "Hotel") await db.hotel.delete({ where: { id } });

    revalidateTag(`/admin/${type.toLowerCase()}`);
    return { success: "Company Deleted Successfully." };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return {
          error: "Company not found. It may have been already deleted.",
        };
      }
    }
    console.error("Error deleting company:", error);
    return { error: "Something went wrong while deleting the company." };
  }
};

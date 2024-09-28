import AdminPackagelisting from "@/components/admin/Main/Admin_Package_listing";
import { db } from "@/core/client/db";
import { unstable_cache } from "next/cache";

const getAllListing = unstable_cache(
  /**
   * Asynchronously retrieves a list of agencies from the database.
   * @returns {Promise<{ id: string; name: string; images: string[]; city: string; country: string; priority: number; city_priority: number; isCertified: boolean; userId: string; methodology: string; type: "Agency" }[]>} - A promise that resolves to an array of agency objects.
   */
  async () => {
    const data = await db.agency.findMany({
      select: {
        id: true,
        name: true,
        images: true,
        city: true,
        country: true,
        priority: true,
        city_priority: true,
        isCertified: true,
        userId: true,
        methodology: true,
      },
    });
    return data.map((d) => ({ ...d, type: "Agency" }));
  },
  undefined,
  { revalidate: 300, tags: ["admin-agency"] }
);

export default async function Page() {
  const listings = await getAllListing();

  return (
    <AdminPackagelisting
      listings={listings}
      type="Agency"
    />
  );
} 
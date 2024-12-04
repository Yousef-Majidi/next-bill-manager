import { sql } from "@vercel/postgres";
import { Tenant } from "./definitions";

export async function fetchTenants() {
    try {
        const data = await sql<Tenant>`SELECT * FROM tenants`;
        return data.rows;
    } catch (error) {
        console.error("Database Error: ", error);
        throw new Error("Failed to fetch tenants");
    }
}

const ITEMS_PER_PAGE = 6;
export async function fetchTenantsPages(query: string) {
    try {
        const count = await sql`SELECT COUNT(*)
        FROM tenants
        WHERE
            name ILIKE ${`%${query}%`} OR
            email ILIKE ${`%${query}%`};
    `;
        const totalPages = Math.ceil(
            Number(count.rows[0].count) / ITEMS_PER_PAGE
        );
        return totalPages;
    } catch (error) {
        console.error("Database Error: ", error);
        throw new Error("Failed to fetch total number of tenants");
    }
}

export async function fetchFilteredTenants(query: string, currentPage: number) {
    const offset = (currentPage - 1) * ITEMS_PER_PAGE;

    try {
        const tenants = await sql<Tenant>`
        SELECT *
        FROM tenants
        WHERE
            name ILIKE ${`%${query}%`} OR
            email ILIKE ${`%${query}%`}
        ORDER BY name ASC
        LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}`;

        return tenants.rows;
    } catch (error) {
        console.error("Database Error: ", error);
        throw new Error("Failed to fetch tenants");
    }
}

export async function fetchTenantById(id: string) {
    try {
        const data = await sql<Tenant>`
        SELECT *
        FROM tenants
        WHERE id = ${id}`;

        return data.rows[0];
    } catch (error) {
        console.error("Database Error: ", error);
        throw new Error("Failed to fetch tenant");
    }
}

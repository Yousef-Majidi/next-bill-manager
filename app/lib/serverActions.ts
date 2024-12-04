"use server";

import { z } from "zod";
import { sql } from "@vercel/postgres";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const FormSchema = z.object({
    id: z.string(),
    name: z.string({ invalid_type_error: "Please enter name" }),
    email: z.string({ invalid_type_error: "Please enter email" }).email(),
    hydroShare: z
        .number()
        .gt(0, { message: "Please enter an amount greater than 0" }),
    enbridgeShare: z.number().gt(0, {
        message: "Please enter an amount greater than 0",
    }),
});

const CreateTenant = FormSchema.omit({ id: true });
const UpdateTenant = FormSchema.omit({ id: true });

export type State = {
    errors?: {
        name?: string[];
        email?: string[];
        hydroShare?: string[];
        enbridgeShare?: string[];
    };
    message?: string | null;
};

export async function deleteTenant(id: string) {
    try {
        await sql`DELETE FROM tenants WHERE id = ${id}`;
        revalidatePath("/dashboard/tenants");
    } catch (error) {
        return {
            message: "An error occurred while deleting the tenant",
            error,
        };
    }
}

export async function addTenant(prevState: State, formData: FormData) {
    const validatedFields = CreateTenant.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        hydroShare: parseFloat(formData.get("hydroShare") as string),
        enbridgeShare: parseFloat(formData.get("enbridgeShare") as string),
    });

    console.log("Validated Fields: ", validatedFields.data);
    if (!validatedFields.success) {
        return {
            errors: validatedFields.error.flatten().fieldErrors,
            message: "Missing Fields. Failed to add tenant.",
        };
    }

    const { name, email, hydroShare, enbridgeShare } = validatedFields.data;
    try {
        await sql`
        INSERT INTO public.tenants (name, email, hydro_share, enbridge_share)
        VALUES (${name}, ${email}, ${hydroShare}, ${enbridgeShare})
      `;
    } catch (error) {
        return {
            message: "An error occurred while creating the invoice.",
            error,
        };
    }

    revalidatePath("/dashboard/tenants");
    redirect("/dashboard/tenants");
}

export async function updateTenant(
    id: string,
    prevState: State,
    formData: FormData
) {
    const validateFields = UpdateTenant.safeParse({
        name: formData.get("name"),
        email: formData.get("email"),
        hydroShare: parseFloat(formData.get("hydroShare") as string),
        enbridgeShare: parseFloat(formData.get("enbridgeShare") as string),
    });

    if (!validateFields.success) {
        return {
            errors: validateFields.error.flatten().fieldErrors,
            message: "Missing Fields. Failed to update tenant.",
        };
    }

    const { name, email, hydroShare, enbridgeShare } = validateFields.data;

    try {
        await sql`
        UPDATE public.tenants
        SET name = ${name},
            email = ${email},
            hydro_share = ${hydroShare},
            enbridge_share = ${enbridgeShare}
        WHERE id = ${id}
      `;
    } catch (error) {
        return {
            message: "An error occurred while updating the tenant.",
            error,
        };
    }

    revalidatePath("/dashboard/tenants");
    revalidatePath(`/dashboard/tenants/${id}/edit`);
    redirect("/dashboard/tenants");
}

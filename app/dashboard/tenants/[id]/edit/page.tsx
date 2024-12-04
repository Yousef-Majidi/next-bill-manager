import { fetchTenantById } from "@/app/lib/data";
import Breadcrumbs from "@/app/ui/tenants/breadcrumbs";
import { notFound } from "next/navigation";
import Form from "@/app/ui/tenants/edit-form";

export default async function Page({ params }: { params: { id: string } }) {
    const { id } = params;
    const [tenant] = await Promise.all([fetchTenantById(id)]);

    if (!tenant) {
        notFound();
    }

    return (
        <main>
            <Breadcrumbs
                breadcrumbs={[
                    { label: "Tenants", href: "/dashboard/tenants" },
                    {
                        label: "Edit Tenant",
                        href: `/dashboard/tenants/${id}/edit`,
                        active: true,
                    },
                ]}
            />
            <Form tenant={tenant} />
        </main>
    );
}

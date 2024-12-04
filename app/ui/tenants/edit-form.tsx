"use client";

import Link from "next/link";
import { Button } from "@/app/ui/button";
import { updateTenant, State } from "@/app/lib/serverActions";
import { useFormState } from "react-dom";
import { Tenant } from "@/app/lib/definitions";

export default function Form({ tenant }: { tenant: Tenant }) {
    const initialState: State = { message: null, errors: {} };
    const updateTenantWithId = updateTenant.bind(null, tenant.id);
    const [state, formAction] = useFormState(updateTenantWithId, initialState);
    return (
        <form action={formAction}>
            <div className="rounded-md bg-gray-600 p-4 md:p-6">
                {/* Tenant Name */}
                <div className="mb-4">
                    <label
                        htmlFor="name"
                        className="mb-2 block text-sm font-medium"
                    >
                        Name
                    </label>
                    <div className="relative mt-2 rounded-md">
                        <div className="relative">
                            <input
                                id="name"
                                name="name"
                                type="string"
                                defaultValue={tenant.name}
                                placeholder="Enter tenant name"
                                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500 text-gray-700"
                                aria-describedby="name-error"
                            />
                        </div>
                    </div>
                    <div id="name-error" aria-live="polite" aria-atomic="true">
                        {state.errors?.name &&
                            state.errors.name.map((error: string) => (
                                <p
                                    className="mt-2 text-sm text-red-500"
                                    key={error}
                                >
                                    {error}
                                </p>
                            ))}
                    </div>
                </div>

                {/* Email */}
                <div className="mb-4">
                    <label
                        htmlFor="email"
                        className="mb-2 block text-sm font-medium"
                    >
                        Email
                    </label>
                    <div className="relative mt-2 rounded-md">
                        <div className="relative">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                defaultValue={tenant.email}
                                placeholder="Enter tenant email"
                                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500 text-gray-700"
                                aria-describedby="email-error"
                            />
                        </div>
                    </div>
                    <div id="email-error" aria-live="polite" aria-atomic="true">
                        {state.errors?.email &&
                            state.errors.email.map((error: string) => (
                                <p
                                    className="mt-2 text-sm text-red-500"
                                    key={error}
                                >
                                    {error}
                                </p>
                            ))}
                    </div>
                </div>

                {/* Hydro Share */}
                <div className="mb-4">
                    <label
                        htmlFor="hydroShare"
                        className="mb-2 block text-sm font-medium"
                    >
                        Hydro Share
                    </label>
                    <div className="relative mt-2 rounded-md">
                        <div className="relative">
                            <input
                                id="hydroShare"
                                name="hydroShare"
                                type="number"
                                defaultValue={tenant.hydro_share}
                                placeholder="Enter tenant hydro share"
                                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500 text-gray-700"
                                aria-describedby="hydroShare-error"
                            />
                        </div>
                    </div>
                    <div
                        id="hydroShare-error"
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        {state.errors?.hydroShare &&
                            state.errors.hydroShare.map((error: string) => (
                                <p
                                    className="mt-2 text-sm text-red-500"
                                    key={error}
                                >
                                    {error}
                                </p>
                            ))}
                    </div>
                </div>

                {/* Enbridge Share */}
                <div className="mb-4">
                    <label
                        htmlFor="enbridgeShare"
                        className="mb-2 block text-sm font-medium"
                    >
                        Enbridge Share
                    </label>
                    <div className="relative mt-2 rounded-md">
                        <div className="relative">
                            <input
                                id="enbridgeShare"
                                name="enbridgeShare"
                                type="number"
                                defaultValue={tenant.enbridge_share}
                                placeholder="Enter tenant enbridge share"
                                className="peer block w-full rounded-md border border-gray-200 py-2 pl-10 text-sm outline-2 placeholder:text-gray-500 text-gray-700"
                                aria-describedby="enbridge_share-error"
                            />
                        </div>
                    </div>
                    <div
                        id="enbridgeShare-error"
                        aria-live="polite"
                        aria-atomic="true"
                    >
                        {state.errors?.enbridgeShare &&
                            state.errors.enbridgeShare.map((error: string) => (
                                <p
                                    className="mt-2 text-sm text-red-500"
                                    key={error}
                                >
                                    {error}
                                </p>
                            ))}
                    </div>
                </div>
            </div>
            <div className="mt-6 flex justify-end gap-4">
                <Link
                    href="/dashboard/tenants"
                    className="flex h-10 items-center rounded-lg bg-gray-100 px-4 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-200"
                >
                    Cancel
                </Link>
                <Button type="submit">Update Tenant</Button>
            </div>
        </form>
    );
}

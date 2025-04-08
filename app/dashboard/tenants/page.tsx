import { fetchTenantsPages } from "@/app/lib/data";
import Pagination from "@/app/ui/tenants/pagination";
import Search from "@/app/ui/search";
import Table from "@/app/ui/tenants/table";
import { CreateTenant } from "@/app/ui/tenants/buttons";
import { Metadata } from "next";
import { Suspense } from "react";
import { TenantsTableSkeleton } from "@/app/ui/skeletons";

export const metadata: Metadata = {
	title: "Tenants",
	description: "List of all tenants",
};

export default async function Page({
	searchParams,
}: {
	searchParams?: { query?: string; page?: string };
}) {
	const query = searchParams?.query || "";
	const currentPage = Number(searchParams?.page || 1);
	const totalPages = await fetchTenantsPages(query);

	return (
		<div className="w-full">
			<div className="flex w-full items-center justify-between">
				<h1 className={`mb-4 text-xl md:text-2xl`}>Tenants</h1>
			</div>
			<div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
				<Search placeholder="Search tenants..." />
				<CreateTenant />
			</div>
			<Suspense
				key={query + currentPage}
				fallback={<TenantsTableSkeleton />}
			>
				<Table query={query} currentPage={currentPage} />
			</Suspense>
			<div className="mt-5 flex w-full justify-center">
				<Pagination totalPages={totalPages} />
			</div>
		</div>
	);
}

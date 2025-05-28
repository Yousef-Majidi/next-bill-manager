"use client";

import { useEffect } from "react";

import { useAtom } from "jotai";

import { tenantsAtom, userAtom, utilityProvidersAtom } from "@/states";
import { Tenant, User, UtilityProvider } from "@/types";

interface DashboardWrapperProps {
	loggedInUser: User;
	utilityProviders: UtilityProvider[];
	tenants: Tenant[];
	children: React.ReactNode;
}

export const DashboardWrapper = ({
	loggedInUser,
	utilityProviders,
	tenants,
	children,
}: DashboardWrapperProps) => {
	const [, setUser] = useAtom(userAtom);
	const [, setProvidersList] = useAtom(utilityProvidersAtom);
	const [, setTenantsList] = useAtom(tenantsAtom);

	useEffect(() => {
		setUser(loggedInUser);
		setProvidersList(utilityProviders);
		setTenantsList(tenants);
	}, [
		loggedInUser,
		utilityProviders,
		tenants,
		setUser,
		setProvidersList,
		setTenantsList,
	]);
	return <>{children}</>;
};

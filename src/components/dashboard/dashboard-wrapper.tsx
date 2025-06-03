"use client";

import { useEffect } from "react";

import { useAtom } from "jotai";

import {
	billsHistoryAtom,
	tenantsAtom,
	userAtom,
	utilityProvidersAtom,
} from "@/states";
import { ConsolidatedBill, Tenant, User, UtilityProvider } from "@/types";

interface DashboardWrapperProps {
	loggedInUser: User;
	utilityProviders: UtilityProvider[];
	tenants: Tenant[];
	billsHistory: ConsolidatedBill[];
	children: React.ReactNode;
}

export const DashboardWrapper = ({
	loggedInUser,
	utilityProviders,
	tenants,
	billsHistory,
	children,
}: DashboardWrapperProps) => {
	const [, setUser] = useAtom(userAtom);
	const [, setProvidersList] = useAtom(utilityProvidersAtom);
	const [, setTenantsList] = useAtom(tenantsAtom);
	const [, setBillsHistory] = useAtom(billsHistoryAtom);

	useEffect(() => {
		setUser(loggedInUser);
		setProvidersList(utilityProviders);
		setTenantsList(tenants);
		setBillsHistory(billsHistory);
	}, [
		loggedInUser,
		utilityProviders,
		tenants,
		billsHistory,
		setUser,
		setProvidersList,
		setTenantsList,
		setBillsHistory,
	]);
	return <>{children}</>;
};

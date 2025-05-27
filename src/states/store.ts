import { atom } from "jotai";

import { Tenant, User, UtilityProvider } from "@/types";

export const userAtom = atom<User | null>(null);
export const utilityProvidersAtom = atom<UtilityProvider[]>([]);
export const tenantsAtom = atom<Tenant[]>([]);

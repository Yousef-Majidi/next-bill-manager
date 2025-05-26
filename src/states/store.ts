import { atom } from "jotai";

import { User, UtilityProvider } from "@/types";

export const userAtom = atom<User | null>(null);
export const utilityProvidersAtom = atom<UtilityProvider[]>([]);

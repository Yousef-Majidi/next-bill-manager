import { useAtom } from "jotai";
import { Atom } from "jotai";

export function useQueryById<T extends { id: string }>(
	atom: Atom<T[]>,
	id: string,
): T | undefined {
	const [list] = useAtom<T[]>(atom);
	return list.find((item) => item.id === id);
}

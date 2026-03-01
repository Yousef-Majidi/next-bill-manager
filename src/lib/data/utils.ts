export const findById = <T extends { id: string }>(list: T[], id: string) => {
	return list.find((item) => item.id === id);
};

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
	id: string;
	name: string;
	role: string;
	token: string;
}
interface UserState {
	user: User | null;
	setUser: (user: User) => void;
	clearUser: () => void;
	isAuthenticated: boolean;
}

export const useUserStore = create<UserState>()(
	persist(
		(set) => ({
			user: null,
			setUser: (user) => set({ user, isAuthenticated: true }),
			clearUser: () => set({ user: null, isAuthenticated: false }),
			isAuthenticated: false,
		}),
		{ name: 'user-storage', partialize: (state) => ({ user: state.user }) },
	),
);

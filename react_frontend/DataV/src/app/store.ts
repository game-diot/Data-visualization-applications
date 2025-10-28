import { create } from 'zustand';

interface AppState {
	token: string | null;
	userInfo: Record<string, unknown> | null;
	loading: boolean;
	setToken: (token: string | null) => void;
	setUserInfo: (user: Record<string, unknown> | null) => void;
	setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set) => ({
	token: localStorage.getItem('token'),
	userInfo: null,
	loading: false,
	setToken: (token) => {
		if (token) localStorage.setItem('token', token);
		else localStorage.removeItem('token');
		set({ token });
	},
	setUserInfo: (user) => set({ userInfo: user }),
	setLoading: (loading) => set({ loading }),
}));

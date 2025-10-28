import { useState } from 'react';
import apiClient from '@/shared/utils/apiClient.ts';

export function useApi<T>(endpoint: string, method: 'get' | 'post' | 'put' | 'delete' = 'get') {
	const [loading, setLoading] = useState(false);

	const request = async (payload?: any) => {
		setLoading(true);
		try {
			const res =
				method === 'get'
					? await apiClient.get<T>(endpoint, { params: payload })
					: await apiClient[method]<T>(endpoint, payload);
			return res;
		} finally {
			setLoading(false);
		}
	};

	return { loading, request };
}

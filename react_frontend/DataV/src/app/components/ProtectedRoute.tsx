import type { JSX } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
	children: JSX.Element;
}
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
	const token = localStorage.getItem('token');
	const location = useLocation();

	if (!token) {
		return <Navigate to="/login" replace state={{ from: location }} />;
	}
	return children;
};

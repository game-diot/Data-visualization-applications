// import { lazy, Suspense } from 'react';
import { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
// import { ProtectedRoute } from './components/ProtectedRoute';
import { Spin } from 'antd';
import { lazyLoad } from '@/shared/utils/lazyLoad';
// const HomePageLazy = lazyLoad(() => import('@/pages/home/HomePage'), 'HomePage');
// const UploadPageLazy = lazyLoad(() => import('@/pages/upload'), 'UploadPage');
// const LoginPageLazy = lazyLoad(() => import('@/pages/login'), 'LoginPage');
const NotFoundLazy = lazyLoad(() => import('@/pages/error/404'), 'NotFound');
const ForibbdenLazy = lazyLoad(() => import('@/pages/error/403'), 'Foribbden');
const TestCSSLazy = lazyLoad(() => import('@/pages/testCSS/index'), 'TestCSS');
const DataImportPageLazy = lazyLoad(
	() => import('@/features/data-import/pages/DataImportPage'),
	'DataImportPage',
);
export const AppRouter = () => {
	return (
		<Router>
			<Suspense fallback={<Spin size="large" className="flex justify-center mt-20"></Spin>}>
				<Routes>
					<Route
						path="/"
						element={
							// <ProtectedRoute>
							<DataImportPageLazy />
							// </ProtectedRoute>
						}
					></Route>
					<Route path="/login" element={<TestCSSLazy />}></Route>
					{/* <Route path="/login" element={<LoginPage />}></Route>
					<Route
						path="/upload"
						element={
							<ProtectedRoute>
								<UploadPage />
							</ProtectedRoute>
						}
					></Route> */}
					<Route path="/403" element={<ForibbdenLazy />}></Route>
					<Route path="*" element={<NotFoundLazy />}></Route>
				</Routes>
			</Suspense>
		</Router>
	);
};

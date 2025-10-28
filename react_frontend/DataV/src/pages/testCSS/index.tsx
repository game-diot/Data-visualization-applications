import { useState, useEffect } from 'react';
import { Card, Button } from 'antd';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import 'react-lazy-load-image-component/src/effects/blur.css';
import { Loading } from '@/shared/components/ui/Loading/Loading';
import { ErrorFallback } from '@/shared/components/ui/ErrorFallback/ErrorFallback';

export const TestCSS = () => {
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [data, setData] = useState<string[]>([]);

	useEffect(() => {
		// 模拟数据请求
		setTimeout(() => {
			const success = Math.random() > 0.2; // 模拟成功或失败
			if (success) {
				setData([
					'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
					'https://images.unsplash.com/photo-1522202176988-66273c2fd55f',
					'https://images.unsplash.com/photo-1519125323398-675f0ddb6308',
				]);
			} else {
				setError(true);
			}
			setLoading(false);
		}, 1500);
	}, []);

	if (loading) return <Loading />;
	if (error) return <ErrorFallback message="加载图片失败，请稍后再试。" />;

	return (
		<div className="min-h-screen bg-gray-50 p-6">
			<h1 className="text-2xl font-semibold text-center mb-6">Showcase Page（组件与样式示例）</h1>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
				{data.map((url, index) => (
					<Card key={index} className="shadow-md rounded-2xl">
						<LazyLoadImage
							effect="blur"
							src={url}
							alt={`示例图片 ${index + 1}`}
							className="rounded-xl w-full h-48 object-cover"
						/>
						<div className="mt-4 text-center">
							<Button type="primary">查看详情</Button>
						</div>
					</Card>
				))}
			</div>
		</div>
	);
};

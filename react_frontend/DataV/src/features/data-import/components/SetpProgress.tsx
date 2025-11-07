import React from 'react';
import { cn } from '@/shared/utils/cn'; // 如果你没有 cn 函数，可以换成 className 直接拼接
import { CheckCircle, Circle } from 'lucide-react';

interface StepProgressProps {
	currentStep: number;

	steps: string[];
}

export const StepProgress: React.FC<StepProgressProps> = ({ currentStep, steps }) => {
	return (
		<div className="flex items-center justify-center gap-4 my-4">
			{steps.map((step, index) => {
				const isActive = index === currentStep;
				const isCompleted = index < currentStep;

				return (
					<div key={index} className="flex items-center">
						{/* 图标部分 */}
						{isCompleted ? (
							<CheckCircle className="text-green-500 w-5 h-5" />
						) : (
							<Circle className={cn('w-5 h-5', isActive ? 'text-blue-500' : 'text-gray-400')} />
						)}

						{/* 步骤文字 */}
						<span
							className={cn(
								'ml-2 text-sm font-medium',
								isActive ? 'text-blue-600' : isCompleted ? 'text-gray-600' : 'text-gray-400',
							)}
						>
							{step}
						</span>

						{/* 连接线 */}
						{index < steps.length - 1 && (
							<div
								className={cn(
									'w-10 h-[2px] mx-2 rounded-full',
									isCompleted ? 'bg-green-500' : 'bg-gray-300',
								)}
							></div>
						)}
					</div>
				);
			})}
		</div>
	);
};

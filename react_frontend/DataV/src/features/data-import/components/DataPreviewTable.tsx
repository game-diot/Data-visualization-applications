import React from 'react';
import { type PreviewData } from '../types/dataImportTypes';

interface DataPreviewTableProps {
	data: PreviewData | null;
}

export const DataPreviewTable: React.FC<DataPreviewTableProps> = ({ data }) => {
	if (!data) return <p>暂无预览数据</p>;
	const { headers, rows } = data;

	return (
		<table className="min-w-full border border-gray-200">
			<thead>
				<tr>
					{headers.map((header) => (
						<th key={header} className="border p-2 bg-gray-100 text-left text-sm font-medium">
							{header}
						</th>
					))}
				</tr>
			</thead>
			<tbody>
				{rows.map((row, i) => (
					<tr key={i}>
						{headers.map((h) => (
							<td key={h}>{String(row[h] ?? '')}</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	);
};

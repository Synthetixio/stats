import { FC } from 'react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, Tooltip } from 'recharts';

import colors from 'styles/colors';
import CustomLegend from './CustomLegend';
import CustomTooltip from './CustomTooltip';

interface BasicPieChartProps {
	data: {
		name: string;
		value: number;
	}[];
	isShortLegend: boolean;
	tooltipFormatter?: FC<{ name: string; value: number; payload: any }>;
	legendFormatter?: FC<{ payload: any }>;
}

export const MIN_PERCENT_FOR_PIE_CHART = 0.03;

export const MUTED_COLORS = [
	colors.mutedBrightBlue,
	colors.mutedBrightOrange,
	colors.mutedBrightGreen,
	colors.mutedBrightPink,
	colors.mutedBrightYellow,
	colors.mutedBrightPurple,
	colors.mutedBrightGray,
	colors.mutedBrightRed,
	colors.mutedBrightFoamGreen,
	colors.mutedBrightBurntOrange,
	colors.mutedBrightForestGreen,
];

export const BRIGHT_COLORS = [
	colors.brightBlue,
	colors.brightOrange,
	colors.brightGreen,
	colors.brightPink,
	colors.brightYellow,
	colors.brightPurple,
	colors.brightGray,
	colors.brightRed,
	colors.brightFoamGreen,
	colors.brightBurntOrange,
	colors.brightForestGreen,
];

const BasicPieChart: FC<BasicPieChartProps> = ({
	data,
	isShortLegend,
	tooltipFormatter,
	legendFormatter,
}) => (
	<ResponsiveContainer width="100%" height={isShortLegend ? '80%' : '100%'}>
		<PieChart height={380}>
			<Pie
				data={data}
				cx="50%"
				cy="50%"
				labelLine={false}
				outerRadius={140}
				fill={colors.mutedBrightGreen}
				dataKey="value"
				strokeWidth={1.5}
			>
				{data.map((_, index: number) => (
					<Cell
						key={`cell-${index}`}
						fill={MUTED_COLORS[index % MUTED_COLORS.length]}
						stroke={BRIGHT_COLORS[index % BRIGHT_COLORS.length]}
					/>
				))}
			</Pie>
			{!tooltipFormatter ? null : (
				<Tooltip
					content={
						// @ts-ignore
						<CustomTooltip formatter={tooltipFormatter} />
					}
				/>
			)}
			<Legend
				content={<CustomLegend isShortLegend={isShortLegend} formatter={legendFormatter} />}
			/>
		</PieChart>
	</ResponsiveContainer>
);

export default BasicPieChart;

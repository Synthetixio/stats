import { FC } from 'react';
import { PieChart, Pie, Cell, Legend, ResponsiveContainer } from 'recharts';

import colors from '../../styles/colors';
import { SynthTotalSupply } from '../../types/data';
import CustomLegend from './CustomLegend';

interface BasicPieChartProps {
	data: SynthTotalSupply[];
}

const MUTED_COLORS = [
	colors.mutedBrightBlue,
	colors.mutedBrightOrange,
	colors.mutedBrightGreen,
	colors.mutedBrightPink,
	colors.mutedBrightYellow,
	colors.mutedBrightPurple,
];
const BRIGHT_COLORS = [
	colors.brightBlue,
	colors.brightOrange,
	colors.brightGreen,
	colors.brightPink,
	colors.brightYellow,
	colors.brightPurple,
];

const BasicPieChart: FC<BasicPieChartProps> = ({ data }) => (
	<ResponsiveContainer width="100%" height={380}>
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
				{data.map((entry: SynthTotalSupply, index: number) => (
					<Cell
						key={`cell-${index}`}
						fill={MUTED_COLORS[index % MUTED_COLORS.length]}
						stroke={BRIGHT_COLORS[index % BRIGHT_COLORS.length]}
					/>
				))}
			</Pie>
			<Legend content={<CustomLegend />} />
		</PieChart>
	</ResponsiveContainer>
);

export default BasicPieChart;

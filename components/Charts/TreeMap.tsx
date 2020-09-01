import { FC } from 'react';
import { Treemap, ResponsiveContainer } from 'recharts';

import colors from '../../styles/colors';
import { formatCurrency } from '../../utils/formatter';
import { TreeMapData } from '../../types/data';

const MUTED_COLORS = [
	colors.mutedBrightBlue,
	colors.mutedBrightPink,
	colors.mutedBrightGreen,
	colors.mutedBrightYellow,
	colors.mutedBrightOrange,
	colors.mutedBrightPurple,
];

const BRIGHT_COLORS = [
	colors.brightBlue,
	colors.brightPink,
	colors.brightGreen,
	colors.brightYellow,
	colors.brightOrange,
	colors.brightPurple,
];

const CustomizedContent: FC<any> = ({ x, y, width, height, index, name, size }) => (
	<g>
		<rect
			x={x}
			y={y}
			width={width}
			height={height}
			style={{
				fill: MUTED_COLORS[index % MUTED_COLORS.length],
				stroke: BRIGHT_COLORS[index % BRIGHT_COLORS.length],
				strokeWidth: 2,
				strokeOpacity: 1,
			}}
		/>
		<text
			x={x + width / 2}
			y={y + height / 2 + 7}
			textAnchor="middle"
			fill={colors.brightGreen}
			fontSize={14}
		>
			{name + ': ' + formatCurrency(size)}
		</text>
	</g>
);

interface BasicTreeMapProps {
	data: TreeMapData[];
}

const BasicTreeMap: FC<BasicTreeMapProps> = ({ data }) => (
	<ResponsiveContainer width="100%" height={400}>
		<Treemap
			height={400}
			data={data}
			dataKey="value"
			ratio={4 / 3}
			stroke={colors.brightGreen}
			fill={colors.mutedBrightGreen}
			content={<CustomizedContent />}
		/>
	</ResponsiveContainer>
);

export default BasicTreeMap;

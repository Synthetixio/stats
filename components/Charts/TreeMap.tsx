import React, { PureComponent } from 'react';
import { Treemap, ResponsiveContainer, Legend } from 'recharts';

import colors from '../../styles/colors';
import { formatCurrency } from '../../utils/formatter';
import { TreeMapData } from '../../types/data';

// const data = [
// 	{
// 		name: 'sUSD',
// 		children: [
// 			{ name: 'Curve', value: 20859000 },
// 			{ name: 'Stakers', value: 4614000 },
// 			{ name: 'Uniswap', value: 3000345 },
// 			{ name: 'Balancer', value: 1250900 },
// 			{ name: 'Other', value: 3478987 },
// 		],
// 	},
// ];

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

class CustomizedContent extends PureComponent {
	render() {
		// @ts-ignore TODO get the types for this
		const { x, y, width, height, index, payload, rank, name, size } = this.props;

		return (
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
	}
}

interface BasicTreeMapProps {
	data: TreeMapData[];
}

export default class BasicTreeMap extends PureComponent<BasicTreeMapProps, {}> {
	render() {
		const { data } = this.props;
		return (
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
				<Legend iconType="line" height={26} />
			</ResponsiveContainer>
		);
	}
}

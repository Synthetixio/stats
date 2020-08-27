import React, { PureComponent } from 'react';
import { Treemap, ResponsiveContainer } from 'recharts';

import colors from '../../styles/colors';
import { formatCurrency } from '../../utils/formatter';

const data = [
	{
		name: 'sUSD',
		children: [
			{ name: 'Curve', size: 20859000 },
			{ name: 'Stakers', size: 4614000 },
			{ name: 'Uniswap', size: 3000345 },
			{ name: 'Balancer', size: 1250900 },
			{ name: 'Other', size: 3478987 },
		],
	},
];

const COLORS = [
	colors.mutedBrightBlue,
	colors.mutedBrightGreen,
	colors.mutedBrightPink,
	colors.mutedBrightOrange,
];

class CustomizedContent extends PureComponent {
	render() {
		const { x, y, width, height, index, payload, rank, name, size } = this.props;

		return (
			<g>
				<rect
					x={x}
					y={y}
					width={width}
					height={height}
					style={{
						fill: COLORS[Math.floor(Math.random() * COLORS.length)],
						stroke: colors.brightGreen,
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

export default class BasicTreeMap extends PureComponent {
	render() {
		return (
			<ResponsiveContainer width="100%" height={400}>
				<Treemap
					height={400}
					data={data}
					dataKey="size"
					ratio={4 / 3}
					stroke={colors.brightGreen}
					fill={colors.mutedBrightGreen}
					content={<CustomizedContent />}
				/>
			</ResponsiveContainer>
		);
	}
}

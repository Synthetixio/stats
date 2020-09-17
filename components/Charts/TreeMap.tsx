import { FC } from 'react';
import styled from 'styled-components';
import { Treemap, ResponsiveContainer } from 'recharts';

import colors from '../../styles/colors';
import { formatPercentage } from '../../utils/formatter';
import { TreeMapData } from '../../types/data';
import { MAX_PAGE_WIDTH } from '../../constants/styles';

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

const CustomizedContent: FC<any> = ({ x, y, width, height, index, value, root }) => {
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
				{formatPercentage(value / root.value, 0)}
			</text>
		</g>
	);
};

interface BasicTreeMapProps {
	data: TreeMapData[];
	totalSupplySUSD: number | null;
}

const BasicTreeMap: FC<BasicTreeMapProps> = ({ data, totalSupplySUSD }) => {
	const totalTopHolders = data.reduce((acc, curr) => (acc += curr.value), 0);
	const formattedData = [
		...data,
		{
			name: 'others',
			value: totalSupplySUSD - totalTopHolders,
		},
	];
	return (
		<>
			<ResponsiveContainer width="100%" height={400}>
				<Treemap
					height={400}
					data={formattedData}
					dataKey="value"
					ratio={4 / 3}
					stroke={colors.brightGreen}
					fill={colors.mutedBrightGreen}
					content={<CustomizedContent />}
				/>
			</ResponsiveContainer>
			<TreeMapLegendContainer>
				{formattedData.map(({ name }, index) => (
					<TreeMapLegendItem key={name} index={index}>
						&#8226; {name}
					</TreeMapLegendItem>
				))}
			</TreeMapLegendContainer>
		</>
	);
};

const TreeMapLegendContainer = styled.div`
	max-width: ${MAX_PAGE_WIDTH}px;
	margin: 10px auto 0 auto;
	display: flex;
	justify-content: space-around;
	height: 75px;
	align-items: center;
	flex-wrap: wrap;
`;

const TreeMapLegendItem = styled.div<{ index: number }>`
	color: ${(props) => BRIGHT_COLORS[props.index % BRIGHT_COLORS.length]};
`;

export default BasicTreeMap;

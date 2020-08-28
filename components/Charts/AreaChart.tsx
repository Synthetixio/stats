import { FC } from 'react';
import styled from 'styled-components';

import BasicAreaChart from './BasicAreaChart';
import ChartTimeSelectors from './ChartTimeSelectors';
import ChartTitle from './ChartTitle';
import { MAX_PAGE_WIDTH, NumberStyle } from '../../constants/styles';

interface AreaChartProps {
	data: Array<any>;
	periods: Array<string>;
	title: string;
	num: number;
	numFormat: NumberStyle;
	percentChange: number;
}

const AreaChart: FC<AreaChartProps> = ({ data, periods, title, num, numFormat, percentChange }) => (
	<ChartContainer>
		<ChartHeader>
			<ChartTitle title={title} num={num} numFormat={numFormat} percentChange={percentChange} />
			<ChartTimeSelectors
				periods={periods}
				onClick={(period: string) => console.log('period:', period)}
			/>
		</ChartHeader>
		<BasicAreaChart data={data} />
	</ChartContainer>
);

export default AreaChart;

const ChartContainer = styled.div`
	background: ${(props) => props.theme.colors.mediumBlue};
	margin: 20px auto;
	max-width: ${MAX_PAGE_WIDTH}px;
`;

const ChartHeader = styled.div`
	height: 100px;
	width: 100%;
	display: flex;
	justify-content: space-between;
	align-items: center;
`;

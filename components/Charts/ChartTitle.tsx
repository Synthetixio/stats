import { FC } from 'react';
import styled from 'styled-components';

import { Z_INDEX, NumberStyle } from '../../constants/styles';

import { PercentChangeBox } from '../common';
import { getFormattedNumber, formatPercentage } from '../../utils/formatter';

interface ChartTitleProps {
	title: string;
	num: number;
	numFormat: NumberStyle;
	percentChange: number;
}

const ChartTitle: FC<ChartTitleProps> = ({ title, num, numFormat, percentChange }) => {
	let formattedNum = getFormattedNumber(num, numFormat);
	console.log('percentChange', percentChange);
	return (
		<ContentContainer>
			<MainTitle>{title}</MainTitle>
			<BottomSegment>
				<MainNumber>{formattedNum}</MainNumber>
				<PercentChangeBox color="green">{formatPercentage(percentChange)}</PercentChangeBox>
			</BottomSegment>
		</ContentContainer>
	);
};

const ContentContainer = styled.div`
	padding-left: 30px;
	padding-top: 30px;
	width: 200px;
	z-index: ${Z_INDEX.hundred};
	color: ${(props) => props.theme.colors.white};
`;

const MainTitle = styled.div`
	font-style: normal;
	font-weight: 500;
	font-size: 14px;
	line-height: 24px;
`;

const MainNumber = styled.div`
	font-style: normal;
	font-weight: bold;
	font-size: 28px;
	line-height: 24px;
	color: ${(props) => props.theme.colors.brightGreen};
	margin-right: 10px;
`;

const BottomSegment = styled.div`
	display: flex;
	width: 100px;
	margin-top: 10px;
	justify-content: space-between;
`;

export default ChartTitle;

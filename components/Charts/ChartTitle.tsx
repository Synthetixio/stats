import { FC, ReactNode } from 'react';
import styled from 'styled-components';

import { Z_INDEX, NumberStyle } from 'constants/styles';

import { PercentChangeBox } from 'components/common';
import { getFormattedNumber, formatPercentage } from 'utils/formatter';
import InfoPopover from '../InfoPopover';

interface ChartTitleProps {
	title: string;
	num: number | null;
	numFormat: NumberStyle;
	percentChange: number | null;
	infoData: ReactNode;
}

const ChartTitle: FC<ChartTitleProps> = ({ title, num, numFormat, percentChange, infoData }) => {
	let formattedNum = getFormattedNumber(num, numFormat);
	return (
		<ContentContainer>
			<TitleWrap>
				<MainTitle>{title}</MainTitle>
				<InfoPopover infoData={infoData} />
			</TitleWrap>
			<BottomSegment>
				<MainNumber>{formattedNum}</MainNumber>
				{percentChange ? (
					<PercentChangeBox color="green">{formatPercentage(percentChange)}</PercentChangeBox>
				) : null}
			</BottomSegment>
		</ContentContainer>
	);
};

const ContentContainer = styled.div`
	padding-left: 30px;
	padding-top: 30px;
	width: 260px;
	z-index: ${Z_INDEX.hundred};
	color: ${(props) => props.theme.colors.white};
`;

const MainTitle = styled.div`
	font-family: ${(props) => `${props.theme.fonts.condensedMedium}, ${props.theme.fonts.regular}`};
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
	font-family: ${(props) => `${props.theme.fonts.mono}, ${props.theme.fonts.regular}`};
`;

const BottomSegment = styled.div`
	display: flex;
	width: 100px;
	margin-top: 10px;
	justify-content: space-between;
`;

const TitleWrap = styled.div`
	display: flex;
`;

export default ChartTitle;

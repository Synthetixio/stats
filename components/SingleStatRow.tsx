import { FC } from 'react';
import styled from 'styled-components';
import { COLORS, NumberColor, MAX_PAGE_WIDTH } from '../constants/styles';
import { PercentChangeBox } from './common';
import { formatCurrency } from '../utils/formatter';

type SingleStatRowProps = {
	text: string;
	subtext: string;
	num: number;
	color: NumberColor;
};

const SingleStatRow: FC<SingleStatRowProps> = ({ text, subtext, color, num }) => {
	return (
		<SingleStatRowContainer>
			<SingleStatsLeft>
				<SingleStatsText>{text}</SingleStatsText>
				<SingleStatsSubtext>{subtext}</SingleStatsSubtext>
			</SingleStatsLeft>
			<SingleStatsRight>
				<SingleStatsNumber color={color}>{formatCurrency(num, 0)}</SingleStatsNumber>
			</SingleStatsRight>
		</SingleStatRowContainer>
	);
};

export default SingleStatRow;

const SingleStatRowContainer = styled.div`
	display: flex;
	justify-content: space-between;
	max-width: ${MAX_PAGE_WIDTH}px;
	margin: 0 auto;
	background: ${(props) => props.theme.colors.mediumBlue};
	height: 100px;
	align-items: center;
`;

const SingleStats = styled.div`
	display: flex;
	flex-direction: column;
	width: 400px;
`;

const SingleStatsLeft = styled(SingleStats)`
	text-align: left;
	padding-left: 30px;
`;

const SingleStatsRight = styled(SingleStats)`
	text-align: right;
	padding-right: 30px;
`;

const SingleStatsText = styled.div`
	color: ${(props) => props.theme.colors.white};
	padding-bottom: 20px;
`;

const SingleStatsSubtext = styled.div`
	color: ${(props) => props.theme.colors.gray};
`;

const SingleStatsNumber = styled.div<{ color: string }>`
	font-family: ${(props) => `${props.theme.fonts.mono}, ${props.theme.fonts.regular}`};
	font-style: normal;
	font-weight: bold;
	font-size: 28px;
	line-height: 24px;
	padding-bottom: 32px;
	color: ${(props) =>
		props.color === COLORS.green ? props.theme.colors.brightGreen : props.theme.colors.brightPink};
`;

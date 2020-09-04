import { FC } from 'react';
import styled from 'styled-components';
import { NumberColor, COLORS } from '../constants/styles';
import { formatCurrency } from '../utils/formatter';

type DoubleStatsBoxProps = {
	title: string;
	subtitle: string;
	firstMetricTitle: string;
	firstMetric: number;
	firstColor: NumberColor;
	secondMetricTitle: string;
	secondMetric: number;
	secondColor: NumberColor;
};

const DoubleStatsBox: FC<DoubleStatsBoxProps> = ({
	title,
	subtitle,
	firstMetric,
	firstMetricTitle,
	firstColor,
	secondColor,
	secondMetric,
	secondMetricTitle,
}) => {
	return (
		<DoubleStatsBoxContainer>
			<DoubleStatsBoxTitle>{title}</DoubleStatsBoxTitle>
			<DoubleStatsBoxSubtitle>{subtitle}</DoubleStatsBoxSubtitle>
			<DoubleStatsBoxMetricTitle>{firstMetricTitle}</DoubleStatsBoxMetricTitle>
			<DoubleStatsBoxMetric color={firstColor}>{formatCurrency(firstMetric)}</DoubleStatsBoxMetric>
			<DoubleStatsBoxMetricTitle>{secondMetricTitle}</DoubleStatsBoxMetricTitle>
			<DoubleStatsBoxMetric color={secondColor}>
				{formatCurrency(secondMetric, 0)}
			</DoubleStatsBoxMetric>
		</DoubleStatsBoxContainer>
	);
};

export default DoubleStatsBox;

const DoubleStatsBoxContainer = styled.div`
	background: ${(props) => props.theme.colors.mediumBlue};
	margin: 20px 0;
	padding: 20px;
	width: 29%;
	height: 290px;
	@media only screen and (max-width: 1015px) {
		width: 45%;
	}
	@media only screen and (max-width: 854px) {
		width: 100%;
	}
`;

const DoubleStatsBoxTitle = styled.div`
	font-family: ${(props) => `${props.theme.fonts.mono}, ${props.theme.fonts.regular}`};
	font-style: normal;
	font-weight: 900;
	font-size: 20px;
	line-height: 120%;
	color: ${(props) => props.theme.colors.white};
	padding: 10px 0;
`;

const DoubleStatsBoxSubtitle = styled.div`
	font-family: 'Inter', sans-serif;
	font-style: normal;
	font-weight: normal;
	font-size: 14px;
	line-height: 18px;
	color: ${(props) => props.theme.colors.gray};
	padding-bottom: 20px;
`;

const DoubleStatsBoxMetric = styled.div<{ color: NumberColor }>`
	font-family: ${(props) => `${props.theme.fonts.mono}, ${props.theme.fonts.regular}`};
	font-style: normal;
	font-weight: bold;
	font-size: 28px;
	line-height: 24px;
	padding-bottom: 30px;
	color: ${(props) =>
		props.color === COLORS.green ? props.theme.colors.brightGreen : props.theme.colors.brightPink};
`;

const DoubleStatsBoxMetricTitle = styled.div`
	font-family: ${(props) => `${props.theme.fonts.mono}, ${props.theme.fonts.regular}`};
	font-style: normal;
	font-weight: 500;
	font-size: 14px;
	line-height: 24px;
	padding-bottom: 5px;
	color: ${(props) => props.theme.colors.white};
`;

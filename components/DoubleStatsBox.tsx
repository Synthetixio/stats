import { FC, ReactNode } from 'react';
import styled from 'styled-components';

import { NumberColor, COLORS, NumberStyle } from 'constants/styles';
import { getFormattedNumber } from 'utils/formatter';
import InfoPopover from './InfoPopover';
import { UseQueryResult } from 'react-query';

import StatsTools from './StatsTools';

type DoubleStatsBoxProps = {
	title: string;
	subtitle: ReactNode;
	firstMetricTitle: string;
	firstMetric: number | null;
	firstColor: NumberColor;
	firstMetricStyle: NumberStyle;
	secondMetricTitle: string;
	secondMetric: number | null;
	secondColor: NumberColor;
	secondMetricStyle: NumberStyle;
	queries?: UseQueryResult[];
	infoData?: ReactNode;
};

const DoubleStatsBox: FC<DoubleStatsBoxProps> = ({
	title,
	subtitle,
	firstMetric,
	firstMetricTitle,
	firstMetricStyle,
	firstColor,
	secondColor,
	secondMetric,
	secondMetricTitle,
	secondMetricStyle,
	queries = [],
	infoData,
}) => {
	const allQueriesLoaded = !queries.find((q) => q.isLoading);

	const formattedFirstMetric =
		allQueriesLoaded && firstMetric != null
			? getFormattedNumber(firstMetric, firstMetricStyle)
			: getFormattedNumber(0, firstMetricStyle)!.replace(/0/g, '-');

	const formattedSecondMetric =
		allQueriesLoaded && secondMetric != null
			? getFormattedNumber(secondMetric, secondMetricStyle)
			: getFormattedNumber(0, secondMetricStyle)!.replace(/0/g, '-');

	return (
		<DoubleStatsBoxContainer>
			<HeaderWrapper>
				<TitleWrapper>
					<DoubleStatsBoxTitle>{title}</DoubleStatsBoxTitle>
					{infoData != null ? <InfoPopover infoData={infoData} /> : null}
				</TitleWrapper>
				<StatsTools queries={queries} />
			</HeaderWrapper>
			<DoubleStatsBoxSubtitle>{subtitle}</DoubleStatsBoxSubtitle>
			<DoubleStatsBoxMetricTitle>{firstMetricTitle}</DoubleStatsBoxMetricTitle>
			<DoubleStatsBoxMetric color={firstColor}>{formattedFirstMetric}</DoubleStatsBoxMetric>
			<DoubleStatsBoxMetricTitle>{secondMetricTitle}</DoubleStatsBoxMetricTitle>
			<DoubleStatsBoxMetric color={secondColor}>{formattedSecondMetric}</DoubleStatsBoxMetric>
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

const HeaderWrapper = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-top: 20px;
	margin-bottom: 15px;
	margin-right: 10px;
`;

export const TitleWrapper = styled.div`
	display: flex;
	align-items: center;
`;

const DoubleStatsBoxTitle = styled.div`
	font-family: ${(props) => `${props.theme.fonts.expanded}, ${props.theme.fonts.regular}`};
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
	height: 50px;
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
	font-family: ${(props) => `${props.theme.fonts.condensedMedium}, ${props.theme.fonts.regular}`};
	font-style: normal;
	font-weight: 500;
	font-size: 14px;
	line-height: 24px;
	padding-bottom: 5px;
	color: ${(props) => props.theme.colors.white};
`;

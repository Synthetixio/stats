import { FC, ReactNode } from 'react';
import { Skeleton } from '@material-ui/lab';
import styled, { css } from 'styled-components';

import { getFormattedNumber } from 'utils/formatter';
import { COLORS, NumberColor, NumberStyle } from 'constants/styles';
import { PercentChangeBox } from './common';
import InfoPopover from './InfoPopover';
import { UseQueryResult } from 'react-query';

import StatsTools from './StatsTools';

interface StatsBoxProps {
	title: string;
	num: number | null;
	queries?: UseQueryResult[];
	percentChange: number | null;
	subText: string;
	color: NumberColor;
	numberStyle: NumberStyle;
	numBoxes: number;
	infoData: ReactNode | null;
}

// TODO what if num is 0 and is supposed to be zero!!
const StatsBox: FC<StatsBoxProps> = ({
	title,
	num,
	queries = [],
	percentChange,
	subText,
	color,
	numberStyle,
	numBoxes,
	infoData,
}) => {
	const allQueriesLoaded = !queries.find((q) => q.isLoading);

	const formattedNumber =
		allQueriesLoaded && num != null
			? getFormattedNumber(num, numberStyle)
			: getFormattedNumber(0, numberStyle)!.replace(/0/g, '-');

	return (
		<StatsBoxContainer num={100} numBoxes={numBoxes}>
			{false ? (
				<Skeleton
					className="stats-box-skeleton"
					variant="rect"
					animation="wave"
					width="100%"
					height="100%"
				/>
			) : (
				<>
					<HeaderWrapper>
						<TitleWrapper>
							<StatsBoxTitle>{title}</StatsBoxTitle>
							{infoData != null ? <InfoPopover infoData={infoData} /> : null}
						</TitleWrapper>
						<StatsTools queries={queries} />
					</HeaderWrapper>
					<StatsBoxNumber color={color}>{formattedNumber}</StatsBoxNumber>
					{percentChange != null ? (
						<PercentChangeBox color={color}>{percentChange}</PercentChangeBox>
					) : null}
					<StatsBoxSubText>{subText}</StatsBoxSubText>
				</>
			)}
		</StatsBoxContainer>
	);
};

export default StatsBox;

const StatsBoxContainer = styled.div<{ num: number | null; numBoxes: number }>`
	margin-top: 20px;
	padding: ${(props) => (props.num == null ? '0' : '20px')};
	padding-top: 0;
	${(props) => {
		if (props.num == null && props.numBoxes === 2) {
			return css`
				width: calc(46% + 40px);
				height: 160px;
			`;
		}
		if (props.num == null && props.numBoxes === 3) {
			return css`
				width: calc(29% + 40px);
				height: 160px;
			`;
		}
		if (props.num == null && props.numBoxes === 4) {
			return css`
				width: calc(21% + 40px);
				height: 205px;
			`;
		}
		if (props.numBoxes === 2) {
			return css`
				width: 46%;
				height: 120px;
			`;
		}
		if (props.numBoxes === 3) {
			return css`
				width: 29%;
				height: 120px;
			`;
		}
		return css`
			width: 21%;
			height: 165px;
		`;
	}};

	background: ${(props) => props.theme.colors.mediumBlue};
	opacity: 0.8;
	box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.4);

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

const TitleWrapper = styled.div`
	display: flex;
	align-items: center;
`;

const StatsBoxTitle = styled.div`
	height: 24px;

	font-family: ${(props) => `${props.theme.fonts.condensedMedium}, ${props.theme.fonts.regular}`};
	font-size: 14px;
	line-height: 24px;

	color: ${(props) => props.theme.colors.white};

	@media only screen and (max-width: 500px) {
		margin-bottom: 25px;
	}
`;

const StatsBoxNumber = styled.div<{ color: NumberColor }>`
	width: 69px;
	height: 24px;
	margin-bottom: 15px;

	font-family: ${(props) => `${props.theme.fonts.mono}, ${props.theme.fonts.regular}`};
	font-style: normal;
	font-weight: bold;
	font-size: 28px;
	line-height: 24px;

	text-transform: uppercase;

	color: ${(props) =>
		props.color === COLORS.green ? props.theme.colors.brightGreen : props.theme.colors.brightPink};
`;

const StatsBoxSubText = styled.div`
	height: 32px;

	font-family: 'Inter', sans-serif;
	font-style: normal;
	font-weight: normal;
	font-size: 14px;
	line-height: 18px;
	/* or 129% */

	color: ${(props) => props.theme.colors.gray};
`;

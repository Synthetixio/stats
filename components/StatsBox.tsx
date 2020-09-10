import { FC } from 'react';
import { Skeleton } from '@material-ui/lab';
import styled, { css } from 'styled-components';

import { getFormattedNumber } from 'utils/formatter';
import { COLORS, NumberColor, NumberStyle } from 'constants/styles';
import { PercentChangeBox } from './common';

interface StatsBoxProps {
	title: string;
	num: number | null;
	percentChange: number | null;
	subText: string;
	color: NumberColor;
	numberStyle: NumberStyle;
	numBoxes: number;
}

// TODO what if num is 0 and is supposed to be zero!!
const StatsBox: FC<StatsBoxProps> = ({
	title,
	num,
	percentChange,
	subText,
	color,
	numberStyle,
	numBoxes,
}) => {
	const formattedNumber = getFormattedNumber(num, numberStyle);
	return (
		<StatsBoxContainer num={num} numBoxes={numBoxes}>
			{num == null ? (
				<Skeleton
					className="stats-box-skeleton"
					variant="rect"
					animation="wave"
					width="100%"
					height="100%"
				/>
			) : (
				<>
					<StatsBoxTitle>{title}</StatsBoxTitle>
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
	${(props) => {
		if (props.num == null && props.numBoxes === 2) {
			return css`
				width: calc(46% + 40px);
				height: 180px;
			`;
		}
		if (props.num == null && props.numBoxes === 3) {
			return css`
				width: calc(29% + 40px);
				height: 180px;
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
				height: 140px;
			`;
		}
		if (props.numBoxes === 3) {
			return css`
				width: 29%;
				height: 140px;
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

const StatsBoxTitle = styled.div`
	height: 24px;
	margin-bottom: 15px;

	font-family: ${(props) => `${props.theme.fonts.condensedMedium}, ${props.theme.fonts.regular}`};
	font-size: 14px;
	line-height: 24px;

	text-transform: uppercase;

	color: ${(props) => props.theme.colors.white};
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

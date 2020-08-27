import { FC } from 'react';
import styled, { css } from 'styled-components';
import { getFormattedNumber } from '../utils/formatter';
import { COLORS, NumberColor, NumberStyle } from '../constants/styles';

interface StatsBoxProps {
	title: string;
	number: number;
	percentChange: number | null;
	subText: string;
	color: NumberColor;
	numberStyle: NumberStyle;
	numBoxes: number;
}

const StatsBox: FC<StatsBoxProps> = ({
	title,
	number,
	percentChange,
	subText,
	color,
	numberStyle,
	numBoxes,
}) => {
	const formattedNumber = getFormattedNumber(number, numberStyle);
	return (
		<StatsBoxContainer numBoxes={numBoxes}>
			<StatsBoxTitle>{title}</StatsBoxTitle>
			<StatsBoxNumber color={color}>{formattedNumber}</StatsBoxNumber>
			{percentChange != null ? (
				<StatsBoxPercentChange color={color}>{percentChange}</StatsBoxPercentChange>
			) : null}
			<StatsBoxSubText>{subText}</StatsBoxSubText>
		</StatsBoxContainer>
	);
};

export default StatsBox;

const StatsBoxContainer = styled.div<{ numBoxes: number }>`
	margin-top: 20px;
	padding: 20px;
	${(props) =>
		props.numBoxes === 3
			? css`
					width: 29%;
					height: 140px;
			  `
			: css`
					width: 21%;
					height: 165px;
			  `};

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

	font-style: normal;
	font-weight: 500;
	font-size: 14px;
	line-height: 24px;

	text-transform: uppercase;

	color: ${(props) => props.theme.colors.white};
`;

const StatsBoxNumber = styled.div<{ color: NumberColor }>`
	width: 69px;
	height: 24px;
	margin-bottom: 15px;

	font-style: normal;
	font-weight: bold;
	font-size: 28px;
	line-height: 24px;

	text-transform: uppercase;

	color: ${(props) =>
		props.color === COLORS.green ? props.theme.colors.brightGreen : props.theme.colors.brightPink};
`;

export const StatsBoxPercentChange = styled.div<{ color: NumberColor }>`
	width: 48px;
	height: 22px;
	margin-bottom: 15px;
	text-align: center;
	padding: 4px 6px 0 6px;
	font-style: normal;
	font-weight: bold;
	font-size: 12px;

	background: ${(props) =>
		props.color === COLORS.green ? props.theme.colors.brightGreen : props.theme.colors.brightPink};
	border-radius: 2px;
`;

const StatsBoxSubText = styled.div`
	height: 32px;

	font-family: Inter;
	font-style: normal;
	font-weight: normal;
	font-size: 14px;
	line-height: 18px;
	/* or 129% */

	color: ${(props) => props.theme.colors.white};
`;

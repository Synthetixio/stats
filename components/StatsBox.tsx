import { FC } from 'react';
import styled from 'styled-components';

type NumberColor = 'green' | 'pink';
type NumberStyle = 'percent' | 'number' | 'currency';

interface StatsBoxProps {
	title: string;
	number: number;
	percentChange: number;
	subText: string;
	color: NumberColor;
	numberStyle: NumberStyle;
}

const StatsBox: FC<StatsBoxProps> = ({
	title,
	number,
	percentChange,
	subText,
	color,
	numberStyle,
}) => {
	console.log('numberStyle', numberStyle);
	return (
		<>
			<StatsBoxContainer>
				<StatsBoxTitle>{title}</StatsBoxTitle>
				<StatsBoxNumber color={color}>{number}</StatsBoxNumber>
				<StatsBoxPercentChange color={color}>{percentChange}</StatsBoxPercentChange>
				<StatsBoxSubText>{subText}</StatsBoxSubText>
			</StatsBoxContainer>
		</>
	);
};

export default StatsBox;

const StatsBoxContainer = styled.div`
	padding: 20px;
	width: 254px;
	height: 207px;
	left: 176px;
	top: 279px;

	background: ${(props) => props.theme.colors.mediumBlue};
	opacity: 0.8;
	box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.4);
`;

const StatsBoxTitle = styled.div`
	width: 130px;
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
		props.color === 'green' ? props.theme.colors.brightGreen : props.theme.colors.brightPink};
`;
const StatsBoxPercentChange = styled.div<{ color: NumberColor }>`
	width: 48px;
	height: 24px;
	margin-bottom: 15px;
	text-align: center;
	padding-top: 6px;

	background: ${(props) =>
		props.color === 'green' ? props.theme.colors.brightGreen : props.theme.colors.brightPink};
	border-radius: 2px;
`;
const StatsBoxSubText = styled.div`
	width: 206px;
	height: 32px;

	font-family: Inter;
	font-style: normal;
	font-weight: normal;
	font-size: 14px;
	line-height: 18px;
	/* or 129% */

	color: ${(props) => props.theme.colors.white1};
`;

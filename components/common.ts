import styled from 'styled-components';
import { COLORS, NumberColor } from '../constants/styles';

export const PercentChangeBox = styled.div<{ color: NumberColor }>`
	width: 52px;
	height: 22px;
	margin-bottom: 15px;
	text-align: center;
	padding: 4px 6px 0 6px;
	font-style: normal;
	font-weight: bold;
	font-size: 10px;
	font-family: 'Inter', sans-serif;

	background: ${(props) =>
		props.color === COLORS.green ? props.theme.colors.brightGreen : props.theme.colors.brightPink};
	border-radius: 2px;
`;

export const ChartTitle = styled.div`
	font-style: normal;
	font-weight: 900;
	font-size: 20px;
	line-height: 58px;
	padding-left: 20px;
	padding-top: 30px;
	color: ${(props) => props.theme.colors.white};
`;

export const ChartSubtitle = styled.div`
	font-style: normal;
	font-weight: normal;
	font-size: 14px;
	line-height: 18px;
	color: ${(props) => props.theme.colors.gray};
	padding-left: 20px;
	padding-bottom: 15px;
`;

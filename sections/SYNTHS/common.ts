import styled from 'styled-components';

export const SynthsChartTitle = styled.div`
	font-style: normal;
	font-weight: 900;
	font-size: 20px;
	line-height: 58px;
	padding-left: 20px;
	padding-top: 30px;
`;

export const SynthsChartSubtitle = styled.div`
	font-style: normal;
	font-weight: normal;
	font-size: 14px;
	line-height: 18px;
	color: ${(props) => props.theme.colors.gray};
	padding-left: 20px;
	padding-bottom: 15px;
`;

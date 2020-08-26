import { FC } from 'react';
import styled, { css, keyframes } from 'styled-components';

import { formatPercentage } from '../../utils/formatter';

interface SidewaysBarChartProps {
	data: any;
}

const SidewaysBarChart: FC<SidewaysBarChartProps> = ({ data }) => (
	<ChartContainer>
		<HeaderRow>
			<StyledLabel>Shorts</StyledLabel>
			<StyledLabel>Longs</StyledLabel>
		</HeaderRow>
		{data
			? Object.keys(data).map((key) => {
					const synthName = `s${key}`;
					const inverseName = `i${key}`;

					const synthValue = data[key][synthName];
					const inverseValue = data[key][inverseName];

					const totalValue = synthValue + inverseValue;

					return (
						<SynthContainer key={`synth-${key}`}>
							<ShortSynth>
								<SynthLabel>{inverseName}</SynthLabel>
								<LabelSmall>{formatPercentage(inverseValue / totalValue, 0)}</LabelSmall>
							</ShortSynth>
							<LongSynth>
								<SynthLabel>{synthName}</SynthLabel>
								<LabelSmall>{formatPercentage(synthValue / totalValue, 0)}</LabelSmall>
							</LongSynth>
							<BarContainer>
								<ShortBar value={inverseValue / totalValue}></ShortBar>
								<LongBar value={synthValue / totalValue}></LongBar>
							</BarContainer>
						</SynthContainer>
					);
			  })
			: null}
	</ChartContainer>
);

const ChartContainer = styled.div`
	width: 500px;
	min-height: 250px;
	position: relative;
`;

const VerticalBar = styled.div`
	position: absolute;
	top: 25px;
	bottom: 0;
	left: 50%;
`;

const HeaderRow = styled.div`
	width: 100%;
	display: flex;
	justify-content: space-between;
	margin: 13px 0;
`;

const SynthContainer = styled.div`
	height: 58px;
	justify-content: center;
	display: flex;
	padding: 0 38px;
	align-items: center;
	width: 100%;
`;

const BarContainer = styled.div`
	position: relative;
	height: 26px;
	width: 100%;
`;

const slideToLeft = (value: string) => keyframes`
  from {
    left: 50%;
  }
  to {
   left: ${value};
  }
`;

const slideToRight = (value: string) => keyframes`
  from {
    right: 50%;
  }
  to {
   right: ${value};
  }
`;

const barStyle = css`
	position: absolute;
	height: 26px;
	transition: all 0.5s linear;
	bottom: 26px;
	top: 0;
`;

const ShortSynth = styled.div`
	display: flex;
	flex-direction: column;
	position: absolute;
	left: 0;
	width: 32px;
	text-align: left;
`;

const LongSynth = styled.div`
	display: flex;
	flex-direction: column;
	position: absolute;
	right: 0;
	width: 38px;
	text-align: right;
`;

const ShortBar = styled.div<{ value: number }>`
	${barStyle}
	border: ${(props) => `2px solid ${props.theme.colors.mutedBrightPinkBorder}`};
	box-shadow: 0px 0px 15px rgba(237, 30, 255, 0.28);
	background: ${(props) => props.theme.colors.mutedBrightPink};
	right: 50%;
	animation: ${(props) => slideToLeft(`calc((50%  - 50%  * ${props.value}))`)} 0.5s forwards linear;
`;

const LongBar = styled.div<{ value: number }>`
	${barStyle}
	border: ${(props) => `2px solid ${props.theme.colors.mutedBrightGreenBorder}`};
	box-shadow: 0px 0px 15px rgba(77, 244, 184, 0.15);
	background: ${(props) => props.theme.colors.mutedBrightGreen};
	left: 50%;
	animation: ${(props) => slideToRight(`calc((50%  - 50%  * ${props.value}))`)} 0.5s forwards linear;
`;

export const LabelSmall = styled.span`
	font-size: 12px;
	color: ${(props) => props.theme.colors.white};
	line-height: 1.2;
	letter-spacing: 0.2px;
`;

const StyledLabel = styled(LabelSmall)`
	text-transform: uppercase;
	flex: 1;
`;

const SynthLabel = styled(LabelSmall)`
	color: ${(props) => props.theme.colors.white};
`;

export default SidewaysBarChart;

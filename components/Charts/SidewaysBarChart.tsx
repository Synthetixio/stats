import { FC } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import styled, { css, keyframes } from 'styled-components';

import { formatCurrency, formatNumber } from 'utils/formatter';
import colors from 'styles/colors';
import { FlexDivCol, FlexDivRow } from 'components/common';

import InfoPopover from '../InfoPopover';

export type OpenInterest = {
	name: string;

	value: number;
	totalSupply: number;

	isShort: boolean;
	inverseTotalSupply: number;
	shortSupply: number;
	shortValue: number;
};

interface SidewaysBarChartProps {
	data: OpenInterest[];
	totalValue: number;
}

const SidewaysBarChart: FC<SidewaysBarChartProps> = ({ data, totalValue }) => {
	const { t } = useTranslation();

	return (
		<ChartContainer>
			<VerticalBar />
			<HeaderRow>
				<StyledLabel>Shorts</StyledLabel>
				<StyledLabel>Longs</StyledLabel>
			</HeaderRow>
			{data
				? data.map(
						({
							name,

							value,
							totalSupply,

							isShort,
							inverseTotalSupply,
							shortSupply,
							shortValue,
						}) => {
							const synthName = `s${name}`;
							const inverseName = `i${name}`;
							return (
								<SynthContainer key={`synth-${name}`}>
									<SynthLabels>
										<SynthInfo>
											<FlexDivCol>
												<FlexDivRow>
													<SynthLabel>
														{inverseName === 'iBTC' || inverseName === 'iETH'
															? `${inverseName}, ${t('synth-bar-chart.shorts', {
																	asset: name,
															  })}, other collateral`
															: inverseName}
													</SynthLabel>
													{isShort ? (
														<InfoPopover
															noPaddingTop={true}
															infoData={
																<Trans
																	i18nKey="synth-bar-chart.info-data"
																	values={{
																		asset: inverseName.slice(1),
																	}}
																/>
															}
														/>
													) : null}
												</FlexDivRow>
												<LabelSmall>
													{inverseName === 'iBTC' || inverseName === 'iETH'
														? `${formatNumber(inverseTotalSupply)} ${inverseName} + ${formatNumber(
																shortSupply
														  )} ${t('synth-bar-chart.shorts', {
																asset: name,
														  })}/${formatCurrency(shortValue, 0)}`
														: `${formatNumber(inverseTotalSupply)} ${inverseName}/${formatCurrency(
																shortValue,
																0
														  )}`}
												</LabelSmall>
											</FlexDivCol>
										</SynthInfo>
										<SynthInfo>
											<FlexDivCol>
												<SynthLabel>{synthName}</SynthLabel>
												<LabelSmall>
													<span>{`${formatNumber(totalSupply)} ${synthName}/${formatCurrency(
														value,
														0
													)}`}</span>
												</LabelSmall>
											</FlexDivCol>
										</SynthInfo>
									</SynthLabels>
									<BarContainer>
										<ShortBar value={shortValue / totalValue}></ShortBar>
										<LongBar value={value / totalValue}></LongBar>
									</BarContainer>
								</SynthContainer>
							);
						}
				  )
				: null}
		</ChartContainer>
	);
};

const ChartContainer = styled.div`
	min-height: 250px;
	position: relative;
	background: ${(props) => props.theme.colors.mediumBlue};
`;

const VerticalBar = styled.div`
	position: absolute;
	top: 25px;
	bottom: 0;
	left: 50%;
	border: 1px solid ${colors.linedBlue};
`;

const HeaderRow = styled.div`
	width: 100%;
	display: flex;
	justify-content: space-between;
	margin: 13px 0;
`;

const SynthContainer = styled.div`
	height: 100px;
	display: flex;
	flex-direction: column;
	width: 100%;
	border-top: 1px solid ${colors.linedBlue};
	&:last-child {
		border-bottom: 1px solid ${colors.linedBlue};
	}
`;

export const SynthLabels = styled.div`
	display: flex;
	width: 100%;
	font-family: 'Inter', sans-serif;
`;

const BarContainer = styled.div`
	height: 60px;
	width: 100%;
	display: flex;
	justify-content: center;
	position: relative;
`;

const SynthInfo = styled.div`
	display: flex;
	padding: 13px 10px;
	width: 50%;
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
	height: 20px;
	transition: all 0.5s linear;
`;

const ShortBar = styled.div<{ value: number }>`
	${barStyle}
	border: ${(props) => `2px solid ${props.theme.colors.brightPink}`};
	box-shadow: 0px 0px 15px rgba(237, 30, 255, 0.28);
	background: ${(props) => props.theme.colors.mutedBrightPink};
	right: 50%;
	animation: ${(props) => slideToLeft(`calc((50%  - 45%  * ${props.value}))`)} 0.5s forwards linear;
`;

const LongBar = styled.div<{ value: number }>`
	${barStyle}
	border: ${(props) => `2px solid ${props.theme.colors.brightGreen}`};
	box-shadow: 0px 0px 15px rgba(77, 244, 184, 0.15);
	background: ${(props) => props.theme.colors.mutedBrightGreen};
	left: 50%;
	animation: ${(props) => slideToRight(`calc((50%  - 45%  * ${props.value}))`)} 0.5s forwards linear;
`;

export const LabelSmall = styled.span`
	font-size: 12px;
	color: ${(props) => props.theme.colors.white};
	line-height: 1.2;
	letter-spacing: 0.2px;
	padding-left: 5px;
`;

const StyledLabel = styled(LabelSmall)`
	text-transform: uppercase;
	text-align: center;
	flex: 1;
	font-family: ${(props) => `${props.theme.fonts.condensedBold}, ${props.theme.fonts.regular}`};
`;

const SynthLabel = styled(LabelSmall)`
	color: ${(props) => props.theme.colors.white};
`;

export default SidewaysBarChart;

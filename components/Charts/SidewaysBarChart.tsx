import { FC, useMemo } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import styled, { css, keyframes } from 'styled-components';

import { formatCurrency, formatNumber } from 'utils/formatter';
import { OpenInterest } from 'types/data';
import colors from 'styles/colors';
import { FlexDivCol, FlexDivRow } from 'components/common';

import InfoPopover from '../InfoPopover';
import _ from 'lodash';
interface SidewaysBarChartProps {
	data: OpenInterest;
}

const SidewaysBarChart: FC<SidewaysBarChartProps> = ({ data }) => {
	const { t } = useTranslation();

	const totalValue = useMemo(() => {
		return _.chain(data).values().map(_.values).flatten().map('value').max().value();
	}, [data]);

	return (
		<ChartContainer>
			<VerticalBar />
			<HeaderRow>
				<StyledLabel>Shorts</StyledLabel>
				<StyledLabel>Longs</StyledLabel>
			</HeaderRow>
			{data
				? Object.keys(data).map((key) => {
						const synthName = `s${key}`;
						const inverseName = `i${key}`;

						const synthValue = data[key][synthName].value;
						const inverseValue =
							(data[key] && data[key][inverseName] && data[key][inverseName].value) || 0;
						const synthTotalSupply = data[key][synthName].totalSupply;
						const inverseTotalSupply =
							(data[key] && data[key][inverseName] && data[key][inverseName].totalSupply) || 0;
						const isShort =
							(data[key] && data[key][inverseName] && data[key][inverseName].isShort) || false;
						const shortSupply =
							(data[key] && data[key][inverseName] && data[key][inverseName].shortSupply) || 0;

						return (
							<SynthContainer key={`synth-${key}`}>
								<SynthLabels>
									<SynthInfo>
										<FlexDivCol>
											<FlexDivRow>
												<SynthLabel>
													{inverseName === 'iBTC' || inverseName === 'iETH'
														? `${inverseName}, ${t('synth-bar-chart.shorts', {
																asset: key,
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
															asset: key,
													  })}/${formatCurrency(inverseValue, 0)}`
													: `${formatNumber(inverseTotalSupply)} ${inverseName}/${formatCurrency(
															inverseValue,
															0
													  )}`}
											</LabelSmall>
										</FlexDivCol>
									</SynthInfo>
									<SynthInfo>
										<FlexDivCol>
											<SynthLabel>{synthName}</SynthLabel>
											<LabelSmall>
												<span>{`${formatNumber(synthTotalSupply)} ${synthName}/${formatCurrency(
													synthValue,
													0
												)}`}</span>
											</LabelSmall>
										</FlexDivCol>
									</SynthInfo>
								</SynthLabels>
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

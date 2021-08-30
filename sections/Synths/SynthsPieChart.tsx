import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { SynthsTotalSupplyData, SynthTotalSupply } from '@synthetixio/queries';

import PieChart, {
	MIN_PERCENT_FOR_PIE_CHART,
	MUTED_COLORS,
	BRIGHT_COLORS,
} from 'components/Charts/PieChart';
import { ChartTitle, ChartSubtitle } from 'components/common';
import { formatCurrency, formatPercentage } from 'utils/formatter';

type SynthsPieChartProps = {
	synthsTotalSupply: SynthsTotalSupplyData;
};

const SynthsPieChart: FC<SynthsPieChartProps> = ({ synthsTotalSupply }) => {
	const { t } = useTranslation();

	const data = useMemo(() => {
		const supplyData = synthsTotalSupply?.supplyData;
		if (!supplyData) return;
		const sortedData = Object.values(supplyData).sort(synthDataSortFn);

		const cutoffIndex = sortedData.findIndex((synth) =>
			synth.poolProportion.lt(MIN_PERCENT_FOR_PIE_CHART)
		);

		const topNSynths = sortedData.slice(0, cutoffIndex);
		const remaining = sortedData.slice(cutoffIndex);

		if (remaining.length) {
			const remainingSupply = { ...remaining[0] };
			remainingSupply.name = 'Other';
			for (const data of remaining.slice(1)) {
				remainingSupply.value = remainingSupply.value.add(data.value);
			}
			remainingSupply.poolProportion = remainingSupply.value.div(
				synthsTotalSupply?.totalValue ?? 0
			);
			topNSynths.push(remainingSupply);
		}
		return topNSynths
			.sort((a, b) => (a.value.lt(b.value) ? 1 : -1))
			.map((supply, index) => ({
				...supply,
				value: supply.value.toNumber(),
				skewValue: supply.skewValue,
				fillColor: MUTED_COLORS[index % MUTED_COLORS.length],
				strokeColor: BRIGHT_COLORS[index % BRIGHT_COLORS.length],
			}));
	}, [synthsTotalSupply]);

	return !data ? null : (
		<SynthsPieChartContainer>
			<ChartTitle>{t('synth-pie-chart.title')}</ChartTitle>
			<ChartSubtitle>{t('synth-pie-chart.subtext')}</ChartSubtitle>
			<PieChart
				data={data}
				isShortLegend={true}
				tooltipFormatter={Tooltip}
				legendFormatter={Legend}
			/>
		</SynthsPieChartContainer>
	);
};

const Tooltip: FC<{ name: string; value: number; payload: { payload: SynthTotalSupply } }> = ({
	name,
	value,
	payload: { payload },
}) => {
	return (
		<StyledTooltip isNeg={payload.skewValue.toNumber() < 0}>
			{name}: {formatCurrency(payload.skewValue.toNumber())}
		</StyledTooltip>
	);
};

const Legend: FC<{ payload: { payload: SynthTotalSupply } }> = ({ payload: { payload } }) => {
	return (
		<span>
			{formatCurrency(payload.skewValue.toNumber(), 0)} ($
			{formatPercentage(payload.poolProportion.toNumber(), 0)})
		</span>
	);
};

function synthDataSortFn(a: SynthTotalSupply, b: SynthTotalSupply) {
	return a.value.lt(b.value) ? 1 : -1;
}

const SynthsPieChartContainer = styled.div`
	background: ${(props) => props.theme.colors.mediumBlue};
	width: 49%;
	height: 680px;
	@media only screen and (max-width: 854px) {
		width: 100%;
	}
`;

const StyledTooltip = styled.div<{ isNeg: boolean }>`
	color: ${(props) => (props.isNeg ? props.theme.colors.brightRed : props.theme.colors.white)};
`;

export default SynthsPieChart;

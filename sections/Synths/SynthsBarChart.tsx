import { FC } from 'react';
import orderBy from 'lodash/orderBy';
import _orderBy from 'lodash/orderBy';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { SynthsTotalSupplyData, SynthTotalSupply } from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';

import SidewaysBarChart, { OpenInterest } from 'components/Charts/SidewaysBarChart';
import { ChartTitle, ChartSubtitle } from 'components/common';
import { useNetwork } from 'contexts/Network';

type SynthsBarChartProps = {
	synthsTotalSupply: SynthsTotalSupplyData;
};

const SynthsBarChart: FC<SynthsBarChartProps> = ({ synthsTotalSupply }) => {
	const { t } = useTranslation();
	const { snxJs } = useNetwork();

	const { ethPrice, btcPrice } = synthsTotalSupply.priceData;
	const { ethNegativeEntries, btcNegativeEntries } = synthsTotalSupply.shortData;

	const openInterest = orderBy(
		Array.from(Object.values(synthsTotalSupply.supplyData)),
		'value',
		'desc'
	);

	const openInterestSynths: string[] = snxJs.synths
		.filter((synth) => ['crypto', 'index'].includes(synth.category))
		.map(({ name }) => name);

	const data = openInterest
		.filter((item) => openInterestSynths.includes(item.name))
		.reduce((acc: Record<string, OpenInterest>, curr: SynthTotalSupply): Record<
			string,
			OpenInterest
		> => {
			const isInverseSynth = 'i' === curr.name.slice(0, 1);
			const isBTCorETHInverseSynth = ~['iBTC', 'iETH'].indexOf(curr.name);
			if (!isInverseSynth || isBTCorETHInverseSynth) {
				const name = curr.name.slice(1);

				acc[name] = acc[name] || {
					name,
					value: 0,
					totalSupply: 0,
					isShort: false,
					inverseTotalSupply: 0,
					shortSupply: 0,
					shortValue: 0,
				};

				if (isBTCorETHInverseSynth) {
					let inverseTotalSupply = wei(curr.totalSupply.toString()) ?? wei(0),
						negativeEntries = wei(0),
						price = wei(0);

					if (curr.name === 'iBTC') {
						negativeEntries = wei(btcNegativeEntries.toString());
						price = wei(btcPrice.toString());
					}
					if (curr.name === 'iETH') {
						negativeEntries = wei(ethNegativeEntries.toString());
						price = wei(ethPrice.toString());
					}

					const shortSupply = negativeEntries.add(inverseTotalSupply);
					const shortValue = shortSupply.mul(price);

					acc[name] = {
						...acc[name],
						isShort: true,
						inverseTotalSupply: inverseTotalSupply.toNumber(),
						shortSupply: shortSupply.toNumber(),
						shortValue: shortValue.toNumber(),
					};
				} else {
					acc[name] = {
						...acc[name],
						value: curr.value.toNumber(),
						totalSupply: curr.totalSupply.toNumber() ?? 0,
					};
				}
			}
			return acc;
		}, {} as Record<string, OpenInterest>);

	const sortedData = _orderBy(Array.from(Object.values(data)), 'value', 'desc');

	return (
		<SynthsBarChartContainer>
			<ChartTitle>{t('synth-bar-chart.title')}</ChartTitle>
			<ChartSubtitle>{t('synth-bar-chart.subtext')}</ChartSubtitle>
			<SidewaysBarChart data={sortedData} totalValue={synthsTotalSupply.totalValue.toNumber()} />
		</SynthsBarChartContainer>
	);
};
const SynthsBarChartContainer = styled.div`
	background: ${(props) => props.theme.colors.mediumBlue};
	width: 49%;
	height: 680px;
	overflow-y: scroll;
	@media only screen and (max-width: 854px) {
		width: 100%;
	}
`;

export default SynthsBarChart;

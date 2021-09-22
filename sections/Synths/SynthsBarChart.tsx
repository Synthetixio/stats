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

	let totalSkewValue = wei(0);

	const data = openInterest
		.filter((item) => openInterestSynths.includes(item.name))
		.reduce((acc: Record<string, OpenInterest>, curr: SynthTotalSupply): Record<
			string,
			OpenInterest
		> => {
			const name = curr.name.slice(1);

			acc[name] = acc[name] || {
				name,
				value: curr.value.toNumber(),
				totalSupply: curr.totalSupply.toNumber() ?? 0,
				isShort: false,
				shortSupply: 0,
				shortValue: 0,
			};

			totalSkewValue = totalSkewValue.add(curr.value);

			if (~['BTC', 'ETH'].indexOf(name)) {
				let negativeEntries = wei(0),
					price = wei(0);

				if (name === 'BTC') {
					negativeEntries = wei(btcNegativeEntries.toString());
					price = wei(btcPrice.toString());
				}
				if (name === 'ETH') {
					negativeEntries = wei(ethNegativeEntries.toString());
					price = wei(ethPrice.toString());
				}

				const shortSupply = negativeEntries;
				const shortValue = shortSupply.mul(price);

				totalSkewValue = totalSkewValue.add(shortValue);

				acc[name] = {
					...acc[name],
					isShort: true,
					shortSupply: shortSupply.toNumber(),
					shortValue: shortValue.toNumber(),
				};
			}
			return acc;
		}, {} as Record<string, OpenInterest>);

	const sortedData = _orderBy(Array.from(Object.values(data)), 'value', 'desc');

	return (
		<SynthsBarChartContainer>
			<ChartTitle>{t('synth-bar-chart.title')}</ChartTitle>
			<ChartSubtitle>{t('synth-bar-chart.subtext')}</ChartSubtitle>
			<SidewaysBarChart data={sortedData} totalValue={totalSkewValue.toNumber()} />
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

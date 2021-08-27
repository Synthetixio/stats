import { FC } from 'react';
import findIndex from 'lodash/findIndex';
import { format } from 'date-fns';
import { useTranslation, Trans } from 'react-i18next';
import useSynthetixQueries from '@synthetixio/queries';
import { OptionsMarket } from '@synthetixio/data';

import SectionHeader from 'components/SectionHeader';
import StatsBox from 'components/StatsBox';
import StatsRow from 'components/StatsRow';
import { COLORS } from 'constants/styles';
import { formatCurrency } from 'utils/formatter';
import { LinkText } from 'components/common';
import { synthetixOptionsSubgraph } from 'constants/links';

import OptionsPieChart, { SynthTotalSupply } from './OptionsPieChart';

const MIN_PERCENT_FOR_PIE_CHART = 0.03;

const Options: FC = () => {
	const { t } = useTranslation();

	const { useOptionsMarketsQuery, useOptionsTransactionsQuery } = useSynthetixQueries();
	const sortedMarkets = useOptionsMarketsQuery({ max: 5000 });
	const optionsTransactions = useOptionsTransactionsQuery({ max: 5000 });

	const now = new Date();

	let largestMarket: OptionsMarket | null = null;
	let largestActiveMarket: OptionsMarket | null = null;

	let totalPoolSizes: number | null = null;
	let numMarkets: number | null = null;
	let pieChartData: SynthTotalSupply[] = [];

	if (sortedMarkets.isSuccess) {
		largestMarket = sortedMarkets.data![0];

		const activeMarkets = sortedMarkets.data!.filter((market: OptionsMarket, index: number) => {
			const expiryDate = new Date(market.expiryDate);
			return expiryDate > now;
		});

		largestActiveMarket = activeMarkets[0];

		const marketsData = activeMarkets.reduce(
			([count, sum]: number[], activeMarket: OptionsMarket, index: number) => {
				count++;
				sum += parseFloat(activeMarket.poolSize);
				return [count, sum];
			},
			[0, 0]
		);

		[numMarkets, totalPoolSizes] = marketsData;

		pieChartData = sortedMarkets.data!.reduce(
			(acc: { name: string; value: number }[], curr: OptionsMarket) => {
				if (Number(curr.poolSize) / totalPoolSizes! < MIN_PERCENT_FOR_PIE_CHART) {
					const othersIndex = findIndex(acc, (o) => o.name === 'others');
					if (othersIndex === -1) {
						acc.push({ name: 'others', value: Number(curr?.poolSize ?? '0') });
					} else {
						acc[othersIndex].value = acc[othersIndex].value + Number(curr.poolSize);
					}
				} else {
					acc.push({
						name: `${curr.currencyKey} > ${formatCurrency(curr.strikePrice)} @${format(
							new Date(curr.maturityDate),
							'MM/dd/yyyy'
						)}`,
						value: Number(curr.poolSize),
					});
				}
				return acc;
			},
			[]
		);
	}

	const yesterday = new Date();
	yesterday.setDate(yesterday.getDate() - 1);

	const num24HRTx = optionsTransactions.isSuccess
		? (optionsTransactions.data?.length as number)
		: 0;

	return (
		<>
			<SectionHeader title={t('section-header.options')} />
			<StatsRow>
				<StatsBox
					key="LGSTACTVBINMKT"
					title={t('largest-active-binary-market.title')}
					num={Number(largestActiveMarket ? largestActiveMarket.poolSize : 0)}
					queries={[sortedMarkets]}
					percentChange={null}
					subText={t('largest-active-binary-market.subtext', {
						synth: largestActiveMarket?.currencyKey ?? '...',
						price: formatCurrency(largestActiveMarket?.strikePrice ?? 0),
						date: largestActiveMarket?.maturityDate
							? format(new Date(largestActiveMarket?.maturityDate), 'MM/dd/yyyy')
							: '...',
					})}
					color={COLORS.green}
					numberStyle="currency0"
					numBoxes={2}
					infoData={
						<Trans
							i18nKey="largest-active-binary-market.infoData"
							components={{
								linkText: <LinkText href={synthetixOptionsSubgraph} />,
							}}
						/>
					}
				/>
				<StatsBox
					key="LGSTBINMKTTODATE"
					title={t('largest-binary-market-to-date.title')}
					num={Number(largestMarket?.poolSize ?? 0)}
					queries={[sortedMarkets]}
					percentChange={null}
					subText={t('largest-binary-market-to-date.subtext', {
						synth: largestMarket?.currencyKey ?? '...',
						price: formatCurrency(largestMarket?.strikePrice ?? 0),
						date: largestMarket?.maturityDate
							? format(new Date(largestMarket?.maturityDate), 'MM/dd/yyyy')
							: '...',
					})}
					color={COLORS.pink}
					numberStyle="currency0"
					numBoxes={2}
					infoData={
						<Trans
							i18nKey="largest-binary-market-to-date.infoData"
							components={{
								linkText: <LinkText href={synthetixOptionsSubgraph} />,
							}}
						/>
					}
				/>
			</StatsRow>
			<StatsRow>
				<StatsBox
					key="NUMBNRYMRKTS"
					title={t('number-of-active-binary-options-markets.title')}
					num={numMarkets}
					queries={[sortedMarkets]}
					percentChange={null}
					subText={t('number-of-active-binary-options-markets.subtext')}
					color={COLORS.green}
					numberStyle="number"
					numBoxes={3}
					infoData={
						<Trans
							i18nKey="number-of-active-binary-options-markets.infoData"
							components={{
								linkText: <LinkText href={synthetixOptionsSubgraph} />,
							}}
						/>
					}
				/>
				<StatsBox
					key="TTLAMOUNTPOOLEDBINOPT"
					title={t('total-pooled-in-binary-options.title')}
					num={totalPoolSizes}
					queries={[sortedMarkets]}
					percentChange={null}
					subText={t('total-pooled-in-binary-options.subtext')}
					color={COLORS.pink}
					numberStyle="currency0"
					numBoxes={3}
					infoData={
						<Trans
							i18nKey="total-pooled-in-binary-options.infoData"
							components={{
								linkText: <LinkText href={synthetixOptionsSubgraph} />,
							}}
						/>
					}
				/>
				<StatsBox
					key="TRADESBINOPTION"
					title={t('trades-in-binary-options-24-hrs.title')}
					num={num24HRTx}
					queries={[optionsTransactions]}
					percentChange={null}
					subText={t('trades-in-binary-options-24-hrs.subtext')}
					color={COLORS.pink}
					numberStyle="number"
					numBoxes={3}
					infoData={
						<Trans
							i18nKey="trades-in-binary-options-24-hrs.infoData"
							components={{
								linkText: <LinkText href={synthetixOptionsSubgraph} />,
							}}
						/>
					}
				/>
			</StatsRow>
			<OptionsPieChart data={pieChartData} />
		</>
	);
};

export default Options;

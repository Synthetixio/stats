import React, { FC, useState, useContext } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { ChartPeriod } from 'types/data';
import StatsBox from 'components/StatsBox';
import StatsRow from 'components/StatsRow';
import AreaChart from 'components/Charts/AreaChart';
import SectionHeader from 'components/SectionHeader';
import { COLORS } from 'constants/styles';
import { Currency } from 'constants/currency';
import {
	synthetixSubgraph,
	synthetixRatesSubgraph,
	synthetixJSGithub,
	curveDocumentation,
	synthetixDataGithub,
} from 'constants/links';
import SUSDDistribution from '../Network/SUSDDistribution';
import { SNXJSContext } from 'pages/_app';
import { LinkText, NewParagraph } from 'components/common';
import {
	useMarketCap,
	useNetworkCRatio,
	useSynthSUSDTotalSupply,
	useTotalIssuedSynths,
	useTotalSNXLocked,
	useRateForCurrency,
} from 'queries/snxjs';
import { useCMCPrice } from 'queries/cmc';
import { useSNXNetworkMeta, useSNXTotal, useSynthHolders, useSNXPriceChart } from 'queries/snxData';
import { useEtherLocked } from 'queries/wallet';
import { useSUSDPrice } from 'queries/curve';
import { getSUSDHoldersName } from 'utils/dataMapping';

const NetworkSection: FC = () => {
	const { t } = useTranslation();
	const [priceChartPeriod, setPriceChartPeriod] = useState<ChartPeriod>('D');
	const snxjs = useContext(SNXJSContext);

	// TODO use variable for SNX
	const { data: snxMarketCap, isError: isMarketCapError, refetch: refetchMarketCap } = useMarketCap(
		Currency.SNX
	);
	const { sUSDPrice, isError: isSUSDPriceError, refetch: refetchSUSDPrice } = useSUSDPrice();

	const {
		data: snx24HVolumeData,
		isError: isSNXVolumeError,
		refetch: refetchSNXVolume,
	} = useCMCPrice(Currency.SNX);
	const snx24HVolume = snx24HVolumeData?.data[Currency.SNX]?.quote?.USD?.volume_24h ?? null;

	const {
		data: totalSNXLocked,
		isError: isTotalSNXLockedError,
		refetch: refetchTotalSNXLocked,
	} = useTotalSNXLocked();

	const {
		data: networkCRatio,
		isError: isNetworkCRatioError,
		refetch: refetchNetworkCRatio,
	} = useNetworkCRatio();

	const {
		data: networkMeta,
		isError: isNetworkMetaError,
		refetch: refetchNetworkMeta,
	} = useSNXNetworkMeta();

	const {
		data: etherLocked,
		isError: isEtherLockedError,
		refetch: refetchEtherLocked,
	} = useEtherLocked();

	const {
		data: sUSDFromEther,
		isError: isSUSDFromEtherError,
		refetch: refetchSUSDFromEther,
	} = useTotalIssuedSynths();

	const {
		data: chartData,
		isError: isChartDataError,
		refetch: refetchChartData,
	} = useSNXPriceChart(priceChartPeriod);

	const { data: snxPrice, isError: snxPriceError, refetch: refetchSnxPrice } = useRateForCurrency(
		Currency.SNX
	);

	const priorSNXPrice = chartData != null && chartData.length > 0 ? chartData[0].value : 0;
	const percentChange = snxPrice != null ? snxPrice / priorSNXPrice - 1 : 0;

	const topSUSDHoldersQuery = useSynthHolders(Currency.sUSD);
	const synthSUSDTotalSupplyQuery = useSynthSUSDTotalSupply();

	const { data: snxTotals, isError: isSNXTotalError, refetch: refetchSNXTotal } = useSNXTotal();

	let activeCRatio = null;
	console.log('networkMeta', networkMeta);
	if (networkMeta) {
		console.log('defined the meta and...');
		activeCRatio = 1 / (networkMeta.stakersTotalDebt / networkMeta.stakersTotalCollateral);
		console.log('activeCRatio', activeCRatio);
	}
	let snxHolders = null;
	if (snxTotals) {
		snxHolders = snxTotals.snxHolders;
	}

	return (
		<>
			<SectionHeader title={t('homepage.section-header.network')} first={true} />
			<AreaChart
				periods={['D', 'W', 'M', 'Y'] as ChartPeriod[]}
				activePeriod={priceChartPeriod}
				onPeriodSelect={(period: ChartPeriod) => setPriceChartPeriod(period)}
				data={chartData ?? []}
				title={t('homepage.snx-price.title')}
				num={snxPrice}
				numFormat="currency2"
				percentChange={percentChange}
				timeSeries={priceChartPeriod === 'D' ? '15m' : '1d'}
				infoData={
					<Trans
						i18nKey="homepage.snx-price.infoData"
						values={{
							sjsLinkText: t('homepage.snx-price.sjsLinkText'),
							viewPlaygroundLinkText: t('homepage.snx-price.viewPlaygroundLinkText'),
						}}
						components={{
							sjslink: <LinkText href={synthetixJSGithub} />,
							viewPlaygroundLink: <LinkText href={synthetixRatesSubgraph} />,
							newParagraph: <NewParagraph />,
						}}
					/>
				}
				isFailedChartLoad={isChartDataError}
				isFailedHeaderLoad={snxPriceError}
				onRefetchChart={refetchChartData}
				onRefetchHeader={refetchSnxPrice}
			/>
			<StatsRow>
				<StatsBox
					key="SNXMKTCAP"
					title={t('homepage.snx-market-cap.title')}
					num={snxMarketCap}
					percentChange={null}
					subText={t('homepage.snx-market-cap.subtext')}
					color={COLORS.pink}
					numberStyle="currency0"
					numBoxes={3}
					infoData={
						<Trans
							i18nKey="homepage.snx-market-cap.infoData"
							values={{
								sjsLinkText: t('homepage.snx-market-cap.sjsLinkText'),
							}}
							components={{
								linkText: <LinkText href={synthetixJSGithub} />,
							}}
						/>
					}
					isFailedLoad={isMarketCapError}
					onRefetch={refetchMarketCap}
				/>
				<StatsBox
					key="SUSDPRICE"
					title={t('homepage.susd-price.title')}
					num={sUSDPrice}
					percentChange={null}
					subText={t('homepage.susd-price.subtext')}
					color={COLORS.green}
					numberStyle="currency2"
					numBoxes={3}
					infoData={
						<Trans
							i18nKey="homepage.susd-price.infoData"
							values={{
								curveDocLinkText: t('homepage.susd-price.curveDocLinkText'),
							}}
							components={{
								linkText: <LinkText href={curveDocumentation} />,
							}}
						/>
					}
					isFailedLoad={isSUSDPriceError}
					onRefetch={refetchSUSDPrice}
				/>
				<StatsBox
					key="SNXVOLUME"
					title={t('homepage.snx-volume.title')}
					num={snx24HVolume}
					percentChange={null}
					subText={t('homepage.snx-volume.subtext')}
					color={COLORS.green}
					numberStyle="currency0"
					numBoxes={3}
					infoData={null}
					isFailedLoad={isSNXVolumeError}
					onRefetch={refetchSNXVolume}
				/>
			</StatsRow>
			<StatsRow>
				<StatsBox
					key="TOTALSNXLOCKED"
					title={t('homepage.total-snx-locked.title')}
					num={totalSNXLocked}
					percentChange={null}
					subText={t('homepage.total-snx-locked.subtext')}
					color={COLORS.pink}
					numberStyle="currency0"
					numBoxes={4}
					infoData={
						<Trans
							i18nKey="homepage.total-snx-locked.infoData"
							values={{
								sDataLinkText: t('homepage.total-snx-locked.sDataLinkText'),
								sjsLinkText: t('homepage.total-snx-locked.sjsLinkText'),
							}}
							components={{
								sDataLink: <LinkText href={synthetixDataGithub} />,
								sjsLink: <LinkText href={synthetixJSGithub} />,
								newParagraph: <NewParagraph />,
							}}
						/>
					}
					isFailedLoad={isTotalSNXLockedError}
					onRefetch={refetchTotalSNXLocked}
				/>
				<StatsBox
					key="NETWORKCRATIO"
					title={t('homepage.network-cratio.title')}
					num={networkCRatio}
					percentChange={null}
					subText={t('homepage.network-cratio.subtext')}
					color={COLORS.green}
					numberStyle="percent0"
					numBoxes={4}
					infoData={
						<Trans
							i18nKey="homepage.network-cratio.infoData"
							values={{
								sjsLinkText: t('homepage.network-cratio.sjsLinkText'),
							}}
							components={{
								sjsLink: <LinkText href={synthetixJSGithub} />,
							}}
						/>
					}
					isFailedLoad={isNetworkCRatioError}
					onRefetch={refetchNetworkCRatio}
				/>
				<StatsBox
					key="ACTIVECRATIO"
					title={t('homepage.active-cratio.title')}
					num={activeCRatio}
					percentChange={null}
					subText={t('homepage.active-cratio.subtext')}
					color={COLORS.green}
					numberStyle="percent0"
					numBoxes={4}
					infoData={
						<Trans
							i18nKey="homepage.active-cratio.infoData"
							values={{
								sDataLinkText: t('homepage.active-cratio.sDataLinkText'),
							}}
							components={{
								sjsLink: <LinkText href={synthetixDataGithub} />,
								newParagraph: <NewParagraph />,
							}}
						/>
					}
					isFailedLoad={isNetworkMetaError}
					onRefetch={refetchNetworkMeta}
				/>
				<StatsBox
					key="SNXHOLDRS"
					title={t('homepage.snx-holders.title')}
					num={snxHolders}
					percentChange={null}
					subText={t('homepage.snx-holders.subtext')}
					color={COLORS.green}
					numberStyle="number"
					numBoxes={4}
					infoData={
						<Trans
							i18nKey="homepage.snx-holders.infoData"
							values={{
								subgraphLinkText: t('homepage.snx-holders.subgraphLinkText'),
							}}
							components={{
								linkText: <LinkText href={synthetixSubgraph} />,
							}}
						/>
					}
					isFailedLoad={isSNXTotalError}
					onRefetch={refetchSNXTotal}
				/>
			</StatsRow>
			<SUSDDistribution
				data={
					topSUSDHoldersQuery.data
						? topSUSDHoldersQuery.data.map(
								({ balanceOf, address }: { balanceOf: number; address: string }) => ({
									name: getSUSDHoldersName(address),
									value: balanceOf,
								})
						  )
						: []
				}
				totalSupplySUSD={synthSUSDTotalSupply?.data ?? 0}
			/>
			<StatsRow>
				<StatsBox
					key="ETHLOCKED"
					title={t('homepage.eth-collateral.title')}
					num={etherLocked}
					percentChange={null}
					subText={t('homepage.eth-collateral.subtext')}
					color={COLORS.pink}
					numberStyle="number4"
					numBoxes={2}
					infoData={null}
					isFailedLoad={isEtherLockedError}
					onRefetch={refetchEtherLocked}
				/>
				<StatsBox
					key="SUSDMINTEDETH"
					title={t('homepage.susd-minted-from-eth.title')}
					num={sUSDFromEther}
					percentChange={null}
					subText={t('homepage.susd-minted-from-eth.subtext')}
					color={COLORS.green}
					numberStyle="currency0"
					numBoxes={2}
					infoData={null}
					isFailedLoad={isSUSDFromEtherError}
					onRefetch={refetchSUSDFromEther}
				/>
			</StatsRow>
		</>
	);
};

export default NetworkSection;

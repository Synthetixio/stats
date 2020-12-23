import { FC, useEffect, useState, useContext } from 'react';
import axios from 'axios';
import snxData from 'synthetix-data';
import { ethers } from 'ethers';
import { Trans, useTranslation } from 'react-i18next';

import { AreaChartData, ChartPeriod, SNXPriceData, TimeSeries, TreeMapData } from 'types/data';
import StatsBox from 'components/StatsBox';
import StatsRow from 'components/StatsRow';
import AreaChart from 'components/Charts/AreaChart';
import SectionHeader from 'components/SectionHeader';
import { COLORS } from 'constants/styles';
import {
	synthetixSubgraph,
	synthetixRatesSubgraph,
	synthetixJSGithub,
	curveDocumentation,
	synthetixDataGithub,
} from 'constants/links';
import SUSDDistribution from '../Network/SUSDDistribution';
import { SNXJSContext, SUSDContext, SNXContext, ProviderContext } from 'pages/_app';
import { formatIdToIsoString } from 'utils/formatter';
import { getSUSDHoldersName } from 'utils/dataMapping';
import { LinkText, NewParagraph } from 'components/common';
import { curveSusdPool, renBTC } from 'contracts';

const CMC_API = 'https://coinmarketcap-api.synthetix.io/public/prices?symbols=SNX';

const NetworkSection: FC = () => {
	const { t } = useTranslation();
	const [etherLocked, setEtherLocked] = useState<number | null>(null);
	const [bitcoinLocked, setBitcoinLocked] = useState<number | null>(null);
	const [priorSNXPrice, setPriorSNXPrice] = useState<number | null>(null);
	const [priceChartPeriod, setPriceChartPeriod] = useState<ChartPeriod>('D');
	const [SNXChartPriceData, setSNXChartPriceData] = useState<AreaChartData[]>([]);
	const [SNXTotalSupply, setSNXTotalSupply] = useState<number | null>(null);
	const [totalSupplySUSD, setTotalSupplySUSD] = useState<number | null>(null);
	const [SNX24HVolume, setSNX24HVolume] = useState<number | null>(null);
	const [activeCRatio, setActiveCRatio] = useState<number | null>(null);
	const [networkCRatio, setNetworkCRatio] = useState<number | null>(null);
	const [SNXPercentLocked, setSNXPercentLocked] = useState<number | null>(null);
	const [SNXHolders, setSNXHolders] = useState<number | null>(null);
	const [SUSDHolders, setSUSDHolders] = useState<TreeMapData[]>([]);
	const snxjs = useContext(SNXJSContext);
	const { sUSDPrice, setsUSDPrice } = useContext(SUSDContext);
	const { SNXPrice, setSNXPrice, setSNXStaked, setIssuanceRatio, issuanceRatio } = useContext(
		SNXContext
	);
	const provider = useContext(ProviderContext);

	// NOTE: use interval? or save data calls?
	useEffect(() => {
		const fetchData = async () => {
			const { formatEther, formatUnits, parseUnits } = snxjs.utils;

			const curveContract = new ethers.Contract(
				curveSusdPool.address,
				// @ts-ignore
				curveSusdPool.abi,
				provider
			);

			const renBTCContract = new ethers.Contract(
				renBTC.address,
				// @ts-ignore
				renBTC.abi,
				provider
			);

			const usdcContractNumber = 1;
			const susdContractNumber = 3;
			const susdAmount = 10000;
			const susdAmountWei = parseUnits(susdAmount.toString(), 18);

			const [
				unformattedSnxPrice,
				unformattedSnxTotalSupply,
				unformattedExchangeAmount,
				cmcSNXData,
				unformattedLastDebtLedgerEntry,
				unformattedTotalIssuedSynths,
				unformattedIssuanceRatio,
				holders,
				snxTotals,
				unformattedSUSDTotalSupply,
				topSUSDHolders,
				ethSusdCollateralBalance,
				ethCollateralBalance,
				multiCollateralEtherBalance,
				multiCollateralRenBtcBalance,
			] = await Promise.all([
				snxjs.contracts.ExchangeRates.rateForCurrency(snxjs.toBytes32('SNX')),
				snxjs.contracts.Synthetix.totalSupply(),
				curveContract.get_dy_underlying(susdContractNumber, usdcContractNumber, susdAmountWei),
				axios.get(CMC_API),
				snxjs.contracts.SynthetixState.lastDebtLedgerEntry(),
				snxjs.contracts.Synthetix.totalIssuedSynthsExcludeEtherCollateral(snxjs.toBytes32('sUSD')),
				snxjs.contracts.SystemSettings.issuanceRatio(),
				snxData.snx.holders({ max: 1000 }),
				snxData.snx.total(),
				snxjs.contracts.SynthsUSD.totalSupply(),
				snxData.synths.holders({ max: 5, synth: 'sUSD' }),
				provider.getBalance(snxjs.contracts.EtherCollateralsUSD.address),
				provider.getBalance(snxjs.contracts.EtherCollateral.address),
				provider.getBalance(snxjs.contracts.CollateralEth.address),
				renBTCContract.balanceOf(snxjs.contracts.CollateralErc20.address),
			]);

			setEtherLocked(
				Number(formatEther(ethCollateralBalance)) +
					Number(formatEther(ethSusdCollateralBalance)) +
					Number(formatEther(multiCollateralEtherBalance))
			);
			setBitcoinLocked(Number(formatEther(multiCollateralRenBtcBalance)));
			setSNXHolders(snxTotals.snxHolders);
			const formattedSNXPrice = Number(formatEther(unformattedSnxPrice));
			setSNXPrice(formattedSNXPrice);
			const totalSupply = Number(formatEther(unformattedSnxTotalSupply));
			setSNXTotalSupply(totalSupply);
			const exchangeAmount = Number(formatUnits(unformattedExchangeAmount, 6));
			setsUSDPrice(exchangeAmount / susdAmount);

			const dailyVolume = cmcSNXData?.data?.data?.SNX?.quote?.USD?.volume_24h;
			if (dailyVolume) {
				setSNX24HVolume(dailyVolume);
			}

			const lastDebtLedgerEntry = Number(formatUnits(unformattedLastDebtLedgerEntry, 27));

			const [totalIssuedSynths, tempIssuanceRatio, usdToSnxPrice, sUSDTotalSupply] = [
				unformattedTotalIssuedSynths,
				unformattedIssuanceRatio,
				unformattedSnxPrice,
				unformattedSUSDTotalSupply,
			].map((val) => Number(formatEther(val)));

			let snxTotal = 0;
			let snxLocked = 0;
			let stakersTotalDebt = 0;
			let stakersTotalCollateral = 0;

			for (const { collateral, debtEntryAtIndex, initialDebtOwnership } of holders) {
				let debtBalance =
					((totalIssuedSynths * lastDebtLedgerEntry) / debtEntryAtIndex) * initialDebtOwnership;
				let collateralRatio = debtBalance / collateral / usdToSnxPrice;

				if (isNaN(debtBalance)) {
					debtBalance = 0;
					collateralRatio = 0;
				}
				const lockedSnx = collateral * Math.min(1, collateralRatio / tempIssuanceRatio);

				if (Number(debtBalance) > 0) {
					stakersTotalDebt += Number(debtBalance);
					stakersTotalCollateral += Number(collateral * usdToSnxPrice);
				}
				snxTotal += Number(collateral);
				snxLocked += Number(lockedSnx);
			}

			const topHolders = topSUSDHolders.map(
				({ balanceOf, address }: { balanceOf: number; address: string }) => ({
					name: getSUSDHoldersName(address),
					value: balanceOf,
				})
			);
			setSUSDHolders(topHolders);
			const percentLocked = snxLocked / snxTotal;
			setSNXPercentLocked(percentLocked);
			setSNXStaked(totalSupply * percentLocked);
			setIssuanceRatio(tempIssuanceRatio);
			setTotalSupplySUSD(sUSDTotalSupply);
			setActiveCRatio(1 / (stakersTotalDebt / stakersTotalCollateral));
			setNetworkCRatio((totalSupply * formattedSNXPrice) / totalIssuedSynths);
		};
		fetchData();
	}, []);

	const formatChartData = (data: SNXPriceData[], timeSeries: TimeSeries): AreaChartData[] =>
		(data as SNXPriceData[]).map(({ id, averagePrice }) => {
			return {
				created: formatIdToIsoString(id, timeSeries as TimeSeries),
				value: averagePrice,
			};
		});

	const fetchNewChartData = async (fetchPeriod: ChartPeriod) => {
		let newSNXPriceData = [];
		let timeSeries = '1d';
		if (fetchPeriod === 'D') {
			timeSeries = '15m';
			newSNXPriceData = await snxData.rate.snxAggregate({ timeSeries, max: 24 * 4 });
		} else if (fetchPeriod === 'W') {
			timeSeries = '15m';
			newSNXPriceData = await snxData.rate.snxAggregate({ timeSeries, max: 24 * 4 * 7 });
		} else if (fetchPeriod === 'M') {
			newSNXPriceData = await snxData.rate.snxAggregate({ timeSeries, max: 30 });
		} else if (fetchPeriod === 'Y') {
			newSNXPriceData = await snxData.rate.snxAggregate({ timeSeries, max: 365 });
		}
		newSNXPriceData = newSNXPriceData.reverse();
		setPriorSNXPrice(newSNXPriceData[0].averagePrice);
		setSNXChartPriceData(formatChartData(newSNXPriceData, timeSeries as TimeSeries));
	};

	useEffect(() => {
		fetchNewChartData(priceChartPeriod);
	}, [priceChartPeriod]);

	const pricePeriods: ChartPeriod[] = ['D', 'W', 'M', 'Y'];
	return (
		<>
			<SectionHeader title={t('section-header.network')} first={true} />
			<AreaChart
				periods={pricePeriods}
				activePeriod={priceChartPeriod}
				onPeriodSelect={(period: ChartPeriod) => {
					setSNXChartPriceData([]); // will force loading state
					setPriceChartPeriod(period);
					fetchNewChartData(period);
				}}
				data={SNXChartPriceData}
				title={t('snx-price.title')}
				num={SNXPrice}
				numFormat="currency2"
				percentChange={
					SNXPrice != null && priorSNXPrice != null ? (SNXPrice ?? 0) / priorSNXPrice - 1 : null
				}
				timeSeries={priceChartPeriod === 'D' ? '15m' : '1d'}
				infoData={
					<Trans
						i18nKey="snx-price.infoData"
						values={{
							sjsLinkText: t('snx-price.sjsLinkText'),
							viewPlaygroundLinkText: t('snx-price.viewPlaygroundLinkText'),
						}}
						components={{
							sjslink: <LinkText href={synthetixJSGithub} />,
							viewPlaygroundLink: <LinkText href={synthetixRatesSubgraph} />,
							newParagraph: <NewParagraph />,
						}}
					/>
				}
			/>
			<StatsRow>
				<StatsBox
					key="SNXMKTCAP"
					title={t('snx-market-cap.title')}
					num={SNXPrice != null && SNXTotalSupply != null ? SNXTotalSupply * (SNXPrice ?? 0) : null}
					percentChange={null}
					subText={t('snx-market-cap.subtext')}
					color={COLORS.pink}
					numberStyle="currency0"
					numBoxes={4}
					infoData={
						<Trans
							i18nKey="snx-market-cap.infoData"
							values={{
								sjsLinkText: t('snx-market-cap.sjsLinkText'),
							}}
							components={{
								linkText: <LinkText href={synthetixJSGithub} />,
							}}
						/>
					}
				/>
				<StatsBox
					key="SUSDPRICE"
					title={t('susd-price.title')}
					num={sUSDPrice}
					percentChange={null}
					subText={t('susd-price.subtext')}
					color={COLORS.green}
					numberStyle="currency2"
					numBoxes={4}
					infoData={
						<Trans
							i18nKey="susd-price.infoData"
							values={{
								curveDocLinkText: t('susd-price.curveDocLinkText'),
							}}
							components={{
								linkText: <LinkText href={curveDocumentation} />,
							}}
						/>
					}
				/>
				<StatsBox
					key="SNXVOLUME"
					title={t('snx-volume.title')}
					num={SNX24HVolume}
					percentChange={null}
					subText={t('snx-volume.subtext')}
					color={COLORS.green}
					numberStyle="currency0"
					numBoxes={4}
					infoData={null}
				/>
				<StatsBox
					key="ISSUANCECRATIO"
					title={t('issuance-ratio.title')}
					num={issuanceRatio != null ? 1 / (issuanceRatio ?? 0) : null}
					percentChange={null}
					subText={t('issuance-ratio.subtext')}
					color={COLORS.green}
					numberStyle="percent0"
					numBoxes={4}
					infoData={<>{t('issuance-ratio.infoData')}</>}
				/>
			</StatsRow>
			<StatsRow>
				<StatsBox
					key="TOTALSNXLOCKED"
					title={t('total-snx-locked.title')}
					num={
						SNXPercentLocked != null && SNXTotalSupply != null && SNXPrice != null
							? SNXPercentLocked * SNXTotalSupply * (SNXPrice ?? 0)
							: null
					}
					percentChange={null}
					subText={t('total-snx-locked.subtext')}
					color={COLORS.pink}
					numberStyle="currency0"
					numBoxes={4}
					infoData={
						<Trans
							i18nKey="total-snx-locked.infoData"
							values={{
								sDataLinkText: t('total-snx-locked.sDataLinkText'),
								sjsLinkText: t('total-snx-locked.sjsLinkText'),
							}}
							components={{
								sDataLink: <LinkText href={synthetixDataGithub} />,
								sjsLink: <LinkText href={synthetixJSGithub} />,
								newParagraph: <NewParagraph />,
							}}
						/>
					}
				/>
				<StatsBox
					key="NETWORKCRATIO"
					title={t('network-cratio.title')}
					num={networkCRatio}
					percentChange={null}
					subText={t('network-cratio.subtext')}
					color={COLORS.green}
					numberStyle="percent0"
					numBoxes={4}
					infoData={
						<Trans
							i18nKey="network-cratio.infoData"
							values={{
								sjsLinkText: t('network-cratio.sjsLinkText'),
							}}
							components={{
								sjsLink: <LinkText href={synthetixJSGithub} />,
							}}
						/>
					}
				/>
				<StatsBox
					key="ACTIVECRATIO"
					title={t('active-cratio.title')}
					num={activeCRatio}
					percentChange={null}
					subText={t('active-cratio.subtext')}
					color={COLORS.green}
					numberStyle="percent0"
					numBoxes={4}
					infoData={
						<Trans
							i18nKey="active-cratio.infoData"
							values={{
								sDataLinkText: t('active-cratio.sDataLinkText'),
							}}
							components={{
								sjsLink: <LinkText href={synthetixDataGithub} />,
								newParagraph: <NewParagraph />,
							}}
						/>
					}
				/>
				<StatsBox
					key="SNXHOLDRS"
					title={t('snx-holders.title')}
					num={SNXHolders}
					percentChange={null}
					subText={t('snx-holders.subtext')}
					color={COLORS.green}
					numberStyle="number"
					numBoxes={4}
					infoData={
						<Trans
							i18nKey="snx-holders.infoData"
							values={{
								subgraphLinkText: t('snx-holders.subgraphLinkText'),
							}}
							components={{
								linkText: <LinkText href={synthetixSubgraph} />,
							}}
						/>
					}
				/>
			</StatsRow>
			<SUSDDistribution data={SUSDHolders} totalSupplySUSD={totalSupplySUSD} />
			<StatsRow>
				<StatsBox
					key="ETHLOCKED"
					title={t('eth-collateral.title')}
					num={etherLocked}
					percentChange={null}
					subText={t('eth-collateral.subtext')}
					color={COLORS.pink}
					numberStyle="number4"
					numBoxes={2}
					infoData={null}
				/>
				<StatsBox
					key="BTCLOCKED"
					title={t('btc-collateral.title')}
					num={bitcoinLocked}
					percentChange={null}
					subText={t('btc-collateral.subtext')}
					color={COLORS.green}
					numberStyle="number4"
					numBoxes={2}
					infoData={null}
				/>
			</StatsRow>
		</>
	);
};

export default NetworkSection;

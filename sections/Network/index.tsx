import { FC, useEffect, useState, useContext } from 'react';
import axios from 'axios';
import snxData from 'synthetix-data';
import { ethers } from 'ethers';

import {
	AreaChartData,
	ChartPeriod,
	SNXPriceData,
	TimeSeries,
	TreeMapData,
	ActiveStakersData,
} from 'types/data';
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
import { curveSusdPool } from 'contracts';

const CMC_API = 'https://coinmarketcap-api.synthetix.io/public/prices?symbols=SNX';

const NetworkSection: FC = () => {
	const [priorSNXPrice, setPriorSNXPrice] = useState<number | null>(null);
	const [totalActiveStakers, setTotalActiveStakers] = useState<number | null>(null);
	const [priceChartPeriod, setPriceChartPeriod] = useState<ChartPeriod>('D');
	const [stakersChartPeriod, setStakersChartPeriod] = useState<ChartPeriod>('W');
	const [SNXChartPriceData, setSNXChartPriceData] = useState<AreaChartData[]>([]);
	const [stakersChartData, setStakersChartData] = useState<AreaChartData[]>([]);
	const [SNXTotalSupply, setSNXTotalSupply] = useState<number | null>(null);
	const [totalSupplySUSD, setTotalSupplySUSD] = useState<number | null>(null);
	const [SNX24HVolume, setSNX24HVolume] = useState<number | null>(null);
	const [activeCRatio, setActiveCRatio] = useState<number | null>(null);
	const [networkCRatio, setNetworkCRatio] = useState<number | null>(null);
	const [SNXPercentLocked, setSNXPercentLocked] = useState<number | null>(null);
	const [utilizationRatio, setUtilizationRatio] = useState<number | null>(null);
	const [SNXHolders, setSNXHolders] = useState<number | null>(null);
	const [SUSDHolders, setSUSDHolders] = useState<TreeMapData[]>([]);
	const snxjs = useContext(SNXJSContext);
	const { sUSDPrice, setsUSDPrice } = useContext(SUSDContext);
	const { SNXPrice, setSNXPrice, setSNXStaked } = useContext(SNXContext);
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
			] = await Promise.all([
				snxjs.contracts.ExchangeRates.rateForCurrency(snxjs.toBytes32('SNX')),
				snxjs.contracts.Synthetix.totalSupply(),
				curveContract.get_dy_underlying(susdContractNumber, usdcContractNumber, susdAmountWei),
				axios.get(CMC_API),
				snxjs.contracts.SynthetixState.lastDebtLedgerEntry(),
				snxjs.contracts.Synthetix.totalIssuedSynthsExcludeEtherCollateral(snxjs.toBytes32('sUSD')),
				snxjs.contracts.SynthetixState.issuanceRatio(),
				snxData.snx.holders({ max: 1000 }),
				snxData.snx.total(),
				snxjs.contracts.SynthsUSD.totalSupply(),
				snxData.synths.holders({ max: 5, synth: 'sUSD' }),
			]);

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

			const [totalIssuedSynths, issuanceRatio, usdToSnxPrice, sUSDTotalSupply] = [
				unformattedTotalIssuedSynths,
				unformattedIssuanceRatio,
				unformattedSnxPrice,
				unformattedSUSDTotalSupply,
			].map((val) => Number(formatEther(val)));

			let snxTotal = 0;
			let snxLocked = 0;
			let stakersTotalDebt = 0;
			let stakersTotalCollateral = 0;
			let numberOfStakersToSampleForSusd = 150;
			let sUSDBalancePromises = [];
			let sUSDBalanceSamplePercent = 0;

			for (const { address, collateral, debtEntryAtIndex, initialDebtOwnership } of holders) {
				let debtBalance =
					((totalIssuedSynths * lastDebtLedgerEntry) / debtEntryAtIndex) * initialDebtOwnership;
				let collateralRatio = debtBalance / collateral / usdToSnxPrice;

				if (isNaN(debtBalance)) {
					debtBalance = 0;
					collateralRatio = 0;
				}
				const lockedSnx = collateral * Math.min(1, collateralRatio / issuanceRatio);

				if (Number(debtBalance) > 0) {
					stakersTotalDebt += Number(debtBalance);
					stakersTotalCollateral += Number(collateral * usdToSnxPrice);
				}
				snxTotal += Number(collateral);
				snxLocked += Number(lockedSnx);

				if (numberOfStakersToSampleForSusd > 0) {
					sUSDBalancePromises.push(snxjs.contracts.SynthsUSD.balanceOf(address));
					numberOfStakersToSampleForSusd--;
				} else if (numberOfStakersToSampleForSusd === 0) {
					sUSDBalanceSamplePercent = snxTotal / totalSupply;
					numberOfStakersToSampleForSusd--;
				}
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
			setTotalSupplySUSD(sUSDTotalSupply);
			setActiveCRatio(1 / (stakersTotalDebt / stakersTotalCollateral));
			setNetworkCRatio((totalSupply * formattedSNXPrice) / totalIssuedSynths);
			await Promise.all(sUSDBalancePromises).then((results) => {
				const susdSampleBalances = results.reduce(
					(acc, value) => (acc += Number(formatEther(value))),
					0
				);
				setUtilizationRatio(susdSampleBalances / sUSDBalanceSamplePercent / sUSDTotalSupply);
			});
		};
		fetchData();
	}, []);

	const formatChartData = (
		type: 'price' | 'stakers',
		data: SNXPriceData[] | ActiveStakersData[],
		timeSeries?: TimeSeries
	): AreaChartData[] =>
		type === 'price'
			? (data as SNXPriceData[]).map(({ id, averagePrice }) => {
					return {
						created: formatIdToIsoString(id, timeSeries as TimeSeries),
						value: averagePrice,
					};
			  })
			: (data as ActiveStakersData[]).map(({ id, count }) => {
					return {
						created: formatIdToIsoString(id, '1d'),
						value: count,
					};
			  });

	const fetchNewChartData = async (
		type: 'price' | 'stakers' | 'both',
		fetchPeriod?: ChartPeriod
	) => {
		let newSNXPriceData = [];
		let newStakersData = [];
		let timeSeries = '1d';
		if (type === 'both') {
			timeSeries = '15m';
			newSNXPriceData = await snxData.rate.snxAggregate({ timeSeries, max: 24 * 4 });
			newStakersData = await snxData.snx.aggregateActiveStakers({ max: 7 });
		} else if (type === 'price' && fetchPeriod === 'D') {
			timeSeries = '15m';
			newSNXPriceData = await snxData.rate.snxAggregate({ timeSeries, max: 24 * 4 });
		} else if (fetchPeriod === 'W' && type === 'price') {
			timeSeries = '15m';
			newSNXPriceData = await snxData.rate.snxAggregate({ timeSeries, max: 24 * 4 * 7 });
		} else if (fetchPeriod === 'M' && type === 'price') {
			newSNXPriceData = await snxData.rate.snxAggregate({ timeSeries, max: 30 });
		} else if (fetchPeriod === 'Y' && type === 'price') {
			newSNXPriceData = await snxData.rate.snxAggregate({ timeSeries, max: 365 });
		} else if (fetchPeriod === 'W' && type === 'stakers') {
			newStakersData = await snxData.snx.aggregateActiveStakers({ max: 7 });
		} else if (fetchPeriod === 'M' && type === 'stakers') {
			newStakersData = await snxData.snx.aggregateActiveStakers({ max: 30 });
		} else if (fetchPeriod === 'Y' && type === 'stakers') {
			newStakersData = await snxData.snx.aggregateActiveStakers({ max: 365 });
		}
		if (type === 'both' || type === 'price') {
			newSNXPriceData = newSNXPriceData.reverse();
			setPriorSNXPrice(newSNXPriceData[0].averagePrice);
			setSNXChartPriceData(formatChartData('price', newSNXPriceData, timeSeries as TimeSeries));
		}
		if (type === 'both' || type === 'stakers') {
			newStakersData = newStakersData.reverse();
			setTotalActiveStakers(newStakersData[newStakersData.length - 1].count);
			setStakersChartData(formatChartData('stakers', newStakersData));
		}
	};

	useEffect(() => {
		fetchNewChartData('both');
	}, []);

	const stakingPeriods: ChartPeriod[] = ['W', 'M', 'Y'];
	const pricePeriods: ChartPeriod[] = ['D', ...stakingPeriods];
	return (
		<>
			<SectionHeader title="NETWORK" first={true} />
			<AreaChart
				periods={pricePeriods}
				activePeriod={priceChartPeriod}
				onPeriodSelect={(period: ChartPeriod) => {
					setSNXChartPriceData([]); // will force loading state
					setPriceChartPeriod(period);
					fetchNewChartData('price', period);
				}}
				data={SNXChartPriceData}
				title="SNX PRICE"
				num={SNXPrice}
				numFormat="currency2"
				percentChange={
					SNXPrice != null && priorSNXPrice != null ? SNXPrice / priorSNXPrice - 1 : null
				}
				timeSeries={priceChartPeriod === 'D' ? '15m' : '1d'}
				infoData={
					<>
						The price of SNX is obtained from Chainlink oracles, which are retrieved using the{' '}
						<LinkText href={synthetixJSGithub}>synthetix-js repo.</LinkText>
						<NewParagraph>
							For the chart, the data is collected from the "DailySNXPrice" and
							"FifteenMinuteSNXPrice" entities in the Synthetix rates subgraph{' '}
							<LinkText href={synthetixRatesSubgraph}>(view playground)</LinkText>.
						</NewParagraph>
					</>
				}
			/>
			<StatsRow>
				<StatsBox
					key="SNXMKTCAP"
					title="SNX MARKET CAP"
					num={SNXPrice != null && SNXTotalSupply != null ? SNXTotalSupply * SNXPrice : null}
					percentChange={null}
					subText="Fully diluted market cap for SNX"
					color={COLORS.pink}
					numberStyle="currency0"
					numBoxes={3}
					infoData={
						<>
							The market cap is calculated using the price of SNX from Chainlink oracles multiplied
							against the total supply of SNX tokens (fully diluted including escrow). These data
							points are retrieved using the{' '}
							<LinkText href={synthetixJSGithub}>synthetix-js repo.</LinkText>
						</>
					}
				/>
				<StatsBox
					key="SUSDPRICE"
					title="sUSD PRICE"
					num={sUSDPrice}
					percentChange={null}
					subText="Price of sUSD on Curve"
					color={COLORS.green}
					numberStyle="currency2"
					numBoxes={3}
					infoData={
						<>
							The price of sUSD is calculated using the peg from Curve, which holds the majority of
							sUSD in a liquidity pool of various stablecoins. The{' '}
							<LinkText href={curveDocumentation}>Curve documentation</LinkText> explains how the
							peg is calculated.
						</>
					}
				/>
				<StatsBox
					key="SNXVOLUME"
					title="SNX VOLUME"
					num={SNX24HVolume}
					percentChange={null}
					subText="SNX 24 hr volume from Coinmarketcap"
					color={COLORS.green}
					numberStyle="currency0"
					numBoxes={3}
					infoData={null}
				/>
			</StatsRow>
			<StatsRow>
				<StatsBox
					key="TOTALSNXLOCKED"
					title="TOTAL SNX STAKED"
					num={
						SNXPercentLocked != null && SNXTotalSupply != null && SNXPrice != null
							? SNXPercentLocked * SNXTotalSupply * SNXPrice
							: null
					}
					percentChange={null}
					subText="The total value of all staked SNX"
					color={COLORS.pink}
					numberStyle="currency0"
					numBoxes={3}
					infoData={
						<>
							To calculate the value of SNX tokens staked we sample the top 1,000 SNX stakers using
							the <LinkText href={synthetixDataGithub}>Synthetix data repo</LinkText> and then
							determine what proportion of SNX they have staked.{' '}
							<NewParagraph>
								We then multiply this proportion across the total supply of SNX tokens which we get
								from the <LinkText href={synthetixJSGithub}>synthetix-js repo.</LinkText>
							</NewParagraph>
							<NewParagraph>
								Taking a small sample produces a result that is very close to taking the entire set
								of holders and allows the page to load faster.
							</NewParagraph>
						</>
					}
				/>
				<StatsBox
					key="NETWORKCRATIO"
					title="NETWORK COLLATERALIZATION RATIO"
					num={networkCRatio}
					percentChange={null}
					subText="The aggregate collateralization ratio of all SNX wallets"
					color={COLORS.green}
					numberStyle="percent0"
					numBoxes={3}
					infoData={
						<>
							To calculate the network C-Ratio we use the following formula "Total SNX Supply * SNX
							Price / Total Issued Synths." We get this data from the{' '}
							<LinkText href={synthetixJSGithub}>synthetix-js repo.</LinkText>
						</>
					}
				/>
				<StatsBox
					key="ACTIVECRATIO"
					title="ACTIVE COLLATERALIZATION RATIO"
					num={activeCRatio}
					percentChange={null}
					subText="The aggregate collateralization ratio of SNX wallets that are currently staking"
					color={COLORS.green}
					numberStyle="percent0"
					numBoxes={3}
					infoData={
						<>
							To calculate the C-Ratio of active stakers we sample the top 1,000 SNX stakers using
							the <LinkText href={synthetixDataGithub}>Synthetix data repo</LinkText> and then
							determine the cumulative C-Ratio using their collateral-to-debt ratio.
							<NewParagraph>
								Taking a small sample produces a result that is very close to taking the entire set
								of holders and allows the page to load faster.
							</NewParagraph>
						</>
					}
				/>
			</StatsRow>
			<SUSDDistribution data={SUSDHolders} totalSupplySUSD={totalSupplySUSD} />
			<AreaChart
				periods={stakingPeriods}
				activePeriod={stakersChartPeriod}
				onPeriodSelect={(period: ChartPeriod) => {
					setStakersChartData([]); // will force loading state
					setStakersChartPeriod(period);
					fetchNewChartData('stakers', period);
				}}
				data={stakersChartData}
				title="TOTAL ACTIVE STAKERS"
				num={totalActiveStakers}
				numFormat="number"
				percentChange={
					stakersChartData.length > 0 && totalActiveStakers != null
						? totalActiveStakers / stakersChartData[0].value - 1
						: null
				}
				timeSeries="1d"
				infoData={
					<>
						The number of total active stakers is obtained from the "TotalActiveStaker" entity from
						the <LinkText href={synthetixSubgraph}>Synthetix subgraph.</LinkText> The chart data
						shows the "TotalDailyActiveStaker" entity over time.{' '}
					</>
				}
			/>
			<StatsRow>
				<StatsBox
					key="UTILRATIO"
					title="UTILIZATION RATIO"
					num={utilizationRatio != null ? 1 - utilizationRatio : null}
					percentChange={null}
					subText="Proportion of sUSD held outside of SNX stakers' wallets"
					color={COLORS.pink}
					numberStyle="percent2"
					numBoxes={2}
					infoData={
						<>
							While we are obtaining staking data from sampling the top 1,000 SNX stakers using the{' '}
							<LinkText href={synthetixDataGithub}>Synthetix data repo</LinkText>, we also make an
							additional call for each of the top 150 stakers using{' '}
							<LinkText href={synthetixJSGithub}>synthetix-js</LinkText> to get their sUSD holdings;
							we use this sample to extrapolate what % of stakers still have sUSD in their wallet.
							<NewParagraph>
								Taking a small sample produces a result that is very close to taking the entire set
								of holders and allows the page to load faster.
							</NewParagraph>
						</>
					}
				/>
				<StatsBox
					key="SNXHOLDRS"
					title="SNX HOLDERS"
					num={SNXHolders}
					percentChange={null}
					subText="Total number of SNX holders"
					color={COLORS.green}
					numberStyle="number"
					numBoxes={2}
					infoData={
						<>
							The number of SNX holders is obtained from the{' '}
							<LinkText href={synthetixSubgraph}>Synthetix subgraph.</LinkText>
						</>
					}
				/>
			</StatsRow>
		</>
	);
};

export default NetworkSection;

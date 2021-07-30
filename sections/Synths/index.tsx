import { FC, useContext, useState } from 'react';
import styled from 'styled-components';
import { ethers } from 'ethers';
import orderBy from 'lodash/orderBy';
import findIndex from 'lodash/findIndex';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';
import useSynthetixQueries from '@synthetixio/queries';

import SectionHeader from 'components/SectionHeader';
import { MAX_PAGE_WIDTH, COLORS } from 'constants/styles';
import { SNXJSContext, ProviderContext } from 'pages/_app';
import { OpenInterest, SynthTotalSupply } from 'types/data';
import SingleStatRow from 'components/SingleStatRow';
import DoubleStatsBox from 'components/DoubleStatsBox';
import StatsRow from 'components/StatsRow';

import { useSnxjsContractQuery } from 'queries/shared/useSnxjsContractQuery';
import { useSUSDInfo } from 'queries/shared/useSUSDInfo';
import { useGeneralTradingInfoQuery } from 'queries/trading';
import { useTokenBalanceQuery } from 'queries/shared/useTokenBalanceQuery';

import { renBTC } from 'contracts';

import SynthsBarChart from './SynthsBarChart';
import SynthsPieChart from './SynthsPieChart';
import SynthsVolumeMatrix, { SynthVolumeStatus } from './SynthsVolumeMatrix';

const MIN_PERCENT_FOR_PIE_CHART = 0.03;
const NUMBER_OF_TOP_SYNTHS = 3;
const subtitleText = (name: string) => `Price and market cap for ${name}`;

function aggregateSynthTradeVolume(trades: any[]) {
	const synthVolumes: { [currencyKey: string]: number } = {};

	for (const trade of trades) {
		synthVolumes[_.padEnd(trade.fromCurrencyKeyBytes, 66, '0')] =
			(synthVolumes[trade.fromCurrencyKeyBytes] || 0) + trade.fromAmountInUSD;
		synthVolumes[_.padEnd(trade.toCurrencyKeyBytes, 66, '0')] =
			(synthVolumes[trade.toCurrencyKeyBytes] || 0) + trade.toAmountInUSD;
	}

	return synthVolumes;
}

const SynthsSection: FC<{}> = () => {
	const { t } = useTranslation();
	const snxjs = useContext(SNXJSContext);
	const provider = useContext(ProviderContext);

	const { useSynthsTotalSupplyQuery } = useSynthetixQueries();
	const synthsTotalSupplyQuery = useSynthsTotalSupplyQuery();
	const totalSupply = synthsTotalSupplyQuery?.data!;

	const [tradeStartTime] = useState(Math.floor(Date.now() / 1000 - 86400));

	const { formatEther, parseBytes32String } = snxjs.utils;

	const { sUSDPrice, sUSDPriceQuery } = useSUSDInfo(provider);

	const synthTotalSuppliesRequest = useSnxjsContractQuery<any[]>(
		snxjs,
		'SynthUtil',
		'synthsTotalSupplies',
		[]
	);
	const unformattedEthShorts = useSnxjsContractQuery<ethers.BigNumber>(
		snxjs,
		'CollateralManager',
		'short',
		[snxjs.toBytes32('sETH')]
	);
	const unformattedBtcShorts = useSnxjsContractQuery<ethers.BigNumber>(
		snxjs,
		'CollateralManager',
		'short',
		[snxjs.toBytes32('sBTC')]
	);
	const unformattedEthPrice = useSnxjsContractQuery<ethers.BigNumber>(
		snxjs,
		'ExchangeRates',
		'rateForCurrency',
		[snxjs.toBytes32('sETH')]
	);
	const unformattedBtcPrice = useSnxjsContractQuery<ethers.BigNumber>(
		snxjs,
		'ExchangeRates',
		'rateForCurrency',
		[snxjs.toBytes32('sBTC')]
	);

	const bitcoinLocked = useTokenBalanceQuery(
		provider,
		renBTC.address,
		snxjs.contracts.CollateralErc20.address,
		{ decimals: 8 }
	);

	const ethSusdCollateralBalance = useTokenBalanceQuery(
		provider,
		ethers.constants.AddressZero,
		snxjs.contracts.EtherCollateralsUSD.address
	);
	const ethCollateralBalance = useTokenBalanceQuery(
		provider,
		ethers.constants.AddressZero,
		snxjs.contracts.EtherCollateral.address
	);
	const multiCollateralEtherBalance = useTokenBalanceQuery(
		provider,
		ethers.constants.AddressZero,
		snxjs.contracts.CollateralEth.address
	);

	const etherLocked =
		ethCollateralBalance.isSuccess &&
		ethSusdCollateralBalance.isSuccess &&
		multiCollateralEtherBalance.isSuccess
			? Number(ethCollateralBalance.data!) +
			  Number(ethSusdCollateralBalance.data!) +
			  Number(multiCollateralEtherBalance.data!)
			: null;

	const unformattedWrapprLocked = useSnxjsContractQuery<ethers.BigNumber>(
		snxjs,
		'EtherWrapper',
		'sETHIssued',
		[]
	);

	const synthTotalSupplies = synthTotalSuppliesRequest.isSuccess
		? synthTotalSuppliesRequest.data!
		: null;

	const synthStatusesRequest = useSnxjsContractQuery<any>(
		snxjs,
		'SystemStatus',
		'getSynthSuspensions',
		[synthTotalSupplies ? synthTotalSupplies[0] : []]
	);

	const synthFrozenRequest = useSnxjsContractQuery<any>(snxjs, 'SynthUtil', 'frozenSynths', []);

	const synthTradesRequest = useGeneralTradingInfoQuery(tradeStartTime);

	const [ethShorts, btcShorts, btcPrice, ethPrice, wrapprLocked] = [
		unformattedEthShorts,
		unformattedBtcShorts,
		unformattedBtcPrice,
		unformattedEthPrice,
		unformattedWrapprLocked,
	].map((val) => (val.isSuccess ? Number(formatEther(val.data!)) : null));

	let barChartData: OpenInterest = {};
	let pieChartData: SynthTotalSupply[] = [];
	let totalValue: number | null = null;

	if (
		synthTotalSupplies &&
		ethShorts &&
		btcShorts &&
		ethPrice &&
		btcPrice &&
		etherLocked &&
		bitcoinLocked.isSuccess &&
		wrapprLocked
	) {
		let totalSynthValue = 0;
		const unsortedOpenInterest: SynthTotalSupply[] = [];
		for (let i = 0; i < synthTotalSupplies[0].length; i++) {
			let value = Number(formatEther(synthTotalSupplies[2][i]));
			const name = parseBytes32String(synthTotalSupplies[0][i]);
			let totalSupply = Number(formatEther(synthTotalSupplies[1][i]));

			if (name === 'sETH') {
				value = totalSupply * ethPrice;
			}
			let combinedWithExtrasValue = value;
			if (name === 'iETH') {
				combinedWithExtrasValue += ethShorts * ethPrice;
				combinedWithExtrasValue += etherLocked * ethPrice;
				combinedWithExtrasValue += wrapprLocked * ethPrice;
			} else if (name === 'iBTC') {
				combinedWithExtrasValue += btcShorts * btcPrice;
				combinedWithExtrasValue += Number(bitcoinLocked.data!) * btcPrice;
			}
			const synthObject: SynthTotalSupply = {
				name,
				totalSupply,
				value,
				valueWithAdjust: combinedWithExtrasValue,
			};

			unsortedOpenInterest.push(synthObject);
			totalSynthValue += value;
		}

		const openInterestSynths: string[] = snxjs.synths
			.filter((synth) => ['crypto', 'index'].includes(synth.category))
			.map(({ name }) => name);

		barChartData = orderBy(unsortedOpenInterest, 'value', 'desc')
			.filter((item) => openInterestSynths.includes(item.name))
			.reduce((acc: OpenInterest, curr: SynthTotalSupply): OpenInterest => {
				const name = curr.name.slice(1);
				const isEthShort = curr.name === 'iETH';
				const isBtcShort = curr.name === 'iBTC';
				const isShort = isEthShort || isBtcShort;

				const subObject = {
					[curr.name]: {
						value: curr.valueWithAdjust,
						totalSupply: curr.totalSupply ?? 0,
						isShort,
						shortSupply: isEthShort ? ethShorts : isBtcShort ? btcShorts : null,
					},
				};
				if (acc[name]) {
					acc[name] = { ...acc[name], ...subObject };
				} else {
					acc[name] = subObject;
				}
				return acc;
			}, {});

		const formattedPieChartData = unsortedOpenInterest.reduce((acc, curr) => {
			if (curr.value / totalSynthValue < MIN_PERCENT_FOR_PIE_CHART) {
				// @ts-ignore
				const othersIndex = findIndex(acc, (o) => o.name === 'others');
				if (othersIndex === -1) {
					// @ts-ignore
					acc.push({ name: 'others', value: curr.value });
				} else {
					// @ts-ignore
					acc[othersIndex].value = acc[othersIndex].value + curr.value;
				}
			} else {
				// @ts-ignore
				acc.push(curr);
			}
			return acc;
		}, []);

		pieChartData = orderBy(formattedPieChartData, 'value', 'desc');

		totalValue = pieChartData.reduce((acc, { value }) => acc + value, 0);
	}

	let synthsVolumeData: SynthVolumeStatus[] = [];

	if (
		synthTotalSupplies &&
		synthStatusesRequest.isSuccess &&
		synthFrozenRequest.isSuccess &&
		synthTradesRequest.isSuccess
	) {
		const aggregatedSynthVolume = aggregateSynthTradeVolume(synthTradesRequest.data!.exchanges);

		const suspendedSynths = synthStatusesRequest.data!;
		const frozenSynthKeys = synthFrozenRequest.data!;

		synthsVolumeData = synthTotalSupplies[0].map((currencyKey: string, idx: number) => ({
			key: snxjs.utils.parseBytes32String(currencyKey),
			lastDayVolume: aggregatedSynthVolume[currencyKey] || 0,
			suspensionReason:
				suspendedSynths[1][idx].toNumber() || (frozenSynthKeys.indexOf(currencyKey) !== -1 ? 4 : 0),
		}));
	}

	synthsVolumeData = _.sortBy(synthsVolumeData, 'lastDayVolume').reverse();

	return (
		<>
			<SectionHeader title={t('section-header.synths')} />
			<SingleStatRow
				text={t('total-debt.title')}
				subtext={t('total-debt.subtext')}
				num={totalValue}
				color={COLORS.green}
				numberStyle="currency0"
			/>
			<SynthsCharts>
				<SynthsBarChart data={barChartData} />
				<SynthsPieChart {...{ totalSupply }} />
			</SynthsCharts>

			<SubsectionHeader>{t('top-synths.title')}</SubsectionHeader>
			<StatsRow>
				{pieChartData.map(({ name, totalSupply, value }: SynthTotalSupply, index: number) => {
					if (index < NUMBER_OF_TOP_SYNTHS) {
						return (
							<DoubleStatsBox
								key={name}
								title={name}
								subtitle={subtitleText(name)}
								firstMetricTitle={t('top-synths.price')}
								firstMetricStyle="currency2"
								firstMetric={name === 'sUSD' ? sUSDPrice : value / (totalSupply ?? 0)}
								firstColor={COLORS.green}
								secondMetricTitle={t('top-synths.marketCap')}
								secondMetric={value}
								secondColor={COLORS.pink}
								secondMetricStyle="currency0"
								queries={[
									sUSDPriceQuery,
									unformattedEthShorts,
									unformattedBtcShorts,
									unformattedBtcPrice,
									unformattedEthPrice,
									synthTotalSuppliesRequest,
								]}
							/>
						);
					}
					return null;
				})}
			</StatsRow>
			<SynthsVolumeMatrix data={synthsVolumeData} />
		</>
	);
};

const SynthsCharts = styled.div`
	max-width: ${MAX_PAGE_WIDTH}px;
	display: flex;
	margin: 20px auto;
	justify-content: space-between;
	@media only screen and (max-width: 854px) {
		display: block;
	}
`;

const SubsectionHeader = styled.div`
	max-width: ${MAX_PAGE_WIDTH}px;
	font-family: ${(props) => `${props.theme.fonts.expanded}, ${props.theme.fonts.regular}`};
	font-style: normal;
	font-weight: 900;
	font-size: 20px;
	line-height: 120%;
	margin: 40px auto 20px auto;
	color: ${(props) => props.theme.colors.white};
`;

export default SynthsSection;

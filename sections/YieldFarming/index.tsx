import { ethers } from 'ethers';
import { FC, useContext } from 'react';
import axios from 'axios';
import { useTranslation, Trans } from 'react-i18next';

import SectionHeader from 'components/SectionHeader';
import SingleStatRow from 'components/SingleStatRow';
import StatsRow from 'components/StatsRow';
import DoubleStatsBox from 'components/DoubleStatsBox';

import { COLORS } from 'constants/styles';
import { SNXJSContext, ProviderContext } from 'pages/_app';
import { formatPercentage } from 'utils/formatter';
import { FullLineText } from '../../components/common';
import { useSNXInfo } from 'queries/shared/useSNXInfo';
import { useTokenBalanceQuery } from 'queries/shared/useTokenBalanceQuery';
import { useSnxjsContractQuery } from 'queries/shared/useSnxjsContractQuery';
import { useCMCQuery } from 'queries/shared/useCMCQuery';

import QUERY_KEYS from 'constants/queryKeys';
import { QueryResult, useQuery } from 'react-query';
import {
	RewardsContractInfo,
	useRewardsContractInfo,
	useCurveContractInfoQuery,
} from 'queries/yield-farming';
import { curvepoolRewards } from 'contracts';
import { usePageResults } from 'queries/shared/usePageResults';
import { aave } from 'constants/graph-urls';

const SubtitleText = ({ name }: { name: string }) =>
	name === 'sUSD' ? (
		<Trans
			i18nKey={'yield-farming-subtitle-text.sUSD'}
			values={{
				name,
			}}
		/>
	) : (
		<Trans
			i18nKey={'yield-farming-subtitle-text.default'}
			values={{
				name,
			}}
		/>
	);

const YieldFarming: FC = () => {
	const { t } = useTranslation();

	const snxjs = useContext(SNXJSContext);

	const { SNXPrice } = useSNXInfo(snxjs);

	const provider = useContext(ProviderContext);

	const curveContractInfo = useCurveContractInfoQuery(provider);

	const rewardsData: { [id: string]: QueryResult<RewardsContractInfo, string> } = {
		CURVE_SUSD: useRewardsContractInfo(provider, curvepoolRewards.address, true),
		iETH: useRewardsContractInfo(provider, snxjs.contracts.StakingRewardsiETH.address, false),
		iBTC: useRewardsContractInfo(provider, snxjs.contracts.StakingRewardsiBTC.address, false),
	};

	const iEthBalance = useTokenBalanceQuery(
		provider,
		snxjs.contracts.ProxyiETH.address,
		snxjs.contracts.StakingRewardsiETH.address
	);
	const iBtcBalance = useTokenBalanceQuery(
		provider,
		snxjs.contracts.ProxyiBTC.address,
		snxjs.contracts.StakingRewardsiBTC.address
	);

	const iEthPrice = useSnxjsContractQuery<ethers.BigNumber>(
		snxjs,
		'ExchangeRates',
		'rateForCurrency',
		[snxjs.toBytes32('iETH')]
	);
	const iBtcPrice = useSnxjsContractQuery<ethers.BigNumber>(
		snxjs,
		'ExchangeRates',
		'rateForCurrency',
		[snxjs.toBytes32('iBTC')]
	);

	const aaveDepositInfo = usePageResults<any[]>({
		api: aave,
		query: {
			entity: 'reserves',
			selection: {
				where: {
					usageAsCollateralEnabled: true,
					name: `\\"Synthetix Network Token\\"`,
				},
			},
			properties: ['liquidityRate'],
		},
		max: 1,
	});

	const crvPriceInfo = useCMCQuery('CRV');

	const curveApy = useQuery<any, string>(QUERY_KEYS.YieldFarming.CurveApy, async () => {
		return (await axios.get('https://www.curve.fi/raw-stats/apys.json')).data;
	});

	const distributions: { [id: string]: number | null } = {};
	for (const r in rewardsData) {
		if (!rewardsData[r].isSuccess) {
			distributions[r] = null;
			continue;
		}

		const d = rewardsData[r].data!;

		const durationInWeeks = d.duration / (3600 * 24 * 7);
		const isPeriodFinished = new Date().getTime() > Number(d.periodFinish) * 1000;

		distributions[r] = isPeriodFinished ? 0 : (d.duration * d.rate) / durationInWeeks;
	}

	let curveTokenAPY: number | null = null;
	if (curveContractInfo.isSuccess) {
		const d = curveContractInfo.data!;

		const curveSUSDTokenRate =
			(((d.curveInflationRate * d.gaugeRelativeWeight * 31536000) / d.curveWorkingSupply) * 0.4) /
			d.curveSusdTokenPrice;

		curveTokenAPY = crvPriceInfo.isSuccess
			? crvPriceInfo.data!.quote.USD.price * curveSUSDTokenRate
			: null;
	}

	const curveSwapAPY = curveApy?.data?.apy?.day?.susd || null;

	const aaveDepositRate = aaveDepositInfo.isSuccess
		? Number(aaveDepositInfo.data![0].liquidityRate) / 1e27
		: null;

	return (
		<>
			<SectionHeader title={t('section-header.yieldFarming')} />
			<SingleStatRow
				text={t('lending-apy.title')}
				subtext={t('lending-apy.subtext')}
				num={aaveDepositRate}
				color={COLORS.green}
				numberStyle="percent2"
			/>
			<StatsRow>
				<DoubleStatsBox
					key="CRVSUSDRWRDS"
					title={t('curve-susd.title')}
					subtitle={<SubtitleText name="sUSD" />}
					firstMetricTitle={t('curve-susd.firstMetricTitle')}
					firstMetricStyle="number"
					firstMetric={distributions['CURVE_SUSD']}
					firstColor={COLORS.pink}
					secondMetricTitle={t('curve-susd.secondMetricTitle')}
					secondMetric={
						SNXPrice != null &&
						distributions['CURVE_SUSD'] != null &&
						curveContractInfo.isSuccess &&
						curveSwapAPY != null &&
						curveTokenAPY != null
							? ((distributions['CURVE_SUSD'] * (SNXPrice ?? 0)) /
									(curveContractInfo.data!.curveSusdBalance *
										curveContractInfo.data!.curveSusdTokenPrice)) *
									52 +
							  curveSwapAPY +
							  curveTokenAPY
							: null
					}
					secondColor={COLORS.green}
					secondMetricStyle="percent2"
					infoData={
						<Trans
							i18nKey={'curve-susd.infoData'}
							values={{
								rewards: curveTokenAPY != null ? formatPercentage(curveTokenAPY) : '...',
								snxRewards:
									distributions['CURVE_SUSD'] != null &&
									curveContractInfo.isSuccess &&
									SNXPrice != null
										? formatPercentage(
												((distributions['CURVE_SUSD'] * (SNXPrice ?? 0)) /
													(curveContractInfo.data!.curveSusdBalance *
														curveContractInfo.data!.curveSusdTokenPrice)) *
													52
										  )
										: '...',
								swapFees: curveSwapAPY != null ? formatPercentage(curveSwapAPY) : '...',
							}}
							components={{
								fullLineText: <FullLineText />,
							}}
						/>
					}
				/>
				<DoubleStatsBox
					key="iETHRWRDS"
					title={t('iETH.title')}
					subtitle={<SubtitleText name="iETH" />}
					firstMetricTitle={t('iETH.firstMetricTitle')}
					firstMetricStyle="number"
					firstMetric={distributions['iETH']}
					firstColor={COLORS.green}
					secondMetricTitle={t('iETH.secondMetricTitle')}
					secondMetric={
						distributions['iETH'] != null &&
						iEthBalance.isSuccess &&
						iEthPrice.isSuccess &&
						SNXPrice != null
							? ((distributions['iETH'] * (SNXPrice ?? 0)) /
									(Number(iEthBalance.data!) * Number(ethers.utils.formatEther(iEthPrice.data!)))) *
							  52
							: null
					}
					secondColor={COLORS.green}
					secondMetricStyle="percent2"
				/>
				<DoubleStatsBox
					key="iBTCRWRDS"
					title={t('iBTC.title')}
					subtitle={<SubtitleText name="iBTC" />}
					firstMetricTitle={t('iBTC.firstMetricTitle')}
					firstMetricStyle="number"
					firstMetric={distributions['iBTC']}
					firstColor={COLORS.green}
					secondMetricTitle={t('iBTC.secondMetricTitle')}
					secondMetric={
						distributions['iBTC'] != null &&
						iBtcBalance.isSuccess &&
						iBtcPrice.isSuccess &&
						SNXPrice != null
							? ((distributions['iBTC'] * (SNXPrice ?? 0)) /
									(Number(iBtcBalance.data!) * Number(ethers.utils.formatEther(iBtcPrice.data!)))) *
							  52
							: null
					}
					secondColor={COLORS.green}
					secondMetricStyle="percent2"
				/>
			</StatsRow>
		</>
	);
};

export default YieldFarming;

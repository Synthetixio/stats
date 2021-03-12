import { FC, useContext } from 'react';
import { useTranslation, Trans } from 'react-i18next';

import SectionHeader from 'components/SectionHeader';
import SingleStatRow from 'components/SingleStatRow';
import StatsRow from 'components/StatsRow';
import DoubleStatsBox from 'components/DoubleStatsBox';

import { COLORS } from 'constants/styles';
import { SNXJSContext, ProviderContext } from 'pages/_app';
import { useSNXInfo } from 'queries/shared/useSNXInfo';

import { useRewardsContractInfo, RewardsData } from 'queries/yield-farming';
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

	const rewardsData: { [id: string]: any } = {
		'curve-susd': useRewardsContractInfo(
			snxjs,
			provider,
			'sUSD',
			curvepoolRewards.address,
			'curve'
		),
		ShortsETH: useRewardsContractInfo(
			snxjs,
			provider,
			'sETH',
			snxjs.contracts.ShortingRewardssETH.address,
			'shorting'
		),
		ShortsBTC: useRewardsContractInfo(
			snxjs,
			provider,
			'sBTC',
			snxjs.contracts.ShortingRewardssBTC.address,
			'shorting'
		),
		iETH: useRewardsContractInfo(
			snxjs,
			provider,
			'iETH',
			snxjs.contracts.StakingRewardsiETH.address,
			'staking'
		),
	};

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
				{Object.entries(rewardsData).map((d: [string, RewardsData]) => (
					<DoubleStatsBox
						key={d[0] + 'RWRDS'}
						title={t(d[0] + '.title')}
						subtitle={<SubtitleText name={d[0]} />}
						firstMetricTitle={t(d[0] + '.firstMetricTitle')}
						firstMetricStyle="number"
						firstMetric={d[1].distribution}
						firstColor={COLORS.green}
						secondMetricTitle={t('iETH.secondMetricTitle')}
						secondMetric={d[1].apy}
						secondColor={COLORS.green}
						secondMetricStyle="percent2"
					/>
				))}
			</StatsRow>
		</>
	);
};

export default YieldFarming;

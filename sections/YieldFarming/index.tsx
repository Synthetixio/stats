import { FC, useContext } from 'react';
import { useTranslation, Trans } from 'react-i18next';

import SectionHeader from 'components/SectionHeader';
import StatsRow from 'components/StatsRow';
import DoubleStatsBox from 'components/DoubleStatsBox';

import { COLORS } from 'constants/styles';

import { useRewardsContractInfo, RewardsData } from 'queries/yield-farming';
import { curvepoolRewards } from 'contracts';
import { usePageResults } from 'queries/shared/usePageResults';
import { aave, aavev2 } from 'constants/graph-urls';
import StatsBox from 'components/StatsBox';
import { useNetwork } from 'contexts/Network';

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

	const { snxJs, provider } = useNetwork();

	const rewardsData: { [id: string]: any } = {
		'curve-susd': useRewardsContractInfo(
			snxJs,
			provider,
			'sUSD',
			curvepoolRewards.address,
			'curve'
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

	const aavev2DepositInfo = usePageResults<any[]>({
		api: aavev2,
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

	const aavev2DepositRate = aavev2DepositInfo.isSuccess
		? Number(aavev2DepositInfo.data![0].liquidityRate) / 1e27
		: null;

	return (
		<>
			<SectionHeader title={t('section-header.yieldFarming')} />
			<StatsRow>
				<StatsBox
					title={t('lending-apy-v2.title')}
					subText={t('lending-apy-v2.subtext')}
					num={aavev2DepositRate}
					queries={[aavev2DepositInfo]}
					color={COLORS.green}
					numberStyle="percent2"
					numBoxes={2}
					infoData={null}
					percentChange={null}
				/>
				<StatsBox
					title={t('lending-apy.title')}
					subText={t('lending-apy.subtext')}
					num={aaveDepositRate}
					queries={[aaveDepositInfo]}
					color={COLORS.green}
					numberStyle="percent2"
					numBoxes={2}
					infoData={null}
					percentChange={null}
				/>
			</StatsRow>
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
						queries={d[1].queries}
					/>
				))}
			</StatsRow>
		</>
	);
};

export default YieldFarming;

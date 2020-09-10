import { ethers } from 'ethers';
import { FC, useEffect, useState } from 'react';

import SectionHeader from 'components/SectionHeader';
import SingleStatRow from 'components/SingleStatRow';
import StatsRow from 'components/StatsRow';
import DoubleStatsBox from 'components/DoubleStatsBox';

import { COLORS } from 'constants/styles';

const subtitleText = (name: string) =>
	`Data for Synthetix Liquidity Provider (LP) ${name} rewards program`;

const YieldFarming: FC = () => {
	const [percent, setPercent] = useState<number | null>(null);

	useEffect(() => {
		setPercent(1);
	}, []);

	return (
		<>
			<SectionHeader title="YIELD FARMING" />
			<SingleStatRow
				text="TOTAL SYNTHS"
				subtext="The total value of all synths in USD"
				num={percent}
				color={COLORS.green}
				numberStyle="percent2"
			/>
			<StatsRow>
				<DoubleStatsBox
					key="CRVSUSDRWRDS"
					title="Curvepool sUSD"
					subtitle={subtitleText('sUSD')}
					firstMetricTitle="WEEKLY REWARDS (SNX)"
					firstMetricStyle="number"
					firstMetric={8000}
					firstColor={COLORS.pink}
					secondMetricTitle="Annual Percentage Yield"
					secondMetric={1}
					secondColor={COLORS.green}
					secondMetricStyle="percent0"
				/>
				<DoubleStatsBox
					key="iETHRWRDS"
					title="iETH"
					subtitle={subtitleText('iETH')}
					firstMetricTitle="WEEKLY REWARDS (SNX)"
					firstMetricStyle="number"
					firstMetric={32198.6}
					firstColor={COLORS.green}
					secondMetricTitle="Annual Percentage Yield"
					secondMetric={1}
					secondColor={COLORS.green}
					secondMetricStyle="percent0"
				/>
				<DoubleStatsBox
					key="iBTCRWRDS"
					title="iBTC"
					subtitle={subtitleText('iBTC')}
					firstMetricTitle="WEEKLY REWARDS (SNX)"
					firstMetricStyle="number"
					firstMetric={16000}
					firstColor={COLORS.green}
					secondMetricTitle="Annual Percentage Yield"
					secondMetric={1}
					secondColor={COLORS.pink}
					secondMetricStyle="percent0"
				/>
			</StatsRow>
		</>
	);
};

export default YieldFarming;

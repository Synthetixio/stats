import { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
// import useSynthetixQueries from '@synthetixio/queries';
import { SynthsTotalSupplyData } from '@synthetixio/queries';
import { Query, UseQueryResult } from 'react-query';

import SectionHeader from 'components/SectionHeader';
import { MAX_PAGE_WIDTH, COLORS } from 'constants/styles';
import SingleStatRow from 'components/SingleStatRow';

import SynthsBarChart from './SynthsBarChart';
import SynthsPieChart from './SynthsPieChart';
import TopSynths from './TopSynths';
import SynthsVolumeMatrix from './SynthsVolumeMatrix';

const SynthsSection: FC<{
	l2: boolean;
	synthsTotalSupplyQuery: UseQueryResult<SynthsTotalSupplyData>;
}> = ({ l2, synthsTotalSupplyQuery }) => {
	const { t } = useTranslation();
	// const { useSynthsTotalSupplyQuery } = useSynthetixQueries();
	// const synthsTotalSupplyQuery = useSynthsTotalSupplyQuery();
	const synthsTotalSupply = synthsTotalSupplyQuery?.data!;

	return (
		<>
			<SectionHeader title={l2 ? 'L2 Synths' : t('section-header.synths')} />
			{!synthsTotalSupply ? null : (
				<>
					<SingleStatRow
						text={t('total-debt.title')}
						subtext={t('total-debt.subtext')}
						num={synthsTotalSupply?.totalValue.toNumber()}
						color={COLORS.green}
						numberStyle="currency0"
					/>
					<SynthsCharts>
						<SynthsBarChart {...{ synthsTotalSupply }} />
						<SynthsPieChart {...{ synthsTotalSupply }} />
					</SynthsCharts>
					<TopSynths {...{ synthsTotalSupply }} />
					<SynthsVolumeMatrix {...{ synthsTotalSupply }} />
				</>
			)}
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

export default SynthsSection;

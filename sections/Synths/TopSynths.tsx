import { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { SynthsTotalSupplyData, SynthTotalSupply } from '@synthetixio/queries';
import _orderBy from 'lodash/orderBy';

import { MAX_PAGE_WIDTH, COLORS } from 'constants/styles';
import DoubleStatsBox from 'components/DoubleStatsBox';
import StatsRow from 'components/StatsRow';

const NUMBER_OF_TOP_SYNTHS = 3;

const TopSynthsSection: FC<{
	synthsTotalSupply: SynthsTotalSupplyData;
	synthsTotalSupplyQuery: any;
}> = ({ synthsTotalSupply, synthsTotalSupplyQuery }) => {
	const { t } = useTranslation();

	const supplyData = _orderBy(
		Array.from(Object.values(synthsTotalSupply.supplyData)),
		'value',
		'desc'
	).slice(NUMBER_OF_TOP_SYNTHS);

	return (
		<>
			<SubsectionHeader>{t('top-synths.title')}</SubsectionHeader>
			<StatsRow>
				{supplyData.map(({ name, totalSupply, value }: SynthTotalSupply) => (
					<DoubleStatsBox
						key={name}
						title={name}
						subtitle={`Price and market cap for ${name}`}
						firstMetricTitle={t('top-synths.price')}
						firstMetricStyle="currency2"
						firstMetric={
							name === 'sUSD' ? 1 : totalSupply.lte(0) ? 0 : value.div(totalSupply).toNumber() ?? 0
						}
						firstColor={COLORS.green}
						secondMetricTitle={t('top-synths.marketCap')}
						secondMetric={value.toNumber()}
						secondColor={COLORS.pink}
						secondMetricStyle="currency0"
						queries={[synthsTotalSupplyQuery]}
					/>
				))}
			</StatsRow>
		</>
	);
};

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

export default TopSynthsSection;

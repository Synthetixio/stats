import { FC } from 'react';
import styled from 'styled-components';
import * as ethers from 'ethers';
import { useTranslation } from 'react-i18next';
import { SynthsTotalSupplyData } from '@synthetixio/queries';
import Wei, { wei } from '@synthetixio/wei';
import _orderBy from 'lodash/orderBy';

import { MAX_PAGE_WIDTH, COLORS } from 'constants/styles';
import DoubleStatsBox from 'components/DoubleStatsBox';
import StatsRow from 'components/StatsRow';

const NUMBER_OF_TOP_SYNTHS = 3;
const { parseBytes32String, formatEther } = ethers.utils;

type SynthTotalSupply = {
	name: string;
	value: Wei;
	totalSupply: Wei;
};

const TopSynthsSection: FC<{
	synthsTotalSupply: SynthsTotalSupplyData;
}> = ({ synthsTotalSupply }) => {
	const { t } = useTranslation();
	const [names, totalSupplies, values] = synthsTotalSupply.synthTotalSupplies;
	const supplyData = _orderBy(
		names.map((name, i) => ({
			name: parseBytes32String(name),
			totalSupply: wei(formatEther(totalSupplies[i])),
			value: wei(formatEther(values[i])),
		})),
		(o) => o.value.toNumber(),
		'desc'
	).slice(0, NUMBER_OF_TOP_SYNTHS);

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
						queries={[]}
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

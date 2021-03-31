import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import BasicTreeMap from 'components/Charts/TreeMap';
import { SectionTitle, SectionSubtitle, SectionWrap } from 'components/common';
import { TreeMapData } from 'types/data';

interface SUSDDistributionProps {
	data: TreeMapData[];
	totalSupplySUSD: number | null;
}

const SUSDDistribution: FC<SUSDDistributionProps> = ({ data, totalSupplySUSD }) => {
	const { t } = useTranslation();
	return (
		<SectionWrap>
			<SectionTitle>{t('susd-distribution.title')}</SectionTitle>
			<SectionSubtitle>{t('susd-distribution.subtext')}</SectionSubtitle>
			<BasicTreeMap data={data} totalSupplySUSD={totalSupplySUSD} />
		</SectionWrap>
	);
};

export default SUSDDistribution;

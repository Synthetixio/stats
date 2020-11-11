import { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import BasicTreeMap from 'components/Charts/TreeMap';
import { SectionTitle, SectionSubtitle } from 'components/common';
import { MAX_PAGE_WIDTH } from 'constants/styles';
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

const SectionWrap = styled.div`
	background: ${(props) => props.theme.colors.mediumBlue};
	max-width: ${MAX_PAGE_WIDTH - 40}px;
	margin: 20px auto;
	padding: 20px;
`;

export default SUSDDistribution;

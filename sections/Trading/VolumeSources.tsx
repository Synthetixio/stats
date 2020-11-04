import { FC, useMemo, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import findIndex from 'lodash/findIndex';

import { useVolumeSourcesTimeQuery, DailyVolumeSource } from 'queries/trading';
// import { synthetixExchangerSubgraph, volumePartnerExchangeWithTrackingLink } from 'constants/ links';
import Select from 'components/Select';
import { CapitalizedText } from 'components/common';
import { formatCurrency } from 'utils/formatter';

const VolumeSources: FC = () => {
	const { t } = useTranslation();
	const volumeSourceTimeList = useMemo(
		() => [
			{ label: t('homepage.volume-sources.time-options.week'), key: 'W' },
			{ label: t('homepage.volume-sources.time-options.month'), key: 'M' },
			{ label: t('homepage.volume-sources.time-options.year'), key: 'Y' },
		],
		[t]
	);
	const [volumeSourceTimeType, setVolumeSourceTimeType] = useState(volumeSourceTimeList[0]);

	const volumeSourceCategoryList = useMemo(
		() => [
			{ label: t('homepage.volume-sources.categories.volume'), key: 'usdVolume' },
			{ label: t('homepage.volume-sources.categories.trades'), key: 'trades' },
			{ label: t('homepage.volume-sources.categories.fees'), key: 'usdFees' },
		],
		[t]
	);
	const [volumeSourceCategoryType, setVolumeSourceCategoryType] = useState(
		volumeSourceCategoryList[0]
	);

	const { data: volumeSourcesData, status: volumeSourcesStatus } = useVolumeSourcesTimeQuery(
		volumeSourceTimeType.key
	);

	const filteredData = useMemo(
		() =>
			(volumeSourcesData ?? [])
				.reduce((acc: DailyVolumeSource[], curr: DailyVolumeSource) => {
					const currIndex = findIndex(acc, (o) => o.partner === curr.partner);
					if (currIndex !== -1) {
						acc[currIndex].usdVolume += curr.usdVolume;
						acc[currIndex].usdFees += curr.usdFees;
						acc[currIndex].trades += curr.trades;
					} else {
						acc.push(curr);
					}
					return acc;
				}, [])
				.map((volumeSources: DailyVolumeSource) => {
					const category = volumeSources[volumeSourceCategoryType.key as keyof DailyVolumeSource];
					const formattedCategory =
						volumeSourceCategoryType.key === 'usdVolume' ||
						volumeSourceCategoryType.key === 'usdFees'
							? formatCurrency(category, 0)
							: category;
					return {
						source: volumeSources.partner,
						category: formattedCategory,
						unformattedCategoryForSorting: category,
					};
				})
				.sort((a, b) => b.unformattedCategoryForSorting - a.unformattedCategoryForSorting),
		[volumeSourcesData, volumeSourceCategoryType.key, volumeSourceTimeType.key]
	);

	return (
		<SectionContainer>
			<InnerTitle>VOLUME SOURCES</InnerTitle>
			<SelectFields>
				<SelectWrapper>
					<SelectLabel>Period: </SelectLabel>
					<StyledSelect
						inputId="volume-source-time"
						formatOptionLabel={(option: any) => <CapitalizedText>{option.label}</CapitalizedText>}
						options={volumeSourceTimeList}
						value={volumeSourceTimeType}
						onChange={(option: any) => {
							if (option) {
								setVolumeSourceTimeType(option);
							}
						}}
					/>
				</SelectWrapper>
				<SelectWrapper>
					<SelectLabel>Category: </SelectLabel>
					<StyledSelect
						inputId="volume-source-category"
						formatOptionLabel={(option: any) => <CapitalizedText>{option.label}</CapitalizedText>}
						options={volumeSourceCategoryList}
						value={volumeSourceCategoryType}
						onChange={(option: any) => {
							if (option) {
								setVolumeSourceCategoryType(option);
							}
						}}
					/>
				</SelectWrapper>
			</SelectFields>
			<DataSection>
				<RowBox>
					<SectionBox>SOURCE</SectionBox>
					<SectionBox>{volumeSourceCategoryType.label.toUpperCase()}</SectionBox>
				</RowBox>
				{filteredData.map(({ source, category }) => (
					<RowBox>
						<SubsectionBox>{source}</SubsectionBox>
						<SubsectionBox>{category}</SubsectionBox>
					</RowBox>
				))}
			</DataSection>
		</SectionContainer>
	);
};

const SectionContainer = styled.div`
	width: 49%;
	height: 340px;
	margin-top: 10px;
	overflow-y: scroll;
	background: ${(props) => props.theme.colors.mediumBlue};

	@media only screen and (max-width: 1015px) {
		width: 100%;
		margin-bottom: 20px;
	}
`;

const InnerTitle = styled.div`
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => `${props.theme.fonts.condensedMedium}, ${props.theme.fonts.regular}`};
	font-size: 14px;
	line-height: 24px;
	margin: 20px 20px 20px 30px;
`;

const SectionBox = styled.div`
	text-align: center;
	width: 50%;
	padding: 10px;
	font-family: ${(props) => `${props.theme.fonts.condensedMedium}, ${props.theme.fonts.regular}`};
	font-size: 14px;
`;

const SubsectionBox = styled(SectionBox)`
	background: ${(props) => props.theme.colors.darkBlue};
	color: ${(props) => props.theme.colors.white};
	border: 1px solid ${(props) => props.theme.colors.mutedBrightPink};
`;

const DataSection = styled.div`
	width: 80%;
	margin: 0 auto 40px auto;
`;

const StyledSelect = styled(Select)`
	width: 60%;
`;

const SelectLabel = styled.div`
	width: 40%;
`;

const SelectWrapper = styled.div`
	display: flex;
	width: 40%;
	align-items: center;
`;

const SelectFields = styled.div`
	display: flex;
	justify-content: space-around;
	margin: 10px 0 20px 0;
`;

const RowBox = styled.div`
	display: flex;
	width: 100%;
`;

export default VolumeSources;

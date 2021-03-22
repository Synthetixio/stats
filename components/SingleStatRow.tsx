import { FC } from 'react';
import styled from 'styled-components';

import { COLORS, NumberColor, MAX_PAGE_WIDTH, NumberStyle } from 'constants/styles';
import { getFormattedNumber } from 'utils/formatter';
import { UseQueryResult } from 'react-query';

import { SnxTooltip } from './common';
import ErrorIcon from 'assets/svg/error';
import RefetchIcon from 'assets/svg/refetch.svg';
import { useTranslation } from 'react-i18next';
import { IconButton, withStyles } from '@material-ui/core';

type SingleStatRowProps = {
	text: string;
	subtext: string;
	num: number | null;
	queries?: UseQueryResult[];
	color: NumberColor;
	numberStyle: NumberStyle;
};

const SingleStatRow: FC<SingleStatRowProps> = ({
	text,
	subtext,
	color,
	num,
	queries = [],
	numberStyle,
}) => {
	const { t } = useTranslation();

	const allQueriesLoaded = !queries.find((q) => q.isLoading);
	const hasQueryError = !!queries.find((q) => q.isError);

	const refetch = () => queries.forEach((q) => q.refetch());

	const formattedNumber =
		allQueriesLoaded && num != null ? getFormattedNumber(num, numberStyle) : '-';
	return (
		<SingleStatRowContainer>
			<SingleStatsLeft>
				<SingleStatsText>{text}</SingleStatsText>
				<SingleStatsSubtext>{subtext}</SingleStatsSubtext>
			</SingleStatsLeft>
			<SingleStatsRight>
				<SingleStatsNumber color={color}>{formattedNumber}</SingleStatsNumber>
				<InfoWrapper>
					{hasQueryError && <WarningIcon />}
					<SnxTooltip arrow title={t('refresh-tooltip')} placement="top">
						<RefetchIconButton aria-label="refetch" onClick={refetch}>
							<RefetchIcon />
						</RefetchIconButton>
					</SnxTooltip>
				</InfoWrapper>
			</SingleStatsRight>
		</SingleStatRowContainer>
	);
};

export default SingleStatRow;

const SingleStatRowContainer = styled.div`
	display: flex;
	justify-content: space-between;
	max-width: ${MAX_PAGE_WIDTH}px;
	margin: 0 auto;
	background: ${(props) => props.theme.colors.mediumBlue};
	height: 100px;
	align-items: center;
`;

const SingleStats = styled.div`
	display: flex;
	flex-direction: column;
	width: 400px;
`;

const SingleStatsLeft = styled(SingleStats)`
	text-align: left;
	padding-left: 30px;
`;

const SingleStatsRight = styled(SingleStats)`
	display: flex;
	flex-direction: row;
	align-items: right;
	justify-content: flex-end;
	text-align: right;
	padding-right: 30px;
`;

const SingleStatsText = styled.div`
	color: ${(props) => props.theme.colors.white};
	padding-bottom: 20px;
	font-size: 14px;
	font-family: ${(props) => `${props.theme.fonts.condensedMedium}, ${props.theme.fonts.regular}`};
`;

const SingleStatsSubtext = styled.div`
	color: ${(props) => props.theme.colors.gray};
	font-size: 14px;
	font-family: 'Inter', sans-serif;

	@media only screen and (max-width: 500px) {
		display: none;
	}
`;

const SingleStatsNumber = styled.div<{ color: string }>`
	font-family: ${(props) => `${props.theme.fonts.mono}, ${props.theme.fonts.regular}`};
	font-style: normal;
	font-weight: bold;
	font-size: 28px;
	line-height: 24px;
	color: ${(props) =>
		props.color === COLORS.green ? props.theme.colors.brightGreen : props.theme.colors.brightPink};
`;

const InfoWrapper = styled.div`
	display: flex;
	justify-content: flex-end;
	align-items: center;
	margin-right: -10px;
	width: 80px;
`;

const WarningIcon = styled(ErrorIcon)`
	fill: ${(props) => `${props.theme.colors.red}`};
	margin-right: 10px;
`;

const RefetchIconButton = withStyles(() => ({
	root: {
		backgroundColor: '#312065',
		padding: '6px',
	},
}))(IconButton);

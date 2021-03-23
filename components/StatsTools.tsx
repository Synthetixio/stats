import { FC } from 'react';
import styled from 'styled-components';

import { SnxTooltip } from './common';
import { UseQueryResult } from 'react-query';
import { IconButton, withStyles } from '@material-ui/core';

import ErrorIcon from 'assets/svg/error';
import RefetchIcon from 'assets/svg/refetch';
import { useTranslation } from 'react-i18next';

import { SPIN360 } from '../constants/styles';
import colors from 'styles/colors';

// TODO what if num is 0 and is supposed to be zero!!
const StatsTools: FC<{ queries: UseQueryResult[] }> = ({ queries = [] }) => {
	const { t } = useTranslation();

	const allQueriesFetched = !queries.find((q) => q.isFetching);
	const hasQueryError = !!queries.find((q) => q.isError);

	const refetch = () => {
		queries.forEach((q) => q.refetch());
	};

	return (
		<InfoWrapper>
			{hasQueryError && <WarningIcon />}
			<SnxTooltip arrow title={t('refresh-tooltip') as string} placement="top">
				<RefetchIconButton aria-label="refetch" onClick={refetch}>
					{allQueriesFetched ? <RefetchIcon /> : <SpinningRefetchIcon />}
				</RefetchIconButton>
			</SnxTooltip>
		</InfoWrapper>
	);
};

export default StatsTools;

const InfoWrapper = styled.div`
	display: flex;
	justify-content: flex-end;
	align-items: center;
	margin-right: -10px;
`;

const WarningIcon = styled(ErrorIcon)`
	fill: ${(props) => `${props.theme.colors.red}`};
	margin-right: 10px;
`;

const SpinningRefetchIcon = styled(RefetchIcon)`
	animation: ${SPIN360} 1s linear infinite;
`;

const RefetchIconButton = withStyles(() => ({
	root: {
		backgroundColor: colors.darkGrayish,
		padding: '6px',
	},
}))(IconButton);

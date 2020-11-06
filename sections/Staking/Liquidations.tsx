import React, { FC, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';

import { NO_VALUE } from 'constants/placeholder';
import { CryptoCurrency } from 'constants/currency';
import { LiquidationsData } from 'queries/staking';

import { GridDivCenteredRow } from 'components/common';

import Table from 'components/Table';

import NoNotificationIcon from 'assets/svg/no-notifications.svg';
import { formatPercentage, formatNumber, formatTime } from 'utils/formatter';

type LiquidationsProps = {
	liquidationsData: LiquidationsData[];
	isLoading: boolean;
	issuanceRatio: number | null;
	snxPrice: number | null;
};

const Liquidations: FC<LiquidationsProps> = ({
	liquidationsData,
	isLoading,
	issuanceRatio,
	snxPrice,
}) => {
	const { t } = useTranslation();
	const columnsDeps = useMemo(() => [issuanceRatio, snxPrice], [issuanceRatio, snxPrice]);

	return (
		<StyledTable
			columns={[
				{
					Header: (
						<StyledTableHeader>{t('homepage.liquidations.columns.account')}</StyledTableHeader>
					),
					accessor: 'account',
					sortType: 'basic',
					Cell: (cellProps: CellProps<LiquidationsData>) => (
						<InterSpan>{cellProps.row.original.account}</InterSpan>
					),
					width: 300,
					sortable: false,
				},
				{
					Header: (
						<StyledTableHeader>{t('homepage.liquidations.columns.deadline')}</StyledTableHeader>
					),
					accessor: 'deadline',
					sortType: 'basic',
					Cell: (cellProps: CellProps<LiquidationsData>) => (
						<InterSpan>{formatTime(cellProps.row.original.deadline, '15m')}</InterSpan>
					),
					width: 100,
					sortable: true,
				},
				{
					Header: (
						<StyledTableHeader>{t('homepage.liquidations.columns.c-ratio')}</StyledTableHeader>
					),
					accessor: 'collateralRatio',
					sortType: 'basic',
					Cell: (cellProps: CellProps<LiquidationsData>) => (
						<InterSpan>{formatPercentage(cellProps.row.original.collateralRatio, 0)}</InterSpan>
					),
					width: 100,
					sortable: false,
				},
				{
					Header: (
						<StyledTableHeader>
							{t('homepage.liquidations.columns.liquidatable-amount')}
						</StyledTableHeader>
					),
					accessor: 'liquidatableNonEscrowSNX',
					sortType: 'basic',
					Cell: (cellProps: CellProps<LiquidationsData>) => (
						<InterSpan>{`${formatNumber(cellProps.row.original.liquidatableNonEscrowSNX)} ${
							CryptoCurrency.SNX
						}`}</InterSpan>
					),
					width: 100,
					sortable: true,
				},
				{
					Header: (
						<StyledTableHeader>
							{t('homepage.liquidations.columns.amount-to-cover')}
						</StyledTableHeader>
					),
					accessor: 'collateral',
					sortType: 'basic',
					Cell: (cellProps: CellProps<LiquidationsData>) => {
						if (snxPrice != null && issuanceRatio != null && cellProps.row.original.collateral) {
							const stakerTargetDebt =
								(issuanceRatio / snxPrice) * cellProps.row.original.collateral;
							const stakerCurrentDebt =
								(cellProps.row.original.collateralRatio / snxPrice) *
								cellProps.row.original.collateral;
							return (
								<InterSpan>{`${formatNumber(stakerCurrentDebt - stakerTargetDebt)} ${
									CryptoCurrency.sUSD
								}`}</InterSpan>
							);
						}
						return <InterSpan>{NO_VALUE}</InterSpan>;
					},
					width: 100,
					sortable: true,
				},
			]}
			columnsDeps={columnsDeps}
			data={liquidationsData}
			isLoading={isLoading}
			noResultsMessage={
				!isLoading && liquidationsData.length === 0 ? (
					<TableNoResults>
						<NoNotificationIcon />
						{t('dashboard.transactions.table.no-results')}
					</TableNoResults>
				) : undefined
			}
			showPagination={true}
		/>
	);
};

const StyledTable = styled(Table)`
	margin-top: 16px;
`;

const InterSpan = styled.span`
	font-family: 'Inter', sans-serif;
`;

const StyledTableHeader = styled.div`
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	font-size: 13px;
	line-height: 18px;
	color: ${(props) => props.theme.colors.white};
`;

const TableNoResults = styled(GridDivCenteredRow)`
	padding: 50px 0;
	justify-content: center;
	background-color: ${(props) => props.theme.colors.mediumBlue};
	margin-top: -2px;
	justify-items: center;
	grid-gap: 10px;
`;

export default Liquidations;

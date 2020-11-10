import React, { FC, useContext, useEffect, useState, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import { BigNumber } from 'ethers';

import { SNXJSContext } from 'pages/_app';
import { NO_VALUE } from 'constants/placeholder';
import { CryptoCurrency } from 'constants/currency';
import { LiquidationsData } from 'queries/staking';

import { GridDivCenteredRow } from 'components/common';

import Table from 'components/Table';

import NoNotificationIcon from 'assets/svg/no-notifications.svg';
import { formatPercentage, formatNumber, formatTime } from 'utils/formatter';

interface LiquidationsProps {
	liquidationsData: LiquidationsData[];
	isLoading: boolean;
	issuanceRatio: number | null;
	snxPrice: number | null;
}

interface LiquidationsDataWithCurrentRatio extends LiquidationsData {
	currentRatio: number;
}

const Liquidations: FC<LiquidationsProps> = ({
	liquidationsData,
	isLoading,
	issuanceRatio,
	snxPrice,
}) => {
	const { t } = useTranslation();
	const snxjs = useContext(SNXJSContext);
	const [liquidationsDataWithCurrentRatio, setLiquidationsDataWithCurrentRatio] = useState<
		LiquidationsDataWithCurrentRatio[]
	>([]);
	const columnsDeps = useMemo(() => [issuanceRatio, snxPrice], [issuanceRatio, snxPrice]);

	useEffect(() => {
		async function getCurrentRatio(): Promise<void> {
			const liquidationsWithCurrent = liquidationsData.map(async (data) => {
				const currentRatio = await snxjs.contracts.Synthetix.collateralisationRatio(data.account);
				// @ts-ignore
				data.currentRatio = Number(snxjs.utils.formatEther(currentRatio));
				return data;
			});
			const updatedLiquidations = await Promise.all(liquidationsWithCurrent);
			// @ts-ignore
			setLiquidationsDataWithCurrentRatio(updatedLiquidations);
		}
		if ((liquidationsData ?? []).length > 0) {
			getCurrentRatio();
		}
	}, [liquidationsData.length]);

	return (
		<StyledTable
			columns={[
				{
					Header: (
						<StyledTableHeader>{t('homepage.liquidations.columns.account')}</StyledTableHeader>
					),
					accessor: 'account',
					sortType: 'basic',
					Cell: (cellProps: CellProps<LiquidationsDataWithCurrentRatio>) => (
						<InterSpan>{cellProps.row.original.account}</InterSpan>
					),
					width: 200,
					sortable: false,
				},
				{
					Header: (
						<StyledTableHeader>{t('homepage.liquidations.columns.deadline')}</StyledTableHeader>
					),
					accessor: 'deadline',
					sortType: 'basic',
					Cell: (cellProps: CellProps<LiquidationsDataWithCurrentRatio>) => (
						<InterSpan>{formatTime(cellProps.row.original.deadline, 'dd:hh:mm:ss')}</InterSpan>
					),
					width: 100,
					sortable: true,
				},
				{
					Header: (
						<StyledTableHeader>{t('homepage.liquidations.columns.c-ratio')}</StyledTableHeader>
					),
					accessor: 'cyrrentRatio',
					sortType: 'basic',
					Cell: (cellProps: CellProps<LiquidationsDataWithCurrentRatio>) => (
						<InterSpan>{formatPercentage(1 / cellProps.row.original.currentRatio, 0)}</InterSpan>
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
					Cell: (cellProps: CellProps<LiquidationsDataWithCurrentRatio>) => (
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
					Cell: (cellProps: CellProps<LiquidationsDataWithCurrentRatio>) => {
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
			data={liquidationsDataWithCurrentRatio}
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

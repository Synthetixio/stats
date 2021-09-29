import { useQuery, UseQueryResult } from 'react-query';
import { ethers } from 'ethers';
import useSynthetixQueries from '@synthetixio/queries';
import { wei, WeiSource } from '@synthetixio/wei';
import { AccountFlaggedForLiquidation, SnxHolder } from '@synthetixio/data';
import _ from 'lodash';

import QUERY_KEYS from 'constants/queryKeys';
import { useNetwork } from 'contexts/Network';

export type LiquidationsSummary = {
	amountToCover: WeiSource;
	totalLiquidatableSNX: WeiSource;
	liquidatableCount: WeiSource;
};

export type LiquidationsData = {
	deadline: WeiSource;
	account: string;
	currentRatio: WeiSource;
	currentCollateral: WeiSource;
	currentDebt: WeiSource;
	amountToCover: WeiSource;
	liquidatableAmount: WeiSource;
};

// number of sUSD to cover before showing on page
const MIN_LIQUIDATION_COVER_THRESHOLD = 10;

// number of SNX which is *actually* liquidatable before showing on page (or else its dust)
const MIN_LIQUIDATION_BALANCE = 1;

export const useLiquidationsQuery = (): {
	summary: LiquidationsSummary;
	liquidations: LiquidationsData[];
	queries: UseQueryResult[];
	isFetching: boolean;
} => {
	const { snxData, isL2 } = useNetwork();
	const { useGlobalStakingInfoQuery } = useSynthetixQueries();

	const globalStakingInfoQuery = useGlobalStakingInfoQuery();
	const {
		snxPrice: SNXPrice,
		issuanceRatio,
		totalIssuedSynths,
		lastDebtLedgerEntry,
	} = globalStakingInfoQuery.isSuccess
		? globalStakingInfoQuery.data
		: {
				snxPrice: wei(0),
				issuanceRatio: wei(0),
				totalIssuedSynths: wei(0),
				lastDebtLedgerEntry: wei(0),
		  };

	const useLiquidationsQuery = useQuery<
		{ activeLiquidations: AccountFlaggedForLiquidation[]; rawAccountInfos: SnxHolder[] },
		string
	>(
		QUERY_KEYS.Staking.Liquidations,
		async () => {
			const activeLiquidations =
				(await snxData.accountsFlaggedForLiquidation({
					maxTimestamp: Math.round(Date.now() / 1000 + 86400 * 3),
					minTimestamp: Math.round(Date.now() / 1000 + 86400 * (-30 + 3)),
					account: undefined,
					max: 5000,
				})) ?? [];

			const accountAddresses = activeLiquidations.map((l: any) => l.account.toLowerCase());

			const rawAccountInfos =
				(await snxData.snxHolders({
					addresses: accountAddresses,
				})) ?? [];

			return { activeLiquidations, rawAccountInfos };
		},
		{
			enabled:
				SNXPrice.gt(0) && !!issuanceRatio && !!totalIssuedSynths && !!lastDebtLedgerEntry && !isL2,
		}
	);

	const summary: LiquidationsSummary = {
		amountToCover: wei(0),
		totalLiquidatableSNX: wei(0),
		liquidatableCount: wei(0),
	};
	const liquidations: LiquidationsData[] = [];

	if (useLiquidationsQuery.isSuccess && SNXPrice.gt(0)) {
		const { activeLiquidations, rawAccountInfos } = useLiquidationsQuery.data;

		const accountInfos = _.keyBy(rawAccountInfos, 'id');

		summary.liquidatableCount = activeLiquidations.length;

		const liquidations = [];
		for (const l of activeLiquidations) {
			const accountInfo = accountInfos[l.account.toLowerCase()];
			const debtEntryAtIndexFmt = Number(accountInfo.debtEntryAtIndex ?? 0);
			const initialDebtOwnershipFmt = Number(accountInfo.initialDebtOwnership);

			let currentDebt = totalIssuedSynths
				.mul(lastDebtLedgerEntry)
				.mul(initialDebtOwnershipFmt)
				.div(debtEntryAtIndexFmt);

			let currentCollateral = wei(accountInfo.collateral);

			let currentBalanceOf = wei(accountInfo.balanceOf);

			const amountToCover = currentDebt.sub(issuanceRatio).mul(currentCollateral).mul(SNXPrice);
			const liquidatableAmount = amountToCover.div(SNXPrice);

			if (
				amountToCover.gt(MIN_LIQUIDATION_COVER_THRESHOLD) &&
				currentBalanceOf.gt(MIN_LIQUIDATION_BALANCE)
			) {
				liquidations.push({
					deadline: l.deadline,
					account: l.account,
					currentRatio: currentDebt.div(currentCollateral).mul(SNXPrice),
					currentCollateral,
					currentDebt,
					amountToCover,
					liquidatableAmount,
				});

				summary.amountToCover = summary.amountToCover.add(amountToCover);
				summary.totalLiquidatableSNX = summary.totalLiquidatableSNX.add(liquidatableAmount);
			}
		}
	}

	const queries = [useLiquidationsQuery, globalStakingInfoQuery];

	return { summary, liquidations, queries, isFetching: !!queries.find((q) => q.isFetching) };
};

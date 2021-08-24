import { useQuery } from 'react-query';
import { ethers } from 'ethers';
import { l1Endpoints as l1GraphAPIEndpoints } from '@synthetixio/data';
import useSynthetixQueries from '@synthetixio/queries';
import { wei, WeiSource } from '@synthetixio/wei';
import snxData from 'synthetix-data';
import _ from 'lodash';

import QUERY_KEYS from 'constants/queryKeys';

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

export const useLiquidationsQuery = () => {
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

	return useQuery<[LiquidationsSummary, LiquidationsData[]], string>(
		QUERY_KEYS.Staking.Liquidations,
		async () => {
			const activeLiquidations = await snxData.liquidations.getActiveLiquidations();

			const accountAddresses = activeLiquidations.map((l: any) => l.account.toLowerCase());

			const rawAccountInfos = await snxData.pageResults({
				api: l1GraphAPIEndpoints.snx,
				query: {
					entity: 'snxholders',
					selection: {
						where: {
							id_in: '[' + accountAddresses.map((v: string) => `\\"${v}\\"`).join(',') + ']',
						},
					},
					properties: ['id', 'collateral', 'balanceOf', 'initialDebtOwnership', 'debtEntryAtIndex'],
				},
			});

			const accountInfos = _.keyBy(rawAccountInfos, 'id');

			const summary: LiquidationsSummary = {
				amountToCover: 0,
				totalLiquidatableSNX: 0,
				liquidatableCount: activeLiquidations.length,
			};

			const liquidations = [];
			for (const l of activeLiquidations) {
				const accountInfo = accountInfos[l.account.toLowerCase()];
				const debtEntryAtIndexFmt = Number(
					ethers.utils.formatEther(ethers.BigNumber.from(accountInfo.debtEntryAtIndex))
				);
				const initialDebtOwnershipFmt = Number(
					ethers.utils.formatEther(ethers.BigNumber.from(accountInfo.initialDebtOwnership))
				);

				let currentDebt = totalIssuedSynths
					.mul(lastDebtLedgerEntry)
					.mul(initialDebtOwnershipFmt)
					.div(debtEntryAtIndexFmt);

				let currentCollateral = wei(
					ethers.utils.formatEther(ethers.BigNumber.from(accountInfo.collateral))
				);

				let currentBalanceOf = wei(
					ethers.utils.formatEther(ethers.BigNumber.from(accountInfo.balanceOf))
				);

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
			return [summary, liquidations];
		},
		{ enabled: !!SNXPrice && !!issuanceRatio && !!totalIssuedSynths && !!lastDebtLedgerEntry }
	);
};

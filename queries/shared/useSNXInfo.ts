import { SynthetixJS } from '@synthetixio/js';
import { ethers } from 'ethers';
import { useSnxjsContractQuery } from 'queries/shared/useSnxjsContractQuery';
import { formatEther, formatUnits } from 'ethers/lib/utils';
import { usePageResults } from './usePageResults';
import { synthetixSnx } from 'constants/graph-urls';

export const useSNXInfo = (snxjs: SynthetixJS) => {
	const unformattedSnxPrice = useSnxjsContractQuery<ethers.BigNumber>(
		snxjs,
		'ExchangeRates',
		'rateForCurrency',
		[snxjs.toBytes32('SNX')]
	);
	const unformattedSnxTotalSupply = useSnxjsContractQuery<ethers.BigNumber>(
		snxjs,
		'Synthetix',
		'totalSupply',
		[]
	);
	const unformattedLastDebtLedgerEntry = useSnxjsContractQuery<ethers.BigNumber>(
		snxjs,
		'SynthetixState',
		'lastDebtLedgerEntry',
		[]
	);
	const unformattedTotalIssuedSynths = useSnxjsContractQuery<ethers.BigNumber>(
		snxjs,
		'Synthetix',
		'totalIssuedSynthsExcludeEtherCollateral',
		[snxjs.toBytes32('sUSD')]
	);
	const unformattedIssuanceRatio = useSnxjsContractQuery<ethers.BigNumber>(
		snxjs,
		'SystemSettings',
		'issuanceRatio',
		[]
	);

	const holders = usePageResults<any[]>({
		api: synthetixSnx,
		query: {
			entity: 'snxholders',
			selection: {
				orderBy: 'collateral',
				orderDirection: 'desc',
				where: {
					block_gt: 5873222,
				},
			},
			properties: ['collateral', 'debtEntryAtIndex', 'initialDebtOwnership'],
		},
		max: 1000,
	});

	/*const holders = useQuery<any, string>(QUERY_KEYS.SnxHolders, async () => {
		return 
		
		snxData.snx.holders({ max: 1000 });
	});*/

	const lastDebtLedgerEntry = unformattedLastDebtLedgerEntry.isSuccess
		? Number(formatUnits(unformattedLastDebtLedgerEntry.data!, 27))
		: null;

	const SNXTotalSupply = unformattedSnxTotalSupply.isSuccess
		? Number(formatEther(unformattedSnxTotalSupply.data!))
		: null;

	const totalIssuedSynths = unformattedTotalIssuedSynths.isSuccess
		? Number(formatEther(unformattedTotalIssuedSynths.data!))
		: null;
	const tempIssuanceRatio = unformattedIssuanceRatio.isSuccess
		? Number(formatEther(unformattedIssuanceRatio.data!))
		: null;
	const usdToSnxPrice = unformattedSnxPrice.isSuccess
		? Number(formatEther(unformattedSnxPrice.data!))
		: null;

	let snxTotal = 0;
	let snxLocked = 0;
	let stakersTotalDebt = 0;
	let stakersTotalCollateral = 0;

	if (
		totalIssuedSynths &&
		usdToSnxPrice &&
		tempIssuanceRatio &&
		lastDebtLedgerEntry &&
		holders.isSuccess
	) {
		for (const { collateral, debtEntryAtIndex, initialDebtOwnership } of holders.data!) {
			//console.log(collateral, debtEntryAtIndex, initialDebtOwnership)
			if (!collateral || !debtEntryAtIndex || !initialDebtOwnership) continue;

			const collateralFmt = Number(ethers.utils.formatEther(ethers.BigNumber.from(collateral)));
			const debtEntryAtIndexFmt = Number(
				ethers.utils.formatEther(ethers.BigNumber.from(debtEntryAtIndex))
			);
			const initialDebtOwnershipFmt = Number(
				ethers.utils.formatEther(ethers.BigNumber.from(initialDebtOwnership))
			);

			let debtBalance =
				((totalIssuedSynths * lastDebtLedgerEntry) / debtEntryAtIndexFmt) * initialDebtOwnershipFmt;
			let collateralRatio = debtBalance / collateralFmt / usdToSnxPrice;

			if (isNaN(debtBalance)) {
				debtBalance = 0;
				collateralRatio = 0;
			}
			const lockedSnx = collateralFmt * Math.min(1, collateralRatio / tempIssuanceRatio);

			if (Number(debtBalance) > 0) {
				stakersTotalDebt += Number(debtBalance);
				stakersTotalCollateral += Number(collateralFmt * usdToSnxPrice);
			}
			snxTotal += Number(collateralFmt);
			snxLocked += Number(lockedSnx);
		}
	}

	return {
		SNXPrice: unformattedSnxPrice.isSuccess ? Number(formatEther(unformattedSnxPrice.data!)) : null,
		SNXTotalSupply,
		SNXStaked: SNXTotalSupply && snxTotal ? (SNXTotalSupply * snxLocked) / snxTotal : null,
		SNXPercentLocked: snxTotal ? snxLocked / snxTotal : null,
		issuanceRatio: tempIssuanceRatio,
		activeCRatio: stakersTotalDebt ? stakersTotalCollateral / stakersTotalDebt : null,
		totalIssuedSynths,
	};
};

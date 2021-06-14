import { SynthetixJS } from '@synthetixio/contracts-interface';
import { ethers } from 'ethers';
import { useSnxjsContractQuery } from 'queries/shared/useSnxjsContractQuery';
import { formatEther, formatUnits } from 'ethers/lib/utils';
import { usePageResults } from './usePageResults';
import { synthetixSnx } from 'constants/graph-urls';

export const useSNXInfo = (snxjs: SynthetixJS) => {
	const snxPriceQuery = useSnxjsContractQuery<ethers.BigNumber>(
		snxjs,
		'ExchangeRates',
		'rateForCurrency',
		[snxjs.toBytes32('SNX')]
	);
	const snxTotalSupplyQuery = useSnxjsContractQuery<ethers.BigNumber>(
		snxjs,
		'Synthetix',
		'totalSupply',
		[]
	);
	const lastDebtLedgerEntryQuery = useSnxjsContractQuery<ethers.BigNumber>(
		snxjs,
		'SynthetixState',
		'lastDebtLedgerEntry',
		[]
	);
	const totalIssuedSynthsQuery = useSnxjsContractQuery<ethers.BigNumber>(
		snxjs,
		'Synthetix',
		'totalIssuedSynthsExcludeEtherCollateral',
		[snxjs.toBytes32('sUSD')]
	);
	const issuanceRatioQuery = useSnxjsContractQuery<ethers.BigNumber>(
		snxjs,
		'SystemSettings',
		'issuanceRatio',
		[]
	);

	const holdersQuery = usePageResults<any[]>({
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

	const lastDebtLedgerEntry = lastDebtLedgerEntryQuery.isSuccess
		? Number(formatUnits(lastDebtLedgerEntryQuery.data!, 27))
		: null;

	const SNXTotalSupply = snxTotalSupplyQuery.isSuccess
		? Number(formatEther(snxTotalSupplyQuery.data!))
		: null;

	const totalIssuedSynths = totalIssuedSynthsQuery.isSuccess
		? Number(formatEther(totalIssuedSynthsQuery.data!))
		: null;
	const tempIssuanceRatio = issuanceRatioQuery.isSuccess
		? Number(formatEther(issuanceRatioQuery.data!))
		: null;
	const usdToSnxPrice = snxPriceQuery.isSuccess ? Number(formatEther(snxPriceQuery.data!)) : null;

	let snxTotal = 0;
	let snxLocked = 0;
	let stakersTotalDebt = 0;
	let stakersTotalCollateral = 0;

	if (
		totalIssuedSynths &&
		usdToSnxPrice &&
		tempIssuanceRatio &&
		lastDebtLedgerEntry &&
		holdersQuery.isSuccess
	) {
		for (const { collateral, debtEntryAtIndex, initialDebtOwnership } of holdersQuery.data!) {
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

	const SNXPrice = snxPriceQuery.isSuccess ? Number(formatEther(snxPriceQuery.data!)) : null;

	return {
		SNXPrice,
		SNXTotalSupply,
		SNXStaked:
			SNXPrice && totalIssuedSynths && tempIssuanceRatio
				? totalIssuedSynths / tempIssuanceRatio / SNXPrice
				: null,
		SNXPercentLocked: snxTotal ? snxLocked / snxTotal : null,
		issuanceRatio: tempIssuanceRatio,
		activeCRatio: stakersTotalDebt ? stakersTotalCollateral / stakersTotalDebt : null,
		totalIssuedSynths,
		lastDebtLedgerEntry,

		SNXPriceQuery: snxPriceQuery,
		SNXTotalSupplyQuery: snxTotalSupplyQuery,
		SNXHoldersQuery: holdersQuery,
		totalIssuedSynthsQuery,
		issuanceRatioQuery,
	};
};

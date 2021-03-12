import { useQuery } from 'react-query';

import QUERY_KEYS from 'constants/queryKeys';
import { SynthetixJS } from '@synthetixio/js';
import snxData from 'synthetix-data';
import { ethers } from 'ethers';
import { useSnxjsContractQuery } from 'queries/shared/useSnxjsContractQuery';
import { formatEther, formatUnits } from 'ethers/lib/utils';

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

	const holders = useQuery<any, string>(QUERY_KEYS.SnxHolders, async () => {
		return snxData.snx.holders({ max: 1000 });
	});

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
			let debtBalance =
				((totalIssuedSynths * lastDebtLedgerEntry) / debtEntryAtIndex) * initialDebtOwnership;
			let collateralRatio = debtBalance / collateral / usdToSnxPrice;

			if (isNaN(debtBalance)) {
				debtBalance = 0;
				collateralRatio = 0;
			}
			const lockedSnx = collateral * Math.min(1, collateralRatio / tempIssuanceRatio);

			if (Number(debtBalance) > 0) {
				stakersTotalDebt += Number(debtBalance);
				stakersTotalCollateral += Number(collateral * usdToSnxPrice);
			}
			snxTotal += Number(collateral);
			snxLocked += Number(lockedSnx);
		}
	}

	const SNXPrice = unformattedSnxPrice.isSuccess
		? Number(formatEther(unformattedSnxPrice.data!))
		: null;

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
	};
};

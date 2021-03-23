import { useQuery } from 'react-query';

import QUERY_KEYS from 'constants/queryKeys';
import { ethers } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { curveSusdPool } from 'contracts';

export const useSUSDInfo = (provider: ethers.providers.Provider) => {
	const curveContract = new ethers.Contract(
		curveSusdPool.address,
		// @ts-ignore
		curveSusdPool.abi,
		provider
	);
	const usdcContractNumber = 1;
	const susdContractNumber = 3;
	const susdAmount = 1;
	const susdAmountWei = ethers.utils.parseUnits(susdAmount.toString(), 18);
	const sUSDPriceQuery = useQuery<ethers.BigNumber, string>(
		QUERY_KEYS.CurveExchangeAmount,
		async () => {
			return curveContract.get_dy_underlying(susdContractNumber, usdcContractNumber, susdAmountWei);
		}
	);

	return {
		sUSDPrice: sUSDPriceQuery.isSuccess ? Number(formatUnits(sUSDPriceQuery.data!, 6)) : null,

		sUSDPriceQuery,
	};
};

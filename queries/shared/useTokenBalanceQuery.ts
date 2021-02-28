import { useQuery } from 'react-query';

import QUERY_KEYS from 'constants/queryKeys';
import ethers from 'ethers';
import { erc20, renBTC } from 'contracts';
import { formatUnits } from 'ethers/lib/utils';

export const useTokenBalanceQuery = (
	provider: ethers.providers.Provider,
	tokenAddress: string,
	address: string,
	options?: { decimals?: number }
) => {
	return useQuery<string, string>(QUERY_KEYS.TokenBalance(tokenAddress, address), async () => {
		let balanceValue: ethers.BigNumber;

		if (tokenAddress === ethers.constants.AddressZero) {
			balanceValue = await provider.getBalance(address);
		} else if (tokenAddress === renBTC.address) {
			const renBTCContract = new ethers.Contract(renBTC.address, renBTC.abi, provider);

			balanceValue = await renBTCContract.balanceOfUnderlying(address);
		} else {
			const erc20Contract = new ethers.Contract(tokenAddress, erc20.abi, provider);

			balanceValue = await erc20Contract.balanceOf(address);
		}

		return formatUnits(balanceValue, options?.decimals || 18);
	});
};

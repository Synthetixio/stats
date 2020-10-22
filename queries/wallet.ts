import QUERY_KEYS from 'constants/queryKeys';
import { BigNumber } from 'ethers';
import { ProviderContext, SNXJSContext } from 'pages/_app';
import { useContext } from 'react';
import { BaseQueryOptions, AnyQueryKey, useQuery } from 'react-query';
import useQueryGroup from './useQueryGroup';

export const useWalletBalance = (address: string, options?: BaseQueryOptions) => {
	const provider = useContext(ProviderContext);
	return useQuery<BigNumber, AnyQueryKey>(
		QUERY_KEYS.Wallet.Balance(address),
		() => provider.getBalance(address),
		{ ...options }
	);
};

export const useEtherLocked = () => {
	const snxjs = useContext(SNXJSContext);
	return useQueryGroup(
		[
			useWalletBalance(snxjs.contracts.EtherCollateralsUSD.address),
			useWalletBalance(snxjs.contracts.EtherCollateral.address),
		],
		(ethUSD, ETH) => ethUSD + ETH
	);
};

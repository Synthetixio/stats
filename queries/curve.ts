import { useQuery, BaseQueryOptions, useQueryCache, AnyQueryKey } from 'react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { BigNumber, Contract, ethers } from 'ethers';
import { curveSusdPool } from 'contracts';
import { SNXJSContext, ProviderContext, SUSDContext } from 'pages/_app';
import { useContext } from 'react';

export const useDYUnderlying = (
	curveContract: Contract,
	susdContractNumber: number,
	usdcContractNumber: number,
	susdAmountWei: BigNumber,
	options?: BaseQueryOptions
) =>
	useQuery<BigNumber, AnyQueryKey>(
		QUERY_KEYS.Contracts.Curve.GetDYUnderlying(
			susdContractNumber,
			usdcContractNumber,
			susdAmountWei
		),
		() => curveContract.get_dy_underlying(susdContractNumber, usdcContractNumber, susdAmountWei),
		{ ...options }
	);

export const useSUSDPrice = () => {
	const snxjs = useContext(SNXJSContext);
	const provider = useContext(ProviderContext);
	const { setsUSDPrice } = useContext(SUSDContext);
	const { formatUnits } = snxjs.utils;

	const usdcContractNumber = 1;
	const susdContractNumber = 3;
	const susdAmount = 10000;
	const susdAmountWei = snxjs.utils.parseUnits(susdAmount.toString(), 18);

	const curveContract = new ethers.Contract(
		curveSusdPool.address,
		// @ts-ignore
		curveSusdPool.abi,
		provider
	);

	const unformattedExchangeAmountQuery = useDYUnderlying(
		curveContract,
		susdContractNumber,
		usdcContractNumber,
		susdAmountWei
	);

	const exchangeAmount = Number(formatUnits(unformattedExchangeAmountQuery.data || 0, 6));
	const sUSDPrice = exchangeAmount / susdAmount;

	// TODO consolidate context to use react-query
	setsUSDPrice(sUSDPrice);

	const queryCache = useQueryCache();
	const refetch = () =>
		queryCache.invalidateQueries(
			QUERY_KEYS.Contracts.Curve.GetDYUnderlying(
				susdContractNumber,
				usdcContractNumber,
				susdAmountWei
			),
			{
				exact: true,
				throwOnError: true,
				refetchActive: true,
				refetchInactive: false,
			}
		);

	return {
		sUSDPrice,
		isLoading: unformattedExchangeAmountQuery.isLoading,
		isError: unformattedExchangeAmountQuery.isError,
		refetch,
	};
};

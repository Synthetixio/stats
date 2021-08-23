import { usePageResults } from './usePageResults';
import { uniswapV2 } from 'constants/graph-urls';
import { UseQueryResult } from 'react-query';

const USDC_ADDRESS = '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48';
const WETH_ADDRESS = '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2';

export const useTokenPriceQuery = (tokenAddress: string): [number | null, UseQueryResult[]] => {
	// get weth price
	const wethPriceInfo = usePageResults<any>({
		api: uniswapV2,
		query: {
			entity: 'pairs',
			selection: {
				where: {
					token0_in: `[\\"${USDC_ADDRESS}\\", \\"${WETH_ADDRESS}\\"]`,
					token1_in: `[\\"${USDC_ADDRESS}\\", \\"${WETH_ADDRESS}\\"]`,
				},
			},
			properties: ['token0 { id }', 'token0Price', 'token1Price'],
		},
		max: 1,
	});

	// get token price against weth
	const tokenPriceInfo = usePageResults<any>({
		api: uniswapV2,
		query: {
			entity: 'pairs',
			selection: {
				where: {
					token0_in: `[\\"${tokenAddress}\\", \\"${WETH_ADDRESS}\\"]`,
					token1_in: `[\\"${tokenAddress}\\", \\"${WETH_ADDRESS}\\"]`,
				},
			},
			properties: ['token0 { id }', 'token0Price', 'token1Price'],
		},
		max: 1,
	});

	let tokenPrice: number | null = null;

	if (wethPriceInfo.isSuccess && tokenPriceInfo.isSuccess) {
		tokenPrice =
			parseFloat(
				tokenPriceInfo.data[0].token0.id === tokenAddress
					? tokenPriceInfo.data[0].token0Price
					: tokenPriceInfo.data[0].token1Price
			) / parseFloat(wethPriceInfo.data[0].token0Price);
	}

	return [tokenPrice, [wethPriceInfo, tokenPriceInfo]];
};

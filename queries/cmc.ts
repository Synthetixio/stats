import { useQuery, BaseQueryOptions, useQueryCache } from 'react-query';
import axios from 'axios';
import QUERY_KEYS from 'constants/queryKeys';
import useQueryGroup from './useQueryGroup';

const CMC_API = 'https://coinmarketcap-api.synthetix.io/public/prices?symbols=';

type CMC_PRICE = {
	data: Record<
		string,
		{
			quote: Record<
				string,
				{
					volume_24h: number;
				}
			>;
		}
	>;
};

export const useCMCPrice = (name: string, options?: BaseQueryOptions) =>
	useQuery<CMC_PRICE, any>(QUERY_KEYS.CMC.Price(name), () => axios.get(`${CMC_API}${name}`), {
		...options,
	});

export const useCMCVolume = (name: string) =>
	useQueryGroup([useCMCPrice(name)], (cmcSNXData) =>
		cmcSNXData.data && cmcSNXData.data.data[name]
			? cmcSNXData.data.data[name].quote.USD.volume_24h
			: null
	);

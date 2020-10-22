import { useQuery, BaseQueryOptions, AnyQueryKey } from 'react-query';
import axios from 'axios';
import QUERY_KEYS from 'constants/queryKeys';

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
	useQuery<CMC_PRICE, AnyQueryKey>(
		QUERY_KEYS.CMC.Price(name),
		() => axios.get(`${CMC_API}${name}`),
		{
			...options,
		}
	);

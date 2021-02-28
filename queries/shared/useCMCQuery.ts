import { useQuery } from 'react-query';

import QUERY_KEYS from 'constants/queryKeys';
import axios from 'axios';

export interface CmcPricesResponse {
	id: number;
	name: string;
	symbol: string;
	slug: string;
	num_market_pairs: number;
	date_added: string;
	tags: string[];
	max_supply: number;
	circulating_supply: number;
	total_supply: number;
	platform: {
		id: number;
		name: string;
		symbol: string;
		slug: string;
		token_address: string;
	};
	is_active: number;
	cmc_rank: number;
	is_fiat: number;
	last_updated: string;
	quote: {
		USD: {
			price: number;
			volume_24h: number;
			percent_change_1h: number;
			percent_change_24h: number;
			percent_change_7d: number;
			percent_change_30d: number;
			market_cap: number;
			last_updated: string;
		};
	};
}

const CMC_PRICES_API = 'https://coinmarketcap-api.synthetix.io/public/prices?symbols=';

export const useCMCQuery = (tokenSymbol: string) => {
	return useQuery<CmcPricesResponse, string>(QUERY_KEYS.CMC(tokenSymbol), async () => {
		return (await axios.get(CMC_PRICES_API + tokenSymbol)).data.data[tokenSymbol];
	});
};

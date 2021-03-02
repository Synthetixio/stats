import { useQuery } from 'react-query';

import snxData from 'synthetix-data';

import QUERY_KEYS from 'constants/queryKeys';
import { OptionsMarket } from 'types/data';

export const useOptionsMarketsQuery = (args: any) => {
	return useQuery<any, string>(QUERY_KEYS.Options.Markets(args), async () => {
		const unformattedMarkets = await snxData.binaryOptions.markets(args);
		const sortedMarkets = unformattedMarkets.sort((a: OptionsMarket, b: OptionsMarket) => {
			return parseFloat(b.poolSize) - parseFloat(a.poolSize);
		});

		return sortedMarkets;
	});
};

import { useQuery } from 'react-query';

import { pageResults } from 'synthetix-data';

import QUERY_KEYS from 'constants/queryKeys';

export const usePageResults = <T>(query: any) => {
	return useQuery<T, string>(QUERY_KEYS.PageResults(query), async () => {
		return await pageResults(query);
	});
};

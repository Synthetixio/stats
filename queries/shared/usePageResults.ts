import { useQuery } from 'react-query';
import pageResults from 'graph-results-pager';
import QUERY_KEYS from 'constants/queryKeys';

export const usePageResults = <T>(query: any) => {
	return useQuery<T, string>(QUERY_KEYS.PageResults(query), async () => {
		return await pageResults(query);
	});
};

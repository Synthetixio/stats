import { useQuery } from 'react-query';
import snxData from 'synthetix-data';

import QUERY_KEYS from 'constants/queryKeys';
import { ActiveStakersData } from 'types/data';

export const useAggregateActiveStakersQuery = (args: any) => {
	return useQuery<ActiveStakersData[], string>(
		QUERY_KEYS.Staking.AggregateActiveStakers(args),
		async () => {
			return (await snxData.snx.aggregateActiveStakers(args)).reverse();
		}
	);
};

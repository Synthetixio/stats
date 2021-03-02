import { useQuery } from 'react-query';

import snxData from 'synthetix-data';

import QUERY_KEYS from 'constants/queryKeys';

export const useOptionsTransactionsQuery = (args: any) => {
	return useQuery<any, string>(QUERY_KEYS.Options.Transactions(args), async () => {
		const unformattedOptionTransactions = await snxData.binaryOptions.optionTransactions(args);

		const yesterday = new Date();
		yesterday.setDate(yesterday.getDate() - 1);
		return unformattedOptionTransactions.filter((optionTx: { timestamp: number }) => {
			return new Date(optionTx.timestamp) > yesterday;
		});
	});
};

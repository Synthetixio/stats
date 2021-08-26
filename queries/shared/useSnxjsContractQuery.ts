import { useQuery } from 'react-query';

import QUERY_KEYS from 'constants/queryKeys';
import { SynthetixJS } from '@synthetixio/contracts-interface';

export const useSnxjsContractQuery = <T>(
	snxJs: SynthetixJS,
	contract: string,
	method: string,
	args: any[]
) => {
	return useQuery<T, string>(QUERY_KEYS.SnxjsContract(snxJs, contract, method, args), async () => {
		return snxJs.contracts[contract][method](...args);
	});
};

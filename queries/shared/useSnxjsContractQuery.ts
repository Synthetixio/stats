import { useQuery } from 'react-query';

import QUERY_KEYS from 'constants/queryKeys';
import { SynthetixJS } from '@synthetixio/js';

export const useSnxjsContractQuery = <T>(
	snxjs: SynthetixJS,
	contract: string,
	method: string,
	args: any[]
) => {
	return useQuery<T, string>(QUERY_KEYS.SnxjsContract(contract, method, args), async () => {
		return snxjs.contracts[contract][method](...args);
	});
};

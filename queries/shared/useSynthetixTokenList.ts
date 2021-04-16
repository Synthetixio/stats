import { useQuery } from 'react-query';
import axios from 'axios';
import keyBy from 'lodash/keyBy';

import QUERY_KEYS from 'constants/queryKeys';

export type Token = {
	address: string;
	chainId: number;
	decimals: number;
	logoURI: string;
	name: string;
	symbol: string;
	tags: string[];
};

export type TokenListResponse = {
	keywords: string[];
	logoURI: string;
	name: string;
	tags: any;
	timestamp: string;
	tokens: Token[];
	version: { major: number; minor: number; patch: number };
};

export type TokenListQueryResponse = {
	tokens: Token[];
	tokensMap: Record<string, Token>;
	symbols: string[];
};

const useSynthetixTokenList = () => {
	return useQuery<TokenListQueryResponse>(QUERY_KEYS.SynthetixTokenList, async () => {
		const response = await axios.get<TokenListResponse>('https://synths.snx.eth.link');

		return {
			tokens: response.data.tokens,
			tokensMap: keyBy(response.data.tokens, 'symbol'),
			symbols: response.data.tokens.map((token) => token.symbol),
		};
	});
};

export default useSynthetixTokenList;

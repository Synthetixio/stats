import { pageResults } from 'synthetix-data';

const aaveSubgraphURL = 'https://api.thegraph.com/subgraphs/name/aave/protocol-multy-raw';

export async function getAaveDepositRate(): Promise<number> {
	return pageResults({
		api: aaveSubgraphURL,
		query: {
			entity: 'reserves',
			selection: {
				where: {
					usageAsCollateralEnabled: true,
					name: `\\"Synthetix Network Token\\"`,
				},
			},
			properties: ['liquidityRate'],
		},
		max: 1,
	}).then((result) => {
		return Number(result[0].liquidityRate) / 1e27;
	});
}

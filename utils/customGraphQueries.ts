import { pageResults } from 'synthetix-data';

const aaveSubgraphURL = 'https://api.thegraph.com/subgraphs/name/aave/protocol-multy-raw';
const uniswapV2SubgraphURL = 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v2';
const CRVTokenAddress = '0xd533a949740bb3306d119cc777fa900ba034cd52';
const synthetixExchangesGraphURL =
	'https://api.thegraph.com/subgraphs/name/synthetixio-team/synthetix-exchanges';

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
		// @ts-ignore
	}).then((result) => {
		return Number(result[0].liquidityRate) / 1e27;
	});
}

export async function getCurveTokenPrice(): Promise<number> {
	return pageResults({
		api: uniswapV2SubgraphURL,
		query: {
			entity: 'tokenDayDatas',
			selection: {
				orderBy: 'id',
				orderDirection: 'desc',
				where: {
					token: `\\"${CRVTokenAddress}\\"`,
				},
			},
			properties: ['priceUSD'],
		},
		max: 1,
		// @ts-ignore
	}).then((result) => {
		return Number(result[0].priceUSD);
	});
}

export async function getPostArchernarTotals() {
	return (
		pageResults({
			api: synthetixExchangesGraphURL,
			query: {
				entity: 'postArchernarTotals',
				selection: {
					where: {
						id: `\\"mainnet\\"`,
					},
				},
				properties: ['trades', 'exchangers', 'exchangeUSDTally', 'totalFeesGeneratedInUSD'],
			},
			max: 1,
		})
			// @ts-ignore
			.then(([{ exchangers, exchangeUSDTally, totalFeesGeneratedInUSD, trades }]) => ({
				trades: Number(trades),
				exchangers: Number(exchangers),
				exchangeUSDTally: exchangeUSDTally / 1e18,
				totalFeesGeneratedInUSD: totalFeesGeneratedInUSD / 1e18,
			}))
	);
}

export async function exchangeSourceData({ timeSeries = '1mo' }) {
	const now = new Date();
	const currentDayID = Math.floor(now.getTime() / 86400 / 1000);
	let searchFromDayID;
	if (timeSeries === '7d') {
		searchFromDayID = currentDayID - 7;
	} else if (timeSeries === '1mo' || timeSeries === '30d') {
		searchFromDayID = currentDayID - 30;
	} else if (timeSeries === '1y' || timeSeries === '365d' || timeSeries === '12mo') {
		searchFromDayID = currentDayID - 365;
	}

	return pageResults({
		api: 'https://api.thegraph.com/subgraphs/name/dvd-schwrtz/exchanger',
		max: 10000,
		query: {
			entity: 'dailyExchangePartners',
			selection: {
				orderBy: 'id',
				orderDirection: 'desc',
				where: {
					dayID_gt: searchFromDayID ? `\\"${searchFromDayID}\\"` : undefined,
				},
			},
			properties: ['trades', 'usdVolume', 'usdFees', 'partner', 'dayID'],
		},
	}).then((results: any) =>
		results.map(({ dayID, partner, trades, usdFees, usdVolume }: any) => ({
			dayID: Number(dayID),
			partner,
			trades: Number(trades),
			usdFees: Math.round(Number(usdFees) * 100) / 100,
			usdVolume: Math.round(Number(usdVolume) * 100) / 100,
		}))
	);
}

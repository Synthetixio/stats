import { ChartPeriod } from 'types/data';

const KNOWN_ADDRESSES: { [address: string]: string } = {
	'0xa5407eae9ba41422680e2e00537571bcc53efbfd': 'Curve sUSD Pool',
	'0xf80758ab42c3b07da84053fd88804bcb6baa4b5c': 'Uniswap v2',
	'0x49be88f0fcc3a8393a59d3688480d7d253c37d2a': 'Synthetix Foundation',
	'0xed3d99d838ab16e8a0543bb91f254139a0fcb8dd': 'Balancer',
	'0xaad22f5543fcdaa694b68f94be177b561836ae57': 'Uniswap V2: BASED',
	'0xf1f85b2c54a2bd284b1cf4141d64fd171bd85539': 'Sushiswap',
	'0x1f2c3a1046c32729862fcb038369696e3273a516': 'Synthetix Short Collateral',
	'0x6c5024cd4f8a59110119c56f8933403a539555eb': 'Aave v2 sUSD',
	'0x250e76987d838a75310c34bf422ea9f1ac4cc906': 'Poly Network Lock Proxy',
	'0xd076b9865feb49a43aa38c06b0432df6b6cbca9e': 'dHEDGE - Jesse Livermore Hearts Crypto',
	'0x055db9aff4311788264798356bbf3a733ae181c6': 'Balancer sUSD/sTSLA',
	'0xf977814e90da44bfa03b6295a0616a897441acec': 'Binance',
};

export const getSUSDHoldersName = (id: string): string => {
	const address = id.split('-')[0];
	return KNOWN_ADDRESSES[address] ?? 'unknown';
};

export function periodToDays(period: ChartPeriod): number {
	switch (period) {
		case 'W':
			return 7;
		case 'M':
			return 30;
		case 'Y':
			return 365;
	}

	return 0;
}

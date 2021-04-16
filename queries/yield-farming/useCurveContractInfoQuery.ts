import { useQuery } from 'react-query';

import QUERY_KEYS from 'constants/queryKeys';
import { ethers } from 'ethers';
import {
	curvepoolRewards,
	curveSusdPool,
	curveSusdPoolToken,
	curveSusdGauge,
	curveGaugeController,
} from 'contracts';

export interface CurveContractInfo {
	curveSusdBalance: number;
	curveSusdTokenPrice: number;
	curveInflationRate: number;
	curveWorkingSupply: number;
	gaugeRelativeWeight: number;
}

export const useCurveContractInfoQuery = (provider: ethers.providers.Provider) => {
	const curveSusdPoolContract = new ethers.Contract(
		curveSusdPool.address,
		// @ts-ignore
		curveSusdPool.abi,
		provider
	);
	const curveSusdPoolTokenContract = new ethers.Contract(
		curveSusdPoolToken.address,
		curveSusdPoolToken.abi,
		provider
	);
	const curveSusdGaugeContract = new ethers.Contract(
		curveSusdGauge.address,
		// @ts-ignore
		curveSusdGauge.abi,
		provider
	);
	const curveGaugeControllerContract = new ethers.Contract(
		curveGaugeController.address,
		// @ts-ignore
		curveGaugeController.abi,
		provider
	);

	return useQuery<CurveContractInfo, string>(QUERY_KEYS.YieldFarming.CurveInfo, async () => {
		const rawCurveContractInfo = await Promise.all([
			// note: gasLimit added here due to temp Berlin upgrade bug https://github.com/ethers-io/ethers.js/issues/1474#event-4602342665
			curveSusdPoolTokenContract.balanceOf(curvepoolRewards.address, { gasLimit: 1000000 }),
			curveSusdPoolContract.get_virtual_price({ gasLimit: 1000000 }),
			curveSusdGaugeContract.inflation_rate({ gasLimit: 1000000 }),
			curveSusdGaugeContract.working_supply({ gasLimit: 1000000 }),
			curveGaugeControllerContract.gauge_relative_weight(curveSusdGauge.address, {
				gasLimit: 1000000,
			}),
		]);

		const [
			curveSusdBalance,
			curveSusdTokenPrice,
			curveInflationRate,
			curveWorkingSupply,
			gaugeRelativeWeight,
		] = rawCurveContractInfo.map((d) => Number(ethers.utils.formatEther(d)));

		return {
			curveSusdBalance,
			curveSusdTokenPrice,
			curveInflationRate,
			curveWorkingSupply,
			gaugeRelativeWeight,
		};
	});
};

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
		const r = await Promise.all([
			curveSusdPoolTokenContract.balanceOf(curvepoolRewards.address),
			curveSusdPoolContract.get_virtual_price(),
			curveSusdGaugeContract.inflation_rate(),
			curveSusdGaugeContract.working_supply(),
			curveGaugeControllerContract.gauge_relative_weight(curveSusdGauge.address),
		]);

		const [
			curveSusdBalance,
			curveSusdTokenPrice,
			curveInflationRate,
			curveWorkingSupply,
			gaugeRelativeWeight,
		] = r.map((d) => Number(ethers.utils.formatEther(d)));

		return {
			curveSusdBalance,
			curveSusdTokenPrice,
			curveInflationRate,
			curveWorkingSupply,
			gaugeRelativeWeight,
		};
	});
};

import { FC, useEffect, useState } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import snxData from 'synthetix-data';
import { synthetix, Networks } from '@synthetixio/js';
import { ethers } from 'ethers';

import StatsBox from '../../components/StatsBox';
import StatsRow from '../../components/StatsRow';
import AreaChart from '../../components/Charts/AreaChart';
import SectionHeader from '../../components/SectionHeader';
import { COLORS } from '../../constants/styles';
import SUSDDistribution from '../Network/SUSDDistribution';

const CMC_API = 'https://coinmarketcap-api.synthetix.io/public/prices?symbols=SNX';

const NetworkSection: FC = () => {
	const [SNXPrice, setSNXPrice] = useState<number>(0);
	const [SNXTotalSupply, setSNXTotalSupply] = useState<number>(0);
	const [SUSDPrice, setSUSDPrice] = useState<number>(0);
	const [SNX24HVolume, setSNX24HVolume] = useState<number>(0);
	const [activeCRatio, setActiveCRatio] = useState<number>(0);
	const [networkCRatio, setNetworkCRatio] = useState<number>(0);
	const [SNXPercentLocked, setSNXPercentLocked] = useState<number>(0);

	// NOTE: use interval? or save data calls?
	useEffect(() => {
		const fetchData = async () => {
			// move this to the context
			const snxjs = synthetix({ network: Networks.Mainnet });
			const { formatEther, formatUnits, parseUnits } = snxjs.utils;

			const curveContract = new ethers.Contract(
				curveSusdSwapContract.address,
				curveSusdSwapContract.abi,
				ethers.getDefaultProvider()
			);

			const usdcContractNumber = 1;
			const susdContractNumber = 3;
			const susdAmount = 10000;
			const susdAmountWei = parseUnits(susdAmount.toString(), 18);

			const [
				unformattedSnxPrice,
				unformattedSnxTotalSupply,
				unformattedExchangeAmount,
				cmcSNXData,
				unformattedLastDebtLedgerEntry,
				unformattedTotalIssuedSynths,
				unformattedIssuanceRatio,
				holders,
			] = await Promise.all([
				snxjs.contracts.ExchangeRates.rateForCurrency(snxjs.toBytes32('SNX')),
				snxjs.contracts.Synthetix.totalSupply(),
				curveContract.get_dy_underlying(susdContractNumber, usdcContractNumber, susdAmountWei),
				axios.get(CMC_API),
				snxjs.contracts.SynthetixState.lastDebtLedgerEntry(),
				snxjs.contracts.Synthetix.totalIssuedSynthsExcludeEtherCollateral(snxjs.toBytes32('sUSD')),
				snxjs.contracts.SynthetixState.issuanceRatio(),
				snxData.snx.holders({ max: 2000 }),
			]);

			const formattedSNXPrice = Number(formatEther(unformattedSnxPrice));
			setSNXPrice(formattedSNXPrice);
			const totalSupply = Number(formatEther(unformattedSnxTotalSupply));
			setSNXTotalSupply(totalSupply);
			const exchangeAmount = Number(formatUnits(unformattedExchangeAmount, 6));
			setSUSDPrice(exchangeAmount / susdAmount);

			const dailyVolume = cmcSNXData?.data?.data?.SNX?.quote?.USD?.volume_24h;
			if (dailyVolume) {
				setSNX24HVolume(dailyVolume);
			}

			const lastDebtLedgerEntry = Number(formatUnits(unformattedLastDebtLedgerEntry, 27));

			const [totalIssuedSynths, issuanceRatio, usdToSnxPrice] = [
				unformattedTotalIssuedSynths,
				unformattedIssuanceRatio,
				unformattedSnxPrice,
			].map((val) => Number(formatEther(val)));

			let snxTotal = 0;
			let snxLocked = 0;
			let stakersTotalDebt = 0;
			let stakersTotalCollateral = 0;

			// @ts-ignore
			holders.forEach(({ collateral, debtEntryAtIndex, initialDebtOwnership }) => {
				let debtBalance =
					((totalIssuedSynths * lastDebtLedgerEntry) / debtEntryAtIndex) * initialDebtOwnership;
				let collateralRatio = debtBalance / collateral / usdToSnxPrice;
				// ignore if 0 balance
				//if (Number(collateral) <= 0) continue;
				if (isNaN(debtBalance)) {
					debtBalance = 0;
					collateralRatio = 0;
				}
				const lockedSnx = collateral * Math.min(1, collateralRatio / issuanceRatio);

				if (Number(debtBalance) > 0) {
					stakersTotalDebt += Number(debtBalance);
					stakersTotalCollateral += Number(collateral * usdToSnxPrice);
				}
				snxTotal += Number(collateral);
				snxLocked += Number(lockedSnx);
			});

			setSNXPercentLocked(snxLocked / snxTotal);
			setActiveCRatio(1 / (stakersTotalDebt / stakersTotalCollateral));
			setNetworkCRatio((totalSupply * formattedSNXPrice) / totalIssuedSynths);
		};
		fetchData();
	}, []);

	const data = [...Array(120).keys()].map((num: number) => {
		const created = format(new Date(), 'MM/dd');
		return {
			name: 'Random data',
			price: 5 + (Math.random() * num) / 40,
			created,
		};
	});

	const periods = ['D', 'W', 'M', 'Y'];
	return (
		<>
			<SectionHeader title="NETWORK" />
			<AreaChart
				periods={periods}
				data={data}
				title="SNX PRICE"
				num={SNXPrice}
				numFormat="currency"
				percentChange={0.1}
			/>
			<StatsRow>
				<StatsBox
					key="SNXMKTCAP"
					title="SNX MARKET CAP"
					number={SNXTotalSupply * SNXPrice}
					percentChange={null}
					subText="Fully Diluted Market cap for Synthetix Network Token"
					color={COLORS.pink}
					numberStyle="currency"
					numBoxes={3}
				/>
				<StatsBox
					key="SUSDPRICE"
					title="SUSD PRICE"
					number={SUSDPrice}
					percentChange={null}
					subText="Price of sUSD token on Curve"
					color={COLORS.green}
					numberStyle="currency"
					numBoxes={3}
				/>
				<StatsBox
					key="SNXVOLUME"
					title="SNX VOLUME"
					number={SNX24HVolume}
					percentChange={null}
					subText="SNX 24HR volume from Coinmarketcap API"
					color={COLORS.green}
					numberStyle="currency"
					numBoxes={3}
				/>
			</StatsRow>
			<StatsRow>
				<StatsBox
					key="TOTALSNXLOCKED"
					title="TOTAL SNX STAKED"
					number={SNXPercentLocked * SNXTotalSupply * SNXPrice}
					percentChange={null}
					subText="USD value of SNX tokens locked in staking"
					color={COLORS.pink}
					numberStyle="currency"
					numBoxes={3}
				/>
				<StatsBox
					key="NETWORKCRATIO"
					title="NETWORK COLLATERALIZATION RATIO"
					number={networkCRatio}
					percentChange={null}
					subText="Collateralization ratio for the all SNX tokens"
					color={COLORS.green}
					numberStyle="percent"
					numBoxes={3}
				/>
				<StatsBox
					key="ACTIVECRATIO"
					title="ACTIVE COLLATERALIZATION RATIO"
					number={activeCRatio}
					percentChange={null}
					subText="Collateralization ratio for staked SNX tokens"
					color={COLORS.green}
					numberStyle="percent"
					numBoxes={3}
				/>
			</StatsRow>
			<SUSDDistribution />
		</>
	);
};

export const curveSusdSwapContract = {
	address: '0xA5407eAE9Ba41422680e2e00537571bcC53efBfD',
	abi: [
		{
			name: 'get_dy_underlying',
			outputs: [
				{
					type: 'uint256',
					name: 'out',
				},
			],
			inputs: [
				{
					type: 'int128',
					name: 'i',
				},
				{
					type: 'int128',
					name: 'j',
				},
				{
					type: 'uint256',
					name: 'dx',
				},
			],
			constant: true,
			payable: false,
			type: 'function',
			gas: 3489467,
		},
	],
};

export default NetworkSection;

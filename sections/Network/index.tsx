import { FC, useState } from 'react';
import { ethers } from 'ethers';
import { formatEther } from 'ethers/lib/utils';
import { Trans, useTranslation } from 'react-i18next';
import { useQuery } from 'react-query';
import useSynthetixQueries, { Token } from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';
import { SynthHolder } from '@synthetixio/data';
import styled from 'styled-components';

import { ChartPeriod, TreeMapData } from 'types/data';
import { ChartTitle } from 'components/common';
import StatsBox from 'components/StatsBox';
import StatsRow from 'components/StatsRow';
import AreaChart from 'components/Charts/AreaChart';
import PieChart from 'components/Charts/PieChart';
import SectionHeader from 'components/SectionHeader';
import SingleStatRow from 'components/SingleStatRow';
import { LinkText, NewParagraph } from 'components/common';
import { COLORS, MAX_PAGE_WIDTH } from 'constants/styles';
import QUERY_KEYS from 'constants/queryKeys';
import {
	synthetixSubgraph,
	synthetixRatesSubgraph,
	synthetixJSGithub,
	curveDocumentation,
	synthetixDataGithub,
} from 'constants/links';
import { getSUSDHoldersName } from 'utils/dataMapping';
import { renBTC } from 'contracts';
import { useSnxjsContractQuery } from 'queries/shared/useSnxjsContractQuery';
import { useSUSDInfo } from 'queries/shared/useSUSDInfo';
import { useNetwork } from 'contexts/Network';

import SUSDDistribution from '../Network/SUSDDistribution';

const NetworkSection: FC = () => {
	const { t } = useTranslation();

	const [priceChartPeriod, setPriceChartPeriod] = useState<ChartPeriod>('D');
	const {
		useSnxPriceChartQuery,
		useTokensBalancesQuery,
		useETHBalanceQuery,
		useGlobalStakingInfoQuery,
	} = useSynthetixQueries();
	const SNXChartPriceData = useSnxPriceChartQuery(priceChartPeriod);

	const { provider, snxJs, snxData } = useNetwork();

	const globalStakingInfoQuery = useGlobalStakingInfoQuery();
	const {
		snxPrice: SNXPrice,
		totalSupply: SNXTotalSupply,
		snxPercentLocked: SNXPercentLocked,
		issuanceRatio,
		activeCRatio,
		totalIssuedSynths,
	} = globalStakingInfoQuery.isSuccess
		? globalStakingInfoQuery.data
		: {
				snxPrice: null,
				totalSupply: wei(0),
				snxPercentLocked: wei(0),
				issuanceRatio: wei(0),
				activeCRatio: wei(0),
				totalIssuedSynths: wei(0),
		  };

	const { sUSDPrice, sUSDPriceQuery } = useSUSDInfo(provider);

	const unformattedSUSDTotalSupply = useSnxjsContractQuery<ethers.BigNumber>(
		snxJs,
		'SynthsUSD',
		'totalSupply',
		[]
	);

	const unformattedWrapprLocked = useSnxjsContractQuery<ethers.BigNumber>(
		snxJs,
		'EtherWrapper',
		'sETHIssued',
		[]
	);
	const unformattedEthPrice = useSnxjsContractQuery<ethers.BigNumber>(
		snxJs,
		'ExchangeRates',
		'rateForCurrency',
		[snxJs.toBytes32('sETH')]
	);
	const unformattedBtcPrice = useSnxjsContractQuery<ethers.BigNumber>(
		snxJs,
		'ExchangeRates',
		'rateForCurrency',
		[snxJs.toBytes32('sBTC')]
	);

	const multiCollateralEtherBalance = useETHBalanceQuery(snxJs.contracts.CollateralEth.address);

	const bitcoinLockedQuery = useTokensBalancesQuery(
		[{ address: renBTC.address, symbol: 'renBTC' } as Token],
		snxJs.contracts.CollateralErc20.address
	);
	const bitcoinLocked = bitcoinLockedQuery.data?.renBTC?.balance ?? null;

	const sUSDShortLockedQuery = useTokensBalancesQuery(
		[{ address: snxJs.contracts.SynthsUSD.address, symbol: 'sUSD' } as Token],
		snxJs.contracts.CollateralShort.address
	);
	const sUSDShortLocked = sUSDShortLockedQuery.data?.sUSD?.balance ?? null;

	const snxTotals = useQuery<any, string>(QUERY_KEYS.SnxTotals, async () => {
		return snxData.synthetix();
	});
	const SUSDHolders = useQuery<TreeMapData[], string>(QUERY_KEYS.sUSDHolders, async () => {
		const topSUSDHolders = (await snxData.synthHolders({ max: 10, synth: 'sUSD' })) ?? [];
		return topSUSDHolders.map(({ balanceOf, address }: SynthHolder) => ({
			name: getSUSDHoldersName(address),
			value: balanceOf,
		}));
	});

	const [btcPrice, ethPrice] = [unformattedBtcPrice, unformattedEthPrice].map((val) =>
		val.isSuccess ? Number(formatEther(val.data!)) : null
	);

	const etherLocked = multiCollateralEtherBalance.isSuccess
		? Number(multiCollateralEtherBalance.data!)
		: null;

	const SNXHolders = snxTotals.data?.snxHolders;

	//const SNX24HVolume = cmcSNXData?.data?.quote?.USD?.volume_24h || null;

	const totalSupplySUSD = unformattedSUSDTotalSupply.isSuccess
		? Number(formatEther(unformattedSUSDTotalSupply.data!))
		: null;

	const networkCRatio =
		SNXTotalSupply.gt(0) && SNXPrice?.gt(0) && totalIssuedSynths.gt(0)
			? SNXTotalSupply.mul(SNXPrice).div(totalIssuedSynths).toNumber()
			: null;

	const wrapprLocked = unformattedWrapprLocked.isSuccess
		? Number(ethers.utils.formatEther(unformattedWrapprLocked.data!))
		: null;

	const priorSNXPrice = SNXChartPriceData.isSuccess ? SNXChartPriceData.data![0].value : null;
	const pricePeriods: ChartPeriod[] = ['D', 'W', 'M', 'Y'];

	// there are 4 sources of debt for the debt pool right now
	const debtResponsibilityChartData = [];

	if (wrapprLocked && etherLocked && bitcoinLocked && totalIssuedSynths && ethPrice && btcPrice) {
		debtResponsibilityChartData.push(
			{
				name: 'ETH Wrapper',
				value: wrapprLocked * ethPrice,
			},
			{
				name: 'ETH Collateral Loan',
				value: etherLocked * ethPrice,
			},
			{
				name: 'BTC Collateral Loan',
				value: bitcoinLocked.toNumber() * btcPrice,
			}
		);

		// snx stakers are responsible for all the debt that is not covered by the previous sources
		debtResponsibilityChartData.unshift({
			name: 'SNX Stakers',
			value: totalIssuedSynths.toNumber(), // this is actually issued synths not associated with above categories
		});
	}

	return (
		<>
			<SectionHeader title={t('section-header.network')} first={true} />
			<AreaChart
				periods={pricePeriods}
				activePeriod={priceChartPeriod}
				onPeriodSelect={(period: ChartPeriod) => {
					setPriceChartPeriod(period);
				}}
				data={SNXChartPriceData.data || []}
				title={t('snx-price.title')}
				num={SNXPrice?.toNumber() ?? null}
				numFormat="currency2"
				percentChange={
					null /* TODO: uncomment once subgraph bug is fixed
					SNXPrice != null && priorSNXPrice != null
						? SNXPrice.div(wei(priorSNXPrice)).sub(wei(1)).toNumber()
						: null*/
				}
				timeSeries={priceChartPeriod === 'D' ? '15m' : '1d'}
				infoData={
					<Trans
						i18nKey="snx-price.infoData"
						values={{
							sjsLinkText: t('snx-price.sjsLinkText'),
							viewPlaygroundLinkText: t('snx-price.viewPlaygroundLinkText'),
						}}
						components={{
							sjslink: <LinkText href={synthetixJSGithub} />,
							viewPlaygroundLink: <LinkText href={synthetixRatesSubgraph} />,
							newParagraph: <NewParagraph />,
						}}
					/>
				}
			/>
			<StatsRow>
				<StatsBox
					key="SNXMKTCAP"
					title={t('snx-market-cap.title')}
					num={SNXPrice != null && SNXTotalSupply != null ? SNXTotalSupply.mul(SNXPrice) : null}
					queries={[globalStakingInfoQuery]}
					percentChange={null}
					subText={t('snx-market-cap.subtext')}
					color={COLORS.pink}
					numberStyle="currency0"
					numBoxes={3}
					infoData={
						<Trans
							i18nKey="snx-market-cap.infoData"
							values={{
								sjsLinkText: t('snx-market-cap.sjsLinkText'),
							}}
							components={{
								linkText: <LinkText href={synthetixJSGithub} />,
							}}
						/>
					}
				/>
				<StatsBox
					key="SUSDPRICE"
					title={t('susd-price.title')}
					num={sUSDPrice}
					queries={[sUSDPriceQuery]}
					percentChange={null}
					subText={t('susd-price.subtext')}
					color={COLORS.green}
					numberStyle="currency2"
					numBoxes={3}
					infoData={
						<Trans
							i18nKey="susd-price.infoData"
							values={{
								curveDocLinkText: t('susd-price.curveDocLinkText'),
							}}
							components={{
								linkText: <LinkText href={curveDocumentation} />,
							}}
						/>
					}
				/>
				<StatsBox
					key="ISSUANCECRATIO"
					title={t('issuance-ratio.title')}
					num={issuanceRatio.gt(0) ? wei(1).div(issuanceRatio) : null}
					queries={[globalStakingInfoQuery]}
					percentChange={null}
					subText={t('issuance-ratio.subtext')}
					color={COLORS.green}
					numberStyle="percent0"
					numBoxes={3}
					infoData={<>{t('issuance-ratio.infoData')}</>}
				/>
			</StatsRow>
			<StatsRow>
				<StatsBox
					key="TOTALSNXLOCKED"
					title={t('total-snx-locked.title')}
					num={
						SNXPercentLocked != null && SNXTotalSupply != null && SNXPrice != null
							? SNXPercentLocked.mul(SNXTotalSupply).mul(SNXPrice)
							: null
					}
					queries={[globalStakingInfoQuery]}
					percentChange={null}
					subText={t('total-snx-locked.subtext')}
					color={COLORS.pink}
					numberStyle="currency0"
					numBoxes={4}
					infoData={
						<Trans
							i18nKey="total-snx-locked.infoData"
							values={{
								sDataLinkText: t('total-snx-locked.sDataLinkText'),
								sjsLinkText: t('total-snx-locked.sjsLinkText'),
							}}
							components={{
								sDataLink: <LinkText href={synthetixDataGithub} />,
								sjsLink: <LinkText href={synthetixJSGithub} />,
								newParagraph: <NewParagraph />,
							}}
						/>
					}
				/>
				<StatsBox
					key="NETWORKCRATIO"
					title={t('network-cratio.title')}
					num={networkCRatio}
					queries={[globalStakingInfoQuery]}
					percentChange={null}
					subText={t('network-cratio.subtext')}
					color={COLORS.green}
					numberStyle="percent0"
					numBoxes={4}
					infoData={
						<Trans
							i18nKey="network-cratio.infoData"
							values={{
								sjsLinkText: t('network-cratio.sjsLinkText'),
							}}
							components={{
								sjsLink: <LinkText href={synthetixJSGithub} />,
							}}
						/>
					}
				/>
				<StatsBox
					key="ACTIVECRATIO"
					title={t('active-cratio.title')}
					num={activeCRatio}
					percentChange={null}
					subText={t('active-cratio.subtext')}
					color={COLORS.green}
					numberStyle="percent0"
					numBoxes={4}
					infoData={
						<Trans
							i18nKey="active-cratio.infoData"
							values={{
								sDataLinkText: t('active-cratio.sDataLinkText'),
							}}
							components={{
								sjsLink: <LinkText href={synthetixDataGithub} />,
								newParagraph: <NewParagraph />,
							}}
						/>
					}
				/>
				<StatsBox
					key="SNXHOLDRS"
					title={t('snx-holders.title')}
					num={SNXHolders}
					queries={[globalStakingInfoQuery]}
					percentChange={null}
					subText={t('snx-holders.subtext')}
					color={COLORS.green}
					numberStyle="number"
					numBoxes={4}
					infoData={
						<Trans
							i18nKey="snx-holders.infoData"
							values={{
								subgraphLinkText: t('snx-holders.subgraphLinkText'),
							}}
							components={{
								linkText: <LinkText href={synthetixSubgraph} />,
							}}
						/>
					}
				/>
			</StatsRow>
			<SUSDDistribution data={SUSDHolders.data || []} totalSupplySUSD={totalSupplySUSD} />
			<SingleStatRow
				key="WRAPPRETHLOCKED"
				text={t('wrappr-locked.title')}
				num={wrapprLocked}
				queries={[unformattedWrapprLocked]}
				subtext={t('wrappr-locked.subtext')}
				color={COLORS.green}
				numberStyle="number"
				postfix="ETH"
			/>
			<DebtInfoRow>
				<DebtChartContainer>
					<ChartTitle>{t('debt-pie-chart.title')}</ChartTitle>
					<PieChart data={debtResponsibilityChartData} isShortLegend={true} />
				</DebtChartContainer>
				<DebtBoxesContainer>
					<StatsBox
						key="ETHLOCKED"
						title={t('eth-collateral.title')}
						num={etherLocked}
						queries={[multiCollateralEtherBalance]}
						percentChange={null}
						subText={t('eth-collateral.subtext')}
						color={COLORS.green}
						numberStyle="number4"
						numBoxes={3}
						infoData={null}
					/>
					<StatsBox
						key="BTCLOCKED"
						title={t('btc-collateral.title')}
						num={bitcoinLocked}
						queries={[bitcoinLockedQuery]}
						percentChange={null}
						subText={t('btc-collateral.subtext')}
						color={COLORS.green}
						numberStyle="number4"
						numBoxes={3}
						infoData={null}
					/>
					<StatsBox
						key="USDLOCKEDSHORT"
						title={t('short-collateral.title')}
						num={sUSDShortLocked}
						queries={[sUSDShortLockedQuery]}
						percentChange={null}
						subText={t('short-collateral.subtext')}
						color={COLORS.pink}
						numberStyle="currency0"
						numBoxes={3}
						infoData={null}
					/>
				</DebtBoxesContainer>
			</DebtInfoRow>
		</>
	);
};

const DebtInfoRow = styled.div`
	display: flex;
	flex-wrap: wrap;
	margin: 0px auto;
	margin-top: 20px;
	max-width: ${MAX_PAGE_WIDTH}px;
`;

const DebtChartContainer = styled.div`
	width: calc(50% - 30px);
	padding: 20px;
	margin-right: 20px;
	background: ${(props) => props.theme.colors.mediumBlue};

	@media only screen and (max-width: 854px) {
		margin-right: 0;
		width: 100%;
	}
`;

const DebtBoxesContainer = styled.div`
	width: calc(50% - 30px);

	> * {
		width: 100%;
		box-sizing: border-box;
		margin-top: 0;
		padding-top: 20px;
		height: auto;
	}

	> *:not(:last-child) {
		margin-bottom: 20px;
	}

	@media only screen and (max-width: 854px) {
		margin-top: 20px;
		width: 100%;
	}
`;

export default NetworkSection;

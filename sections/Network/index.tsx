import { FC, useState, useContext } from 'react';
import snxData from 'synthetix-data';
import { ethers } from 'ethers';
import { Trans, useTranslation } from 'react-i18next';

import { ChartPeriod, TreeMapData } from 'types/data';
import { ChartTitle } from 'components/common';
import StatsBox from 'components/StatsBox';
import StatsRow from 'components/StatsRow';
import AreaChart from 'components/Charts/AreaChart';
import PieChart from 'components/Charts/PieChart';
import SectionHeader from 'components/SectionHeader';
import { COLORS, MAX_PAGE_WIDTH } from 'constants/styles';
import QUERY_KEYS from 'constants/queryKeys';
import {
	synthetixSubgraph,
	synthetixRatesSubgraph,
	synthetixJSGithub,
	curveDocumentation,
	synthetixDataGithub,
} from 'constants/links';
import SUSDDistribution from '../Network/SUSDDistribution';
import { SNXJSContext, ProviderContext } from 'pages/_app';
import { getSUSDHoldersName } from 'utils/dataMapping';
import { LinkText, NewParagraph } from 'components/common';
import { renBTC } from 'contracts';
import { useSnxPriceChartQuery } from 'queries/network/useSnxPriceChartQuery';
import { formatEther } from 'ethers/lib/utils';
import { useSnxjsContractQuery } from 'queries/shared/useSnxjsContractQuery';
import { useTokenBalanceQuery } from 'queries/shared/useTokenBalanceQuery';
import { useQuery } from 'react-query';
import { useSNXInfo } from 'queries/shared/useSNXInfo';
import { useSUSDInfo } from 'queries/shared/useSUSDInfo';
import SingleStatRow from 'components/SingleStatRow';
import styled from 'styled-components';

const NetworkSection: FC = () => {
	const { t } = useTranslation();

	const [priceChartPeriod, setPriceChartPeriod] = useState<ChartPeriod>('D');

	const SNXChartPriceData = useSnxPriceChartQuery(priceChartPeriod);

	const snxjs = useContext(SNXJSContext);
	const provider = useContext(ProviderContext);

	const {
		SNXPrice,
		SNXTotalSupply,
		SNXPercentLocked,
		issuanceRatio,
		activeCRatio,
		totalIssuedSynths,

		SNXPriceQuery,
		SNXTotalSupplyQuery,
		issuanceRatioQuery,
		totalIssuedSynthsQuery,
		SNXHoldersQuery,
	} = useSNXInfo(snxjs);
	const { sUSDPrice, sUSDPriceQuery } = useSUSDInfo(provider);

	const unformattedSUSDTotalSupply = useSnxjsContractQuery<ethers.BigNumber>(
		snxjs,
		'SynthsUSD',
		'totalSupply',
		[]
	);

	const unformattedWrapprLocked = useSnxjsContractQuery<ethers.BigNumber>(
		snxjs,
		'EtherWrapper',
		'sETHIssued',
		[]
	);
	const unformattedEthPrice = useSnxjsContractQuery<ethers.BigNumber>(
		snxjs,
		'ExchangeRates',
		'rateForCurrency',
		[snxjs.toBytes32('sETH')]
	);
	const unformattedBtcPrice = useSnxjsContractQuery<ethers.BigNumber>(
		snxjs,
		'ExchangeRates',
		'rateForCurrency',
		[snxjs.toBytes32('sBTC')]
	);

	const ethSusdCollateralBalance = useTokenBalanceQuery(
		provider,
		ethers.constants.AddressZero,
		snxjs.contracts.EtherCollateralsUSD.address
	);
	const ethCollateralBalance = useTokenBalanceQuery(
		provider,
		ethers.constants.AddressZero,
		snxjs.contracts.EtherCollateral.address
	);
	const multiCollateralEtherBalance = useTokenBalanceQuery(
		provider,
		ethers.constants.AddressZero,
		snxjs.contracts.CollateralEth.address
	);
	const bitcoinLocked = useTokenBalanceQuery(
		provider,
		renBTC.address,
		snxjs.contracts.CollateralErc20.address,
		{ decimals: 8 }
	);
	const sUSDShortLocked = useTokenBalanceQuery(
		provider,
		snxjs.contracts.SynthsUSD.address,
		snxjs.contracts.CollateralShort.address
	);

	const snxTotals = useQuery<any, string>(QUERY_KEYS.SnxTotals, async () => {
		return snxData.snx.total();
	});
	const SUSDHolders = useQuery<TreeMapData[], string>(QUERY_KEYS.sUSDHolders, async () => {
		const topSUSDHolders = await snxData.synths.holders({ max: 10, synth: 'sUSD' });
		return topSUSDHolders.map(({ balanceOf, address }: { balanceOf: number; address: string }) => ({
			name: getSUSDHoldersName(address),
			value: balanceOf,
		}));
	});

	const [btcPrice, ethPrice] = [unformattedBtcPrice, unformattedEthPrice].map((val) =>
		val.isSuccess ? Number(formatEther(val.data!)) : null
	);

	const etherLocked =
		ethCollateralBalance.isSuccess &&
		ethSusdCollateralBalance.isSuccess &&
		multiCollateralEtherBalance.isSuccess
			? Number(ethCollateralBalance.data!) +
			  Number(ethSusdCollateralBalance.data!) +
			  Number(multiCollateralEtherBalance.data!)
			: null;

	const SNXHolders = snxTotals.data?.snxHolders;

	//const SNX24HVolume = cmcSNXData?.data?.quote?.USD?.volume_24h || null;

	const totalSupplySUSD = unformattedSUSDTotalSupply.isSuccess
		? Number(formatEther(unformattedSUSDTotalSupply.data!))
		: null;

	const networkCRatio =
		SNXTotalSupply && SNXPrice && totalIssuedSynths
			? (SNXTotalSupply * SNXPrice) / totalIssuedSynths
			: null;

	const wrapprLocked = unformattedWrapprLocked.isSuccess
		? Number(ethers.utils.formatEther(unformattedWrapprLocked.data!))
		: null;

	const priorSNXPrice = SNXChartPriceData.isSuccess ? SNXChartPriceData.data![0].value : null;

	const pricePeriods: ChartPeriod[] = ['D', 'W', 'M', 'Y'];

	// there are 4 sources of debt for the debt pool right now
	const debtResponsibilityChartData = [];

	if (
		wrapprLocked &&
		etherLocked &&
		bitcoinLocked.isSuccess &&
		totalIssuedSynths &&
		ethPrice &&
		btcPrice
	) {
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
				value: Number(bitcoinLocked.data!) * btcPrice,
			}
		);

		// snx stakers are responsible for all the debt that is not covered by the previous sources
		debtResponsibilityChartData.unshift({
			name: 'SNX Stakers',
			value: totalIssuedSynths, // this is actually issued synths not associated with above categories
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
				num={SNXPrice}
				numFormat="currency2"
				percentChange={
					SNXPrice != null && priorSNXPrice != null ? (SNXPrice ?? 0) / priorSNXPrice - 1 : null
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
					num={SNXPrice != null && SNXTotalSupply != null ? SNXTotalSupply * (SNXPrice ?? 0) : null}
					queries={[SNXPriceQuery, SNXTotalSupplyQuery]}
					percentChange={null}
					subText={t('snx-market-cap.subtext')}
					color={COLORS.pink}
					numberStyle="currency0"
					numBoxes={4}
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
					numBoxes={4}
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
					key="SNXVOLUME"
					title={t('snx-volume.title')}
					num={0}
					percentChange={null}
					subText={t('snx-volume.subtext')}
					color={COLORS.green}
					numberStyle="currency0"
					numBoxes={4}
					infoData={null}
				/>
				<StatsBox
					key="ISSUANCECRATIO"
					title={t('issuance-ratio.title')}
					num={issuanceRatio != null ? 1 / (issuanceRatio ?? 0) : null}
					queries={[issuanceRatioQuery]}
					percentChange={null}
					subText={t('issuance-ratio.subtext')}
					color={COLORS.green}
					numberStyle="percent0"
					numBoxes={4}
					infoData={<>{t('issuance-ratio.infoData')}</>}
				/>
			</StatsRow>
			<StatsRow>
				<StatsBox
					key="TOTALSNXLOCKED"
					title={t('total-snx-locked.title')}
					num={
						SNXPercentLocked != null && SNXTotalSupply != null && SNXPrice != null
							? SNXPercentLocked * SNXTotalSupply * (SNXPrice ?? 0)
							: null
					}
					queries={[SNXTotalSupplyQuery, SNXPriceQuery]}
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
					queries={[SNXTotalSupplyQuery, SNXPriceQuery, totalIssuedSynthsQuery]}
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
					queries={[SNXHoldersQuery]}
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
						queries={[ethCollateralBalance, ethSusdCollateralBalance, multiCollateralEtherBalance]}
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
						num={parseFloat(bitcoinLocked.data || '0')}
						queries={[bitcoinLocked]}
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
						num={parseFloat(sUSDShortLocked.data || '0')}
						queries={[sUSDShortLocked]}
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

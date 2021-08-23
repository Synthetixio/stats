import React, { FC, useContext, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import useSynthetixQueries, { SynthsTotalSupplyData } from '@synthetixio/queries';
import _padEnd from 'lodash/padEnd';
import _orderBy from 'lodash/orderBy';
import { Period } from '@synthetixio/queries/build/node/src/constants';

import { ChartTitle, SnxTooltip } from 'components/common';
import colors from 'styles/colors';
import { formatCurrency } from 'utils/formatter';

import Image from 'next/image';

import CircleIcon from 'assets/svg/circle';
import { SNXJSContext } from 'pages/_app';
import { MAX_PAGE_WIDTH } from 'constants/styles';
import { useGeneralTradingInfoQuery } from 'queries/trading';
import { useSnxjsContractQuery } from 'queries/shared/useSnxjsContractQuery';

export type SynthVolumeStatus = {
	key: string;
	lastDayVolume: number;
	suspensionReason: number | null;
};

export type SynthsVolumeMatrixProps = {
	synthsTotalSupply: SynthsTotalSupplyData;
};

const SynthsVolumeMatrix: FC<SynthsVolumeMatrixProps> = ({ synthsTotalSupply }) => {
	const { t } = useTranslation();
	const snxjs = useContext(SNXJSContext);
	const { useTokenListQuery } = useSynthetixQueries();
	const tokenList = useTokenListQuery('https://synths.snx.eth.link');
	const synthTradesRequest = useGeneralTradingInfoQuery(Period.ONE_DAY);
	const synthFrozenRequest = useSnxjsContractQuery<any>(snxjs, 'SynthUtil', 'frozenSynths', []);
	const synthTotalSupplies: string[] = synthsTotalSupply?.synthTotalSupplies[0];
	const synthStatusesRequest = useSnxjsContractQuery<any>(
		snxjs,
		'SystemStatus',
		'getSynthSuspensions',
		[synthTotalSupplies ?? []]
	);

	let synthsVolumeData: SynthVolumeStatus[] = [];

	if (
		synthStatusesRequest.isSuccess &&
		synthFrozenRequest.isSuccess &&
		synthTradesRequest.isSuccess
	) {
		const aggregatedSynthVolume = aggregateSynthTradeVolume(synthTradesRequest.data!.exchanges);
		const suspendedSynths = synthStatusesRequest.data!;
		const frozenSynthKeys = synthFrozenRequest.data!;

		synthsVolumeData = synthTotalSupplies.map((currencyKey: string, idx: number) => ({
			key: snxjs.utils.parseBytes32String(currencyKey),
			lastDayVolume: aggregatedSynthVolume[currencyKey] || 0,
			suspensionReason:
				suspendedSynths[1][idx].toNumber() || (frozenSynthKeys.indexOf(currencyKey) !== -1 ? 4 : 0),
		}));
	}

	synthsVolumeData = _orderBy(synthsVolumeData, 'lastDayVolume', 'desc');

	const GreenLight = () => <CircleIcon fill={colors.brightGreen} width={10} height={10} />;
	const PinkLight = () => <CircleIcon fill={colors.brightPink} width={10} height={10} />;
	const OrangeLight = () => <CircleIcon fill={colors.brightOrange} width={10} height={10} />;

	return (
		<SynthsVolumeMatrixContainer>
			<VolumeMatrixHeader>
				<ChartTitle>{t('synth-volume-matrix.title')}</ChartTitle>
				<VolumeMatrixLegend>
					<VolumeMatrixLegendItem color={colors.brightGreen}>
						<GreenLight />
						{t('synth-volume-matrix.status.live')}
					</VolumeMatrixLegendItem>
					<VolumeMatrixLegendItem color={colors.brightOrange}>
						<OrangeLight />
						{t('synth-volume-matrix.status.paused')}
					</VolumeMatrixLegendItem>
					<VolumeMatrixLegendItem color={colors.brightPink}>
						<PinkLight />
						{t('synth-volume-matrix.status.frozen')}
					</VolumeMatrixLegendItem>
				</VolumeMatrixLegend>
			</VolumeMatrixHeader>
			<VolumeMatrix>
				{synthsVolumeData.map((info) => (
					<SynthInfoContainer key={info.key}>
						{tokenList.isSuccess && (
							<Image
								src={tokenList.data!.tokensMap[info.key].logoURI}
								width={24}
								height={24}
								alt=""
							/>
						)}
						<TokenName>{info.key}</TokenName>
						<VolumeNumber>{formatCurrency(info.lastDayVolume)}</VolumeNumber>
						{info.suspensionReason && info.suspensionReason > 0 ? (
							<SnxTooltip
								arrow
								placement="top"
								title={
									snxjs.suspensionReasons[info.suspensionReason]
										? (t('synths-status.suspension-with-reason', {
												reason: snxjs.suspensionReasons[info.suspensionReason],
										  }) as string)
										: (t('synths-status.suspension') as string)
								}
							>
								{info.suspensionReason === 4 ? <PinkLight /> : <OrangeLight />}
							</SnxTooltip>
						) : (
							<GreenLight />
						)}
					</SynthInfoContainer>
				))}
			</VolumeMatrix>
		</SynthsVolumeMatrixContainer>
	);
};

function aggregateSynthTradeVolume(trades: any[]) {
	const synthVolumes: { [currencyKey: string]: number } = {};

	for (const trade of trades) {
		synthVolumes[_padEnd(trade.fromCurrencyKeyBytes, 66, '0')] =
			(synthVolumes[trade.fromCurrencyKeyBytes] || 0) + trade.fromAmountInUSD;
		synthVolumes[_padEnd(trade.toCurrencyKeyBytes, 66, '0')] =
			(synthVolumes[trade.toCurrencyKeyBytes] || 0) + trade.toAmountInUSD;
	}

	return synthVolumes;
}

const SynthsVolumeMatrixContainer = styled.div`
	background: ${(props) => props.theme.colors.mediumBlue};
	width: 100%;
	margin-left: auto;
	margin-right: auto;
	max-width: ${MAX_PAGE_WIDTH}px;
`;

const VolumeMatrixHeader = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
`;

const VolumeMatrixLegend = styled.div`
	display: flex;
	padding-top: 30px;
	margin-right: 10px;
`;

const VolumeMatrixLegendItem = styled.div`
	display: flex;
	font-family: ${(props) => props.theme.fonts.condensedBold};
	color: ${(props) => props.color};
	align-items: center;
	margin: 16px;

	> * {
		margin: 8px;
	}
`;

const VolumeMatrix = styled.div`
	display: flex;
	justify-content: flex-start;
	flex-wrap: wrap;
	margin: 8px;
	color: ${(props) => props.theme.colors.white};
`;

const TokenName = styled.div`
	font-family: ${(props) => props.theme.fonts.regular};
	font-weight: bold;
	flex-grow: 1;
	margin-left: 10px;
`;

const VolumeNumber = styled.div`
	margin: 0 10px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
`;

const SynthInfoContainer = styled.div`
	display: flex;
	justify-content: flex-end;
	align-items: center;
	width: 200px;
	padding: 12px;
	margin: 8px;
	border: 1px solid ${(props) => props.theme.colors.linedBlue};
`;

export default SynthsVolumeMatrix;

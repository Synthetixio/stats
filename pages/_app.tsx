import { createContext, FC, createRef, RefObject, useState } from 'react';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { ethers } from 'ethers';
import { QueryClientProvider, QueryClient, Query } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';

import { synthetix, Network } from '@synthetixio/js';
import { ThemeProvider as SCThemeProvider } from 'styled-components';
import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';

import { scTheme, muiTheme } from 'styles/theme';

import 'styles/index.css';
import '../i18n';

import Layout from 'sections/shared/Layout';
import { IconButton, Snackbar, withStyles } from '@material-ui/core';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { Alert } from '@material-ui/lab';
import colors from 'styles/colors';
import { SPIN360 } from 'constants/styles';

import MenuCloseIcon from 'assets/svg/menu-close';
import RefetchIcon from 'assets/svg/refetch';

export const headersAndScrollRef: { [key: string]: RefObject<unknown> } = {
	NETWORK: createRef(),
	STAKING: createRef(),
	TRADING: createRef(),
	'YIELD FARMING': createRef(),
	SYNTHS: createRef(),
	OPTIONS: createRef(),
};

const provider = new ethers.providers.InfuraProvider(
	'homestead',
	process.env.NEXT_PUBLIC_INFURA_KEY
);
export const ProviderContext = createContext(provider);

export const HeadersContext = createContext(headersAndScrollRef);

const queryClient = new QueryClient({
	defaultOptions: {
		queries: {
			retry: 0, // on failure, do not repeat the request
			refetchOnWindowFocus: false,
			refetchOnReconnect: false,
		},
	},
});

let checkInterval: any = null;

const snxjs = synthetix({ network: Network.Mainnet, provider });

export const SNXJSContext = createContext(snxjs);

const App: FC<AppProps> = ({ Component, pageProps }) => {
	const { t } = useTranslation();

	const [failedQueries, setFailedQueries] = useState<Query[]>([]);

	const [hadFailure, setHadFailure] = useState<boolean>(false);
	const [isLoadingFailed, setLoadingFailed] = useState<boolean>(false);

	const qc = queryClient.getQueryCache();

	const recheckQueries = () => {
		const allQueries = qc.findAll();

		const foundFailed = allQueries.filter((q) => {
			return q.state.status === 'error';
		});

		const currentLoadingFailed = !!failedQueries.find((q) => q.isFetching());

		// failed query objects are different so help react tell the difference
		if (failedQueries.length !== foundFailed.length) {
			setFailedQueries(foundFailed);
			setHadFailure(true);
		}

		setLoadingFailed(currentLoadingFailed);
	};

	if (checkInterval) clearInterval(checkInterval);
	checkInterval = setInterval(recheckQueries, 1000);

	const refetchFailedQueries = () => {
		setLoadingFailed(true);
		failedQueries.forEach((q) => q.fetch());
	};

	return (
		<>
			<Head>
				<link
					rel="apple-touch-icon-precomposed"
					sizes="57x57"
					href="/favicon/apple-touch-icon-57x57.png"
				/>
				<link
					rel="apple-touch-icon-precomposed"
					sizes="114x114"
					href="/favicon/apple-touch-icon-114x114.png"
				/>
				<link
					rel="apple-touch-icon-precomposed"
					sizes="72x72"
					href="/favicon/apple-touch-icon-72x72.png"
				/>
				<link
					rel="apple-touch-icon-precomposed"
					sizes="144x144"
					href="/favicon/apple-touch-icon-144x144.png"
				/>
				<link
					rel="apple-touch-icon-precomposed"
					sizes="60x60"
					href="/favicon/apple-touch-icon-60x60.png"
				/>
				<link
					rel="apple-touch-icon-precomposed"
					sizes="120x120"
					href="/favicon/apple-touch-icon-120x120.png"
				/>
				<link
					rel="apple-touch-icon-precomposed"
					sizes="76x76"
					href="/favicon/apple-touch-icon-76x76.png"
				/>
				<link
					rel="apple-touch-icon-precomposed"
					sizes="152x152"
					href="/favicon/apple-touch-icon-152x152.png"
				/>
				<link rel="icon" type="image/png" href="/favicon/favicon-196x196.png" sizes="196x196" />
				<link rel="icon" type="image/png" href="/favicon/favicon-96x96.png" sizes="96x96" />
				<link rel="icon" type="image/png" href="/favicon/favicon-32x32.png" sizes="32x32" />
				<link rel="icon" type="image/png" href="/favicon/favicon-16x16.png" sizes="16x16" />
				<link rel="icon" type="image/png" href="/favicon/favicon-128.png" sizes="128x128" />
				<meta name="application-name" content="&nbsp;" />
				<meta name="msapplication-TileColor" content="#08021E" />
				<meta name="msapplication-TileImage" content="/favicon/mstile-144x144.png" />
				<meta name="msapplication-square70x70logo" content="/favicon/mstile-70x70.png" />
				<meta name="msapplication-square150x150logo" content="/favicon/mstile-150x150.png" />
				<meta name="msapplication-wide310x150logo" content="/favicon/mstile-310x150.png" />
				<meta name="msapplication-square310x310logo" content="/favicon/mstile-310x310.png" />
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<meta name="description" content="Synthetix protocol statistics and network data" />
				<meta name="twitter:card" content="summary_large_image" />
				<meta name="twitter:site" content="@synthetix_io" />
				<meta name="twitter:creator" content="@synthetix_io" />
				{/* open graph */}
				<meta property="og:url" content="https://stats.synthetix.io/" />
				<meta property="og:type" content="website" />
				<meta property="og:title" content="Synthetix Stats" />
				<meta property="og:description" content="Synthetix protocol statistics and network data" />
				<meta property="og:image" content="/static/images/stats-social.jpeg" />
				<meta property="og:image:alt" content="Synthetix Stats" />
				<meta property="og:site_name" content="Synthetix Stats" />
				{/* twitter */}
				<meta name="twitter:image" content="/static/images/stats-social.jpeg" />
				<meta name="twitter:url" content="https://stats.synthetix.io" />
				<link rel="icon" href="/images/favicon.png" />
				<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Inter" />
			</Head>
			<SCThemeProvider theme={scTheme}>
				<MuiThemeProvider theme={muiTheme}>
					<QueryClientProvider client={queryClient}>
						<HeadersContext.Provider value={headersAndScrollRef}>
							<SNXJSContext.Provider value={snxjs}>
								<ProviderContext.Provider value={provider}>
									<Layout>
										<Component {...pageProps} />
									</Layout>
								</ProviderContext.Provider>
							</SNXJSContext.Provider>
						</HeadersContext.Provider>
						<Snackbar
							anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
							open={hadFailure}
							onClose={() => !failedQueries.length && setHadFailure(false)}
							key="load-failed"
						>
							{failedQueries.length ? (
								<SynthetixAlert severity="error" onClick={refetchFailedQueries}>
									<RefetchAlertContainer>
										<AlertCloseContainer>
											<RefetchIconButton onClick={() => setHadFailure(false)}>
												<MenuCloseIcon fill={colors.white} width={12} height={12} />
											</RefetchIconButton>
										</AlertCloseContainer>
										<div>
											<b>{t('uh-oh')}</b>
											<br />
											{t('load-failed')}
										</div>
										<RefetchIconButton>
											{isLoadingFailed ? <SpinningRefetchIcon /> : <RefetchIcon />}
										</RefetchIconButton>
									</RefetchAlertContainer>
								</SynthetixAlert>
							) : (
								<SynthetixAlert severity="success" onClick={() => setHadFailure(false)}>
									{t('load-success')}
								</SynthetixAlert>
							)}
						</Snackbar>
						<ReactQueryDevtools />
					</QueryClientProvider>
				</MuiThemeProvider>
			</SCThemeProvider>
		</>
	);
};

export default App;

const SynthetixAlert = withStyles(() => ({
	root: {
		color: colors.white,
		backgroundColor: (props: any) =>
			props.severity === 'error' ? colors.mutedBrightPink : colors.mutedBrightGreen,
		borderRadius: 0,
		borderColor: (props: any) =>
			props.severity === 'error' ? colors.brightPink : colors.brightGreen,
		borderWidth: '2px',
		borderStyle: 'solid',
		cursor: 'pointer',
		maxWidth: '250px',
		paddingTop: '10px',
		paddingBottom: '10px',
		paddingRight: '10px',
		paddingLeft: '10px',
	},
	icon: {
		display: 'none',
	},
}))(Alert);

const RefetchAlertContainer = styled.div`
	display: flex;
	justify-content: space-between;
	align-items: center;
`;

const AlertCloseContainer = styled.div`
	align-self: flex-start;
	margin-right: 20px;
	margin-top: -10px;
`;

const SpinningRefetchIcon = styled(RefetchIcon)`
	animation: ${SPIN360} 1s linear infinite;
`;

const RefetchIconButton = withStyles(() => ({
	root: {
		backgroundColor: colors.brightPink,
		padding: '6px',
		//width: '24px',
		//height: '24px'
	},
}))(IconButton);

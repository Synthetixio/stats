import { createContext, FC, createRef, useState, RefObject } from 'react';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { ethers } from 'ethers';
import { ReactQueryCacheProvider, QueryCache } from 'react-query';
import { ReactQueryDevtools } from 'react-query-devtools';

import { synthetix, Network } from '@synthetixio/js';
import { ThemeProvider as SCThemeProvider } from 'styled-components';
import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';

import { scTheme, muiTheme } from 'styles/theme';

import 'styles/index.css';
import '../i18n';

import Layout from 'sections/shared/Layout';

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

export const SUSDContext = createContext({
	sUSDPrice: null,
	setsUSDPrice: (num: number) => null,
});

export const SNXContext = createContext({
	SNXPrice: null,
	setSNXPrice: (num: number) => null,
	SNXStaked: null,
	setSNXStaked: (num: number) => null,
	issuanceRatio: null,
	setIssuanceRatio: (num: number) => null,
});

const queryCache = new QueryCache({
	defaultConfig: {
		queries: {
			retry: 1,
			cacheTime: Infinity,
		},
	},
});

const snxjs = synthetix({ network: Network.Mainnet, provider });

export const SNXJSContext = createContext(snxjs);

const App: FC<AppProps> = ({ Component, pageProps }) => {
	const [sUSDPrice, setsUSDPrice] = useState<number | null>(null);
	const [SNXPrice, setSNXPrice] = useState<number | null>(null);
	const [SNXStaked, setSNXStaked] = useState<number | null>(null);
	const [issuanceRatio, setIssuanceRatio] = useState<number | null>(null);

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
					<ReactQueryCacheProvider queryCache={queryCache}>
						<HeadersContext.Provider value={headersAndScrollRef}>
							<SNXJSContext.Provider value={snxjs}>
								<ProviderContext.Provider value={provider}>
									{/*
	                // @ts-ignore */}
									<SUSDContext.Provider value={{ sUSDPrice, setsUSDPrice }}>
										<SNXContext.Provider
											value={{
												// @ts-ignore
												SNXPrice,
												// @ts-ignore
												setSNXPrice,
												// @ts-ignore
												SNXStaked,
												// @ts-ignore
												setSNXStaked,
												// @ts-ignore
												issuanceRatio,
												// @ts-ignore
												setIssuanceRatio,
											}}
										>
											<Layout>
												<Component {...pageProps} />
											</Layout>
										</SNXContext.Provider>
									</SUSDContext.Provider>
								</ProviderContext.Provider>
							</SNXJSContext.Provider>
						</HeadersContext.Provider>
						<ReactQueryDevtools />
					</ReactQueryCacheProvider>
				</MuiThemeProvider>
			</SCThemeProvider>
		</>
	);
};

export default App;

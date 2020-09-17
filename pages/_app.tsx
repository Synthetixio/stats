import { createContext, FC, createRef, useState } from 'react';
import { AppProps } from 'next/app';
import Head from 'next/head';
import { ethers } from 'ethers';
import { useTranslation } from 'react-i18next';

import { synthetix, Network } from '@synthetixio/js';
import { ThemeProvider as SCThemeProvider } from 'styled-components';
import { ThemeProvider as MuiThemeProvider } from '@material-ui/core/styles';

import { scTheme, muiTheme } from 'styles/theme';

import 'styles/index.css';
import '../i18n';

import Layout from 'sections/shared/Layout';

const headersAndScrollRef = {
	NETWORK: createRef(),
	STAKING: createRef(),
	'YIELD FARMING': createRef(),
	SYNTHS: createRef(),
	TRADING: createRef(),
	OPTIONS: createRef(),
};

const provider = new ethers.providers.InfuraProvider('homestead', process.env.INFURA_KEY);
export const ProviderContext = createContext(provider);

export const HeadersContext = createContext(headersAndScrollRef);

export const SUSDContext = createContext({
	sUSDPrice: 0,
	setsUSDPrice: (num: number) => null,
});

export const SNXContext = createContext({
	SNXPrice: 0,
	setSNXPrice: (num: number) => null,
	SNXStaked: 0,
	setSNXStaked: (num: number) => null,
});

const snxjs = synthetix({ network: Network.Mainnet, provider });

export const SNXJSContext = createContext(snxjs);

const App: FC<AppProps> = ({ Component, pageProps }) => {
	const { t } = useTranslation();
	const [sUSDPrice, setsUSDPrice] = useState<number>(0);
	const [SNXPrice, setSNXPrice] = useState<number>(0);
	const [SNXStaked, setSNXStaked] = useState<number>(0);

	return (
		<>
			<Head>
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
				<meta property="og:image" content="/images/synthetix.png" />
				<meta property="og:image:alt" content="Synthetix Stats" />
				<meta property="og:site_name" content="Synthetix Stats" />
				{/* twitter */}
				<meta name="twitter:image" content="/images/synthetix.png" />
				<meta name="twitter:url" content="https://stats.synthetix.io" />
				<link rel="icon" href="/images/favicon.png" />
				<link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Inter" />
			</Head>
			<SCThemeProvider theme={scTheme}>
				<MuiThemeProvider theme={muiTheme}>
					<HeadersContext.Provider value={headersAndScrollRef}>
						<SNXJSContext.Provider value={snxjs}>
							<ProviderContext.Provider value={provider}>
								{/*
	              // @ts-ignore */}
								<SUSDContext.Provider value={{ sUSDPrice, setsUSDPrice }}>
									{/*
									// @ts-ignore */}
									<SNXContext.Provider value={{ SNXPrice, setSNXPrice, SNXStaked, setSNXStaked }}>
										<Layout>
											<Component {...pageProps} />
										</Layout>
									</SNXContext.Provider>
								</SUSDContext.Provider>
							</ProviderContext.Provider>
						</SNXJSContext.Provider>
					</HeadersContext.Provider>
				</MuiThemeProvider>
			</SCThemeProvider>
		</>
	);
};

export default App;

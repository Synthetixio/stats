import React, { FC, useContext } from 'react';
import Head from 'next/head';

import SnxSection from 'sections/Network';
import TradingSection from 'sections/Trading';
import SynthsSection from 'sections/Synths';
import OptionsSection from 'sections/Options';
import StakingSection from 'sections/Staking';
import YieldFarmingSection from 'sections/YieldFarming';
import { HeadersContext } from './_app';

const HomePage: FC = () => {
	const headersContext = useContext(HeadersContext);

	return (
		<>
			<Head>
				<title>Stats</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<div ref={headersContext.NETWORK as React.RefObject<HTMLDivElement>}>
				<SnxSection />
			</div>
			<div ref={headersContext.STAKING as React.RefObject<HTMLDivElement>}>
				<StakingSection />
			</div>
			<div ref={headersContext.TRADING as React.RefObject<HTMLDivElement>}>
				<TradingSection />
			</div>
			<div ref={headersContext['YIELD FARMING'] as React.RefObject<HTMLDivElement>}>
				<YieldFarmingSection />
			</div>
			<div ref={headersContext.SYNTHS as React.RefObject<HTMLDivElement>}>
				<SynthsSection l2={false} />
			</div>
			<div ref={headersContext.OPTIONS as React.RefObject<HTMLDivElement>}>
				<OptionsSection />
			</div>
			<div ref={headersContext.L2 as React.RefObject<HTMLDivElement>}>
				<SynthsSection l2={true} />
			</div>
		</>
	);
};

export default HomePage;

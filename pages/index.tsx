import React, { FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';

import SnxSection from 'sections/Network';
import TradingSection from 'sections/Trading';
import SynthsSection from 'sections/Synth';
import OptionsSection from 'sections/Options';
import StakingSection from 'sections/Staking';
import YieldFarmingSection from 'sections/YieldFarming';
import { HeadersContext } from './_app';

const HomePage: FC = () => {
	const { t } = useTranslation();
	const headersContext = useContext(HeadersContext);

	return (
		<>
			<div ref={headersContext.NETWORK as React.RefObject<HTMLDivElement>}>
				<SnxSection />
			</div>
			<div ref={headersContext.STAKING as React.RefObject<HTMLDivElement>}>
				<StakingSection />
			</div>
			<div ref={headersContext['YIELD FARMING'] as React.RefObject<HTMLDivElement>}>
				<YieldFarmingSection />
			</div>
			<div ref={headersContext.SYNTHS as React.RefObject<HTMLDivElement>}>
				<SynthsSection />
			</div>
			<div ref={headersContext.TRADING as React.RefObject<HTMLDivElement>}>
				<TradingSection />
			</div>
			<div ref={headersContext.OPTIONS as React.RefObject<HTMLDivElement>}>
				<OptionsSection />
			</div>
		</>
	);
};

export default HomePage;

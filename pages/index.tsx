import React, { FC, useContext } from 'react';
import { useTranslation } from 'react-i18next';

import SNXSection from '../sections/Network/index';
import SYNTHSSection from '../sections/SYNTHS/index';
import { HeadersContext } from './_app';

const HomePage: FC = () => {
	const { t } = useTranslation();
	const headersContext = useContext(HeadersContext);

	return (
		<>
			<div ref={headersContext.NETWORK as React.RefObject<HTMLDivElement>}>
				<SNXSection />
			</div>
			<div ref={headersContext.STAKING as React.RefObject<HTMLDivElement>}>
				<div />
			</div>
			<div ref={headersContext['YIELD FARMING'] as React.RefObject<HTMLDivElement>}>
				<div />
			</div>
			<div ref={headersContext.SYNTHS as React.RefObject<HTMLDivElement>}>
				<SYNTHSSection />
			</div>
			<div ref={headersContext.EXCHANGE as React.RefObject<HTMLDivElement>}>
				<div />
			</div>
			<div ref={headersContext.OPTIONS as React.RefObject<HTMLDivElement>}>
				<div />
			</div>
		</>
	);
};

export default HomePage;

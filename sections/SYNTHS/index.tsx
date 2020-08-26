import { FC } from 'react';
import SidewaysBarChart from '../../components/Charts/SidewaysBarChart';

const SynthsSection: FC<{}> = () => {
	const data = {
		ETH: {
			sETH: 1000,
			iETH: 50,
		},
		LTC: {
			sLTC: 20,
			iLTC: 200,
		},
		ETC: {
			sETC: 30000,
			iETC: 100,
		},
	};
	return <SidewaysBarChart data={data} />;
};

export default SynthsSection;

import { FC } from 'react';
import { format } from 'date-fns';

import StatsBox from '../../components/StatsBox';
import StatsRow from '../../components/StatsRow';
import AreaChart from '../../components/Charts/AreaChart';
import SectionHeader from '../../components/SectionHeader';
import Cross from '../../assets/svg/cross.svg';

const SUSDSection: FC = () => {
	const data = [...Array(120).keys()].map((num: number) => {
		const created = format(new Date(), 'MM/dd');
		return {
			name: 'Random data',
			price: 1 + (Math.random() * num) / 1000,
			created,
		};
	});
	const periods = ['D', 'W', 'M', 'Y'];
	return (
		<>
			<SectionHeader icon={<Cross />} title="sUSD" subtitle="(something)" />
			<StatsRow>
				<StatsBox
					title="Staking APY"
					number={10}
					percentChange={0.24}
					subText="Lorem ipsum dolor sit amet consectetur adipsing"
					color="pink"
					numberStyle="percent"
				/>
				<StatsBox
					title="Staking APY"
					number={10}
					percentChange={0.24}
					subText="Lorem ipsum dolor sit amet consectetur adipsing"
					color="green"
					numberStyle="percent"
				/>
				<StatsBox
					title="Staking APY"
					number={10}
					percentChange={0.24}
					subText="Lorem ipsum dolor sit amet consectetur adipsing"
					color="green"
					numberStyle="percent"
				/>
				<StatsBox
					title="Staking APY"
					number={10}
					percentChange={0.24}
					subText="Lorem ipsum dolor sit amet consectetur adipsing"
					color="green"
					numberStyle="percent"
				/>
			</StatsRow>
			<AreaChart
				periods={periods}
				data={data}
				title="SUSD Price"
				num={1}
				numFormat="currency"
				percentChange={0.02}
			/>
		</>
	);
};

export default SUSDSection;

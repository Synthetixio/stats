import { FC } from 'react';
import StatsBox from '../../components/StatsBox';
import StatsRow from '../../components/StatsRow';
import SectionHeader from '../../components/SectionHeader';
import Cross from '../../assets/svg/cross.svg';

const SNXSection: FC = () => (
	<>
		<SectionHeader icon={<Cross />} title="SNX" subtitle="(something)" />
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
	</>
);

export default SNXSection;

import { FC } from 'react';
import styled from 'styled-components';

type StatsRowProps = {
	children: React.ReactNode;
};

const StatsRow: FC<StatsRowProps> = ({ children }) => (
	<>
		<StatsRowContainer>{children}</StatsRowContainer>
	</>
);

export default StatsRow;

const StatsRowContainer = styled.div`
	display: flex;
	max-width: 1226px;
	justify-content: space-between;
	margin: 0 auto;
	flex-wrap: wrap;
`;

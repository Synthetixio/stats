import { FC } from 'react';
import styled from 'styled-components';

import { MAX_PAGE_WIDTH } from '../constants/styles';

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
	max-width: ${MAX_PAGE_WIDTH}px;
	justify-content: space-between;
	margin: 0px auto;
	flex-wrap: wrap;
`;

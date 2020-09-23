import { FC } from 'react';
import styled from 'styled-components';

import { MAX_PAGE_WIDTH } from 'constants/styles';

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

export const StatsRowEmptySpace: FC<StatsRowProps> = ({ children }) => (
	<>
		<StatsRowEmptySpaceContainer>{children}</StatsRowEmptySpaceContainer>
	</>
);

const StatsRowEmptySpaceContainer = styled.div`
	display: flex;
	max-width: ${MAX_PAGE_WIDTH}px;
	margin: 0px auto;
	flex-wrap: wrap;
	@media only screen and (min-width: 1016px) {
		div {
			margin-right: 20px;
		}
	}
	@media only screen and (max-width: 1015px) {
		div {
			width: 100%;
		}
	}
`;

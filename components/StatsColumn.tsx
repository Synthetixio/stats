import { FC } from 'react';
import styled from 'styled-components';

type StatsColumnProps = {
	children: React.ReactNode;
};

const StatsColumn: FC<StatsColumnProps> = ({ children }) => (
	<>
		<StatsColumnContainer>{children}</StatsColumnContainer>
	</>
);

export default StatsColumn;

const StatsColumnContainer = styled.div`
	display: flex;
	flex-direction: column;
	width: 49%;
	justify-content: space-between;
	flex-wrap: wrap;
	@media only screen and (max-width: 1015px) {
		width: 100%;
	}
`;

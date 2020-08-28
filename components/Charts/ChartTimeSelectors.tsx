import { FC } from 'react';
import styled from 'styled-components';

import { Z_INDEX } from '../../constants/styles';
import { ChartPeriod } from '../../types/data';

interface ChartTimeSelectorsProps {
	periods: Array<ChartPeriod>;
	onClick: (period: ChartPeriod) => void;
}

const ChartTimeSelectors: FC<ChartTimeSelectorsProps> = ({ onClick, periods }) => {
	return (
		<SelectorContainer>
			{periods.map((period: ChartPeriod) => (
				<SelectorItem key={period} onClick={() => onClick(period)}>
					{period}
				</SelectorItem>
			))}
		</SelectorContainer>
	);
};

const SelectorContainer = styled.div`
	padding-right: 40px;
	display: flex;
	justify-content: space-between;
	width: 200px;
	z-index: ${Z_INDEX.hundred};
`;

const SelectorItem = styled.div`
	cursor: pointer;
	height: 25px;
	width: 25px;
	color: ${(props) => props.theme.colors.white};
`;

export default ChartTimeSelectors;

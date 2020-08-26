import { FC } from 'react';
import styled from 'styled-components';

import { Z_INDEX } from '../../constants/styles';

interface ChartTimeSelectorsProps {
	periods: Array<string>;
	onClick: (timePeriod: string) => void;
}

const ChartTimeSelectors: FC<ChartTimeSelectorsProps> = ({ onClick, periods }) => {
	return (
		<SelectorContainer>
			{periods.map((period: string) => (
				<SelectorItem key={period} onClick={() => onClick(period)}>
					{period}
				</SelectorItem>
			))}
		</SelectorContainer>
	);
};

const SelectorContainer = styled.div`
	display: flex;
	justify-content: space-between;
	position: absolute;
	width: 200px;
	right: 50px;
	top: 30px;
	z-index: ${Z_INDEX.hundred};
`;

const SelectorItem = styled.div`
	cursor: pointer;
	height: 25px;
	width: 25px;
	color: ${(props) => props.theme.colors.white};
`;

export default ChartTimeSelectors;

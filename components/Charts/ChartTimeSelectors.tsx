import { FC } from 'react';
import styled from 'styled-components';

import { Z_INDEX } from '../../constants/styles';
import { ChartPeriod } from '../../types/data';

interface ChartTimeSelectorsProps {
	periods: Array<ChartPeriod>;
	onClick: (period: ChartPeriod) => void;
	activePeriod: ChartPeriod;
}

const ChartTimeSelectors: FC<ChartTimeSelectorsProps> = ({ onClick, periods, activePeriod }) => {
	return (
		<SelectorContainer>
			{periods.map((period: ChartPeriod) => (
				<SelectorItem
					isActive={period === activePeriod}
					key={period}
					onClick={() => onClick(period)}
				>
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
	@media only screen and (max-width: 500px) {
		padding-right: 5px;
		width: 140px;
	}
`;

const SelectorItem = styled.div<{ isActive: boolean }>`
	cursor: pointer;
	height: 25px;
	width: 25px;
	font-size: 12px;
	color: ${(props) => (props.isActive ? props.theme.colors.white : props.theme.colors.gray)};
	font-family: ${(props) => `${props.theme.fonts.condensedBold}, ${props.theme.fonts.regular}`};
`;

export default ChartTimeSelectors;

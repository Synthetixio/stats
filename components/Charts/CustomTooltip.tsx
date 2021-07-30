import { FC } from 'react';
import styled from 'styled-components';

const CustomTooltip: FC<{
	active: boolean;
	payload: [
		{
			name: string;
			value: number;
			payload: any;
		}
	];
	formatter: FC<{ name: string; value: number; payload: any }>;
}> = ({ active, payload, formatter }) => {
	if (!(active && payload?.length)) return null;
	const [item] = payload;
	return (
		<TooltipContentStyle>
			{formatter({ name: item.name, value: item.value, payload: item.payload })}
		</TooltipContentStyle>
	);
};

const TooltipContentStyle = styled.div`
	background: ${(props) => props.theme.colors.tooltipBlue};
	font-family: ${(props) => props.theme.fonts.expanded};
	font-size: 12px;
	padding: 10px 15px;
	border-radius: 5px;
`;

export default CustomTooltip;

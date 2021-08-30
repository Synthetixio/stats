import { NetworkId } from '@synthetixio/contracts-interface';
import { useNetwork } from 'contexts/Network';
import { FC, useState } from 'react';
import styled from 'styled-components';

const LAYERS = [
	{
		name: 'L1',
		networkId: NetworkId.Mainnet,
	},
	{
		name: 'L2',
		networkId: NetworkId['Mainnet-Ovm'],
	},
];

const LayerToggler: FC = () => {
	const { networkId, toggleNetwork } = useNetwork();

	return (
		<Container>
			{LAYERS.map((layer) => (
				<ToggleButton
					key={layer.networkId}
					active={layer.networkId === networkId}
					onClick={() => toggleNetwork()}
				>
					{layer.name}
				</ToggleButton>
			))}
		</Container>
	);
};

const Container = styled.div`
	display: flex;
	margin-left: 100px;
`;

const RADIO_BUTTON_RADIUS = 4;

const ToggleButton = styled.div<{ active: boolean }>`
	display: flex;
	align-items: center;
	justify-content: center;
	height: 20px;
	width: 40px;
	background: ${(props) =>
		props.active ? props.theme.colors.brightBlue : props.theme.colors.black};
	color: ${(props) => (props.active ? props.theme.colors.black : props.theme.colors.white)};
	cursor: pointer;
	border: 1px solid ${(props) => props.theme.colors.brightBlue};
	font-size: 12px;

	&:first-child {
		border-top-left-radius: ${RADIO_BUTTON_RADIUS}px;
		border-bottom-left-radius: ${RADIO_BUTTON_RADIUS}px;
	}

	&:last-child {
		border-top-right-radius: ${RADIO_BUTTON_RADIUS}px;
		border-bottom-right-radius: ${RADIO_BUTTON_RADIUS}px;
	}

	&:hover {
		opacity: 0.8;
	}
`;

export default LayerToggler;

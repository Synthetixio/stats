import { FC } from 'react';
import styled, { createGlobalStyle } from 'styled-components';

import Header from './Header';

type LayoutProps = {
	children: React.ReactNode;
};
export const IN_MAINTENANCE = true;

const Layout: FC<LayoutProps> = ({ children }) => {
	return (
		<>
			<GlobalStyle />
			{IN_MAINTENANCE ? '' : <Header />}
			{IN_MAINTENANCE ? (
				<MaintenanceWrapper>
					<h2>Maintenance Mode</h2>
					<p>Data is out of date and a new version is coming soon.</p>
					<p>
						See the debt pool on{' '}
						<a href="https://staking.synthetix.io/debt">https://staking.synthetix.io/debt</a>{' '}
					</p>
				</MaintenanceWrapper>
			) : (
				<section>{children}</section>
			)}
		</>
	);
};

const GlobalStyle = createGlobalStyle`
  body {
		margin: 0 20px;
		scroll-behavior: smooth;
		font-family: "GT America Mono", sans-serif;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 18px;
		/* identical to box height, or 129% */

		background-color: ${(props) => props.theme.colors.darkBlue};
		color: ${(props) => props.theme.colors.lightFont};

		.stats-box-skeleton, .chart-skeleton, .liquidations-skeleton {
			background-color: ${(props) => props.theme.colors.mediumBlue};
		}

		.chart-skeleton {
			margin-top: -100px;
		}

		.stats-box-skeleton::after, .chart-skeleton::after, .liquidations-skeleton::after {
			background: linear-gradient(90deg, #08021E 0%, #120446 146.21%);
		}

		/* Let's get this party started */
		*::-webkit-scrollbar, ::-webkit-scrollbar {
				width: 8px;
				height: 8px;
		}
		
		/* Track */
		*::-webkit-scrollbar-track, ::-webkit-scrollbar-track {
				-webkit-box-shadow: inset 0 0 10px ${(props) => props.theme.colors.darkBlue}; 
				box-shadow: inset 0 0 10px ${(props) => props.theme.colors.darkBlue}; 
				-webkit-border-radius: 10px;
				border-radius: 10px;
				width: 8px;
				height: 8px;
				background: ${(props) => props.theme.colors.darkBlue};
		}
		
		/* Handle */
		*::-webkit-scrollbar-thumb, ::-webkit-scrollbar-thumb {
				-webkit-border-radius: 10px;
				border-radius: 10px;
				background: ${(props) => props.theme.colors.mutedBrightPink}; 
				width: 8px;
				height: 8px;
				-webkit-box-shadow: inset 0 0 10px ${(props) => props.theme.colors.mutedBrightPink}; 
				box-shadow: inset 0 0 10px ${(props) => props.theme.colors.mutedBrightPink}; 
		}
		*::-webkit-scrollbar-thumb:window-inactive, ::-webkit-scrollbar-thumb:window-inactive {
			background: ${(props) => props.theme.colors.brightPink};
			width: 8px;
			height: 8px;
		}

		svg.recharts-surface tspan {
			font-size: 10px !important;
		}

		.MuiPopover-paper {
			width: 250px;
			color: ${(props) => props.theme.colors.white};
			background-color: ${(props) => props.theme.colors.tooltipBlue};
			padding: 15px;
			font-family: 'Inter', sans-serif;
			font-size: 14px;
			line-height: 18px;
			text-align: center;
		}

		.MuiTypography-colorPrimary {
			color: ${(props) => props.theme.colors.brightBlue};
		}
		.MuiTypography-root {
			margin: 10px 0;
		}
  }
`;
const MaintenanceWrapper = styled.div`
	width: 100%;
	height: 100vh;
	display: flex;
	justify-content: center;
	align-items: center;
	flex-direction: column;
`;

export default Layout;

import { FC } from 'react';
import { createGlobalStyle } from 'styled-components';

import Header from './Header';
import Footer from './Footer';

type LayoutProps = {
	children: React.ReactNode;
};

const Layout: FC<LayoutProps> = ({ children }) => {
	return (
		<>
			<GlobalStyle />
			<Header />
			<section>{children}</section>
			<Footer />
		</>
	);
};

const GlobalStyle = createGlobalStyle`
  body {
		margin: 0;
		font-family: Inter;
    font-style: normal;
    font-weight: normal;
    font-size: 14px;
    line-height: 18px;
    /* identical to box height, or 129% */


color: ;
		background-color: ${(props) => props.theme.colors.darkBlue};
		color: ${(props) => props.theme.colors.lightFont};
  }
`;

export default Layout;

import { FC } from 'react';
import styled from 'styled-components';
import Cross from '../../../assets/svg/cross.svg';

// TODO use translation
const Header: FC = () => {
	return (
		<>
			<HeaderContainer>
				<HeaderSectionLeft>
					<Cross />
					<HeaderTitle>Stats</HeaderTitle>
				</HeaderSectionLeft>
				<HeaderSectionRight>
					<HeaderLink>SNX</HeaderLink>
					<HeaderLink>SUSD</HeaderLink>
					<HeaderLink>SYNTHS</HeaderLink>
					<HeaderLink>STAKING</HeaderLink>
					<HeaderLink>EXCHANGES</HeaderLink>
					<HeaderLink>BINARY OPTIONS</HeaderLink>
				</HeaderSectionRight>
			</HeaderContainer>
			<Divider />
		</>
	);
};

export default Header;

// TODO create a common flex container
// TODO put 1226 in a shared variable
const HeaderContainer = styled.div`
	width: 1226px;
	height: 60px;
	padding-top: 30px;
	margin: 0 auto;
`;

const HeaderTitle = styled.div`
	font-size: 35px;
	font-weigth: bold;
	margin-left: 15px;
`;

const HeaderSectionLeft = styled.div`
	width: 300px;
	float: left;
	display: flex;
	justify-content; space-between;
`;

const HeaderSectionRight = styled.div`
	float: right;
	display: flex;
	justify-content; space-between;
`;

const HeaderLink = styled.div`
	margin-left: 25px;
	cursor: pointer;
`;

const Divider = styled.div`
	background: ${(props) => props.theme.colors.white};
	opacity: 0.1;
	width: 100%;
	height: 1px;
`;

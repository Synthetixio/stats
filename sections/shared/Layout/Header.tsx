import { FC, useContext } from 'react';
import styled from 'styled-components';

import StatsLogo from '../../../assets/svg/stats-logo.svg';
import { MAX_PAGE_WIDTH, Z_INDEX } from '../../../constants/styles';
import { HeadersContext } from '../../../pages/_app';

// TODO use translation
const Header: FC = () => {
	const headersContext = useContext(HeadersContext);
	const scrollToRef = (ref: any) => {
		const offsetTop = ref?.current?.offsetTop ?? 0;
		const scrollEnd = offsetTop === 0 ? 0 : offsetTop - 120;
		window.scrollTo(0, scrollEnd);
	};
	return (
		<>
			<HeaderContainer>
				<HeaderContainerInner>
					<HeaderSectionLeft>
						<StatsLogoWrap>
							<StatsLogo />
						</StatsLogoWrap>
					</HeaderSectionLeft>
					<HeaderSectionRight>
						{Object.entries(headersContext).map(([key, value]) => (
							<HeaderLink key={key} onClick={() => scrollToRef(value)}>
								{key}
							</HeaderLink>
						))}
					</HeaderSectionRight>
				</HeaderContainerInner>
			</HeaderContainer>
			<Divider />
		</>
	);
};

export default Header;

// TODO create a common flex container
const HeaderContainer = styled.div`
	height: 60px;
	padding-top: 35px;
	position: fixed;
	font-style: normal;
	font-weight: bold;
	width: 100%;
	margin-left: -20px;
	z-index: ${Z_INDEX.thousand};
	background-color: ${(props) => props.theme.colors.darkBlue};
	@media only screen and (max-width: 1266px) {
		margin-left: 0;
	}
`;

const HeaderContainerInner = styled.div`
	max-width: ${MAX_PAGE_WIDTH}px;
	margin: 0 auto;
	display: flex;
	justify-content: space-between;
	@media only screen and (max-width: 1266px) {
		max-width: calc(100% - 40px);
		margin: 0;
	}
`;

const StatsLogoWrap = styled.div`
	margin-top: -4px;
`;

const HeaderSectionLeft = styled.div`
	display: flex;
	justify-content; space-between;
`;

const HeaderSectionRight = styled.div`
	display: flex;
	justify-content; space-between;
	font-family: ${(props) => `${props.theme.fonts.condensedBold}, ${props.theme.fonts.regular}`};
	font-size: 12px;
	color: ${(props) => props.theme.colors.white};
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

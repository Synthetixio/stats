import { FC, useContext } from 'react';
import styled from 'styled-components';

import SNXLogo from '../../../assets/svg/snxlogo.svg';
import { MAX_PAGE_WIDTH, Z_INDEX } from '../../../constants/styles';
import { HeadersContext } from '../../../pages/_app';

// TODO use translation
const Header: FC = () => {
	const headersContext = useContext(HeadersContext);
	const scrollToRef = (ref: any) => {
		const offsetTop = ref?.current?.offsetTop ?? 0;
		const scrollEnd = offsetTop === 0 ? 0 : offsetTop - 20;
		window.scrollTo(0, scrollEnd);
	};
	return (
		<>
			<HeaderContainer>
				<HeaderContainerInner>
					<HeaderSectionLeft>
						<SNXLogoWrap>
							<SNXLogo />
						</SNXLogoWrap>
						<HeaderTitle>Stats</HeaderTitle>
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
	width: 100%;
	z-index: ${Z_INDEX.thousand};
	background-color: ${(props) => props.theme.colors.darkBlue};
`;

const HeaderContainerInner = styled.div`
	width: ${MAX_PAGE_WIDTH}px;
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

const SNXLogoWrap = styled.div`
	margin-top: -7px;
	margin-right: 10px;
`;

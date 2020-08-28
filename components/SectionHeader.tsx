import { FC } from 'react';
import styled from 'styled-components';

import Button from './Button';
import { MAX_PAGE_WIDTH } from '../constants/styles';

type SectionHeaderProps = {
	title: string;
	first?: boolean;
};

const SectionHeader: FC<SectionHeaderProps> = ({ title, first }) => (
	<SectionHeaderContainer first={first}>{title}</SectionHeaderContainer>
);

export default SectionHeader;

const SectionHeaderContainer = styled.div<{ first?: boolean }>`
	max-width: ${MAX_PAGE_WIDTH}px;
	margin: ${(props) => (props.first ? '120px auto 20px auto' : '40px auto 20px auto')};
	font-style: normal;
	font-weight: 900;
	font-size: 28px;
	line-height: 120%;
`;

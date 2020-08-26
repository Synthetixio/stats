import { FC } from 'react';
import styled from 'styled-components';

import Button from './Button';
import { MAX_PAGE_WIDTH } from '../constants/styles';

type SectionHeaderProps = {
	icon?: JSX.Element;
	title: string;
	subtitle?: string;
};

const SectionHeader: FC<SectionHeaderProps> = ({ icon, title, subtitle }) => (
	<>
		<SectionHeaderContainer>
			<SectionHeaderLeft>
				{icon ? <div>{icon}</div> : null}
				<SectionTitle>{title}</SectionTitle>
				{subtitle ? <div>{subtitle}</div> : null}
			</SectionHeaderLeft>
			<SectionHeaderRight>
				<Button text="Price" isActive={true} />
				<Button text="Volume" isActive={false} />
			</SectionHeaderRight>
		</SectionHeaderContainer>
	</>
);

export default SectionHeader;

const SectionHeaderContainer = styled.div`
	display: flex;
	max-width: ${MAX_PAGE_WIDTH}px;
	justify-content: space-between;
	margin: 0 auto;
	flex-wrap: wrap;
	margin-top: 35px;
	margin-bottom: 15px;
`;

const SectionHeaderLeft = styled.div`
	display: flex;
	max-width: 300px;
	justify-content: space-between;
`;

const SectionHeaderRight = styled.div`
	display: flex;
	max-width: 200px;
	justify-content: space-between;
`;

const SectionTitle = styled.div`
	font-size: 25px;
	font-weight: bold;
	margin-left: 15px;
	margin-right: 15px;
`;

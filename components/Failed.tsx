import { FC } from 'react';
import styled from 'styled-components';
import Button from './Button';

interface FailedProps {
	refetchData: (noRetry: boolean) => void;
}

const Failed: FC<FailedProps> = ({ refetchData }) => (
	<FailedContainer>
		<div>Error fetching data</div>
		<Button onClick={() => refetchData(true)} text="Refetch" />
	</FailedContainer>
);

export default Failed;

const FailedContainer = styled.div`
	height: 100%;
	width: 100%;
	text-align: center;
	display: flex;
	flex-direction: column;
	justify-content: space-around;
	font-size: 20px;
`;

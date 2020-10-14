import { useState } from 'react';
import { FC, FunctionComponent } from 'react';
import styled from 'styled-components';
import Button from './Button';

type RetryProps = {
	isError: boolean;
	onRefetch: Function;
	children: React.ReactNode;
};

const Retry = ({ isError, onRefetch, children }: RetryProps) => {
	const [error, setError] = useState(true);
	return (
		<RetryContainer>
			{isError ? (
				<>
					<div>Error fetching data</div>
					<Button
						onClick={(e: any) => {
							onRefetch();
							setError(false);
						}}
						text="Refetch"
					/>
				</>
			) : (
				children
			)}
		</RetryContainer>
	);
};
export default Retry;

const RetryContainer = styled.div`
	height: 100%;
	width: 100%;
	text-align: center;
	display: flex;
	flex-direction: column;
	justify-content: space-around;
	font-size: 20px;
`;

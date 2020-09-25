import { FC } from 'react';
import styled from 'styled-components';
import CircularProgress from '@material-ui/core/CircularProgress';

const Retry: FC = () => (
	<RetryContainer>
		<div>Error fetching data: Retrying...</div>
		<CircularProgress />
	</RetryContainer>
);

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

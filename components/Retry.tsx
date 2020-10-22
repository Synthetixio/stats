import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import Button from './Button';

type RetryProps = {
	isFailedLoad: boolean;
	onRefetch: () => Promise<any>;
	children: React.ReactNode;
};

const Retry: FC<RetryProps> = ({ isFailedLoad, onRefetch, children }) => {
	const { t } = useTranslation();
	return (
		<RetryContainer>
			{isFailedLoad ? (
				<>
					<div>{t('homepage.retry.error')}</div>
					<Button onClick={() => onRefetch()} text="Refetch" />
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

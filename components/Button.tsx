import { FC } from 'react';
import styled from 'styled-components';

type ButtonProps = {
	text: string;
	onClick: () => void;
};

const Button: FC<ButtonProps> = ({ text, onClick }) => {
	return <ButtonContainer onClick={onClick}>{text}</ButtonContainer>;
};

export default Button;

const ButtonContainer = styled.button`
	background: ${(props) => props.theme.colors.brightBlue};

	box-shadow: 0px 0px 10px rgba(0, 209, 255, 0.9);
	border-radius: 4px;
	border: none;
	width: 63px;
	height: 25px;
	margin-left: 10px;

	font-style: normal;
	font-weight: bold;
	font-size: 12px;
	/* or 185% */

	text-align: center;
	text-transform: uppercase;
	cursor: pointer;

	color: ${(props) => props.theme.colors.black1};
`;

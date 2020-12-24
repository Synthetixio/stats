import { FC, useState, MouseEvent } from 'react';
import styled from 'styled-components';
import Popover from '@material-ui/core/Popover';

import InfoIcon from 'assets/svg/info.svg';

interface InfoPopoverProps {
	infoData: React.ReactNode;
	noPaddingTop?: boolean;
}

const InfoPopover: FC<InfoPopoverProps> = ({ infoData, noPaddingTop = false }) => {
	const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);

	const handleClick = (event: MouseEvent<any>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
	};

	const open = Boolean(anchorEl);
	const id = open ? 'simple-popover' : undefined;

	return (
		<PopoverContainer noPaddingTop={noPaddingTop}>
			<div aria-describedby={id} onClick={handleClick}>
				{/* 
				// @ts-ignore */}
				<InfoIcon width="13px" height="13px" />
			</div>
			<Popover
				id={id}
				open={open}
				anchorEl={anchorEl}
				onClose={handleClose}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'right',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'left',
				}}
			>
				{infoData}
			</Popover>
		</PopoverContainer>
	);
};

const PopoverContainer = styled.div<{ noPaddingTop: boolean }>`
	margin-left: 10px;
	margin-right: 20px;
	padding-top: ${(props) => (props.noPaddingTop ? '0' : '4px')};
	cursor: pointer;
`;

export default InfoPopover;

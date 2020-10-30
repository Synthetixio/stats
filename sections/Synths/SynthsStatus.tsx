import { FC, useContext } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import Tooltip from '@material-ui/core/Tooltip';
import { makeStyles } from '@material-ui/core/styles';
import colors from 'styles/colors';
import { SNXJSContext } from 'pages/_app';

import { MAX_PAGE_WIDTH } from 'constants/styles';
import { SynthStatusData } from 'types/data';

const useStyles = makeStyles(() => ({
	suspendedTooltip: {
		padding: 10,
		backgroundColor: colors.tooltipBlue,
		color: colors.white,
		fontSize: 12,
		fontFamily: `'Inter', sans-serif`,
	},
}));

type SynthsStatusProps = {
	data: SynthStatusData[];
};

const SynthsStatus: FC<SynthsStatusProps> = ({ data }) => {
	const { t } = useTranslation();
	const snxjs = useContext(SNXJSContext);
	const classes = useStyles();
	return (
		<SynthsStatusContainer>
			{data.map(({ synth, isSuspended, reason }, index) => (
				<SynthItem key={`${synth}-${index}`}>
					<SynthText>{synth}</SynthText>
					<>
						{isSuspended ? (
							<Tooltip
								title={
									snxjs.suspensionReasons[reason]
										? (t('homepage.synths-status.suspension-with-reason', {
												synth,
												reason: snxjs.suspensionReasons[reason],
										  }) as string)
										: (t('homepage.synths-status.suspension') as string)
								}
								classes={{ tooltip: classes.suspendedTooltip }}
							>
								<PinkCircle />
							</Tooltip>
						) : (
							<GreenCircle />
						)}
					</>
				</SynthItem>
			))}
		</SynthsStatusContainer>
	);
};

const SynthsStatusContainer = styled.div`
	max-width: ${MAX_PAGE_WIDTH}px;
	margin: 0 auto;
	display: grid;
	grid-gap: 10px;
	grid-template-columns: auto auto auto auto auto auto;
	@media only screen and (max-width: 768px) {
		grid-template-columns: auto auto auto;
	}
	background-color: ${(props) => props.theme.colors.mediumBlue};
	padding: 10px;
`;

const SynthItem = styled.div`
	display: flex;
	justify-content: space-around;
	background-color: ${(props) => props.theme.colors.darkBlue};
	border: 1px solid ${(props) => props.theme.colors.mutedBrightBlue};
	padding: 5px;
	border-radius: 2px;
	align-items: center;
`;

const SynthText = styled.div`
	width: 60px;
	font-size: 14px;
	font-family: ${(props) => `${props.theme.fonts.condensedMedium}, ${props.theme.fonts.regular}`};
`;

const Circle = styled.div`
	width: 14px;
	height: 14px;
	border-radius: 50%;
`;

const GreenCircle = styled(Circle)`
	background: ${(props) => props.theme.colors.brightGreen};
	box-shadow: 0 0 14px 1px ${(props) => props.theme.colors.brightGreen};
`;

const PinkCircle = styled(Circle)`
	background: ${(props) => props.theme.colors.brightPink};
	box-shadow: 0 0 14px 1px ${(props) => props.theme.colors.brightPink};
	cursor: pointer;
`;

export default SynthsStatus;

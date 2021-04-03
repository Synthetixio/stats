import React, { FC, useContext, useMemo } from 'react';
import ReactSelect, { Props, StylesConfig } from 'react-select';
import { ThemeContext } from 'styled-components';

const IndicatorSeparator: FC = () => null;

function Select<T>(props: Props<T>) {
	const { colors, fonts } = useContext(ThemeContext);

	const computedStyles = useMemo(() => {
		const styles: StylesConfig = {
			container: (provided, state) => ({
				...provided,
				opacity: state.isDisabled ? 0.4 : 1,
				backgroundColor: colors.mediumBlue,
				width: 200,
			}),
			singleValue: (provided) => ({
				...provided,
				color: colors.white,
				boxShadow: 'none',
				fontSize: '12px',
				border: 'none',
			}),
			control: (provided) => ({
				...provided,
				fontFamily: fonts.condensedBold,
				color: colors.white,
				cursor: 'pointer',
				boxShadow: '0 0 6px 0px ' + colors.darkBlue,
				border: `1px solid rgba(255, 255, 255, 0.1)`,
				borderRadius: 0,
				outline: 'none',
				minHeight: 'unset',
				height: 'unset',
				'&:hover': {
					border: `1px solid rgba(255, 255, 255, 0.1)`,
				},
				fontSize: '12px',
				paddingTop: '5px',
				paddingBottom: '5px',
				backgroundColor: colors.mediumBlue,
			}),
			menu: (provided) => ({
				...provided,
				backgroundColor: colors.mediumBlue,
				border: `1px solid rgba(255, 255, 255, 0.1)`,
				boxShadow: '0 0 6px 0px ' + colors.darkBlue,
				borderRadius: 0,
				padding: 0,
			}),
			menuList: (provided) => ({
				...provided,
				borderRadius: 0,
				padding: 0,
				textAlign: 'left',
			}),
			option: (provided) => ({
				...provided,
				fontFamily: fonts.condensedBold,
				color: colors.white,
				cursor: 'pointer',
				fontSize: '12px',
				backgroundColor: colors.mediumBlue,
				'&:hover': {
					backgroundColor: colors.linedBlue,
					color: colors.brightBlue,
				},
				padding: '6px 8px',
			}),
			placeholder: (provided) => ({
				...provided,
				fontSize: '12px',
				color: colors.white,
			}),
			dropdownIndicator: (provided, state) => ({
				...provided,
				color: state.selectProps.menuIsOpen ? colors.brightBlue : colors.white,
				transition: 'transform 0.2s ease-in-out',
				padding: '0 8px',
				transform: state.selectProps.menuIsOpen && 'rotate(180deg)',
				'&:hover': {
					color: state.selectProps.menuIsOpen ? colors.brightBlue : colors.white,
				},
			}),
		};
		return styles;
	}, [colors, fonts]);

	return (
		<ReactSelect
			styles={computedStyles}
			classNamePrefix="react-select"
			components={{ IndicatorSeparator }}
			{...props}
		/>
	);
}

export default Select;

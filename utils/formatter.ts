import BigNumber from 'bignumber.js';
import numbro from 'numbro';
import { NumberStyle } from '../constants/formatter';

const DEFAULT_CURRENCY_DECIMALS = 2;

export const toBigNumber = (value: number | string): BigNumber => new BigNumber(value);

export const formatCurrency = (
	value: string | number,
	decimals: number = DEFAULT_CURRENCY_DECIMALS
): string => {
	if (!value || !Number(value)) {
		return '0';
	}

	// always use dollars for now
	return (
		'$' +
		numbro(value).format({
			thousandSeparated: true,
			mantissa: Number.isInteger(value) ? 0 : decimals,
		})
	);
};

export const formatPercentage = (
	value: string | number,
	decimals = DEFAULT_CURRENCY_DECIMALS
): string => {
	return numbro(value).format({
		output: 'percent',
		mantissa: decimals,
	});
};

export const getFormattedNumber = (num: number, numFormat: NumberStyle) => {
	let formattedNum;
	if (numFormat === 'currency') {
		formattedNum = formatCurrency(num);
	} else if (numFormat === 'number') {
		formattedNum = num.toFixed(2);
	} else if (numFormat === 'percent') {
		formattedNum = formatPercentage(num);
	}
	return formattedNum;
};

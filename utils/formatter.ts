import BigNumber from 'bignumber.js';
import numbro from 'numbro';

import { NumberStyle } from '../constants/styles';
import { TimeSeries } from '../types/data';

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
	decimals: number = DEFAULT_CURRENCY_DECIMALS
): string => {
	return numbro(value).format({
		output: 'percent',
		mantissa: decimals,
	});
};

export const formatNumber = (num: number, mantissa: number = DEFAULT_CURRENCY_DECIMALS) =>
	numbro(num).format({ thousandSeparated: true, mantissa });

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

export const formatIdToIsoString = (id: string, timeSeries: TimeSeries) => {
	let multiple = 0;
	if (timeSeries === '1d') {
		multiple = 86400;
	} else if (timeSeries === '15m') {
		multiple = 900;
	}
	const created = new Date(Number(id) * multiple * 1000);
	return created.toISOString();
};

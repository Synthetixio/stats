import BigNumber from 'bignumber.js';
import numbro from 'numbro';
import { format } from 'date-fns';
import isNaN from 'lodash/isNaN';

import { NumberStyle } from '../constants/styles';
import { TimeSeries } from '../types/data';

const DEFAULT_CURRENCY_DECIMALS = 2;

export const toBigNumber = (value: number | string): BigNumber => new BigNumber(value);

export const formatCurrency = (
	value: string | number,
	decimals: number = DEFAULT_CURRENCY_DECIMALS
): string => {
	if (value !== 0 && !value) {
		return '$-.--';
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

export const formatNumber = (num: number, mantissa: number = 0) =>
	numbro(num).format({ thousandSeparated: true, mantissa });

export const getFormattedNumber = (num: number | null, numFormat: NumberStyle) => {
	if (num == null) {
		return null;
	}
	let formattedNum;
	if (numFormat === 'currency0') {
		formattedNum = formatCurrency(num, 0);
	} else if (numFormat === 'currency2') {
		formattedNum = formatCurrency(num, 2);
	} else if (numFormat === 'number') {
		formattedNum = formatNumber(num);
	} else if (numFormat === 'number4') {
		formattedNum = formatNumber(num, 4);
	} else if (numFormat === 'percent2') {
		formattedNum = formatPercentage(num);
	} else if (numFormat === 'percent0') {
		formattedNum = formatPercentage(num, 0);
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

export type TimeSeriesType = '15m' | '1d';

export const getTimeLength = (tst: TimeSeriesType): number => {
	switch (tst) {
		case '1d':
			return 86400;
		case '15m':
			return 900;
	}
};

export const formatTime = (created: string | number, type: TimeSeriesType) => {
	// hack for if timestamp might be in seconds
	let date = new Date(created);
	if (isNaN(date.getFullYear())) {
		date = new Date(Number(created) * 1000);
	}
	if (type === '15m') {
		return format(date, 'HH:00');
	} else if (type === '1d') {
		return format(date, 'MM/dd');
	}
	throw new Error('unrecognized time to format');
};

export const formatDate = (created: string) => format(new Date(created), 'PPpp');

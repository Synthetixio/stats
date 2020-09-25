import { LOADING_STATE, RELOADING_TIMES } from '../constants/loading';
import { LoadingState } from '../types/data';

export const refetchHelper = ({
	numberLoadTries,
	isBadData,
	noRetry,
	setLoadingState,
	refetchData,
	section,
}: {
	numberLoadTries: number;
	isBadData: boolean;
	noRetry: boolean;
	setLoadingState: (state: LoadingState) => void;
	refetchData: () => void;
	section: string;
}) => {
	if (numberLoadTries < 2 && isBadData && !noRetry) {
		console.log(`refetching ${section} data due to bad data`);
		refetchData();
	} else if (numberLoadTries === 2 && isBadData && !noRetry) {
		setLoadingState(LOADING_STATE.FAILED);
	} else if (!noRetry) {
		setLoadingState(LOADING_STATE.SUCCESS);
	}
};

export const refetchErrorHelper = ({
	numberLoadTries,
	noRetry,
	setLoadingState,
	refetchData,
	error,
	section,
}: {
	numberLoadTries: number;
	noRetry: boolean;
	setLoadingState: (state: LoadingState) => void;
	refetchData: () => void;
	error: Error;
	section: string;
}) => {
	if (numberLoadTries < 2 && !noRetry) {
		console.log(`refetching ${section} data due to error: ${error.message}`);
		refetchData();
	} else if (numberLoadTries === 2 && !noRetry) {
		setLoadingState(LOADING_STATE.FAILED);
	}
};

export const refetchTimeoutHelper = ({
	setLoadingState,
	fetchData,
	numberLoadTries,
	setNumberLoadTries,
}: {
	setLoadingState: (state: LoadingState) => void;
	setNumberLoadTries: (state: number) => void;
	fetchData: () => void;
	numberLoadTries: number;
}) => {
	setLoadingState(LOADING_STATE.RETRY);
	setTimeout(
		() => {
			fetchData();
		},
		numberLoadTries === 0 ? RELOADING_TIMES.INITIAL : RELOADING_TIMES.SECOND
	);
	setNumberLoadTries(numberLoadTries + 1);
};

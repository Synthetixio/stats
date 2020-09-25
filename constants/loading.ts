import { LoadingState } from '../types/data';

export const RELOADING_TIMES = {
	INITIAL: 3000,
	SECOND: 5000,
};

export const LOADING_STATE: { [key: string]: LoadingState } = {
	LOADING: 'loading',
	RETRY: 'retry',
	FAILED: 'failed',
	SUCCESS: 'success',
};

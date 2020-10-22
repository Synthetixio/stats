import { QueryResult } from 'react-query';

export const useQueryGroup = (
	queries: QueryResult<any>[],
	onDataReady: (...args: any) => any,
	options: { enabled?: boolean; initialData?: { [key: string]: any } } = {
		enabled: true,
		initialData: undefined,
	}
) => ({
	isLoading: isLoadingAny(queries),
	isSuccess: isSuccessAll(queries),
	isError: isErrorAny(queries),
	isIdle: isIdleAll(queries),
	refetch: () => refetchAll(queries),
	data:
		hasDataAll(queries) && options.enabled
			? onDataReady(...queries.map((query) => query.data))
			: options.initialData,
	error: getMostRecentError(queries),
});

const getMostRecentError = (queries: QueryResult<any>[]) =>
	isErrorAny(queries) ? queries.find((query) => query.error) : null;

const isLoadingAny = (queries: QueryResult<any>[]) =>
	queries.reduce((arr, curr) => arr || curr.isLoading, false);

const isErrorAny = (queries: QueryResult<any>[]) =>
	queries.reduce((arr, curr) => arr || curr.isError, false);

const isSuccessAll = (queries: QueryResult<any>[]) =>
	queries.reduce((arr, curr) => arr && curr.isSuccess, true);

const isIdleAll = (queries: QueryResult<any>[]) =>
	queries.reduce((arr, curr) => arr && curr.isIdle, true);

const hasDataAll = (queries: QueryResult<any>[]) =>
	queries.reduce((acc, curr) => acc && curr.data !== undefined, true);

const refetchAll = (queries: QueryResult<any>[]) =>
	Promise.all(queries.map((query) => query.refetch({ throwOnError: true })));

export default useQueryGroup;

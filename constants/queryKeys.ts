import { DailyVolumeSourcePeriod } from 'queries/trading/useVolumeSourcesTimeQuery';

export default {
	Trading: {
		VolumeSources: (period: DailyVolumeSourcePeriod) => ['volumeSources', period],
	},
};

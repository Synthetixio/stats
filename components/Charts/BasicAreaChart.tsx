import { FC } from 'react';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@material-ui/lab';

import colors from '../../styles/colors';
import { AreaChartData } from '../../types/data';
import { TimeSeriesType, formatTime } from '../../utils/formatter';

interface BasicAreaChartProps {
	data: Array<AreaChartData>;
	timeSeries: TimeSeriesType;
}

const BasicAreaChart: FC<BasicAreaChartProps> = ({ data, timeSeries }) => {
	if (data.length === 0) {
		return (
			<Skeleton
				className="chart-skeleton"
				variant="rect"
				animation="wave"
				width="100%"
				height={400}
			/>
		);
	}
	const formattedData = data.map((data) => ({
		...data,
		created: formatTime(data.created, timeSeries),
	}));

	let interval = 1;
	if (formattedData.length > 90 && formattedData.length < 120) {
		interval = 16;
	} else if (formattedData.length > 120 && formattedData.length < 600) {
		interval = 30;
	} else if (formattedData.length > 600) {
		interval = 100;
	}

	return (
		<ResponsiveContainer width="100%" height={300}>
			<AreaChart height={300} data={formattedData}>
				<defs>
					<linearGradient id="colorGreen" x1="0" y1="0" x2="0" y2="1">
						<stop offset="5%" stopColor={colors.brightGreen} stopOpacity={0.2} />
						<stop offset="45%" stopColor={colors.brightGreen} stopOpacity={0} />
					</linearGradient>
				</defs>
				<XAxis interval={interval} axisLine={false} tickLine={false} dataKey="created" />
				<Tooltip />
				<Area
					type="monotone"
					dataKey="value"
					stackId="1"
					stroke={colors.brightGreen}
					fillOpacity={1}
					fill="url(#colorGreen)"
				/>
			</AreaChart>
		</ResponsiveContainer>
	);
};

export default BasicAreaChart;

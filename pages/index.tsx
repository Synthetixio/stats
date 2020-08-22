import { useTranslation } from 'react-i18next';
import SNXSection from '../sections/SNX/index';
import SUSDSection from '../sections/SUSD/index';

const HomePage = () => {
	const { t } = useTranslation();

	return (
		<>
			<SNXSection />
			<SUSDSection />
		</>
	);
};

export default HomePage;

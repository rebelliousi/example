import { NavLink, useLocation } from 'react-router-dom';
import type { ITab } from '../../models/models';

interface TabProps {
    tabs: ITab[];
    disabled?: boolean;
}

const ArrowRightTabs: React.FC<TabProps> = ({ tabs, disabled }) => {
    const location = useLocation();

    const escapeRegex = (string: string) => {
        return string.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
    };

    const matchPathIgnoringDynamicSegments = (path: string) => {
        const escapedPath = escapeRegex(path);
        const regexPath = escapedPath.replace(/:\w+/g, '[^/]+');
        const regex = new RegExp(`^${regexPath}$`);
        return regex.test(location.pathname);
    };

    return (
        <ul className="flex pb-2 items-center text-sm tab-list text-textSecondary">
            {tabs.map((tab: ITab, index) => (
                <li key={tab.id || index} className="flex items-center px-2">
                    {disabled ? (
                        <span
                            aria-disabled="true"
                            className={`flex items-center gap-2 p-1 ${
                                matchPathIgnoringDynamicSegments(tab.link)
                                    ? 'text-primaryBlue border-b border-primaryBlue'
                                    : 'opacity-50 cursor-not-allowed text-gray-500'
                            }`}
                        >
                            {tab.name}
                            {index !== tabs.length - 1 && (
                                <img src="/icons/arrow-right-gray.svg" alt="Go to next step" />
                            )}
                        </span>
                    ) : (
                        <NavLink
                            to={tab.link}
                            className={({ isActive }: { isActive: boolean }) =>
                                `flex items-center gap-2 p-2 pr-2 ${
                                    isActive
                                        ? 'text-primaryBlue border-b  border-primaryBlue'
                                        : 'hover:text-primaryBlue'
                                }`
                            }
                        >
                            <p>{tab.name}</p>
                            {index !== tabs.length - 1 && (
                                <img src="/icons/arrow-right-gray.svg" alt="Go to next step" />
                            )}
                        </NavLink>
                    )}
                </li>
            ))}
        </ul>
    );
};

export default ArrowRightTabs;
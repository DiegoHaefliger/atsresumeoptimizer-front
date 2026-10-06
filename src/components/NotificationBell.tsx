import { NavLink } from "react-router-dom";
import { useUnreadCount } from "../lib/useUnreadCount";
import { BellIcon } from "./icons";

const MAX_BADGE = 99;

export function NotificationBell() {
	const unread = useUnreadCount();
	const label = unread > 0 ? `Notificações, ${unread} não lidas` : "Notificações";
	return (
		<NavLink to="/notifications" className="app-bell" aria-label={label} title="Notificações">
			<BellIcon className="app-bell-icon" />
			{unread > 0 && (
				<span className="app-bell-badge" aria-hidden="true">
					{unread > MAX_BADGE ? `${MAX_BADGE}+` : unread}
				</span>
			)}
		</NavLink>
	);
}

import { Link } from "react-router-dom";
import type { AppNotification } from "../api/types";
import { notificationTime } from "../lib/notificationGroups";
import { formatDateTime } from "../lib/processLabels";
import { BellIcon, TrashIcon } from "./icons";

type NotificationItemProps = {
	notification: AppNotification;
	onRead: (id: string) => void;
	onRemove: (id: string) => void;
};

export function NotificationItem({ notification, onRead, onRemove }: NotificationItemProps) {
	const unread = notification.readAt === null;
	return (
		<li className={`notification-row${unread ? " notification-unread" : ""}`}>
			<span className="notification-icon" aria-hidden="true">
				<BellIcon />
			</span>
			<div className="notification-body">
				<span className="notification-heading">
					<strong className="notification-title">{notification.title}</strong>
					{unread && <span className="sr-only">(não lida)</span>}
				</span>
				<span className="notification-message">{notification.message}</span>
			</div>
			<div className="notification-side">
				<time className="notification-time" dateTime={notification.createdAt} title={formatDateTime(notification.createdAt)}>
					{notificationTime(notification.createdAt)}
				</time>
				<div className="notification-actions">
					{unread && (
						<button type="button" className="btn-secondary btn-small" onClick={() => onRead(notification.id)}>
							Marcar como lida
						</button>
					)}
					{notification.processId && (
						<Link
							to={`/processes/${notification.processId}`}
							className="button-link btn-small"
							onClick={() => unread && onRead(notification.id)}
						>
							Abrir processo
						</Link>
					)}
					<button
						type="button"
						className="btn-icon notification-remove"
						aria-label="Excluir notificação"
						title="Excluir"
						onClick={() => onRemove(notification.id)}
					>
						<TrashIcon />
					</button>
				</div>
			</div>
		</li>
	);
}

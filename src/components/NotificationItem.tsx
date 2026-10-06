import { Link } from "react-router-dom";
import type { AppNotification } from "../api/types";
import { formatDateTime } from "../lib/processLabels";
import { TrashIcon } from "./icons";

type NotificationItemProps = {
	notification: AppNotification;
	onRead: (id: string) => void;
	onRemove: (id: string) => void;
};

export function NotificationItem({ notification, onRead, onRemove }: NotificationItemProps) {
	const unread = notification.readAt === null;
	return (
		<li className={`notification-item${unread ? " notification-unread" : ""}`}>
			<div className="notification-body">
				<strong>
					{unread && <span className="notification-dot" role="img" aria-label="Não lida" />}
					{notification.title}
				</strong>
				<span>{notification.message}</span>
				<time className="notification-time" dateTime={notification.createdAt}>
					{formatDateTime(notification.createdAt)}
				</time>
			</div>
			<div className="notification-actions">
				{notification.processId && (
					<Link
						to={`/processes/${notification.processId}`}
						className="btn-secondary btn-small"
						onClick={() => unread && onRead(notification.id)}
					>
						Abrir processo
					</Link>
				)}
				{unread && (
					<button type="button" className="btn-secondary btn-small" onClick={() => onRead(notification.id)}>
						Marcar como lida
					</button>
				)}
				<button
					type="button"
					className="btn-icon"
					aria-label="Excluir notificação"
					title="Excluir"
					onClick={() => onRemove(notification.id)}
				>
					<TrashIcon />
				</button>
			</div>
		</li>
	);
}

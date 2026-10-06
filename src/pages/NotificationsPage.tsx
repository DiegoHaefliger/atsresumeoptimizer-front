import { useState } from "react";
import { errorMessage } from "../api/client";
import { NotificationItem } from "../components/NotificationItem";
import { Pagination } from "../components/Pagination";
import { SegmentedTabs } from "../components/SegmentedTabs";
import { Skeleton } from "../components/Skeleton";
import { StateMessage } from "../components/StateMessage";
import { useNotifications } from "../lib/useNotifications";

type Filter = "all" | "unread";

const PAGE_SIZE = 10;

const FILTER_OPTIONS: { value: Filter; label: string }[] = [
	{ value: "all", label: "Todas" },
	{ value: "unread", label: "Não lidas" },
];

export function NotificationsPage() {
	const [filter, setFilter] = useState<Filter>("all");
	const [page, setPage] = useState(0);
	const [error, setError] = useState<string | null>(null);
	const { notifications, failed, reload, markRead, markAllRead, remove } = useNotifications(filter === "unread");
	const pageCount = Math.max(1, Math.ceil((notifications?.length ?? 0) / PAGE_SIZE));
	const visible = (notifications ?? []).slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

	async function act(action: () => Promise<void>) {
		setError(null);
		try {
			await action();
		} catch (err) {
			setError(errorMessage(err, "Não deu pra atualizar a notificação. Tenta de novo."));
		}
	}

	return (
		<div className="page">
			<header className="page-header">
				<div>
					<span className="eyebrow">Notificações</span>
					<h1>Central de notificações</h1>
					<p className="page-subtitle">Lembretes dos seus agendamentos aparecem aqui conforme a antecedência configurada.</p>
				</div>
			</header>

			<div className="notification-toolbar">
				<SegmentedTabs
					label="Filtrar notificações"
					options={FILTER_OPTIONS}
					value={filter}
					onChange={(value) => {
						setFilter(value);
						setPage(0);
					}}
				/>
				<button type="button" className="btn-secondary btn-small" onClick={() => act(markAllRead)}>
					Marcar todas como lidas
				</button>
			</div>

			{error && <StateMessage variant="error" layout="inline" message={error} />}

			{failed ? (
				<StateMessage
					variant="error"
					layout="page"
					message="Não deu pra carregar as notificações."
					action={{ label: "Voltar", to: "/upload" }}
				/>
			) : notifications === null ? (
				<div role="status" aria-busy="true">
					<span className="sr-only">Carregando notificações...</span>
					<Skeleton width="100%" height={160} radius="var(--radius-lg)" />
				</div>
			) : notifications.length === 0 ? (
				<StateMessage
					variant="empty"
					layout="page"
					message={filter === "unread" ? "Nenhuma notificação não lida." : "Nenhuma notificação ainda."}
				/>
			) : (
				<>
					<ul className="notification-list panel">
						{visible.map((notification) => (
							<NotificationItem
								key={notification.id}
								notification={notification}
								onRead={(id) => act(() => markRead(id))}
								onRemove={(id) => act(() => remove(id))}
							/>
						))}
					</ul>
					<Pagination page={Math.min(page, pageCount - 1)} pageCount={pageCount} onChange={setPage} />
				</>
			)}
			{failed && (
				<button type="button" className="btn-secondary btn-small" onClick={reload}>
					Tentar de novo
				</button>
			)}
		</div>
	);
}

import React from "react";
import {
  Typography,
  Card,
  CardHeader,
  CardBody,
  Button,
  Spinner,
} from "@material-tailwind/react";
import { useNotifications } from "@/context/NotificationContext.jsx";

function formatDateTime(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "—";
  }
}

export function Notifications() {
  const { notifications = [], loading, error, markRead, reload } = useNotifications();

  return (
    <div className="mt-8 has-fixed-navbar page space-y-6">
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader
          color="transparent"
          floated={false}
          shadow={false}
          className="rounded-none m-0 p-4 border-b border-blue-gray-50 dark:border-gray-700"
        >
          <div className="flex items-center justify-between gap-3">
            <Typography variant="h5" color="blue-gray" className="dark:text-gray-100">
              Notifications
            </Typography>
            <Button size="sm" variant="text" onClick={reload} disabled={loading}>
              {loading ? <Spinner className="h-4 w-4" /> : "Refresh"}
            </Button>
          </div>
        </CardHeader>

        <CardBody className="flex flex-col gap-3 p-4">
          {/* States */}
          {error && (
            <Typography color="red" className="text-sm">
              {String(error)}
            </Typography>
          )}

          {loading && !notifications.length && (
            <div className="grid gap-3">
              <div className="skeleton h-16 w-full" />
              <div className="skeleton h-16 w-full" />
              <div className="skeleton h-16 w-full" />
            </div>
          )}

          {!loading && (!notifications || notifications.length === 0) && !error && (
            <Typography className="subtle">No new notifications.</Typography>
          )}

          {/* List */}
          {notifications.map((n) => {
            const isUnread = !n.read;
            return (
              <div
                key={n.id}
                className={`flex items-start justify-between gap-4 rounded-lg border p-3
                            border-blue-gray-50 dark:border-gray-600
                            ${isUnread ? "bg-blue-gray-50/60 dark:bg-gray-700/50" : "bg-transparent"}`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <Typography variant="small" className="font-medium dark:text-gray-100">
                      {n.type || "Info"}
                    </Typography>
                    {isUnread && (
                      <span className="inline-block h-2 w-2 rounded-full bg-blue-500" aria-hidden />
                    )}
                  </div>

                  <Typography
                    variant="paragraph"
                    className="dark:text-gray-200 break-words"
                  >
                    {n.message}
                  </Typography>

                  <Typography variant="small" className="subtle">
                    {formatDateTime(n.createdAt)}
                  </Typography>
                </div>

                <div className="shrink-0">
                  {isUnread ? (
                    <Button size="sm" onClick={() => markRead(n.id)}>
                      Mark read
                    </Button>
                  ) : (
                    <Button size="sm" variant="text" onClick={() => markRead(n.id)}>
                      Mark read again
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </CardBody>
      </Card>
    </div>
  );
}

export default Notifications;

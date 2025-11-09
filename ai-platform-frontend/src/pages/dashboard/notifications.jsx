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
    <section
      className="
        relative isolate overflow-x-hidden
        -mx-4 md:-mx-6 lg:-mx-8 px-4 md:px-6 lg:px-8
        min-h-[calc(100vh-4rem)] pb-10  /* ⬅️ fills screen but a bit shorter */
        flex
      "
    >
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-blue-50 via-sky-100 to-blue-100 dark:from-gray-900 dark:via-blue-950 dark:to-gray-900 transition-all duration-700" />
      <div className="pointer-events-none absolute -top-8 right-[10%] h-52 w-52 rounded-full bg-sky-300/30 dark:bg-sky-600/30 blur-3xl" />
      <div className="pointer-events-none absolute top-24 -left-8 h-60 w-60 rounded-full bg-blue-300/25 dark:bg-blue-700/25 blur-3xl" />

      <div className="mt-6 has-fixed-navbar page w-full flex flex-col items-center">
        <Card
          className="
            w-full max-w-5xl border border-blue-100/60
            bg-white/90 backdrop-blur-md shadow-sm
            dark:bg-gray-800/80 dark:border-gray-700
            flex-1
          "
        >
          <CardHeader
            color="transparent"
            floated={false}
            shadow={false}
            className="m-0 p-3 md:p-4 rounded-none"
          >
            <div className="flex items-center justify-between gap-3">
              <Typography variant="h6" color="blue-gray" className="dark:text-gray-100">
                Notifications
              </Typography>
              <Button size="sm" variant="text" onClick={reload} disabled={loading}>
                {loading ? <Spinner className="h-4 w-4" /> : "Refresh"}
              </Button>
            </div>
            <div className="mt-3 h-px bg-black/5 dark:bg-white/10" />
          </CardHeader>

          <CardBody className="flex flex-col gap-3 p-3 md:p-4">
            {/* States */}
            {error && (
              <Typography color="red" className="text-sm">
                {String(error)}
              </Typography>
            )}

            {loading && !notifications.length && (
              <div className="grid gap-3">
                <div className="skeleton h-14 w-full" />
                <div className="skeleton h-14 w-full" />
              </div>
            )}

            {!loading && (!notifications || notifications.length === 0) && !error && (
              <Typography className="text-blue-gray-600 dark:text-gray-300 text-sm">
                No new notifications.
              </Typography>
            )}

            {/* List */}
            {notifications.map((n) => {
              const isUnread = !n.read;
              return (
                <div
                  key={n.id}
                  className={`flex items-start justify-between gap-4 rounded-lg border p-3
                              border-blue-100/60 dark:border-gray-700
                              ${
                                isUnread
                                  ? "bg-blue-50/60 dark:bg-gray-700/50"
                                  : "bg-white/0"
                              }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Typography
                        variant="small"
                        className="font-medium dark:text-gray-100 text-sm"
                      >
                        {n.type || "Info"}
                      </Typography>
                      {isUnread && (
                        <span
                          className="inline-block h-2 w-2 rounded-full bg-blue-500"
                          aria-hidden
                        />
                      )}
                    </div>

                    <Typography
                      variant="paragraph"
                      className="dark:text-gray-200 text-sm break-words"
                    >
                      {n.message}
                    </Typography>

                    <Typography
                      variant="small"
                      className="text-blue-gray-500 dark:text-gray-400 text-xs"
                    >
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
    </section>
  );
}

export default Notifications;

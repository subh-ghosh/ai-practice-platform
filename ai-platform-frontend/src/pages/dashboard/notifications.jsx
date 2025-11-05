import React from "react";
import { Typography, Card, CardHeader, CardBody, Button } from "@material-tailwind/react";
import { useNotifications } from "@/context/NotificationContext.jsx";

export function Notifications() {
  const { notifications, loading, error, markRead, reload } = useNotifications();

  return (
    <div className="mt-12">
      <Card>
        <CardHeader floated={false} shadow={false} className="rounded-none m-0 p-4">
          <div className="flex items-center justify-between">
            <Typography variant="h5" color="blue-gray">Notifications</Typography>
            <Button size="sm" variant="text" onClick={reload}>Refresh</Button>
          </div>
        </CardHeader>
        <CardBody className="flex flex-col gap-3 p-4">
          {loading && <Typography>Loading...</Typography>}
          {error && <Typography color="red">{error}</Typography>}
          {!loading && notifications.length === 0 && <Typography>No new notifications.</Typography>}
          {notifications.map(n => (
            <div key={n.id} className="flex items-start justify-between border border-blue-gray-50 rounded-lg p-3">
              <div>
                <Typography variant="small" className="font-medium">{n.type}</Typography>
                <Typography variant="paragraph">{n.message}</Typography>
                <Typography variant="small" color="gray">{new Date(n.createdAt).toLocaleString()}</Typography>
              </div>
              <Button size="sm" onClick={() => markRead(n.id)}>Mark read</Button>
            </div>
          ))}
        </CardBody>
      </Card>
    </div>
  );
}

export default Notifications;

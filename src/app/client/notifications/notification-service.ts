import { injectable } from "inversify";
import { SocketConnection } from "../socket-connection";
import { FleetOrder } from "../../../shared/model/v1/fleet-orders";
import { WorldOrder } from "../../../shared/model/v1/world-order";
import { GameNotificationsSubscription } from "../../../shared/messages/subscriptions";
import { GameNotificationsSubscriptionResult } from "../../../shared/messages/subscription-result";
import { GameNotification, PersistedGameNotification } from "../../../shared/model/v1/notification";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

@injectable()
export class NotificationService {

  constructor(private connection: SocketConnection) { }

  getNotificationsForGameById(gameId: string) {
    return this.connection.subscribe<GameNotificationsSubscription, GameNotificationsSubscriptionResult>({
      type: 'GAME/NOTIFICATIONS'
    }, gameId).pipe(
      map(result => result.notifications)
    ) as Observable<PersistedGameNotification[]>
  }

  async markNotificationsAsRead(gameId: string, notificationIds: string[]): Promise<void> {
    await this.connection.sendCommand({
      type: 'NOTIFICATIONS/MARK_AS_READ',
      notificationIds
    }, gameId)
  }

}
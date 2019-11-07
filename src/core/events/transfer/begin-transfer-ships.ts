import { GameEvent, GameEventQueue } from "../event";
import { Observable } from "rxjs";
import { map, withLatestFrom } from "rxjs/operators";
import { ReadyFleetBase, ReadyFleet } from "../../model/fleet";
import { getTrueTransferAmount } from "./amount-helper";
import { injectable, inject } from "inversify";
import 'reflect-metadata'
import { FleetProjector } from "../../projectors/fleet-projector";
import { WorldProjector } from "../../projectors/world-projector";
import { TimeProjector } from "../../projectors/time-projector";
import { CONFIG, GameConfig } from "../../config";
import { TransferShipsOrder } from "../../model/fleet-orders";
import { popFleetOrder } from "../../actions/fleet/pop-fleet-order";
import { giveOrTakeWorldShips } from "../../actions/world/give-or-take-ships";
import { transferShips } from "../../actions/fleet/transfer-ships";

@injectable()
export class BeginTransferShipsEventQueue implements GameEventQueue {

  public upcomingEvent$: Observable<GameEvent | null>;

  constructor(private fleets: FleetProjector, private worlds: WorldProjector, private time: TimeProjector, @inject(CONFIG) private config: GameConfig ) {

    const readyFleetWithTransferShipsOrder$ = this.fleets.firstByStatusAndNextOrderType<ReadyFleet, TransferShipsOrder>('READY','TRANSFER_SHIPS')

    this.upcomingEvent$ = readyFleetWithTransferShipsOrder$.pipe(
      withLatestFrom(this.worlds.byId$, this.time.currentTimestamp$),
      map(([[fleet, order], worlds, timestamp]) => {
        if (!fleet || !order) {
          return null
        } else {
          return {
            timestamp,
            happen: () => {
              const world = worlds[fleet.currentWorldId];

              if (world.status === 'LOST' || fleet.ownerId !== world.ownerId) {
                return [
                  popFleetOrder(fleet.id)
                ]
              }
          
              const trueAmount = getTrueTransferAmount(fleet.ships, world.ships, order.amount)
          
              if (trueAmount === 0) {
                return [
                  popFleetOrder(fleet.id)
                ]
              }
          
              return [
                transferShips(fleet.id, trueAmount, timestamp + config.transfering.transferShipsDelay),
                giveOrTakeWorldShips(world.id, -1 * trueAmount),
                popFleetOrder(fleet.id)
              ];
            }
          }
        }
      }
      ));
  }
}

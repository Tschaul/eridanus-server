import { GameEvent, GameEventQueue } from "../event";
import { Observable, combineLatest } from "rxjs";
import { map, withLatestFrom } from "rxjs/operators";
import { ReadyFleetBase, ReadyFleet } from "../../../shared/model/v1/fleet";
import { getTrueTransferAmount } from "./amount-helper";
import { injectable, inject } from "inversify";
import { FleetProjector } from "../../projectors/fleet-projector";
import { WorldProjector } from "../../projectors/world-projector";
import { TimeProjector } from "../../projectors/time-projector";
import { DropShipsOrder } from "../../../shared/model/v1/fleet-orders";
import { popFleetOrder } from "../../actions/fleet/pop-fleet-order";
import { dropShips } from "../../actions/fleet/drop-ships";
import { GameSetupProvider } from "../../game-setup-provider";
import { giveOrTakeFleetShips } from "../../actions/fleet/give-or-take-ships";

@injectable()
export class BeginDroppingShipsEventQueue implements GameEventQueue {

  public upcomingEvent$: Observable<GameEvent | null>;

  constructor(
    private fleets: FleetProjector,
    private worlds: WorldProjector,
    private time: TimeProjector,
    private setup: GameSetupProvider) {

    const readyFleetWithTransferShipsOrder$ = this.fleets.firstByStatusAndNextOrderType<ReadyFleet, DropShipsOrder>('READY', 'DROP_SHIPS')

    this.upcomingEvent$ = combineLatest(
      readyFleetWithTransferShipsOrder$,
      this.worlds.byId$,
      this.time.currentTimestamp$
    ).pipe(
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

              // dont transfer ships that still carry metal or population
              const availableShips = fleet.ships - fleet.metal - fleet.population;
              const amount = Math.min(availableShips, order.amount);

              const trueAmount = getTrueTransferAmount(fleet.ships, world.ships, amount, this.setup.rules.global.maxAmount)

              if (trueAmount === 0) {
                return [
                  popFleetOrder(fleet.id)
                ]
              }

              return [
                dropShips(fleet.id, trueAmount, timestamp + this.setup.rules.transfering.transferShipsDelay),
                giveOrTakeFleetShips(fleet.id, -1 * trueAmount),
                popFleetOrder(fleet.id)
              ];
            }
          }
        }
      }
      ));
  }
}

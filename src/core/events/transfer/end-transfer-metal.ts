import { GameEvent, GameEventQueue } from "../event";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { TransferingMetalFleet } from "../../model/fleet";
import { FleetProjector } from "../../projectors/fleet-projector";
import { injectable } from "inversify";
import { giveOrTakeFleetMetal } from "../../actions/fleet/give-or-take-metal";
import { fleetReady } from "../../actions/fleet/ready";

@injectable()
export class EndTransferMetalEventQueue implements GameEventQueue {

  public upcomingEvent$: Observable<GameEvent | null>;
  constructor(public fleets: FleetProjector) {
    this.upcomingEvent$ = this.fleets.firstByStatus<TransferingMetalFleet>('TRANSFERING_METAL').pipe(
      map((fleet) => {
        if (!fleet) {
          return null
        } else {
          return {
            timestamp: fleet.readyTimestamp,
            happen: () => {
              return [
                giveOrTakeFleetMetal(fleet.id, fleet.transferAmount),
                fleetReady(fleet.id),
              ];
            }
          }
        }
      })
    )
  }
}
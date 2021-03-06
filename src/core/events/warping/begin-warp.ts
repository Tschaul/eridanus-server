import { GameEvent, GameEventQueue } from "../event";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { LeavingFleet } from "../../../shared/model/v1/fleet";
import { FleetProjector } from "../../projectors/fleet-projector";
import { inject } from "inversify";
import { injectable } from "inversify";
import { warpToWorld } from "../../actions/fleet/warp-to-world";
import { GameSetupProvider } from "../../game-setup-provider";

@injectable()
export class BeginWarpEventQueue implements GameEventQueue {

  public upcomingEvent$: Observable<GameEvent | null>;

  constructor(
    public fleets: FleetProjector,
    private setup: GameSetupProvider
  ) {
    this.upcomingEvent$ = this.fleets.firstByStatusAndTimestamp<LeavingFleet>('LEAVING', 'warpingTimestamp').pipe(
      map((fleet) => {
        if (!fleet) {
          return null
        } else {
          return {
            timestamp: fleet.warpingTimestamp,
            happen: () => {
              return [
                warpToWorld(fleet.id, fleet.warpingTimestamp + this.setup.rules.warping.warpToWorldDelay),
              ];
            }
          }
        }
      }))
  }
}

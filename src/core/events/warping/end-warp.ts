import { GameEvent, GameEventQueue } from "../event";
import { Observable, combineLatest } from "rxjs";
import { map } from "rxjs/operators";
import { WarpingFleet } from "../../../shared/model/v1/fleet";
import { FleetProjector } from "../../projectors/fleet-projector";
import { inject } from "inversify";
import { injectable } from "inversify";
import { arriveAtWorld } from "../../actions/fleet/arrive-at-world";
import { GameSetupProvider } from "../../game-setup-provider";
import { WorldProjector } from "../../projectors/world-projector";
import { worldHasOwner } from "../../../shared/model/v1/world";

@injectable()
export class EndWarpEventQueue implements GameEventQueue {

  public upcomingEvent$: Observable<GameEvent | null>;

  constructor(
    public fleets: FleetProjector,
    private setup: GameSetupProvider,
    public worlds: WorldProjector,
  ) {
    this.upcomingEvent$ = combineLatest(
      this.fleets.firstByStatusAndTimestamp<WarpingFleet>('WARPING','arrivingTimestamp'),
      this.worlds.byId$
    ).pipe(
      map(([fleet, worlds]) => {
        if (!fleet) {
          return null
        } else {

          let delay = 0;

          const targetWorld = worlds[fleet.targetWorldId];

          if (worldHasOwner(targetWorld) && targetWorld.ownerId !== fleet.ownerId) {
            delay = this.setup.rules.warping.leaveEnemyWorldDelay;
          }

          return {
            timestamp: fleet.arrivingTimestamp,
            happen: () => {
              return [
                arriveAtWorld(fleet.id, fleet.arrivingTimestamp + delay),
              ];
            }
          }
        }
      }))
  }
}
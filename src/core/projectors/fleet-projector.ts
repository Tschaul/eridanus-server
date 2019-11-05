import { injectable } from "inversify";
import 'reflect-metadata'
import { ReadonlyStore } from "../store";
import { map, distinctUntilChanged, shareReplay } from "rxjs/operators";
import { Observable } from "rxjs";
import { Fleet } from "../model/fleet";
import { FleetOrder } from "../model/fleet-orders";

@injectable()
export class FleetProjector {

  constructor(private store: ReadonlyStore) { }

  public byId$ = this.store.state$.pipe(
    map(state => state.universe.fleets),
    distinctUntilChanged(),
    shareReplay(1)
  )

  public firstByStatusAndNextOrderType<TFleetWithStatus extends Fleet, TFleetOrder extends FleetOrder>(
    status: TFleetWithStatus["status"], 
    orderType: FleetOrder["type"]): Observable<[TFleetWithStatus | null, TFleetOrder | null]> {
    return this.byId$.pipe(
      map(fleets => {
        const fleet = Object.values(fleets).find(fleet => fleet.status === status
          && fleet.orders.length
          && fleet.orders[0].type === orderType);
        return [fleet || null, fleet ? fleet.orders[0] : null] as any;
      }),
      distinctUntilChanged());
    
  }

  public firstByStatus<TFleetWithStatus extends Fleet>(status: Fleet["status"]): Observable<TFleetWithStatus | null> {
    return this.byId$.pipe(
      map(fleets => {
        const fleet = Object.values(fleets).find(fleet => fleet.status === status);
        return fleet as TFleetWithStatus || null;
      }),
      distinctUntilChanged());
  }
}
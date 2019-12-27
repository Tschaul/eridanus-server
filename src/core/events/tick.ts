import { GameState } from "../state";
import { GameEvent } from "./event";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

export function upcomingTickEvent(state$: Observable<GameState>): Observable<TickEvent> {
    return state$.pipe(
        map(state => state.currentTimestamp),
        map(currentTimestamp => {
            const nextTick = Math.floor(currentTimestamp / 1000) * 1000 + 1000;
            return new TickEvent(nextTick);
        }),
    )
}

export class TickEvent implements GameEvent {

    constructor(public timestamp: number){}

    happen() {
        return []
    }
}
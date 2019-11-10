import { DataProvider } from "./data-provider";
import { DummySubscription } from "../../../shared/subscriptions";
import { interval, Observable } from "rxjs";
import { injectable } from "inversify";
import { map } from "rxjs/operators";
import { SubscriptionResult } from "../../../shared/subscription-result";

@injectable()
export class CounterDataProvider implements DataProvider {
  getObservable(subscription: DummySubscription): Observable<SubscriptionResult> {
    return interval(1000).pipe(
      map(i => {
        const result: SubscriptionResult = {
          type: 'DUMMY_COUNTER',
          i
        }
        return result;
      })
    );
  }
}
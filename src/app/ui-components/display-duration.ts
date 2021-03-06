import { interval, of, Subscription } from "rxjs";
import { map, startWith } from "rxjs/operators";
import React from "react";

const millisecondsPerSecond = 1000;
const millisecondsPerMinute = 60 * millisecondsPerSecond;
const millisecondsPerHour = 60 * millisecondsPerMinute;
const millisecondsPerDay = 24 * millisecondsPerHour;
const millisecondsPerWeek = 7 * millisecondsPerDay;

export function getDisplayDuration(endTimestamp: number, now: number | null = null) {
  if (!endTimestamp) {
    return of(null);
  }
  if (now) {
    return of(displayDuration(endTimestamp - now))
  }
  return interval(30 * 1000).pipe(
    map(() => {
      return displayDuration(endTimestamp - new Date().getTime())
    }),
    startWith(displayDuration(endTimestamp - new Date().getTime()))
  )
}

function displayDuration(duration: number): string | null {

  if (duration === 0) {
    return null;
  }

  if (duration <= 0) {
    return displayDuration(-duration) + ' ago';
  }

  const weeks = Math.floor(duration / millisecondsPerWeek)
  duration -= weeks * millisecondsPerWeek

  const days = Math.floor(duration / millisecondsPerDay)
  duration -= days * millisecondsPerDay

  const hours = Math.floor(duration / millisecondsPerHour)
  duration -= hours * millisecondsPerHour

  const minutes = Math.floor(duration / millisecondsPerMinute)
  duration -= minutes * millisecondsPerMinute

  const seconds = Math.floor(duration / millisecondsPerSecond)

  if (weeks) {
    return `${weeks}w${days}d`
  }

  if (days) {
    return `${days}d${hours}h`
  }

  if (hours) {
    return `${hours}h${minutes}m`
  }

  if (minutes) {
    return `${minutes}m`
  }

  return `${seconds}s`;
}

export class Duration extends React.Component<{
  timestamp: number
}> {
  state: { duration: string | null } = { duration: '' }
  subscription: Subscription;

  componentDidMount() {
    this.subscription = getDisplayDuration(this.props.timestamp).subscribe(duration => {
      this.setState({ duration });
    })
  }

  componentWillUnmount() {
    this.subscription.unsubscribe();
  }

  render() {
    return this.state.duration;
  }

}
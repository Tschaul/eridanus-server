import { GameData } from "./game-data";
import { observable, reaction, computed } from "mobx";
import { GameViewModel } from "./game-view-model";
import { visibleWorldhasOwner } from "../../../shared/model/v1/visible-state";
import { fleetHasOwner, fleetIsAtWorldAndHasOwner, fleetIsAtWorld } from "../../../shared/model/v1/fleet";
import { WorldHints, WorldHint } from "./world-hints";
import { BaseWorld } from "../../../shared/model/v1/world";

export interface Stats {
  population: number;
  industry: number;
  mines: number;
  ships: number;
  metal: number;
  fleetKeys: number;
}

export type StatType = 'NONE' | 'INDUSTRY' | 'METAL' | 'MINES' | 'POPULATION' | 'SHIPS' | 'FLEET_KEYS' | 'ALL';

export class GameStats {
  constructor(
    private gameViewModel: GameViewModel,
    private gameData: GameData,
    private worldHints: WorldHints
  ) {
    reaction(
      () => this.highlightedStat,
      (stat) => {
        switch (stat) {
          case 'NONE':
            this.worldHints.clearHints();
            break;
          case 'INDUSTRY':
            this.showStatForAllOwnedWorlds('industry');
            break;
          case 'MINES':
            this.showStatForAllOwnedWorlds('mines');
            break;
          case 'POPULATION':
            this.showStatForAllOwnedWorlds('population');
            break;
          case 'SHIPS':
            this.showShipsOrMetalForAllOwnedWorlds('ships');
            break;
          case 'METAL':
            this.showShipsOrMetalForAllOwnedWorlds('metal');
            break;
          case 'FLEET_KEYS':
            this.showFleetKeysForAllOwnedWorlds();
            break;
        }
      }
    )
  }

  @observable public highlightedStat: StatType = 'NONE';

  @computed get totalStats() {
    let stats: Stats = {
      industry: 0,
      metal: 0,
      mines: 0,
      population: 0,
      ships: 0,
      fleetKeys: 0,
    }

    const currentPlayer = this.gameViewModel.selfPlayerId;

    Object.values(this.gameData.worlds).forEach(world => {
      if (visibleWorldhasOwner(world) && world.ownerId === currentPlayer) {
        stats.industry += world.industry;
        stats.metal += world.metal;
        stats.mines += world.mines;
        stats.population += world.population;
        stats.ships += world.ships;
      }
    })

    Object.values(this.gameData.fleets).forEach(fleet => {
      if (fleetHasOwner(fleet) && fleet.ownerId === currentPlayer) {
        stats.metal += fleet.metal;
        stats.ships += fleet.ships;
        stats.fleetKeys += 1;
      }
    })

    return stats;
  }

  private symbolForProperty(prop: string) {
    switch (prop) {
      case 'population': return ' P'
      case 'industry': return ' I'
      case 'mines': return  ' M'
      case 'metal': return ' ▮'
      case 'ships': return ' ►'
      case 'fleetKeys': return ' ◈'
      default: return ''
    }
  }

  private showStatForAllOwnedWorlds(property: keyof BaseWorld) {
    const currentPlayer = this.gameViewModel.selfPlayerId;


    const hints: WorldHint[] = []

    Object.values(this.gameData.worlds).forEach(world => {
      if (visibleWorldhasOwner(world) && world.ownerId === currentPlayer) {
        const hintText = property === 'population'
          ? world[property] + '/' + world.populationLimit
          : world[property];

        hints.push({
          type: 'WORLD',
          hint: hintText + this.symbolForProperty(property),
          worldId: world.id
        })
      }
    })

    this.worldHints.showHints(hints);
  }

  private showShipsOrMetalForAllOwnedWorlds(property: 'ships' | 'metal') {

    const currentPlayer = this.gameViewModel.selfPlayerId;

    const hints: WorldHint[] = []

    Object.values(this.gameData.worlds).forEach(world => {

      let value = 0;

      if (visibleWorldhasOwner(world) && world.ownerId === currentPlayer) {
        value += world[property]
      }

      const fleetsAtWorld = this.gameData.fleetsByWorldId[world.id] || [];

      fleetsAtWorld.filter(fleet => fleetHasOwner(fleet) && fleet.ownerId === currentPlayer).forEach(fleet => {
        value += fleet[property];
      })

      if (value > 0) {

        hints.push({
          type: 'WORLD',
          hint: value + this.symbolForProperty(property),
          worldId: world.id
        })
      }

    })

    Object.getOwnPropertyNames(this.gameData.warpingFleetsByBothWorlds).forEach(worldId1 => {
      Object.getOwnPropertyNames(this.gameData.warpingFleetsByBothWorlds[worldId1]).forEach(worldId2 => {
        const fleets = this.gameData.warpingFleetsByBothWorlds[worldId1][worldId2].filter(fleet => fleet.ownerId === currentPlayer);
        if (fleets.length) {
          let value = 0;
          fleets.forEach(fleet => {
            value += fleet[property];
          })
          hints.push({
            type: 'GATE',
            hint: value + this.symbolForProperty(property),
            worldId1,
            worldId2
          })
        }
      })
    })

    this.worldHints.showHints(hints);
  }

  private showFleetKeysForAllOwnedWorlds() {
    
    const currentPlayer = this.gameViewModel.selfPlayerId;

    const hints: WorldHint[] = []

    Object.values(this.gameData.worlds).forEach(world => {

      const fleetsAtWorld = this.gameData.fleetsByWorldId[world.id] || [];

      let value = fleetsAtWorld.filter(fleet => fleetHasOwner(fleet) && fleet.ownerId === currentPlayer).length;

      if (value > 0) {
        hints.push({
          type: 'WORLD',
          hint: value + this.symbolForProperty('fleetKey'),
          worldId: world.id
        })
      }

    })

    Object.getOwnPropertyNames(this.gameData.warpingFleetsByBothWorlds).forEach(worldId1 => {
      Object.getOwnPropertyNames(this.gameData.warpingFleetsByBothWorlds[worldId1]).forEach(worldId2 => {
        const fleets = this.gameData.warpingFleetsByBothWorlds[worldId1][worldId2].filter(fleet => fleet.ownerId === currentPlayer);
        if (fleets.length) {
          let value = fleets.length;
          hints.push({
            type: 'GATE',
            hint: value + this.symbolForProperty('fleetKey'),
            worldId1,
            worldId2
          })
        }
      })
    })

    this.worldHints.showHints(hints);
  }
}
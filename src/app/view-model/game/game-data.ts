import { observable, computed, when, toJS } from "mobx";
import { IStreamListener, fromStream, toStream } from "mobx-utils";
import { GameInfo, GameMetaData } from "../../../shared/model/v1/game-info";
import { EMPTY, Subscription } from "rxjs";
import { PlayerInfos } from "../../../shared/model/v1/player-info";
import { GameViewModel } from "./game-view-model";
import { resolveFromRegistry } from "../../container-registry";
import { GameStateService } from "../../client/game-state/game-state.service";
import { FleetAtWorld, fleetIsAtWorld, FleetInTransit, pathOfFleetInTransit } from "../../../shared/model/v1/fleet";
import { VisibleState } from "../../../shared/model/v1/visible-state";
import { GameRules } from "../../../shared/model/v1/rules";
import { Distances } from "../../../shared/model/v1/distances";
import { floydWarshallGates } from "../../../shared/math/path-finding/floydWarshall";
import { reactionToObservable } from "../../../shared/util/reactionToObservable";
import { Distribution } from "../../../shared/math/distributions/distribution-helper";
import { switchMap } from "rxjs/operators";
import { GameClock } from "./clock";

export type FleetByTwoWorlds = {
  [worldId1: string]: {
    [worldId2: string]: FleetInTransit[];
  };
};

const dummyState: VisibleState = {
  players: {},
  currentTimestamp: 0,
  gameStartTimestamp: 0,
  gameEndTimestamp: Number.MAX_SAFE_INTEGER,
  universe: {
    fleets: {},
    worlds: {},
    gates: {}
  }
}

const dummyMetaData: GameMetaData = {
  drawingPositions: {}
}

const dummyInfo: GameInfo = {
  id: '',
  state: 'STARTED',
  players: {}
}

const dummyRules: GameRules = {
  building: {
    buildShipDelay: 1,
  },
  capture: {
    populationConversionRate: 1,
    shipConversionMultiplier: 1,
  },
  combat: {
    integrityDamagePerShip: 1,
    populationDamagePerShip: 1,
    meanFiringInterval: 1,
  },
  visibility: {
    revealPeriod: 1
  },
  global: {
    maxAmount: 1,
  },
  mining: {
    maximumMetal: 1,
    miningDelay: 1,
  },
  population: {
    minimumPopulationGrowthDelay: 1,
  },
  scoring: {
    gameEndingScore: 1,
  },
  warping: {
    arriveAtEnemyWorldDelay: 1,
    leaveEnemyWorldDelay: 1,
    warpToWorldDelay: 1,
  }
}

export class GameData {

  private gameStateService = resolveFromRegistry(GameStateService);

  @observable private gameInfo: IStreamListener<GameInfo> = fromStream(EMPTY, dummyInfo);
  @observable private gameRulesStream: IStreamListener<GameRules> = fromStream(EMPTY, dummyRules);
  @observable private gameState: IStreamListener<VisibleState> = fromStream(EMPTY, dummyState);
  @observable private metaData: IStreamListener<GameMetaData> = fromStream(EMPTY, dummyMetaData);
  @observable private score: IStreamListener<Distribution> = fromStream(EMPTY, {});

  @observable public distances: Distances = {}

  @observable public doneLoading = false;
  subscription: Subscription = Subscription.EMPTY;

  @computed public get rawDrawingPositions() {
    const gameInfo = this.metaData.current as GameMetaData;
    return gameInfo.drawingPositions;
  }

  @computed public get playerInfos(): PlayerInfos {
    return this.gameInfo.current.players;
  };

  @computed public get gameRules() {
    return this.gameRulesStream.current;
  }

  @computed private get universe() {
    return this.gameState.current.universe;
  }

  @computed public get gameStartTimestamp() {
    return this.gameState.current.gameStartTimestamp;
  }

  @computed public get gameEndTimestamp() {
    return this.gameState.current.gameEndTimestamp;
  }

  @computed public get scorings() {
    return this.score.current;
  }

  @computed public get players() {
    return this.gameState.current.players;
  }

  @computed public get worlds() {
    return this.gameState.current.universe.worlds;
  }

  @computed public get fleets() {
    return this.gameState.current.universe.fleets;
  }

  @computed public get gates() {
    return this.gameState.current.universe.gates;
  }

  @computed get fleetsByWorldId() {
    const result: { [k: string]: Array<FleetAtWorld> } = {};
    for (const fleetKey of Object.getOwnPropertyNames(this.universe.fleets)) {
      const fleet = this.universe.fleets[fleetKey];
      if (fleetIsAtWorld(fleet)) {
        result[fleet.currentWorldId] = result[fleet.currentWorldId] || [];
        result[fleet.currentWorldId].push(fleet)
      }
    }
    return result;
  }

  @computed get fleetsInTransitByBothWorlds() {
    const fleets = Object.values(this.universe.fleets).filter(
      fleet => !fleetIsAtWorld(fleet)
    ) as Array<FleetInTransit>;

    const result: FleetByTwoWorlds = {};

    for (const fleet of fleets) {

      const [id1, id2] = pathOfFleetInTransit(fleet).sort();
      result[id1] = result[id1] || {};
      result[id1][id2] = result[id1][id2] || [];
      result[id1][id2].push(fleet);
    }

    return result;
  }

  constructor(private gameViewModel: GameViewModel, private clock: GameClock) {

  }

  focus() {
    const gameId = this.gameViewModel.gameId as string;
    this.gameInfo = fromStream(this.gameStateService.getGameInfoById(gameId), dummyInfo);
    this.gameRulesStream = fromStream(this.gameStateService.getGameRulesByGameId(gameId), dummyRules);
    this.metaData = fromStream(this.gameStateService.getGameMetaDataById(gameId), dummyMetaData);
    this.score = fromStream(this.gameStateService.getGameScoreById(gameId), {});
    when(
      () => !!Object.values(this.metaData.current.drawingPositions).length,
      () => {
        this.gameState = fromStream(
          reactionToObservable(() => this.clock.fixedTimestamp).pipe(
            switchMap(timestamp => this.gameStateService.getGameStateById(gameId, timestamp || undefined))
          ),
          dummyState
        );
      }
    )
    when(
      () => !!Object.values(this.gameState.current.universe.worlds).length,
      () => {
        this.doneLoading = true;
      }
    )

    this.subscription = reactionToObservable(() => this.gameState.current.universe.gates, { deepEqual: true })
      .subscribe(gates => {
        this.distances = floydWarshallGates(gates)
      })
  }

  unfocus() {
    this.gameState.dispose();
    this.metaData.dispose();
    this.gameInfo.dispose();
    this.subscription.unsubscribe();
    this.subscription = Subscription.EMPTY;
  }
}
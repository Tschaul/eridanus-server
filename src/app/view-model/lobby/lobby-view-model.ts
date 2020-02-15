import { LobbyService } from "../../client/lobby/lobby.service";
import { resolveFromRegistry } from "../../container-registry";
import { MainViewModel } from "../main-view-model";
import { fromStream, IStreamListener } from "mobx-utils";
import { observable, computed } from "mobx";
import { empty } from "rxjs";
import { GameInfo } from "../../../shared/model/v1/game-info";
import { GameMap } from "../../../shared/model/v1/game-map";
import { GameRuleSet } from "../../../shared/model/v1/rules";

export class LobbyViewModel {

  private lobbyService = resolveFromRegistry(LobbyService);

  constructor(private mainViewModel: MainViewModel) { 
  }

  @computed
  public get loggedInUserId() {
    return this.mainViewModel.loggedInUserId;
  }

  @observable
  public allGames: IStreamListener<GameInfo[]> = fromStream(empty(), [])

  @observable
  public allMaps: IStreamListener<GameMap[]> = fromStream(empty(), [])

  @observable
  public allRulesSets: IStreamListener<GameRuleSet[]> = fromStream(empty(), [])

  public focus() {
    this.allGames = fromStream(this.lobbyService.allGames$, []);
  }

  public unfocus() {
    this.allGames.dispose()
    this.allMaps.dispose()
    this.allRulesSets.dispose()
  }

  @observable
  public selectedGameId: string | null = null;

  @computed
  public get selectedGame() {
    if (this.selectedGameId) {
      return this.allGames.current.find(game => game.id === this.selectedGameId) || null
    } else {
      return null
    }
  }

  public async createGame() {
    await this.lobbyService.createGame();
  }

  public async joinGame() {
    if (!this.selectedGameId) {
      return
    }
    await this.lobbyService.joinGame(this.selectedGameId);
  }

  public async readyForGame() {
    if (!this.selectedGameId) {
      return
    }
    await this.lobbyService.readyForGame(this.selectedGameId);
  }

  public async viewGame() {
    if (!this.selectedGameId) {
      return
    }
    this.mainViewModel.activeGameId = this.selectedGameId;
  }

}
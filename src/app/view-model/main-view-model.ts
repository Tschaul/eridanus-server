import { GameViewModel } from "./game/game-view-model";
import { observable, computed } from "mobx";
import { WelcomeViewModel } from "./welcome/welcome-view-model";
import { LobbyViewModel } from "./lobby/lobby-view-model";

type PossibleScreen = 'GAME' | 'WELCOME' | 'LOBBY';

export class MainViewModel {
  
  @computed get activeScreen(): PossibleScreen {
    if (!this.loggedInUserId) {
      return 'WELCOME'
    }
    if (!this.activeGameId) {
      return 'LOBBY'
    }
    return 'GAME'
  }

  @observable
  loggedInUserId: string | null = null;

  @observable
  activeGameId: string | null = null;

  public gameViewModel = new GameViewModel(this);
  public welcomeViewModel = new WelcomeViewModel(this);
  public lobbyViewModel = new LobbyViewModel(this);

}
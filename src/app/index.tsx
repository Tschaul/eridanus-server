import React from 'react';
import ReactDOM from 'react-dom';
import "reflect-metadata";
import { GameScreen } from './screens/game/game-screen';
import { MainViewModel, PossibleScreen } from './view-model/main-view-model';
import { observer } from 'mobx-react'
import { setupContainerRegistry } from './container-registry';
import { WelcomeScreen } from './screens/welcome/welcome-screen';
import { LobbyScreen } from './screens/lobby/lobby-screen';
import { TooltipOverlay } from './ui-components/tooltip/tooltip-overlay.component';
import { HasExitAnimation } from './ui-components/animatable-components';
import { reaction } from 'mobx';
import { Background } from './ui-components/background/background-component';
import { AccountScreen } from './screens/account/account-screen';

setupContainerRegistry();

const vm = new MainViewModel();

(window as any).vm = vm;

@observer
class App extends React.Component<{
  vm: MainViewModel
}, {
  activeScreen: PossibleScreen
}> {

  constructor(props: any) {
    super(props);
    this.state = {
      activeScreen: this.props.vm.activeScreen
    }
  }

  componentDidMount() {
    reaction(
      () => this.props.vm.activeScreen,
      async (value) => {
        if (this.activeScreenComponent) {
          await this.activeScreenComponent.fadeOut();
        }
        this.setState({
          activeScreen: value
        });
      }
    )
  }

  activeScreenComponent: HasExitAnimation | null;

  render() {
    return (
      <TooltipOverlay>
        <Background vm={this.props.vm}>
          {this.renderScreen()}
        </Background>
      </TooltipOverlay>
    )
  }

  renderScreen() {
    switch (this.state.activeScreen) {
      case 'GAME':
        return <GameScreen vm={this.props.vm.gameViewModel} ref={elem => this.activeScreenComponent = elem}></GameScreen>
      case 'WELCOME':
        return <WelcomeScreen vm={this.props.vm.welcomeViewModel} ref={elem => this.activeScreenComponent = elem}></WelcomeScreen>
      case 'LOBBY':
        return <LobbyScreen vm={this.props.vm.lobbyViewModel} ref={elem => this.activeScreenComponent = elem}></LobbyScreen>
      case 'ACCOUNT':
        return <AccountScreen vm={this.props.vm.accountViewModel} ref={elem => this.activeScreenComponent = elem}></AccountScreen>
    }
  }
}

ReactDOM.render(<App vm={vm}></App>, document.getElementById('root'))



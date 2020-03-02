import * as React from "react";
import { Panel } from "../../ui-components/panel/panel-component";
import { GameStage } from "./game-stage/game-stage-component";
import { GameViewModel } from "../../view-model/game/game-view-model";
import { SelectedWorldPanel } from "./selected-world/selected-world-panel-component";
import { OrderEditor } from "./order-editor/order-editor-component";
import { HasExitAnimation } from "../../ui-components/animatable-components";
import classNames from "classnames";
import { createClasses } from "../../ui-components/setup-jss";
import { TopBar } from "./top-bar/top-bar-component";

const TOP_BAR_HEIGHT = 75;
const RIGHT_PANEL_WIDTH = 420;

const MIDDLE_PANEL_HEIGHT = 500;
const BOTTOM_PANEL_HEIGHT = 300;


const classes = createClasses({
  grid: {
    display: 'grid',
    height: '100vh',
    width: '100vw',
    gridTemplateColumns: `[start] auto [panels-start] ${RIGHT_PANEL_WIDTH}px [end]`,
    gridTemplateRows: `[start] ${TOP_BAR_HEIGHT}px [main-start] auto [middle-start] ${MIDDLE_PANEL_HEIGHT}px [bottom-start] ${BOTTOM_PANEL_HEIGHT}px [end]`,
    position: 'fixed',
    top: 0,
    left: 0
  },
  topLeft: {
    gridColumn: 'start / panels-start',
    gridRow: 'start / main-start',
  },
  middleRight: {
    gridColumn: 'panels-start / end',
    gridRow: 'middle-start / bottom-start',
  },
  bottomRight: {
    gridColumn: 'panels-start / end',
    gridRow: 'bottom-start / end',
  },
  gameStage: {
    gridColumn: 'start / panels-start',
    gridRow: 'main-start / end',
    overflow: 'hidden'
  }
});

export class GameScreen extends React.Component<{ vm: GameViewModel }> implements HasExitAnimation {

  async fadeOut() { }

  componentDidMount() {
    this.props.vm.focus();
  }

  componentWillUnmount() {
    this.props.vm.unfocus();
  }

  render() {

    return (
      <div className={classNames(classes.grid)}>
        <TopBar
          vm={this.props.vm.gameOrders}
          panelClassName={classNames(classes.topLeft)}
        ></TopBar>
        <SelectedWorldPanel
          vm={this.props.vm.selectedWorldViewModel}
          panelClassName={classNames(classes.middleRight)}
        />
        <OrderEditor
          vm={this.props.vm.orderEditorViewModel}
          panelClassName={classNames(classes.bottomRight)}
        />
        <GameStage
          className={classNames(classes.gameStage)}
          vm={this.props.vm.gameStageViewModel} />
      </div>
    )
  }
}
import * as React from "react";
import { screenWhite, selectedYellow, hoverYellow } from "../colors/colors";
import { createClasses } from "../setup-jss";
import classNames from "classnames";

const classes = createClasses({
  button: {
    transition: "background-color 0.3s",
    cursor: 'pointer',
    color: 'rgba(114, 130, 135, 029)',
    backgroundColor: screenWhite,
    padding: '0.25em 0.5em',
    borderRadius: '0.5em',
    fontWeight: 'bold',
    fontSize: "100%",
    fontFamily: "inherit",
    border: 0,
    boxShadow: 'rgba(255, 255, 255, 0.5) 0px 0px 5px',
    textShadow: 'rgba(114, 130, 135, 029) 0px 0px 5px',
    "&:active:hover:not[.disabled]": {
      backgroundColor: selectedYellow,
      outline: "none !important",
    },
    "&:hover:not[.disabled]": {
      backgroundColor: hoverYellow,
      outline: "none !important",
    },
    "&:focus, &:active": {
      outline: "none !important",
    },
    "&.disabled": {
      opacity: 0.5
    },
    "&.spaceLeft": {
      marginLeft: '0.5em'
    },
    "&.spaceRight": {
      marginRight: '0.5em'
    },
  },
});

export class Button extends React.Component<{
  onClick?: () => void,
  disabled?: boolean,
  spaceLeft?: boolean,
  spaceRight?: boolean,
  style?: React.CSSProperties
}> {
  render() {

    const { spaceLeft, spaceRight, disabled,style } = this.props;

    return (
      <button
        disabled={this.props.disabled} 
        style={style}
        className={classNames([classes.button, { spaceLeft, spaceRight, disabled }])} 
        onClick={this.props.onClick}>{this.props.children}</button>
    )
  }
}
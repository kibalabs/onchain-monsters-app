
import React from 'react';

import { getClassName, RecursivePartial } from '@kibalabs/core';
import { ISingleAnyChildProps } from '@kibalabs/core-react';
import { defaultComponentProps, IBoxTheme, IComponentProps, KibaIcon, themeToCss, ThemeType, useBuiltTheme, useColors } from '@kibalabs/ui-react';
import styled from 'styled-components';


export interface ISelectableViewThemeBase extends ThemeType {
  background: IBoxTheme;
  overlay: IBoxTheme;
}

export interface ISelectableViewThemeState extends ThemeType {
  default: ISelectableViewThemeBase;
  hover: RecursivePartial<ISelectableViewThemeBase>;
  press: RecursivePartial<ISelectableViewThemeBase>;
  focus: RecursivePartial<ISelectableViewThemeBase>;
}

export interface ISelectableViewTheme extends ThemeType {
  normal: ISelectableViewThemeState;
  selected: RecursivePartial<ISelectableViewThemeState>;
}

interface IStyledSelectableViewProps {
  $theme: ISelectableViewTheme;
}

const StyledSelectableView = styled.button<IStyledSelectableViewProps>`
  position: relative;
  color: currentColor;
  cursor: pointer;
  outline: none;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  background-clip: padding-box;
  transition: 0.3s;
  width: fit-content;
  &.fullWidth {
    width: 100%;
  }

  &.fullHeight {
    height: 100%;
  }

  ${(props: IStyledSelectableViewProps): string => themeToCss(props.$theme.normal.default.background)};
  &:hover {
    ${(props: IStyledSelectableViewProps): string => themeToCss(props.$theme.normal.hover?.background)};
  }
  &:active {
    ${(props: IStyledSelectableViewProps): string => themeToCss(props.$theme.normal.press?.background)};
  }
  &:focus {
    ${(props: IStyledSelectableViewProps): string => themeToCss(props.$theme.normal.focus?.background)};
  }
`;

interface IStyledOverlayProps {
  $isSelected: boolean;
  $theme: ISelectableViewTheme;
}

const StyledOverlay = styled.div<IStyledOverlayProps>`
  position: absolute;
  height: 100%;
  width: 100%;
  z-index: 10;

  ${(props: IStyledOverlayProps): string => themeToCss(props.$theme.normal.default.overlay)};
  &:hover {
    ${(props: IStyledOverlayProps): string => themeToCss(props.$theme.normal.hover?.overlay)};
  }
  &:active {
    ${(props: IStyledOverlayProps): string => themeToCss(props.$theme.normal.press?.overlay)};
  }
  &:focus {
    ${(props: IStyledOverlayProps): string => themeToCss(props.$theme.normal.focus?.overlay)};
  }
  &.isSelected {
    ${(props: IStyledOverlayProps): string => themeToCss(props.$theme.selected.default.overlay)};
    &:hover {
      ${(props: IStyledOverlayProps): string => themeToCss(props.$theme.selected.hover?.overlay)};
    }
    &:active {
      ${(props: IStyledOverlayProps): string => themeToCss(props.$theme.selected.press?.overlay)};
    }
    &:focus {
      ${(props: IStyledOverlayProps): string => themeToCss(props.$theme.selected.focus?.overlay)};
    }
  }
`;

export interface ISelectableViewProps extends IComponentProps<ISelectableViewTheme>, ISingleAnyChildProps {
  isSelected: boolean;
  onClicked(): void;
}

export const SelectableView = (props: ISelectableViewProps): React.ReactElement => {
  const colors = useColors();
  const onClicked = (): void => {
    if (props.onClicked) {
      props.onClicked();
    }
  };

  const theme = useBuiltTheme('selectableViews', props.variant, props.theme);

  return (
    // @ts-ignore: as prop doesn't match type required
    <StyledSelectableView
      id={props.id}
      className={getClassName(SelectableView.displayName, props.className)}
      $theme={theme}
      onClick={onClicked}
    >
      {props.children}
      <StyledOverlay
        className={getClassName(props.isSelected && 'isSelected')}
        $theme={theme}
        $isSelected={props.isSelected}
      >
        { props.isSelected && (
          <KibaIcon iconId='ion-checkmark-circle' variant='large' _color={colors.white} />
        )}
      </StyledOverlay>
    </StyledSelectableView>
  );
};

SelectableView.displayName = 'SelectableView';
SelectableView.defaultProps = {
  ...defaultComponentProps,
};

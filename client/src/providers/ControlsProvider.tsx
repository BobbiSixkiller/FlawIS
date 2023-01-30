import { createContext, Dispatch, ReactNode, useReducer } from "react";

type ActionMap<M extends { [index: string]: any }> = {
	[Key in keyof M]: M[Key] extends undefined
		? {
				type: Key;
		  }
		: {
				type: Key;
				payload: M[Key];
		  };
};

export enum ActionTypes {
	CleanAll = "CLEAN_ALL",
	SetDrawer = "SET_DRAWER",
	SetRightPanel = "SET_RIGHT_PANEL",
}

type ActionPayload = {
	[ActionTypes.SetDrawer]: { drawerItems: ReactNode };
	[ActionTypes.SetRightPanel]: { rightPanelItems: ReactNode };
	[ActionTypes.CleanAll]: undefined;
};

type ControlsActions = ActionMap<ActionPayload>[keyof ActionMap<ActionPayload>];

type ControlsState = {
	drawerItems: ReactNode;
	rightPanelItems: ReactNode;
};

function controlsReducer(state: ControlsState, action: ControlsActions) {
	switch (action.type) {
		case ActionTypes.SetDrawer:
			return { ...state, drawerItems: action.payload.drawerItems };

		case ActionTypes.SetRightPanel:
			return { ...state, rightPanelItems: action.payload.rightPanelItems };

		case ActionTypes.CleanAll:
			return { rightPanelItems: null, drawerItems: null };

		default:
			return state;
	}
}

export const ControlsContext = createContext<
	ControlsState & { dispatch: Dispatch<ControlsActions> }
>({
	drawerItems: null,
	rightPanelItems: null,
	dispatch: () => null,
});

export function ControlsProvider({ children }: { children: ReactNode }) {
	const [state, dispatch] = useReducer(controlsReducer, {
		drawerItems: null,
		rightPanelItems: null,
	});

	return (
		<ControlsContext.Provider value={{ ...state, dispatch }}>
			{children}
		</ControlsContext.Provider>
	);
}

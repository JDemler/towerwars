import { createContext, PropsWithChildren, useContext, useEffect, useReducer } from 'react';
import { FieldModel } from '../models';
import React from 'react';
import { useGameStateOpt } from './useGameState';

// type Action =
//     | { type: "clear-fieldModel"; }
//     | { type: "set-fieldModel"; fieldModel: FieldModel }

// function reducer (state: FieldModel | undefined, action: Action): FieldModel | undefined {
//     switch (action.type) {
//         case 'set-fieldModel':
//             return action.fieldModel;
//         default:
//             return state;
//     }
// }

const FieldModelContext = createContext<FieldModel | undefined>(undefined);

export interface FieldModelProviderProps extends PropsWithChildren {
    fieldId: number;
}

export const FieldModelProvider: React.FC<FieldModelProviderProps> = ({ fieldId, children }) => {
    // const [state, dispatch] = useReducer(reducer, undefined);

    const gameState = useGameStateOpt();

    const fieldModel = gameState?.gameState?.fields.find(field => field.id === fieldId);

    // useEffect(() => {
    //     const fieldModel = gameState?.fields.find(field => field.id === fieldId);

    //     if (fieldModel) {
    //         dispatch({ type: "set-fieldModel", fieldModel });
    //     } else {
    //         dispatch({ type: "clear-fieldModel" });
    //     }
    // }, [fieldId, gameState]);

    return (
        <FieldModelContext.Provider value={fieldModel}>
            {children}
        </FieldModelContext.Provider>
    )
}

export function useFieldModelOpt() {
    return useContext(FieldModelContext);
}

export function useFieldModel() {
    return useFieldModelOpt()!;
}
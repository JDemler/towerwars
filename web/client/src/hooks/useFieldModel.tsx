import { createContext, PropsWithChildren, useContext } from 'react';
import { FieldModel } from '../models';
import React from 'react';
import { useGameStateOpt } from './useGameState';

const FieldModelContext = createContext<FieldModel | undefined>(undefined);

export interface FieldModelProviderProps extends PropsWithChildren {
    fieldId: number;
}

export const FieldModelProvider: React.FC<FieldModelProviderProps> = ({ fieldId, children }) => {
    const gameState = useGameStateOpt();

    const fieldModel = gameState?.gameState?.fields.find(field => field.id === fieldId);

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
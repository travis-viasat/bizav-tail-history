/***
 * Copyright (C) 2026 Viasat, Inc.
 * All rights reserved.
 * The information in this software is subject to change without notice and
 * should not be construed as a commitment by Viasat, Inc.
 *
 * Viasat Proprietary
 * The Proprietary Information provided herein is proprietary to Viasat and
 * must be protected from further distribution and use. Disclosure to others,
 * use or copying without express written authorization of Viasat, is strictly
 * prohibited.
 *
 * Description: Zustand view store factory with persist middleware
 */
import {create} from 'zustand';
import type {StoreApi, UseBoundStore} from 'zustand';
import {createJSONStorage, persist} from 'zustand/middleware';
import type {StateStorage} from 'zustand/middleware';

export const customStorage: StateStorage = {
  getItem: async (name: string): Promise<string | null> => sessionStorage.getItem(name) ?? localStorage.getItem(name),
  setItem: async (name: string, value: string): Promise<void> => {
    sessionStorage.setItem(name, value);
    localStorage.setItem(name, value);
  },
  removeItem: async (name: string): Promise<void> => {
    sessionStorage.removeItem(name);
    localStorage.removeItem(name);
  }
};

export type BaseViewStoreActionsType = {reset: () => void};
export type LoadType = {loadUrlParams: (params: any) => void};

const viewStores: UseBoundStore<StoreApi<BaseViewStoreActionsType>>[] = [];

type SetFn<StateType> = {
  (newState: Partial<StateType>): void;
  (updater: (state: StateType) => Partial<StateType>): void;
};

const createViewStore = <StateType, ActionType extends BaseViewStoreActionsType>(
  name: string,
  initialValues: StateType,
  hookActions: (setFn: SetFn<StateType>) => ActionType,
  dontPersist: string[]
) => {
  const store = create<StateType & ActionType & LoadType>()(
    persist(
      (set, get) => ({
        ...initialValues,
        ...hookActions(set as unknown as SetFn<StateType>),
        loadUrlParams: (params: any) => {
          const curState = get();
          const updateSet: Partial<StateType & ActionType & LoadType> = {};

          for (const [key, value] of Object.entries(curState)) {
            if (typeof value !== 'function') {
              const newValue = params[key];
              if (newValue) {
                (updateSet as Record<string, any>)[key] = newValue;
              }
            }
          }

          if (Object.keys(updateSet).length > 0) {
            set(updateSet);
          }
        }
      }),
      {
        name,
        storage: createJSONStorage(() => customStorage),
        partialize: partState =>
          Object.fromEntries(
            Object.entries(partState as Record<string, any>).filter(([key]) => !dontPersist.includes(key))
          )
      }
    )
  );

  viewStores.push(store);
  return store;
};

/**
 * Reset all the view stores
 */
export const resetViewStores = () => {
  for (const store of viewStores) {
    store.getState().reset();
  }
};
export default createViewStore;

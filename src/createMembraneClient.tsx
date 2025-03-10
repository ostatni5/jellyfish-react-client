import React, { useContext, useMemo, useState } from "react";
import type { State, Selector } from "./state.types";
import { DEFAULT_STORE } from "./externalState/externalState";
import { ConnectConfig } from "./jellyfish/JellyfishClient";
import { connect } from "./connect";

export type MembraneContextProviderProps = {
  children: React.ReactNode;
};

type MembraneContextType<PeerMetadata, TrackMetadata> = {
  state: State<PeerMetadata, TrackMetadata>;
  setState: (value: (prevState: State<PeerMetadata, TrackMetadata>) => State<PeerMetadata, TrackMetadata>) => void;
  // setState: (
  //   value:
  //     | ((
  //     prevState: LibraryPeersState<PeerMetadata, TrackMetadata>
  //   ) => LibraryPeersState<PeerMetadata, TrackMetadata>)
  //     | LibraryPeersState<PeerMetadata, TrackMetadata>
  // ) => void;
};

export type UseConnect<PeerMetadata> = (config: ConnectConfig<PeerMetadata>) => () => void;

export const createMembraneClient = <PeerMetadata, TrackMetadata>() => {
  const MembraneContext = React.createContext<MembraneContextType<PeerMetadata, TrackMetadata> | undefined>(undefined);

  const MembraneContextProvider = ({ children }: MembraneContextProviderProps) => {
    const [state, setState] = useState<State<PeerMetadata, TrackMetadata>>(DEFAULT_STORE);

    return <MembraneContext.Provider value={{ state, setState }}>{children}</MembraneContext.Provider>;
  };

  const useMembraneContext = (): MembraneContextType<PeerMetadata, TrackMetadata> => {
    const context = useContext(MembraneContext);
    if (!context) throw new Error("useMembraneContext must be used within a MembraneContextProvider");
    return context;
  };

  const useSelector = <Result,>(selector: Selector<PeerMetadata, TrackMetadata, Result>): Result => {
    const { state } = useMembraneContext();

    return useMemo(() => selector(state), [selector, state]);
  };

  const useConnect = (): UseConnect<PeerMetadata> => {
    const { setState }: MembraneContextType<PeerMetadata, TrackMetadata> = useMembraneContext();

    return useMemo(() => connect(setState), [setState]);
  };

  return {
    MembraneContextProvider,
    useSelector,
    useConnect,
  };
};

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { cache } from "./cache";
import type { Selector } from "../state.types";
import type { ExternalState, Listener, Subscribe } from "./externalState";
// todo extract isEqual as dependency
import isEqual from "lodash.isequal";

const EMPTY_FUNCTION = () => undefined;

export const useSelector = <Result, PeerMetadata, TrackMetadata>(
  store: ExternalState<PeerMetadata, TrackMetadata>,
  selector: Selector<PeerMetadata, TrackMetadata, Result>
): Result => {
  const cachedSelector: Selector<PeerMetadata, TrackMetadata, Result> = useMemo(
    () => cache(isEqual, selector),
    [selector]
  );

  const subscribe: Subscribe = useCallback(
    (listener: Listener) => {
      const sub: Subscribe | undefined = store?.subscribe;

      return sub ? sub(listener) : EMPTY_FUNCTION;
    },
    [store]
  );

  const getSnapshotWithSelector = useCallback(
    () => cachedSelector(store?.getSnapshot() || null),
    [store, cachedSelector]
  );

  return useSyncExternalStore(subscribe, getSnapshotWithSelector);
};

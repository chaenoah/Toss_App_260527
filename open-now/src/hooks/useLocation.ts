import { useState, useEffect } from 'react';
import { getCurrentLocation } from '@apps-in-toss/web-framework';
import type { UserLocation } from '../types';

type LocationState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; location: UserLocation }
  | { status: 'error'; message: string };

export function useLocation() {
  const [state, setState] = useState<LocationState>({ status: 'idle' });

  useEffect(() => {
    setState({ status: 'loading' });

    getCurrentLocation({ accuracy: 'FINE' })
      .then((loc) =>
        setState({
          status: 'success',
          location: { lat: loc.latitude, lng: loc.longitude },
        }),
      )
      .catch((err: unknown) =>
        setState({
          status: 'error',
          message: err instanceof Error ? err.message : '위치를 가져올 수 없어요',
        }),
      );
  }, []);

  return state;
}

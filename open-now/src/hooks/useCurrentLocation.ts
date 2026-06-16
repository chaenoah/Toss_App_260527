import { useState, useCallback } from 'react';
import { geocodeAddress } from '../utils/geocode';
import type { UserLocation } from '../types';
import type { RegionInfo } from '../utils/geocode';

export type LocationStatus =
  | { phase: 'idle' }
  | { phase: 'success'; location: UserLocation; source: 'manual'; region: RegionInfo }
  | { phase: 'error'; message: string };

export function useCurrentLocation() {
  const [state, setState] = useState<LocationStatus>({ phase: 'idle' });

  const submitManualAddress = useCallback(async (address: string): Promise<boolean> => {
    const result = await geocodeAddress(address);
    if (!result) return false;
    setState({ phase: 'success', location: result.location, source: 'manual', region: result.info });
    return true;
  }, []);

  const reset = useCallback(() => setState({ phase: 'idle' }), []);

  return { state, submitManualAddress, reset };
}

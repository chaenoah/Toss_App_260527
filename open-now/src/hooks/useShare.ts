import { useCallback } from 'react';
import { share, getTossShareLink } from '@apps-in-toss/web-framework';
import type { MedicalPlace } from '../types';

export function useShare() {
  const sharePlaceLink = useCallback(async (place: MedicalPlace) => {
    const path = `intoss://open-now/place/${place.category}/${place.id}`;
    const tossLink = await getTossShareLink(path);
    await share({ message: `[${place.name}]\n${place.address}\n${tossLink}` });
  }, []);

  return { sharePlaceLink };
}

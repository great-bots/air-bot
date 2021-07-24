import cities from 'all-the-cities';

import type { City } from '../types/City';

export const getCityCoords = (cityName: string) => {
  const cityInfo = cities.filter((city: City) => {
    return city.name.match(cityName);
  });

  return cityInfo[0].loc.coordinates;
};

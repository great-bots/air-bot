import cities from 'all-the-cities';

import { City } from '../interfaces/City';

export const getCityCoords = (cityName: string) => {
  const cityInfo = cities.filter((city: City) => {
    return city.name.match(cityName);
  });

  return cityInfo[0].loc.coordinates;
};

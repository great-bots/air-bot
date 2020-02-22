import cities from 'all-the-cities';

export const getCityCoords = (cityName: string) => {
  const cityInfo = cities.filter((city: any) => {
    return city.name.match(cityName);
  });

  return cityInfo[0].loc.coordinates;
};

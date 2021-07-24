export interface City {
  cityId: string;
  name: string;
  country: string;
  altCountry: string;
  muni: string;
  muniSub: string;
  featureClass: string;
  featureCode: string;
  adminCode: string;
  population: number;
  loc: Loc;
}

interface Loc {
  type: string;
  coordinates: number[];
}

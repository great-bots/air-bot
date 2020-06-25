export interface Installation {
  id: number;
  location: Location;
  address: Address;
  elevation: number;
  airly: boolean;
  sponsor: Sponsor;
}

interface Sponsor {
  id: number;
  name: string;
  description: string;
  logo: string;
  link?: any;
  displayName: string;
}

interface Address {
  country: string;
  city: string;
  street: string;
  number: string;
  displayAddress1: string;
  displayAddress2: string;
}

interface Location {
  latitude: number;
  longitude: number;
}

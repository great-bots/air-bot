export interface Measurement {
  current: Data;
  history: Data[];
  forecast: Data[];
}

interface Data {
  fromDateTime: string;
  tillDateTime: string;
  values: Value[];
  indexes: Index[];
  standards: Standard[];
}

interface Value {
  name: string;
  value: number;
}

interface Index {
  name: string;
  value: number;
  level: string;
  description: string;
  advice: string;
  color: string;
}

interface Standard {
  name: string;
  pollutant: string;
  limit: number;
  percent: number;
  averaging: string;
}

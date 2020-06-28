import * as functions from 'firebase-functions';
import { WebhookClient } from 'dialogflow-fulfillment';

import { getCityCoords } from './helpers/getCityCoords';

import { airly } from './config/airly';

import { Installation } from './interfaces/Installation';
import { Measurement } from './interfaces/Measurement';

import type { Coords } from './types/Coords';

process.env.DEBUG = 'dialogflow:debug';

export const packageBot = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });

  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

  const getInstallations = async ({ latitude, longitude }: Coords) => {
    const installations = await airly.nearestInstallations(
      latitude,
      longitude,
      30,
      3
    );

    if (!installations[0]) {
      agent.add('No installations were found in your area.');
    }

    await displayResults(installations);
  };

  const displayResults = async (installations: Installation[]) => {
    const data: Measurement = await airly.installationMeasurements(
      installations[0].id
    );

    const { city, street } = installations[0].address;

    const { indexes, values, standards } = data.current;

    agent.add(`Location: ${city}, ${street}`);
    agent.add(`Description: ${indexes[0].description}`);
    agent.add(`Advice: ${indexes[0].advice}\n`);
    agent.add(`Particulate Matter (PM) in μg/m3:`);

    values
      .filter((item) => item.name === 'PM25' || item.name === 'PM10')
      .map(({ name, value }) => agent.add(`${name}: ${value}`));

    agent.add('\nAir quality guidelines recommended by WHO (24-hour mean):');

    standards.map(({ pollutant, limit }) =>
      agent.add(`${pollutant}: ${limit} μg/m3`)
    );

    agent.add('\nReady more about air quality here: https://bit.ly/2tbIhek');
  };

  async function airPollutionStatusNearby(agent: WebhookClient) {
    const { longitude, latitude } = agent.parameters;

    await getInstallations({
      longitude: parseFloat(longitude),
      latitude: parseFloat(latitude),
    });
  }

  async function airPollutionStatus(agent: WebhookClient) {
    const [longitude, latitude] = getCityCoords(agent.parameters.city);

    await getInstallations({ longitude, latitude });
  }

  const intentMap = new Map();

  intentMap.set('Air Pollution Status Nearby', airPollutionStatusNearby);
  intentMap.set('Air Pollution Status', airPollutionStatus);

  agent.handleRequest(intentMap).then(
    () => null,
    () => null
  );
});

import * as functions from 'firebase-functions';
import { WebhookClient } from 'dialogflow-fulfillment';
import cities from 'all-the-cities';
import Airly from 'airly';

process.env.DEBUG = 'dialogflow:debug';

export const packageBot = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });

  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

  const airly = new Airly(process.env.AIRLY_KEY!);

  const getInstallations = async ({ latitude, longitude }: any) => {
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

  const displayResults = async (installations: any) => {
    const data = await airly.installationMeasurements(installations[0].id);

    const { city, street } = installations[0].address;

    const { indexes, values, standards } = data.current;

    console.log(`Location: ${city}, ${street}`);
    console.log(`Description: ${indexes[0].description}`);
    console.log(`Advice: ${indexes[0].advice}\n`);
    console.log(`Particulate Matter (PM) in μg/m3:`);

    values
      .filter((item: any) => item.name === 'PM25' || item.name === 'PM10')
      .map(({ name, value }: any) => console.log(`${name}: ${value}`));

    console.log('\nAir quality guidelines recommended by WHO (24-hour mean):');

    standards.map(({ pollutant, limit }: any) =>
      console.log(`${pollutant}: ${limit} μg/m3`)
    );

    console.log('\nReady more about air quality here: https://bit.ly/2tbIhek');
  };

  async function airPollutionStatusNearby(agent: WebhookClient) {
    const { latitude, longitude } = agent.parameters;

    await getInstallations({ latitude, longitude });
  }

  async function airPollutionStatus(agent: WebhookClient) {
    const cityInfo = cities.filter((city: any) => {
      return city.name.match(agent.parameters.city);
    });

    const [longitude, latitude] = cityInfo[0].loc.coordinates;

    await getInstallations({ latitude, longitude });
  }

  const intentMap = new Map();

  intentMap.set('Air Pollution Status Nearby', airPollutionStatusNearby);
  intentMap.set('Air Pollution Status', airPollutionStatus);

  agent.handleRequest(intentMap).then(
    () => null,
    () => null
  );
});

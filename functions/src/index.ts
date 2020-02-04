import * as functions from 'firebase-functions';
import { WebhookClient } from 'dialogflow-fulfillment';
import Airly from 'airly';

process.env.DEBUG = 'dialogflow:debug';

export const packageBot = functions.https.onRequest((request, response) => {
  const agent = new WebhookClient({ request, response });

  const airly = new Airly(process.env.AIRLY_KEY);

  console.log('Dialogflow Request headers: ' + JSON.stringify(request.headers));
  console.log('Dialogflow Request body: ' + JSON.stringify(request.body));

  async function airPollutionStatus(agent: WebhookClient) {
    const city = agent.parameters.city;

    const { latitude, longitude } = agent.parameters;

    const installations = await airly.nearestInstallations(
      latitude,
      longitude,
      30,
      3
    );

    if (!installations[0]) {
      agent.add('No installations were found in your area.');
    }

    const data = await airly.installationMeasurements(installations[0].id);

    data.current.values
      .filter(item => item.name === 'PM25')
      .map(el => el.value);

    // agent.add();
  }

  const intentMap = new Map();

  intentMap.set('Air Pollution Status', airPollutionStatus);

  agent.handleRequest(intentMap).then(
    () => null,
    () => null
  );
});

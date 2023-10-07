const { Kafka, logLevel } = require('kafkajs');
const { OpenFgaApi } = require('@openfga/sdk');

const kafka = new Kafka({
  logLevel: logLevel.INFO,
  brokers: process.env.OPENFGA_KAFKA_BROKERS || ['kafka:19092'],
  clientId: process.env.OPENFGA_KAFKA_CLIENT_ID || 'example-consumer',
  retry: {
    initialRetryTime: 500,
    retries: 20,
    maxRetryTime: 50000
  }
})

const openFga = new OpenFgaApi({
  apiScheme: process.env.OPENFGA_API_SCHEME || "http",
  apiHost: process.env.OPENFGA_API_HOST || "openfga:8080"
});

const topicsArray = process.env.OPENFGA_KAKFA_TOPIC || ['openfga-topic']
const consumer = kafka.consumer({ groupId: 'test-group' })


const run = async () => {
  await consumer.connect()
  await consumer.subscribe({ topics: topicsArray, fromBeginning: true })
  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`
      console.log(`[Kafka Consumer OpenFGA] ${prefix} ${message.key}#${message.value}`);
      console.log("[Kafka Consumer OpenFGA] Proceeding to publish message");
      if(!openFga.storeId){
        console.log("[Kafka Consumer OpenFGA] Upps OpenFGA is not initialized properly...");
        await getOpenFGAStore();
        if(!openFga.storeId){
          console.error("[Kafka Consumer OpenFGA] OpenFGA doesn't have store id, therefore, we are not going to publish the events..");
          return;
        }
      }
      await publishOpenFgaTuples(JSON.parse(message.value.toString()));     
    },
  })
}

const publishOpenFgaTuples = async (relationships) => { 
  try {
    console.log("[Kafka Consumer OpenFGA] Publish tuples: " + JSON.stringify(relationships)); 
    const result = await openFga.write(relationships);
    console.log("[Kafka Consumer OpenFGA] Success: " + JSON.stringify(result)); 
  }  
  catch(e) {
    console.error(e);
  }
}

const getOpenFGAStore = async () => {
  console.log("[Kafka Consumer OpenFGA] Finding the OpenFGA store...");
  try {
    const { stores } = await openFga.listStores();
    for (const store of stores) {
      console.log("[Kafka Consumer OpenFGA] Store found name: " + store.name + " id: " + store.id);
      openFga.storeId =  store.id;
      const { authorization_models } = await openFga.readAuthorizationModels();
      console.log("[Kafka Consumer OpenFGA] Authz models: " + JSON.stringify(authorization_models) + " for store ID: " + openFga.storeId);
    }  
  }
  catch(e){
    console.error(e)
  }
}

const initOpenFGA = async () => {
  await getOpenFGAStore();
}

initOpenFGA().catch(e => console.error(`[OpenFga] ${e.message}`, e))
run().catch(e => console.error(`[OpenFga] ${e.message}`, e))

const errorTypes = ['unhandledRejection', 'uncaughtException']
const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2']

errorTypes.forEach(type => {
  process.on(type, async e => {
    try {
      console.log(`[OpenFGA] process.on ${type}`)
      console.error(e)
      await consumer.disconnect()
      process.exit(0)
    } catch (_) {
      process.exit(1)
    }
  })
})

signalTraps.forEach(type => {
  process.once(type, async () => {
    try {
      await consumer.disconnect()
    } finally {
      process.kill(process.pid, type)
    }
  })
})
import mqtt from 'mqtt'
import moment from 'moment'

const devID = 'INEM_DEMO'
const topic = `devicesIn/${devID}/data`
const max = 100
const min = 10
let mqttClient

function publishData() {
  const interval = setInterval(() => {
    /** Publish on mqtt every second */
    console.log('Publishing ', devID, ' data...')
    const random = Math.random() * (max - min) + min
    const random2 = Math.random() * (max - min) + min
    const random3 = Math.random() * (max - min) + min
    // console.log('Random number', random)

    const currentHour = moment().get('hour') // should be either 5(10:30 am in IST) or 12 (5:30 pm in IST) publish low VOLTS1 value

    const dataPacket = {
      device: devID,
      time: Date.now(),
      data: [
        {
          tag: 'VOLTS1',
          value: 228.07602856051832,
        },
        {
          tag: 'VOLTS2',
          value: 228.3990800794001,
        },
        {
          tag: 'VOLTS3',
          value: 227.9216194144245,
        },
        {
          tag: 'CUR1',
          value: 1.676028560518326,
        },
        {
          tag: 'CUR2',
          value: 2.776028560518326,
        },
        {
          tag: 'CUR3',
          value: 2.376028560518326,
        },
        {
          tag: 'W1',
          value: 0.4260285605183258,
        },
        {
          tag: 'W2',
          value: 0.6460285605183258,
        },
        {
          tag: 'W3',
          value: 0.5960285605183259,
        },
        {
          tag: 'PF1',
          value: 0.8376028560518325,
        },
        {
          tag: 'PF2',
          value: 0.8076028560518327,
        },
        {
          tag: 'PF3',
          value: 0.8276028560518325,
        },
        {
          tag: 'PFAVG',
          value: 0.8276028560518325,
        },
        {
          tag: 'FREQ',
          value: 50.076028560518324,
        },
        {
          tag: 'REACTIVE',
          value: 1.306028560518326,
        },
        {
          tag: 'ACTIVE',
          value: 1.326028560518326,
        },
        {
          tag: 'MDKW',
          value: 2.15,
        },
        {
          tag: 'MD',
          value: 1.9,
        },
        {
          tag: 'RSSI',
          value: 16.076028560518324,
        },
      ],
    }

    mqttClient.publish(topic, JSON.stringify(dataPacket))
  }, 9000)
}
const mqttconfig = {
  host: 'broker.emqx.io',
  port: 1883,
  username: 'admin',
  password: 'server$4321',
  qos: 2,
}
mqttconfig.clientId = 'DMFM_D2' + Date.now()
mqttClient = mqtt.connect(mqttconfig)
console.log('EnergyMeter Mqtt client connected:-', mqttClient.options.clientId)

publishData()

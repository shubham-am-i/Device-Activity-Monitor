import mqtt from 'mqtt'
import moment from 'moment'
import Redis from 'ioredis'
import colors from 'colors'

// configurations
const protocol = 'mqtt'
const host = 'broker.emqx.io'
const port = '1883'
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`
const devID = 'INEM_DEMO'
const topic = `devicesIn/${devID}/data`

// Redis configuration
const redisClient = new Redis()
const connectionTimeout = 10000 // Specify the connection timeout value in milliseconds
let lastPacketTime = moment()

// Create MQTT client for device activity subscriber
const client_DeviceActivity = mqtt.connect(`${protocol}://${host}:${port}`, {
  clientId,
})

// Handle connection event
client_DeviceActivity.on('connect', () => {
  console.log('Device Activity Subscriber connected')

  // Subscribe to the publisher's topic
  client_DeviceActivity.subscribe(topic, { qos: 2 }, (error) => {
    if (error) {
      console.error('Subscription failed', error)
    } else {
      console.log('Device Activity Subscriber subscribed to topic:'.yellow, topic)
    }
  })
})

// Handle message received event
client_DeviceActivity.on('message', async (topic, message) => {
  // console.log('Device Activity Monitored: Publisher is Active'.green)
  const { time } = JSON.parse(message.toString())

  // // Store the current packet time in Redis
  // lastPacketTime = time

  lastPacketTime = moment(time)

  // Store the current packet time in Redis
  await redisClient.hset('connection_timeout', devID, lastPacketTime.valueOf())
})

// Check for absence of messages within connection timeout
setInterval(async () => {
  const currentTime = moment()
  const lastPacketTimeStr = await redisClient.hget('connection_timeout', devID)
  lastPacketTime = moment(parseInt(lastPacketTimeStr))

  const timeDiff = moment.duration(currentTime.diff(lastPacketTime)).asMilliseconds()
  // console.log(timeDiff, connectionTimeout);
  if (timeDiff > connectionTimeout) {
    // Publisher has failed to send data within the specified time
    const dataPacket = {
      device: devID,
      time: Date.now(),
      data: [
        {
          tag: 'RSSI',
          value: -1,
        },
      ],
    }
    client_DeviceActivity.publish(topic, JSON.stringify(dataPacket))
    console.log('Warning: Publisher is Offline. Sending RSSI : -1'.red)
  }
}, connectionTimeout)

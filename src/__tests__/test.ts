import { getOutputDevices, getOutputDeviceVolume, setOutputDeviceVolume } from "macos-audio-devices"
import * as console from "node:console"
test("test", async () => {
  const outputDevices = await getOutputDevices().then(devices => {
    console.log(devices[0])
    return devices
  })
  await getOutputDeviceVolume(outputDevices[0].id).then(volume => {
    console.log("Volume: ", volume)
  })
  outputDevices.forEach(device => {
    console.log("Set volume to 0.2 for device: ", device.name)
    setOutputDeviceVolume(device.id, 0.2)
  })
})

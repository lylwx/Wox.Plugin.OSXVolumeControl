import { Context, Plugin, PluginInitParams, PublicAPI, Query, Result } from "@wox-launcher/wox-plugin"
import { getOutputDevices, getOutputDeviceVolume, setOutputDeviceVolume } from "macos-audio-devices"

let api: PublicAPI
const actionVolumeArray = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]

export const plugin: Plugin = {
  init: async (ctx: Context, initParams: PluginInitParams) => {
    api = initParams.API
    await api.Log(ctx, "Info", "Init finished")
  },

  query: async (ctx: Context, query: Query): Promise<Result[]> => {
    const outputDevices = await getOutputDevices()
    await api.Log(ctx, "Info", `Found ${outputDevices.length} output devices: ${JSON.stringify(outputDevices)}`)
    const queryArray = query.Search.split(" ")
    const filter =
      queryArray.length > 0
        ? queryArray
            .filter((_, index) => {
              return index !== queryArray.length - 1
            })
            .reduce((acc, curr) => acc + curr, "")
        : ""
    const action = queryArray.length > 1 ? queryArray[queryArray.length - 1] : ""
    return outputDevices
      .filter(device => {
        if (filter !== "") {
          if (filter.startsWith("id:")) {
            const contentArray = filter.split(":")
            return device.id.toString().includes(contentArray[1])
          }
          return device.name.toLowerCase().includes(filter.toLowerCase())
        }
        return true
      })
      .map(device => {
        const isValidAction = !isNaN(parseFloat(action)) || action == "++" || action == "--"
        const subTitle =
          query.Search === "" || !isValidAction
            ? device.transportType
            : action == "++"
            ? "Add 10% to volume"
            : action == "--"
            ? "Subtract 10% from volume"
            : `Set volume to ${Math.min(parseFloat(action), 100)}%`
        return {
          Title: `${device.name} 【Device ID: ${device.id})】`,
          SubTitle: subTitle,
          Icon: {
            ImageType: "relative",
            ImageData: "images/app.png"
          },
          Actions: isValidAction
            ? [
                {
                  Name: subTitle,
                  IsDefault: true,
                  Action: async () => {
                    if (queryArray.length > 1) {
                      const contentArray = filter.split(":").filter((_, index) => {
                        return index !== 0
                      })
                      if (action == "++") {
                        contentArray.forEach(deviceId => {
                          const currentDeviceId = Number(deviceId)
                          if (isNaN(currentDeviceId)) return
                          getOutputDeviceVolume(currentDeviceId).then(volume => {
                            api.Log(ctx, "Info", `Current volume is ${volume}`)
                            setOutputDeviceVolume(currentDeviceId, Number(Number(volume) + 0.1))
                            api.Log(ctx, "Info", `Set volume to ${Number(volume) + 0.1}`)
                          })
                        })
                      } else if (action == "--") {
                        contentArray.forEach(deviceId => {
                          const currentDeviceId = Number(deviceId)
                          if (isNaN(currentDeviceId)) return
                          getOutputDeviceVolume(currentDeviceId).then(volume => {
                            api.Log(ctx, "Info", `Current volume is ${volume}`)
                            setOutputDeviceVolume(currentDeviceId, Number(Number(volume) - 0.1))
                            api.Log(ctx, "Info", `Set volume to ${Number(volume) - 0.1}`)
                          })
                        })
                      } else if (!isNaN(parseFloat(action))) {
                        contentArray.forEach(deviceId => {
                          const currentDeviceId = Number(deviceId)
                          if (isNaN(currentDeviceId)) return
                          api.Log(ctx, "Info", `Current deviceId is ${currentDeviceId}`)
                          const changeVolume = Math.max(0, Math.min(1, parseFloat(action) / 100))
                          setOutputDeviceVolume(currentDeviceId, changeVolume)
                          api.Log(ctx, "Info", `Set volume to ${changeVolume}`)
                        })
                      }
                    }
                  }
                }
              ]
            : device.transportType === "aggregate"
            ? []
            : actionVolumeArray.map(volume => {
                return {
                  Name: `Set volume to ${volume * 100}%`,
                  Action: async () => {
                    await setOutputDeviceVolume(device.id, volume)
                  }
                }
              })
        }
      })
  }
}

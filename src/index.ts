import { Context, Plugin, PluginInitParams, PublicAPI, Query, Result } from "@wox-launcher/wox-plugin"
import { getOutputDevices, getOutputDeviceVolume, setOutputDeviceVolume } from "macos-audio-devices"

let api: PublicAPI

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
                          if (isNaN(Number(deviceId))) return
                          getOutputDeviceVolume(Number(deviceId)).then(volume => {
                            api.Log(ctx, "Info", `Current volume is ${volume}`)
                            setOutputDeviceVolume(Number(deviceId), Number(Number(volume) + 0.1))
                            api.Log(ctx, "Info", `Set volume to ${Number(volume) + 0.1}`)
                          })
                        })
                      } else if (action == "--") {
                        contentArray.forEach(deviceId => {
                          if (isNaN(Number(deviceId))) return
                          getOutputDeviceVolume(Number(deviceId)).then(volume => {
                            api.Log(ctx, "Info", `Current volume is ${volume}`)
                            setOutputDeviceVolume(Number(deviceId), Number(Number(volume) - 0.1))
                            api.Log(ctx, "Info", `Set volume to ${Number(volume) - 0.1}`)
                          })
                        })
                      } else if (!isNaN(parseFloat(action))) {
                        contentArray.forEach(deviceId => {
                          if (isNaN(Number(deviceId))) return
                          const changeVolume = Math.max(0, Math.min(1, parseFloat(action) / 100))
                          setOutputDeviceVolume(device.id, changeVolume)
                          api.Log(ctx, "Info", `Set volume to ${changeVolume}`)
                        })
                      }
                    }
                  }
                }
              ]
            : [
                {
                  Name: "Set volume to 10%",
                  Action: async () => {
                    await setOutputDeviceVolume(device.id, 0.1)
                  }
                },
                {
                  Name: "Set volume to 20%",
                  Action: async () => {
                    await setOutputDeviceVolume(device.id, 0.2)
                  }
                },
                {
                  Name: "Set volume to 30%",
                  Action: async () => {
                    await setOutputDeviceVolume(device.id, 0.3)
                  }
                },
                {
                  Name: "Set volume to 40%",
                  Action: async () => {
                    await setOutputDeviceVolume(device.id, 0.4)
                  }
                },
                {
                  Name: "Set volume to 50%",
                  Action: async () => {
                    await setOutputDeviceVolume(device.id, 0.5)
                  }
                },
                {
                  Name: "Set volume to 60%",
                  Action: async () => {
                    await setOutputDeviceVolume(device.id, 0.6)
                  }
                },
                {
                  Name: "Set volume to 70%",
                  Action: async () => {
                    await setOutputDeviceVolume(device.id, 0.7)
                  }
                },
                {
                  Name: "Set volume to 80%",
                  Action: async () => {
                    await setOutputDeviceVolume(device.id, 0.8)
                  }
                },
                {
                  Name: "Set volume to 90%",
                  Action: async () => {
                    await setOutputDeviceVolume(device.id, 0.9)
                  }
                },
                {
                  Name: "Set volume to 100%",
                  Action: async () => {
                    await setOutputDeviceVolume(device.id, 1)
                  }
                }
              ]
        }
      })
  }
}

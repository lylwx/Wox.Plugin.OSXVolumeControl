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
    return outputDevices
      .filter(device => {
        if (queryArray.length > 0) {
          const filter = queryArray
            .filter((_, index) => {
              return index !== queryArray.length - 1
            })
            .reduce((acc, curr) => acc + curr, "")
          if (filter.startsWith("id:")) {
            return device.id.toString().includes(filter.slice(3))
          }
          return device.name.toLowerCase().includes(filter.toLowerCase())
        }
        return true
      })
      .map(device => {
        const action = queryArray.length > 1 ? queryArray[queryArray.length - 1] : ""
        const isValidAction = !isNaN(parseFloat(action)) || action == "++" || action == "--"
        return {
          Title: device.name,
          SubTitle: `Device ID: ${device.id}`,
          Icon: {
            ImageType: "relative",
            ImageData: "images/app.png"
          },
          Actions: isValidAction
            ? [
                {
                  Name: !isNaN(parseFloat(action)) ? `Set volume to ${queryArray[queryArray.length - 1]}` : action == "++" ? "Add 10% to volume" : "Subtract 10% from volume",
                  IsDefault: true,
                  Action: async () => {
                    if (queryArray.length > 1) {
                      if (action == "++") {
                        getOutputDeviceVolume(device.id).then(volume => {
                          api.Log(ctx, "Info", `Current volume is ${volume}`)
                          setOutputDeviceVolume(device.id, Number(Number(volume) + 0.1))
                          api.Log(ctx, "Info", `Set volume to ${Number(volume) + 0.1}`)
                        })
                      } else if (action == "--") {
                        getOutputDeviceVolume(device.id).then(volume => {
                          api.Log(ctx, "Info", `Current volume is ${volume}`)
                          setOutputDeviceVolume(device.id, Number(Number(volume) - 0.1))
                          api.Log(ctx, "Info", `Set volume to ${Number(volume) - 0.1}`)
                        })
                      } else if (!isNaN(parseFloat(action))) {
                        await setOutputDeviceVolume(device.id, Math.max(0, Math.min(1, parseFloat(action))))
                        await api.Log(ctx, "Info", `Set volume to ${Math.max(0, Math.min(1, parseFloat(action)))}`)
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

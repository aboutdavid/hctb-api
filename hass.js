const fetch = require("node-fetch").default;
const config = require("./config.js")

async function main() {
    const busp = await fetch(`${config.hass.hctb_api_server}/api/login?` + new URLSearchParams({
        user: config.hass.username,
        pass: config.hass.password,
        code: config.hass.school_code
    }), { method: "POST" })
    const bus = await busp.json()

    if (!bus.success) { // We basically want to stop it if anything bad happens
        console.error(`Error: ${bus.error}`)
        process.exit(1)
    }
    // Let's implement reverse lookup if we get a lat and a lon
    var street = "Unavailable"
    if (bus.lat && bus.lon) {
      const reversep = await fetch(`${config.hass.hctb_api_server}/api/reverse?` + new URLSearchParams({
        lat: bus.lat, lon: bus.lon
    }), { method: "POST" })
    const reverse = reversep.json()
    if (!reverse.success || !reverse.name) return // We don't need to look it up further.
    street = reverse.name
    }

    await fetch(`${config.hass.instance_base}/api/states/hctb.street_name`, {
        headers: {
            "Authorization": `Bearer ${config.hass.access_token}`,
            "Content-Type": `application/json`
        },
        body: JSON.stringify({
            state: street,
            entity_id: "hctb.street_name"
        }),
        method: "POST"
    })
    await fetch(`${config.hass.instance_base}/api/states/hctb.latitude`, {
        headers: {
            "Authorization": `Bearer ${config.hass.access_token}`,
            "Content-Type": `application/json`
        },
        body: JSON.stringify({
            state: bus.lat || "Unavailable",
            entity_id: "hctb.latitude"
        }),
        method: "POST"
    })
    await fetch(`${config.hass.instance_base}/api/states/hctb.longitude`, {
        headers: {
            "Authorization": `Bearer ${config.hass.access_token}`,
            "Content-Type": `application/json`
        },
        body: JSON.stringify({
            state: bus.lon || "Unavailable",
            entity_id: "hctb.longitude"
        }),
        method: "POST"
    })
    await fetch(`${config.hass.instance_base}/api/states/hctb.route_status`, {
        headers: {
            "Authorization": `Bearer ${config.hass.access_token}`,
            "Content-Type": `application/json`
        },
        body: JSON.stringify({
            state: (bus.lat && bus.lon) ? "In service": "Not running",
            entity_id: "hctb.route_status"
        }),
        method: "POST"
    })
}
main()
if (config.hass.cron.builtIn) setInterval(main, config.hass.cron.frequency || 1000 * 60)
module.exports = {
    hass: {
        access_token: "...",
        instance_base: "https://something.ui.nabu.casa", // Do not include a trailing slash. nabu.casa links works here too.
        hctb_api_server: "http://localhost:8080", // Again, please do not include a trailing slash.
        username: "youremail@example.com", // Usually an E-mail (from HCTB)
        password: "verySecurePassword!", // The password (from HCTB),
        school_code: "12345",
        cron: {
          builtIn: true, // Disable this if you prefer to use crontab, rather than the setInterval.
          frequency: 1000 * 60 // Once per minute
        }
    }
}
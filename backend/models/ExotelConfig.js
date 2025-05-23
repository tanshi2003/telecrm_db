const db = require("../config/db");

const ExotelConfig = {
    // Get the current Exotel configuration
    getConfig: (callback) => {
        db.query("SELECT * FROM exotel_config ORDER BY id DESC LIMIT 1", callback);
    },

    // Update Exotel configuration
    updateConfig: (config, callback) => {
        const { sid, token, phone_number } = config;
        db.query(
            "INSERT INTO exotel_config (sid, token, phone_number) VALUES (?, ?, ?)",
            [sid, token, phone_number],
            callback
        );
    }
};

module.exports = ExotelConfig; 
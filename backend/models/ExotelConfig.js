const db = require("../config/db");

const ExotelConfig = {
    // Get the current Exotel configuration
    getConfig: async () => {
        try {
            const [results] = await db.promise().query(
                "SELECT * FROM exotel_config ORDER BY id DESC LIMIT 1"
            );
            return results.length ? results[0] : null;
        } catch (error) {
            throw error;
        }
    },

    // Update Exotel configuration
    updateConfig: async (config) => {
        try {
            const { sid, token, phone_number } = config;
            const [result] = await db.promise().query(
                "INSERT INTO exotel_config (sid, token, phone_number) VALUES (?, ?, ?)",
                [sid, token, phone_number]
            );
            return result;
        } catch (error) {
            throw error;
        }
    }
};

module.exports = ExotelConfig;
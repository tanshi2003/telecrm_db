const responseFormatter = (success, message, data = null) => {
    // If data is already a complete response object, return it as is
    if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
        return data;
    }
    
    // If data is already formatted with dbCallId, return it in the correct structure
    if (data && typeof data === 'object' && 'dbCallId' in data) {
        return {
            success,
            data
        };
    }
    
    // Default response format
    return {
        success,
        message,
        data
    };
};

module.exports = responseFormatter;
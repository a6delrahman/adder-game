module.exports = (req, res, next) => {
    res.success = (data, message = 'Request successful') => {
        res.json({ success: true, message, data });
    };

    next();
};
const mongoose = require('mongoose');

const UserActivitySchema = new mongoose.Schema({
    userId: { type: String, required: true },
    loginTime: { type: Date, default: Date.now },
    logoutTime: { type: Date },
    actionType: { type: String, required: true },
    status: { type: String, required: true },
    sessionId: { type: String, required: true }, // JWT or session ID
    userRole: { type: String },
    ipAddress: { type: String },
    deviceInfo: { type: String },
    browserInfo: { type: String },
    osInfo: { type: String },
    location: { type: Object },
    userAgent: { type: String },
});

const UserActivity = mongoose.model('UserActivity', UserActivitySchema);
module.exports = UserActivity;

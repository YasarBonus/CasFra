const mongoose = require('mongoose');


// used for the login data
const ProxmoxServersLoginSchema = new mongoose.Schema ({
    username: String,
    password: String,
    url: String,
    port: Number,
    token: String,
});

// used for the logs
const ProxmoxServersLogsSchema = new mongoose.Schema ({
    date: Date,
    log: String,
});

const ProxmoxServersLogs = mongoose.model('ProxmoxServersLogs', ProxmoxServersLogsSchema);

const proxmoxServersSchema = new mongoose.Schema({
    name: String,
    hostname: String,
    login: ProxmoxServersLoginSchema,
    description: String,
    active: Boolean,
    proxmox_version: String,
    proxmox_logs: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: 'ProxmoxServersLogs'
    },
});

const ProxmoxServers = mongoose.model('ProxmoxServers', proxmoxServersSchema);

module.exports = {
    ProxmoxServers,
    ProxmoxServersLogs,
}
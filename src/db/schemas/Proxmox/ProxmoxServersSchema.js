const mongoose = require('mongoose');

// used for the logs
const ProxmoxServersLogsSchema = new mongoose.Schema({
    date: Date,
    log: String,
    proxmoxServer_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ProxmoxServers',
    },
});

const ProxmoxServersLogs = mongoose.model('ProxmoxServersLogs', ProxmoxServersLogsSchema);

// used for the login data
// it's correct that there is no model for this, because it's only used in the ProxmoxServersSchema
const ProxmoxServersLoginSchema = new mongoose.Schema({
    username: String,
    password: String,
    url: String,
    port: Number,
    token: String,
});

// used for the proxmox server data
const proxmoxServersSchema = new mongoose.Schema({
    name: String,
    hostname: String,
    login: ProxmoxServersLoginSchema,
    description: String,
    active: Boolean,
    proxmox_server_id: String,
    proxmox_version: String,
    proxmox_clustered: {
        type: Boolean,
        default: false
    },
});

const ProxmoxServers = mongoose.model('ProxmoxServers', proxmoxServersSchema);

// Create some default data

const proxmoxServersEntries = [{
    name: 'Treudler',
    hostname: 'treudler',
    login: {
        username: 'root',
        password: 'password',
        url: 'https://treudler:8006/api2/json',
        port: 8006,
        token: '',
    },
    description: 'Treudler Proxmox Server',
    active: true,
    proxmox_server_id: 'treudler',
    proxmox_version: '6.3-3',
    proxmox_logs: [],
}]

const saveDefaultProxmoxServersDatabaseData = async () => {
    try {
        const promises = [];

        for (const proxmoxServersEntry of proxmoxServersEntries) {
            const existingProxmoxServers = await ProxmoxServers.findOne({
                name: proxmoxServersEntry.name
            });

            if (!existingProxmoxServers) {
                promises.push(ProxmoxServers.create(proxmoxServersEntry));
            }
        }

        await Promise.all(promises);
    } catch (error) {
        console.error('Error saving default proxmox servers database data:', error);
    }
}

saveDefaultProxmoxServersDatabaseData();

const proxmoxServersLogsEntries = [{
        date: new Date(),
        log: 'Test Log',
        proxmoxServer_id: '6594aed412628fe5edc7f238',
    },
    {
        date: new Date(),
        log: 'Test Log 2',
        proxmoxServer_id: '6594aed412628fe5edc7f238',

    },
    {
        date: new Date(),
        log: 'Test Log 3',
        proxmoxServer_id: '6594aed412628fe5edc7f238',

    }
]

// function to save the default data for the proxmox servers logs in the ProxmoxServers.proxmox_logs array
const saveDefaultProxmoxServersLogsDatabaseData = async () => {
    try {
        const promises = [];

        for (const proxmoxServersLogsEntry of proxmoxServersLogsEntries) {
            const existingProxmoxServersLogs = await ProxmoxServersLogs.findOne({
                log: proxmoxServersLogsEntry.log
            });

            if (!existingProxmoxServersLogs) {
                promises.push(ProxmoxServersLogs.create(proxmoxServersLogsEntry));
            }
        }

        await Promise.all(promises);
    } catch (error) {
        console.error('Error saving default proxmox servers logs database data:', error);
    }
}

saveDefaultProxmoxServersLogsDatabaseData();

module.exports = ProxmoxServers, ProxmoxServersLogs;
const mongoose = require('mongoose');
const generateRandomPriority = require('../../utils/generateRandomPriority');

const hcVmSchema = new mongoose.Schema({
    name: String,
    notes: String,
    createdBy: {
        type: String,
    },
    createdDate: {
        type: Date,
        default: Date.now
    },
    modifiedBy: String,
    modifiedDate: Date,
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    active: {
        type: Boolean,
        default: true
    },
    instanceId: String,
    publicIpv4: String,
    publicIpv6: String,
    region: {
        type: String,
        required: true
    },
    instanceId: {
        type: String,
        required: true
    },
    root_password: {
        type: String
    },
    operatingSystem: {
        type: String
    },
})

const HcVm = mongoose.model('HcVm', hcVmSchema);

const axios = require('axios');

async function createVmAndSaveToDb(name, notes, createdBy) {
        try {
            // Hetzner Cloud API aufrufen, um die VM zu erstellen
            const response = await axios.post('https://api.hetzner.cloud/v1/servers', {
                name: name,
                image: 'ubuntu-22.04',
                server_type: 'cx11'
                // Weitere Parameter hier, wie z.B. Servertyp, Image, Standort, etc.
            }, {
                headers: {
                    'Authorization': 'Bearer ' + 'rG2JQY07WqlaaJgHNcxf8y1PrPtMn0OQJLNgGnnbEkCPZzJZVwzMiQmTt14Diivo'
                }
            });
    
            // Überprüfen, ob die VM erfolgreich erstellt wurde
            if (response.data && response.data.server) {
                const server = response.data.server;
    
                // Neue HcVm-Instanz erstellen
                const hcVm = new HcVm({
                    name: name,
                    notes: notes,
                    createdBy: createdBy,
                    instanceId: server.id,
                    publicIpv4: server.public_net.ipv4.ip,
                    publicIpv6: server.public_net.ipv6.ip,
                    region: server.datacenter.name,
                    root_password: server.root_password
                    // Weitere Felder hier
                });
    
                // HcVm-Instanz in die Datenbank speichern
                const savedHcVm = await hcVm.save();
    
                console.log('VM erfolgreich erstellt und in die Datenbank eingetragen.');
                console.log('VM ID:', savedHcVm.instanceId); // Print the saved VM ID
            } else {
                console.log('Fehler beim Erstellen der VM:', response.data);
            }
        } catch (error) {
            console.error('Fehler:', error);
        }
    }

async function updateVmDetailsFromHetznerCloud() {
    // Alle HcVm-Instanzen aus der Datenbank abrufen
    const hcVms = await HcVm.find();

    // Für jede HcVm-Instanz die Details aus der Hetzner Cloud API abrufen
    for (let i = 0; i < hcVms.length; i++) {
        const hcVm = hcVms[i];

        // Hetzner Cloud API aufrufen, um die VM-Details abzurufen
        const response = await axios.get('https://api.hetzner.cloud/v1/servers/' + hcVm.instanceId, {
            headers: {
                'Authorization': 'Bearer ' + 'rG2JQY07WqlaaJgHNcxf8y1PrPtMn0OQJLNgGnnbEkCPZzJZVwzMiQmTt14Diivo'
            }
        });

        // Überprüfen, ob die VM-Details erfolgreich abgerufen wurden
        if (response.data && response.data.server) {
            const server = response.data.server;

            // HcVm-Instanz in der Datenbank aktualisieren
            hcVm.name = server.name;
            hcVm.publicIpv4 = server.public_net.ipv4.ip;
            hcVm.publicIpv6 = server.public_net.ipv6.ip;
            hcVm.region = server.datacenter.name;
            hcVm.modifiedDate = Date.now();
            hcVm.lastUpdated = Date.now();
            hcVm.operatingSystem = server.image.description;

            // HcVm-Instanz in die Datenbank speichern
            await hcVm.save();

            console.log('VM-Details erfolgreich aktualisiert.');
            console.log('VM ID:', hcVm.instanceId); // Print the saved VM ID
        } else {
            console.log('Fehler beim Aktualisieren der VM-Details:', response.data);
        }
    }
}


  // createVmAndSaveToDb('Tedstdd-dVddM', 'Test-Notiz', 'Test-User');

    
  
  
  
  
  updateVmDetailsFromHetznerCloud();
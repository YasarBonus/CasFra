const express = require('express');
const app = express();
const port = 3000;

// Statische Dateien aus dem "public"-Ordner bereitstellen
app.use(express.static('public'));

// Routen

app.get('/api', (req, res) => {
  // Hier kannst du deinen serverseitigen Code einfügen
  res.send('Hello World!');
});

const fs = require('fs');
app.get('/api/casinos/html', (req, res) => {
  fs.readFile('private/data/casinos.json', 'utf8', (err, data) => {
    console.log('test');
    // Error handling
    if (err) {
      console.error(err);
      res.status(500).send('Error reading JSON file');
      return;
    }
    try {
      // Parse JSON data and send it to the client
      const jsonData = JSON.parse(data);

      // Apply filter based on URL parameters
      const { name, vpn, sticky, category, bonushunt, sportbets, nodeposit, prohibitedgamesprotection, provider, paymentmethod, company, yasarsbest} = req.query;
      console.log(req.query);

      // Filter data based on URL parameters (if they exist)
      let filteredData = jsonData;

      if (name) {
        filteredData = filteredData.filter(casino => casino.name.toLowerCase().includes(name.toLowerCase()));
      }

      if (sticky) {
        if (sticky === 'sticky') {
          filteredData = filteredData.filter(casino => casino.bonus_display_sticky === 'true');
        } else if (sticky === 'nonsticky') {
          filteredData = filteredData.filter(casino => casino.bonus_display_sticky === 'false');
        } else if (sticky === 'wagerfree') {
          filteredData = filteredData.filter(casino => casino.bonus_display_sticky === 'wagerfree');
        }
      }

      if (category) {
        if (category === 'wagerfree') {
          filteredData = filteredData.filter(casino => casino.wager === '0x');
        } else if (category === 'sticky') {
          filteredData = filteredData.filter(casino => casino.bonus_display_sticky === 'true');
        } else if (category === 'nonsticky') {
          filteredData = filteredData.filter(casino => casino.bonus_display_sticky === 'false');
        }
      }

      if (sportbets) {
        if (sportbets === 'true') {
          filteredData = filteredData.filter(casino => casino.tags.includes('Sportbets'));
        } else if (sportbets === 'false') {
          filteredData = filteredData.filter(casino => !casino.tags.includes('Sportbets'));
        }
      }

      if (bonushunt) {
        if (bonushunt === 'true') {
          filteredData = filteredData.filter(casino => casino.tags.includes('Bonushunt allowed'));
        } else if (bonushunt === 'false') {
          filteredData = filteredData.filter(casino => !casino.tags.includes('Bonushunt allowed'));
        }
      }

      if (nodeposit) {
        if (nodeposit === 'true') {
          filteredData = filteredData.filter(casino => casino.tags.includes('No Deposit'));
        } else if (nodeposit === 'false') {
          filteredData = filteredData.filter(casino => !casino.tags.includes('No Deposit'));
        }
      }

      if (vpn) {
        if (vpn === 'true') {
          filteredData = filteredData.filter(casino => casino.tags.includes('VPN allowed'));
        } else if (vpn === 'false') {
          filteredData = filteredData.filter(casino => !casino.tags.includes('VPN allowed'));
        }
      }

      if (prohibitedgamesprotection) {
        if (prohibitedgamesprotection === 'true') {
          filteredData = filteredData.filter(casino => casino.tags.includes('Prohibited Games Protection'));
        } else if (prohibitedgamesprotection === 'false') {
          filteredData = filteredData.filter(casino => !casino.tags.includes('Prohibited Games Protection'));
        }
      }

      if (yasarsbest) {
        if (yasarsbest === 'true') {
          filteredData = filteredData.filter(casino => casino.tags.includes('Yasars Best'));
        } else if (yasarsbest === 'false') {
          filteredData = filteredData.filter(casino => !casino.tags.includes('Yasars Best'));
        }
      }

      if (provider) {
        const providersArray = provider.split(',');
        console.log(providersArray);
        filteredData = filteredData.filter(casino => providersArray.every(provider => casino.providers.includes(provider)));
      }

      if (paymentmethod) {
        const paymentmethodArray = paymentmethod.split(',');
        console.log(paymentmethodArray);
        filteredData = filteredData.filter(casino => paymentmethodArray.every(paymentmethod => casino.paymentmethods.includes(paymentmethod)));
      }

      if (company) {
        filteredData = filteredData.filter(casino => casino.company.toLowerCase().includes(company.toLowerCase()));
      }
      // END: abpxx6d04wxr

      console.log('Number of filtered items:', filteredData.length);
      var casino = filteredData;
      // var lowercaseName = filteredData.name.toLowerCase();
      // console.log(filteredData);
      console.log(filteredData[0].name);
      var html = ``;
      filteredData.forEach(casino => {
      
       var lowercaseName = casino.name.toLowerCase();
      html += `
      <div class="pb-3" id="casino${lowercaseName}">
      <div class="row g-0 p-3 border border-2 b-2 rounded-3 bc-yasarred bg-light align-items-center" align="center">
      <div class="col-sm-12 col-md-8 col-lg-3 col-xl-3 order-1 order-lg-1 order-md-1">

        <div class="">
        ${casino.logo_text ? `<div class="pb-3"><span class="p-1 badge bg-info bg-large">${casino.logo_text}</span></div>` : ''}
          <div>
            <img class="lazyload" src="img/casinos/${lowercaseName}.png" data-src="img/casinos/${lowercaseName}.png" alt="foo" style="max-width:200px" height="auto" lazyload="on" />
          </div>
        </div>
      </div>
      <div class="col-sm-12 col-md-12 col-lg-7 col-xl-6 order-2 order-lg-2 order-xl-2 order-md-3 " >
        <div class="row col-sm g-0 align-self-stretch">
        <div class="col-3">
          <div>
            <h2>${casino.bonus_display} %</h2>
            <h6>up to ${casino.bonus_display_max} €</h6>
            <h5>${casino.bonus_display_sticky == "true" ? `Sticky` : casino.bonus_display_sticky == "false" ? `Non-Sticky` : casino.bonus_display_sticky == "wagerfree" ? `Wagerfree` : ``}</h5>  
          </div>
        </div>
        <div class="col-2">
          <div>
            <h2>${casino.max_bet} €</h2>
            <h6>Max Bet</h6>  
          </div>
        </div>
        <div class="col-3">
          <div>
            <h2>${casino.max_cashout}</h2>
            <h6>Max Cashout</h6>
          </div>
        </div>
        <div class="col-4">
          <div>
            <h2>${casino.wager} (${casino.wager_type})</h2>
            <h6>Wager</h6>
          </div>
        </div>
        </div>
    </div>
    <div class="col-sm-8 col-md-3 col-lg-2 col-xl-3 col-xxl-3 p-1 order-3 order-lg-3 order-md-2">
        <a class="btn btn-lg btn-success" href="/${casino.aff_url}" target="_blank">PLAY NOW</a>
        <br>
        <span style="font-size:12px">T&amp;C apply</span>
    </div>
    <div class="col-sm-4 col-md-12 col-lg-12 col-xl-12 order-4 order-md-4 p-1" align="center">
      <button class="btn btn-sm btn-secondary" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${casino.name}" aria-expanded="false" aria-controls="collapse${casino.name}">
        Show Details
        </button>
    </div>
    <div class="collapse p-3 order-5" id="collapse${casino.name}">
      <div class="row col-md-12" align="left">
      <div class="col-6">
        <h3>Casino Bonus</h3>
        <ul class="list-group-flush">
        ${casino.boni ? casino.boni.map(bonus => `<li class="list-group-item">${bonus}</li>`).join('') : ''}
        </ul>
        <h5>Tags</h5>
        <p>${casino.tags ? casino.tags.map(tag => `${tag}`).join(', ') : ''}</p>
      </div>
      <div class="col-6">
        <h3>Casino Features</h3>
        <ul class="list-group-flush">
        ${casino.features ? casino.features.map(feature => `<li class="list-group-item">${feature}</li>`).join('') : ''}
        </ul>
      </div> 
      <div class="col-6">
        <h3>Provider</h3>
        <div class="row">
        ${casino.providers ? casino.providers.map(provider => `<div class="col-4 col-md-3 col-lg-2"><img style="max-width:60px;" src="img/images/${provider}.png" /></div>`).join('') : ''}
        </div>                    
      </div> 
      <div class="col-6">
        <h3>Payment Methods</h3>
        <div class="row">
        ${casino.paymentMethods ? casino.paymentMethods.map(paymentMethod => `<div class="col-4 col-md-3 col-lg-2 paymentMethod"><img style="max-width:60px;" src="img/images/${paymentMethod}.png" /></div>`).join('') : ''}
        </div>
      </div> 
      </div>
      <br>
    </div>
    </div>
    </div>
      `;
      });
      res.send(html)
      
    } catch (error) {
      console.error(error);
      res.status(500).send('Error parsing JSON data');
    }
    

  
  });
});

// 
app.get('/api/casinos', (req, res) => {
  fs.readFile('private/data/casinos.json', 'utf8', (err, data) => {
    // Error handling
    if (err) {
      console.error(err);
      res.status(500).send('Error reading JSON file');
      return;
    }
    try {
      // Parse JSON data and send it to the client
      const jsonData = JSON.parse(data);

      // Apply filter based on URL parameters
      const { name, vpn, sticky, category, bonushunt, sportbets, nodeposit, prohibitedgamesprotection, provider, paymentmethod, company, yasarsbest} = req.query;
      console.log(req.query);

      // Filter data based on URL parameters (if they exist)
      let filteredData = jsonData;

      if (name) {
        filteredData = filteredData.filter(casino => casino.name.toLowerCase().includes(name.toLowerCase()));
      }

      if (sticky) {
        if (sticky === 'sticky') {
          filteredData = filteredData.filter(casino => casino.bonus_display_sticky === 'true');
        } else if (sticky === 'nonsticky') {
          filteredData = filteredData.filter(casino => casino.bonus_display_sticky === 'false');
        } else if (sticky === 'wagerfree') {
          filteredData = filteredData.filter(casino => casino.bonus_display_sticky === 'wagerfree');
        }
      }

      if (category) {
        if (category === 'wagerfree') {
          filteredData = filteredData.filter(casino => casino.wager === '0x');
        } else if (category === 'sticky') {
          filteredData = filteredData.filter(casino => casino.bonus_display_sticky === 'true');
        } else if (category === 'nonsticky') {
          filteredData = filteredData.filter(casino => casino.bonus_display_sticky === 'false');
        }
      }

      if (sportbets) {
        if (sportbets === 'true') {
          filteredData = filteredData.filter(casino => casino.tags.includes('Sportbets'));
        } else if (sportbets === 'false') {
          filteredData = filteredData.filter(casino => !casino.tags.includes('Sportbets'));
        }
      }

      if (bonushunt) {
        if (bonushunt === 'true') {
          filteredData = filteredData.filter(casino => casino.tags.includes('Bonushunt allowed'));
        } else if (bonushunt === 'false') {
          filteredData = filteredData.filter(casino => !casino.tags.includes('Bonushunt allowed'));
        }
      }

      if (nodeposit) {
        if (nodeposit === 'true') {
          filteredData = filteredData.filter(casino => casino.tags.includes('No Deposit'));
        } else if (nodeposit === 'false') {
          filteredData = filteredData.filter(casino => !casino.tags.includes('No Deposit'));
        }
      }

      if (vpn) {
        if (vpn === 'true') {
          filteredData = filteredData.filter(casino => casino.tags.includes('VPN allowed'));
        } else if (vpn === 'false') {
          filteredData = filteredData.filter(casino => !casino.tags.includes('VPN allowed'));
        }
      }

      if (prohibitedgamesprotection) {
        if (prohibitedgamesprotection === 'true') {
          filteredData = filteredData.filter(casino => casino.tags.includes('Prohibited Games Protection'));
        } else if (prohibitedgamesprotection === 'false') {
          filteredData = filteredData.filter(casino => !casino.tags.includes('Prohibited Games Protection'));
        }
      }

      if (yasarsbest) {
        if (yasarsbest === 'true') {
          filteredData = filteredData.filter(casino => casino.tags.includes('Yasars Best'));
        } else if (yasarsbest === 'false') {
          filteredData = filteredData.filter(casino => !casino.tags.includes('Yasars Best'));
        }
      }

      if (provider) {
        const providersArray = provider.split(',');
        console.log(providersArray);
        filteredData = filteredData.filter(casino => providersArray.every(provider => casino.providers.includes(provider)));
      }

      if (paymentmethod) {
        const paymentmethodArray = paymentmethod.split(',');
        console.log(paymentmethodArray);
        filteredData = filteredData.filter(casino => paymentmethodArray.every(paymentmethod => casino.paymentmethods.includes(paymentmethod)));
      }

      if (company) {
        filteredData = filteredData.filter(casino => casino.company.toLowerCase().includes(company.toLowerCase()));
      }
      // END: abpxx6d04wxr

      console.log('Number of filtered items:', filteredData.length);

      // console.log(filteredData);
      res.send(filteredData);
    } catch (error) {
      console.error(error);
      res.status(500).send('Error parsing JSON data');
    }

  
  });
});



// 404 Error
app.use((req, res) => {
  res.status(404).send('404 - Page not found');
});

// 500 Error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('500 - Internal Server Error');
});

// Server starten

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});


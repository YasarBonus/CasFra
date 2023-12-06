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

const sqlite3 = require('sqlite3').verbose();

// Create a new SQLite database connection
const db = new sqlite3.Database('private/data/link_hits.db');

// Create a table to store link hits
db.run(`CREATE TABLE IF NOT EXISTS link_hits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  date TEXT,
  time TEXT
)`);



app.get('/go/:casino', (req, res) => {
  const casinoName = req.params.casino;
  
  fs.readFile('private/data/casinos.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error reading JSON file');
      return;
    }
    
    try {
      const jsonData = JSON.parse(data);
      const casino = jsonData.find(casino => casino.name.toLowerCase() === casinoName.toLowerCase());
      console.log(casino);
      
      if (casino) {
        // Insert link hit into the database
        const currentDate = new Date().toLocaleDateString();
        const currentTime = new Date().toLocaleTimeString();
        db.run(`INSERT INTO link_hits (name, date, time) VALUES (?, ?, ?)`, [casino.name, currentDate, currentTime], (err) => {
          if (err) {
            console.error(err);
            res.status(500).send('Error inserting link hit into the database');
          } else {
            res.redirect(casino.affiliate_link);
          }
        });
      } else {
        res.status(404).send('Casino not found');
      }
    } catch (error) {
      console.error(error);
      res.status(500).send('Error parsing JSON data');
    }
  });
});

// Close the database connection when the server is shut down
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error(err.message);
    }
    console.log('Closed the database connection.');
    process.exit(0);
  });
});

// const fs = require('fs');
app.get('/api/casinos/htmldiv', (req, res) => {
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
      const { name, vpn, sticky, category, nomaxcashout, bonushunt, sportbets, nodeposit, prohibitedgamesprotection, provider, paymentmethod, company, egonsbest} = req.query;
      console.log(req.query);

      // Filter data based on URL parameters (if they exist)
      let prefilteredData = jsonData;
      prefilteredData = prefilteredData.filter(casino => casino.hidden !== 'true');

      let filteredData = prefilteredData.sort((a, b) => parseFloat(a.sorting) - parseFloat(b.sorting));

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
          filteredData = filteredData.filter(casino => casino.sportbets === 'true');
        } else if (sportbets === '') {
          filteredData = filteredData.filter(casino => casino.sportbets === 'false');
        }
      }

      if (nomaxcashout) {
        if (nomaxcashout === 'true') {
          filteredData = filteredData.filter(casino => casino.max_cashout === 'No');
        } else if (bonushunt === 'false') {
          filteredData = filteredData.filter(casino => !casino.max_cashout === 'No');
        }
      }

      if (bonushunt) {
        if (bonushunt === 'true') {
          filteredData = filteredData.filter(casino => casino.bonushunt === 'true');
        } else if (bonushunt === 'false') {
          filteredData = filteredData.filter(casino => !casino.bonushunt === 'true');
        }
      }

      if (nodeposit) {
        if (nodeposit === 'true') {
          filteredData = filteredData.filter(casino => casino.nodeposit === 'true');
        } else if (nodeposit === 'false') {
          filteredData = filteredData.filter(casino => casino.nodeposit === 'false');
        }
      }

      if (vpn) {
        if (vpn === 'true') {
          filteredData = filteredData.filter(casino => casino.vpn === 'true');
        } else if (vpn === 'false') {
          filteredData = filteredData.filter(casino => casino.vpn === 'false');
        }
      }

      if (prohibitedgamesprotection) {
        if (prohibitedgamesprotection === 'true') {
          filteredData = filteredData.filter(casino => casino.prohibitedgamesprotection === 'true');
        } else if (prohibitedgamesprotection === 'false') {
          filteredData = filteredData.filter(casino => !casino.prohibitedgamesprotection === 'true');
        }
      }

      if (egonsbest) {
        if (egonsbest === 'true') {
          filteredData = filteredData.filter(casino => casino.egons_best === 'true');
        } else if (egonsbest === 'false') {
          filteredData = filteredData.filter(casino => !casino.egons_best === 'true');
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
        if (company === 'n1') {
          filteredData = filteredData.filter(casino => casino.company === 'n1');
        } else if (company === 'dama') {
          filteredData = filteredData.filter(casino => casino.company === 'dama');
        } else if (company === 'hollycorn') {
          filteredData = filteredData.filter(casino => casino.company === 'hollycorn');
        } else if (company === 'rabidi') {
          filteredData = filteredData.filter(casino => casino.company === 'rabidi');
        } 
      }

      

      

      if (company) {
        filteredData = filteredData.filter(casino => casino.company.toLowerCase().includes(company.toLowerCase()));
      }
      // END: abpxx6d04wxr

      console.log('Number of filtered items:', filteredData.length);
      // var casino = filteredData;
      // var lowercaseName = filteredData.name.toLowerCase();
      // console.log(filteredData);
      // console.log(casino[0].name);
      var html = ``;


      if (filteredData.length === 0) {
        html += `
        <div class="ui icon message">
  <i class="user secret icon"></i>
  <div class="content">
    <div class="header">
      No Casinos found
    </div>
    <p>Please try some other search term.</p>
  </div>
  <div class="filteritem" onclick="resetFilters()">
    <div class="center aligned medium orange ui button">Reset Filter</div>
  </div>
</div>
        `;
      } else {
        filteredData.forEach(casino => {
      
       var lowercaseName = casino.name.toLowerCase();
      html += `
      <div class="top attached ui segment" id="casino${lowercaseName}" style="background-color: beige;">
                <div class="ui styled six column grid" style="">
                  <div class="ui three wide column">
                  ${casino.label ? `<div class="ui teal ribbon label">${casino.label}</div>` : ''}
                  </div>
                  <div class="ui three wide left aligned column">
                  ${casino.egons_best == "true" ? `<div class="ui small orange image label"><img src="/img/avatar/egon.png"> Egon's Best</div>` : ``}
                  ${casino.company == "dama" ? `<div class="ui small orange image label">Dama NV</div>` : casino.company == "rabidi" ? `<div class="ui small orange image label">Rabidi NV</div>` : casino.company == "n1" ? `<div class="ui small orange image label">N1 Interactive</div>` : casino.company == "hollycorn" ? `<div class="ui small orange image label">Hollycorn NV</div>` : ``}

                  ${casino.code ? `
                  
                  <!-- div class="ui small input">
                          <input class="" type="text" value="${casino.code}"></input>
                          <button type="button"  onclick="copyText('${casino.code}')"  name="copyToken" value="copy" class="copyToken ui right icon button">
                              <i class="clipboard icon"></i>
                          </button>
                  </div -->
                  
                  ` : ``}
                  </div>
                  <div class="ui ten wide right aligned column" style="padding-right:10px;">
                  ${casino.tags ? casino.tags.map(tag => `<div class="ui mini olive tag label">${tag}</div>`).join('    ') : ''}
                  ${casino.prohibitedgamesprotection == "true" ? `<a data-tooltip="Prohibited Games Protection" onclick="setCheckboxAndFetchData(prohibitedgamesprotectionFilter, true)" class="ui right floated small blue circular label"><i class="lock icon"></i> PGP</a>` : casino.prohibitedgamesprotection == "false" ? `<a data-tooltip="No Prohibited Games Protection" onclick="setCheckboxAndFetchData(prohibitedgamesprotectionFilter, true)" class="ui right floated small red circular label"><i class="lock open icon"></i> PGP</a>` : ``}
                  ${casino.nodeposit == "true" ? `<a data-tooltip="No Deposit Bonus - Cool!" onclick="setCheckboxAndFetchData(nodepositFilter, true)" class="right floated small blue circular ui label"><i class="plus icon"></i> Nodeposit</a>` : ``}
                  ${casino.sportbets == "true" ? `<a data-tooltip="Sportbets available" onclick="setCheckboxAndFetchData(sportbetsFilter, true)" class="ui right floated small blue circular label"><i class="plus icon"></i> Sportbets</a>` : ``}
                  ${casino.bonus_display_sticky == "true" ? `<a data-tooltip="Sticky Bonus" onclick="setCheckboxAndFetchData(nonstickyFilter, true)" class="ui right floated small purple circular label">Sticky</a>` : casino.bonus_display_sticky == "false" ? `<a data-tooltip="Non-Sticky Bonus" onclick="setCheckboxAndFetchData(nonstickyFilter, true)" class="ui right floated small purple circular label">Non-Sticky</a>` : casino.bonus_display_sticky == "wagerfree" ? `<a data-tooltip="Wagerfree Bonus" onclick="setCheckboxAndFetchData(wagerfreeFilter, true)" class="ui right floated small purple circular label">Wagerfree</a>` : ``}
                  ${casino.bonushunt == "true" ? `<a data-tooltip="Bonushunt is allowed" onclick="setCheckboxAndFetchData(bonushuntFilter, true)" class="ui right floated small green circular label"><i class="check icon"></i> Bonushunt</a>` : `<a data-tooltip="Bonushunt is not allowed" onclick="setCheckboxAndFetchData(bonushuntFilter, true)" class="ui right small floated red circular label"><i class="x icon"></i> Bonushunt</a>`}
                  ${casino.vpn == "true" ? `<a data-tooltip="VPN is allowed" onclick="setCheckboxAndFetchData(vpnFilter, true)" class="ui right floated small green circular label"><i class="check icon"></i> VPN</a>` : ` <a data-tooltip="VPN is allowed" onclick="setCheckboxAndFetchData(vpnFilter, true)" class="ui right small floated red circular label"><i class="x icon"></i> VPN</a>`}
                  </div>
                  <!-- div class="ui one wide column">
                  ${casino.label ? `<div class="ui orange right corner label"><i class="heart icon"></i></div>` : ''}
                  </div -->
                </div>
                <div class="ui styled three column grid " style=""> 
                    <div class="ui three wide column" style="padding-left:15px">
                        <img style="width:160px;" src="img/casinos/${lowercaseName}.png">
                    </div>
                    <div class="ui ten wide center aligned column">
                        <div class="ui center aligned four column grid"> 
                            <div class="row" style="padding-top:20px"> 
                                <div class="four wide computer eight wide mobile column">
                                    <div class="bonustext">${casino.bonus_display} %</div>
                                    <div style="font-size:18px; padding-top:15px;">up to ${casino.bonus_display_max} €</div>
                                    <div class="bonushead">Bonus</div>
                                </div>
                                <div class="three wide computer eight wide mobile column">
                                    <div class="bonustext">${casino.max_bet} €</div>
                                    <div class="bonushead">Max Bet</div>
                                    
                                </div>
                                <div class="three wide computer eight wide mobile column">
                                    <div class="bonustext">${casino.max_cashout}</div>
                                    <div class="bonushead">Max Cashout</div>
                                </div>
                                  <div class="five wide computer eight wide mobile column">
                                  <div class="bonustext">${casino.wager} (${casino.wager_type})</div>
                                  <div class="bonushead">Wager</div>
                                    </div>
                            </div> 
                        </div> 
                    </div>
                    <div class="ui three wide right aligned column">
                        <div class="ui right floated" style="padding-right:15px">
                            <a href="/go/${casino.name}" target="_blank" class="ui large green button">
                                PLAY NOW
                                <!-- i class="right chevron icon"></i -->
                            </a>
                              <div class="attached">
                                <div style="text-align: center;">T&C apply</div>
                              </div>
                        </div>
                    </div>
                    <div class="ui twelve wide left floated column">
                    
                    </div>
                    <div class="ui four wide right aligned column">
                        <!-- div class="ui right floated">
                            <a onclick="copyText()" class="ui mini gray button">
                                Details
                                <!-- i class="right chevron icon"></i -->
                            </a>
                        </div -->
                    </div>
                    <div id="div${lowercaseName}details" style="display:none;">
                    <div class="attached ui segment" style="border:0px; background-color: beige;">
                    <div class="ui styled four column grid">
                        <div class="eight wide column">
                          <h3>Casino Bonus</h3>
                          <ul class="ui list">
                          ${casino.boni ? casino.boni.map(bonus => `<div class="item">${bonus}</div>`).join('') : ''}
                          </ul>
                          ${casino.review_small ? `
                          <div class="ui comments">
  <div class="short comment">
    <a class="avatar">
      <img src="/img/avatar/egon.png">
    </a>
    <div class="content">
      <div class="author">Egon's Review</div>
      <!-- div class="metadata">
        <div class="date">2 days ago</div>
        <div class="rating">
          <i class="star icon"></i>
          5 Faves
        </div>
      </div -->
      <div class="text">
      ${casino.review_small}
      </div>
    </div>
  </div>
</div>` : ''}
                        </div>
                        
                        <div class="eight wide column">
                          <h3>Casino Features</h3>
                          <ul class="ui list">
                            ${casino.features ? casino.features.map(feature => `<div class="item">${feature}</div>`).join('') : ''}
                          </ul>
                        </div> 
                        <div class="eight wide column">
                          <h3>Provider</h3>
                          <div class="ui five column grid container">
                          ${casino.providers ? casino.providers.map(provider => `<div class="column"><img style="max-width:60px;" src="img/provider/${provider}.png" /></div>`).join('') : ''}
                          </div>                    
                        </div> 
                        <div class="eight wide column">
                          <h3>Payment Methods</h3>

                          <div class="ui five column grid container">
                          ${casino.paymentmethods ? casino.paymentmethods.map(paymentMethod => `<div class="column"><img style="max-width:60px;" src="img/paymentmethods/${paymentMethod}.png" /></div>`).join('') : ''}
                          </div>
                        </div> 
                        </div>
                        </div>
                </div>
                

            </div>
            <div class="bottom attached ui button" id="toggleBtn${lowercaseName}">
            Details
      </div>
      <script>
      document.getElementById("toggleBtn${lowercaseName}").onclick = function() {
          var div${lowercaseName}details = document.getElementById("div${lowercaseName}details");
          if (div${lowercaseName}details.style.display === "none") {
            div${lowercaseName}details.style.display = "block";
          } else {
            div${lowercaseName}details.style.display = "none";
          }
      };
  </script>
      `;
      })};
      res.send(html)
      
    } catch (error) {
      console.error(error);
      res.status(500).send('Error parsing JSON data');
    }
    

  
  });
});

// Read data from casinos.json using fs.readFile
app.get('/api/casinos', (req, res) => {
  fs.readFile('private/data/casinos.json', 'utf8', (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send('Error reading casinos.json');
    } else {
      res.send(data);
    }
  });
});

// 301 Redirect
app.get('/instagram', (req, res) => {
  res.redirect(301, 'https://www.instagram.com/twitchyasar92/');
});

// 301 Redirect
app.get('/telegram', (req, res) => {
  res.redirect(301, 'https://t.me/+5XJAkomDbms0M2Iy');
});

// 301 Redirect
app.get('/discord', (req, res) => {
  res.redirect(301, 'https://discord.com/invite/nvQJYeqfBs');
});

// 301 Redirect
app.get('/casinos', (req, res) => {
  res.redirect(301, '/');
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


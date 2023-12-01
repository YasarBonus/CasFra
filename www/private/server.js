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
          filteredData = filteredData.filter(casino => casino.tags.includes('Egons Best'));
        } else if (egonsbest === 'false') {
          filteredData = filteredData.filter(casino => !casino.tags.includes('Egons Best'));
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
        const companyArray = company.split(',');
        console.log(companyArray);
        filteredData = filteredData.filter(casino => companyArray.every(company => casino.company.includes(company)));
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
      filteredData.forEach(casino => {
      
       var lowercaseName = casino.name.toLowerCase();
      html += `
      <div class="top attached ui segment" id="casino${lowercaseName}">
                <div class="ui styled six column grid" style="">
                  <div class="ui three wide column">
                  ${casino.label ? `<div class="ui teal ribbon label">${casino.label}</div>` : ''}
                  </div>
                  <div class="ui three wide left aligned column">
                  ${casino.egons_best == "true" ? `<div class="ui small orange image label"><img src="/img/avatar/egon.png"> Egon's Best</div>` : ``}

                  ${casino.code ? `
                  
                  <!-- div class="ui small input">
                          <input class="" type="text" value="${casino.code}"></input>
                          <button type="button"  onclick="copyText('${casino.code}')"  name="copyToken" value="copy" class="copyToken ui right icon button">
                              <i class="clipboard icon"></i>
                          </button>
                  </div -->
                  
                  ` : ``}
                  </div>
                  <div class="ui ten wide right aligned column">
                  ${casino.tags ? casino.tags.map(tag => `<div class="ui mini olive tag label">${tag}</div>`).join('    ') : ''}
                  ${casino.prohibitedgamesprotection == "true" ? `<div class="ui right floated small blue circular label"><i class="plus icon"></i> Prohibited Games Protection</div>` : ``}
                  ${casino.nodeposit == "true" ? `<div class="ui right floated small blue circular label"><i class="plus icon"></i> Nodeposit</div>` : ``}
                  ${casino.sportbets == "true" ? `<div class="ui right floated small blue circular label"><i class="plus icon"></i> Sportbets</div>` : ``}
                  ${casino.bonus_display_sticky == "true" ? `<div class="ui right floated small purple circular label">Sticky</div>` : casino.bonus_display_sticky == "false" ? `<div class="ui right floated small purple circular label">Non-Sticky</div>` : casino.bonus_display_sticky == "wagerfree" ? `<div class="ui right floated small purple circular label">Wagerfree</div>` : ``}
                  ${casino.bonushunt == "true" ? `<div class="ui right floated small green circular label"><i class="check icon"></i> Bonushunt</div>` : `<div class="ui right small floated red circular label"><i class="x icon"></i> Bonushunt</div>`}
                  ${casino.vpn == "true" ? `<div class="ui right floated small green circular label"><i class="check icon"></i> VPN</div>` : ` <div class="ui right small floated red circular label"><i class="x icon"></i> VPN</div>`}
                  </div>
                  <!-- div class="ui one wide column">
                  ${casino.label ? `<div class="ui orange right corner label"><i class="heart icon"></i></div>` : ''}
                  </div -->
                </div>
                <div class="ui styled three column grid" style=""> 
                    <div class="ui three wide column">
                        <img style="width:160px;" src="img/casinos/${lowercaseName}.png">
                    </div>
                    <div class="ui ten wide center aligned column">
                        <div class="ui center aligned four column grid"> 
                            <div class="row" style="padding-top:20px"> 
                                <div class="four wide computer eight wide mobile column">

                                    <span style="font-size:30px; padding-top:15px;">${casino.bonus_display} %</span><br>
                                    <span style="font-size:18px; padding-top:15px;">up to ${casino.bonus_display_max} €</span><br>
                                    <h2 class="ui sub header">
                                    Bonus
                                </h2>
                                  </div>
                                  <div class="three wide computer eight wide mobile column">

                                    <span style="font-size:30px; padding-top:15px;">${casino.max_bet} €</span>
                                    <h2 class="ui sub header" style="padding:0px">
                                    Max Bet
                                </h2>
                                    </div>
                                  <div class="four wide computer eight wide mobile column">

                                    <span style="font-size:30px; padding-top:15px;">${casino.max_cashout}</span>
                                    <h2 class="ui sub header">
                                    Max Cashout
                                </h2>
                                    </div>
                                  <div class="five wide computer eight wide mobile column">

                                    <span style="font-size:30px; padding-top:15px;">${casino.wager} (${casino.wager_type})</span>
                                    <h2 class="ui sub header">
                                    Wager
                                </h2>
                                    </div>
                            </div> 
                        </div> 
                    </div>
                    <div class="ui three wide right aligned column">
                        <div class="ui right floated">
                            <a href="${casino.aff_url}" target="_blank" class="ui large green button">
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
                    <div class="attached ui segment" style="border:0px";>
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
      const { name, vpn, sticky, category, bonushunt, sportbets, nodeposit, prohibitedgamesprotection, provider, paymentmethod, company, egonsbest} = req.query;
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
          filteredData = filteredData.filter(casino => casino.sportbets === 'true');
        } else if (sportbets === '') {
          filteredData = filteredData.filter(casino => casino.sportbets === 'false');
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

      if (egonsbest) {
        if (egonsbest === 'true') {
          filteredData = filteredData.filter(casino => casino.tags.includes('Egons Best'));
        } else if (egonsbest === 'false') {
          filteredData = filteredData.filter(casino => !casino.tags.includes('Egons Best'));
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


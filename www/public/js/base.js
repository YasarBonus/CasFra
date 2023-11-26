// define global variables
var urlParams = window.location.search;


function displayCasinos() {
  console.log("function displayCasino");
  var casinoDiv = document.getElementById('casinos');
  console.log("Casino Div:", casinoDiv);

  getCasinosHTML(urlParams, casinoHTML => {
    const div = document.createElement('div');
    div.id = "casino";
    div.style.paddingTop = '15px';
    div.innerHTML = casinoHTML;
    casinoDiv.appendChild(div);
    console.log("Loaded Casinos");
  });
};

function getCasinosHTML(urlSearch, onData) {
  console.log("function getCasinos with", urlSearch, onData);

  const url = new URL("http://127.0.0.1:3000/api/casinos/html" + urlSearch);
  console.log("API URL:", url);

  fetch(url)
    .then(response => response.text())
    .then(data => {
      console.log("Data:", data);
      onData(data)
    })
    .catch(error => {
      console.error("Error fetching data:", error);
    });
};

//               const casinosCountDiv = document.getElementById('casinosCount');
// 
//               // Function to filter the data based on selected filters
//               
//               const filterData = () => {
//                 
// 
//                   var searchText = filterText.value.toLowerCase();
//                   var selectedCategory = filterCategory.value;
//                   var isBonushunt = filterBonushunt.checked;
//                   var isVpn = filterVpn.checked;
//                   var isSportbets = filterSportbets.checked;
//                   var isNoDeposit = filterNoDeposit.checked;
//                   var isProhibitedGamesProtection = filterProhibitedGamesProtection.checked;
//                   var isGamomat = filterGamomat.checked;
//                   var isPlayngo = filterPlayngo.checked;
//                   var isYasarsBest = filterYasarsBest.checked;
//                   var is150andmore = filter150andmore.checked;
//                   var isN1 = filterN1.checked;
//                   var isHollycorn = filterHollycorn.checked;
//                   var isDama = filterDama.checked;
//                   var isRabidi = filterRabidi.checked;
// 
// 
//                   // Log the selected filters
// 
//                   if (selectedCategory) {
//                     console.log("Category Filter:", selectedCategory)
//                   } 
//                   if (isBonushunt) {
//                     console.log("Filter: Bonushunt")
//                   }
//                   if (isVpn) {
//                     console.log("Filter: VPN")
//                   }
//                   if (isSportbets) {
//                     console.log("Filter: Sportbets")
//                   }
//                   if (isNoDeposit) {
//                     console.log("Filter: No Deposit")
//                   }
//                   if (isProhibitedGamesProtection) {
//                     console.log("Filter: Prohibited Games Protection")
//                   }                  
// 
//                   // build array of special filters
//                   var specialFilters = []; 
//                   if (isGamomat) {specialFilters.push('gamomat');}
//                   if (isPlayngo) {specialFilters.push('playngo');}
//                   if (isYasarsBest) {specialFilters.push('yasarsbest');}
//                   if (is150andmore) {specialFilters.push('150andmore');}
//                   console.log("Special Filters:", specialFilters);
// 
//                   // build array of company filters
//                   var companyFilters = []; 
//                   if (isRabidi) {companyFilters.push('rabidi');}
//                   if (isN1) {companyFilters.push('n1');}
//                   if (isHollycorn) {companyFilters.push('hollycorn');}
//                   if (isDama) {companyFilters.push('dama');}
//                   console.log("Company Filters:", companyFilters);
// 
//                   // const filteredCasinos = data.filter(casino => {
// 
//                       // DONE: Filter by text
//                       //if (searchText && !casino.name.toLowerCase().includes(searchText)) {
//                       //    return false;
//                       //}
// 
//                       // DONE Filter by category
//                       // if (selectedCategory == 'wagerfree' && casino.wager !== '0x') {
//                       //     return false;
//                       // } 
//                       // if (selectedCategory == 'sticky' && casino.bonus_display_sticky !== 'true') {
//                       //     return false;
//                       // }
//                       // if (selectedCategory == 'non-sticky' && casino.bonus_display_sticky !== 'false') {
//                       //     return false;
//                       // }
//                       //if (selectedCategory && casino.category !== selectedCategory) {
//                       //    return false;
//                       //}
//                       // Filter by additional filters
// 
//                       // DONE
//                       // const bonushunt = casino.tags.includes('Bonushunt allowed') ? 'true' : 'false';
//                       // if (isBonushunt && bonushunt !== 'true') {
//                       //     return false;
//                       // }
//                       // const vpn = casino.tags.includes('VPN allowed') ? 'true' : 'false';
//                       // if (isVpn && vpn !== 'true') {
//                       //     return false;
//                       // }
//                       // const sportbets = casino.tags.includes('Sportbets') ? 'true' : 'false';
//                       // if (isSportbets && sportbets !== 'true') {
//                       //     return false;
//                       // }
//                       // const noDeposit = casino.tags.includes('No Deposit') ? 'true' : 'false';
//                       // if (isNoDeposit && noDeposit !== 'true') {
//                       //     return false;
//                       // }
//                       // const prohibitedGamesProtection = casino.tags.includes('Prohibited Games Protection') ? 'true' : 'false';
//                       // if (isProhibitedGamesProtection && prohibitedGamesProtection !== 'true') {
//                       //     return false;
//                       // }
// 
//                       // const yasarsBest = casino.tags.includes('Yasars Best') ? 'true' : 'false';
//                       // if (isYasarsBest && yasarsBest !== 'true') {
//                       //     return false;
//                       // }
//                       
//                       // var providersLowercase = casino.providers.map(function(x){ return x.toLowerCase() });
//                       // casino.providers = providersLowercase;
//                       // if (specialFilters.length > 0 && specialFilters.includes ("gamomat" || "playngo") && !specialFilters.every(v => providersLowercase.includes(v))) {
//                       //     return false;
//                       // }
// 
//                       // if (companyFilters.length > 0 && !companyFilters.some(v => casino.company == v)) {
//                       //     return false;
//                       // }
// // 
//                       // var paymentMethodsLowercase = casino.paymentMethods.map(function(x){ return x.toLowerCase() });
//                       // casino.paymentMethods = paymentMethodsLowercase;
//                       
//                       // return true;
//                   // });
// 
//                   const filteredCasinos = data;
// 
//                   console.log("Casinos filtered:", (filteredCasinos).length);
//                   
//                   var casinosCount = (filteredCasinos).length;
//                   casinosCountDiv.innerHTML = "Showing " + casinosCount + " Casinos";
// 
//                   // Clear existing HTML elements
//                   dataDiv.innerHTML = '';
// 
//                   // Create HTML elements for each filtered item
//                   
//                   const sortedCasinos = filteredCasinos.sort((a, b) => {
//                     if (!a.sorting && !b.sorting) {
//                       return 0;
//                     } else if (!a.sorting) {
//                       return 1;
//                     } else if (!b.sorting) {
//                       return -1;
//                     } else {
//                       return a.sorting - b.sorting;
//                     }
//                   });
//                   const casinos = sortedCasinos.map(casino => {
//                   var lowercaseName = casino.name.toLowerCase();
// 
//                   const lowercasePaymentMethods = casino.paymentMethods.map(method => method.toLowerCase());
//                   casino.paymentMethods = lowercasePaymentMethods;
//                   // console.log("Payment Methods:", casino.paymentMethods);
//  
//                                  
//                   const div = document.createElement('div');
//                   div.id = casino.name;
//                   div.classList.add('container');
//                   div.style.paddingTop = '15px';
//                   div.innerHTML = `
//                   <div class="row g-0 p-3 border border-2 b-2 rounded-3 bc-yasarred bg-light align-items-center" align="center">
//                     <div class="col-sm-12 col-md-8 col-lg-3 col-xl-3 order-1 order-lg-1 order-md-1">
//       
//                       <div class="">
//                       ${casino.logo_text ? `<div class="pb-3"><span class="p-1 badge bg-info bg-large">${casino.logo_text}</span></div>` : ''}
//                         <div>
//                           <img class="lazyload" src="img/casinos/${lowercaseName}.png" data-src="img/casinos/${lowercaseName}.png" alt="foo" style="max-width:200px" height="auto" lazyload="on" />
//                         </div>
//                       </div>
//                     </div>
//                     <div class="col-sm-12 col-md-12 col-lg-7 col-xl-6 order-2 order-lg-2 order-xl-2 order-md-3 " >
//                       <div class="row col-sm g-0 align-self-stretch">
//                       <div class="col-3">
//                         <div>
//                           <h2>${casino.bonus_display} %</h2>
//                           <h6>up to ${casino.bonus_display_max} €</h6>
//                           <h5>${casino.bonus_display_sticky == "true" ? `Sticky` : casino.bonus_display_sticky == "false" ? `Non-Sticky` : casino.bonus_display_sticky == "wagerfree" ? `Wagerfree` : ``}</h5>  
//                         </div>
//                       </div>
//                       <div class="col-2">
//                         <div>
//                           <h2>${casino.max_bet} €</h2>
//                           <h6>Max Bet</h6>  
//                         </div>
//                       </div>
//                       <div class="col-3">
//                         <div>
//                           <h2>${casino.max_cashout}</h2>
//                           <h6>Max Cashout</h6>
//                         </div>
//                       </div>
//                       <div class="col-4">
//                         <div>
//                           <h2>${casino.wager} (${casino.wager_type})</h2>
//                           <h6>Wager</h6>
//                         </div>
//                       </div>
//                       </div>
//                   </div>
//                   <div class="col-sm-8 col-md-3 col-lg-2 col-xl-3 col-xxl-3 p-1 order-3 order-lg-3 order-md-2">
//                       <a class="btn btn-lg btn-success" href="/${casino.aff_url}" target="_blank">PLAY NOW</a>
//                       <br>
//                       <span style="font-size:12px">T&amp;C apply</span>
//                   </div>
//                   <div class="col-sm-4 col-md-12 col-lg-12 col-xl-12 order-4 order-md-4 p-1" align="center">
//                     <button class="btn btn-sm btn-secondary" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${casino.name}" aria-expanded="false" aria-controls="collapse${casino.name}">
//                       Show Details
//                       </button>
//                   </div>
//                   <div class="collapse p-3 order-5" id="collapse${casino.name}">
//                     <div class="row col-md-12" align="left">
//                     <div class="col-6">
//                       <h3>Casino Bonus</h3>
//                       <ul class="list-group-flush">
//                       ${casino.boni ? casino.boni.map(bonus => `<li class="list-group-item">${bonus}</li>`).join('') : ''}
//                       </ul>
//                       <h5>Tags</h5>
//                       <p>${casino.tags ? casino.tags.map(tag => `${tag}`).join(', ') : ''}</p>
//                     </div>
//                     <div class="col-6">
//                       <h3>Casino Features</h3>
//                       <ul class="list-group-flush">
//                       ${casino.features ? casino.features.map(feature => `<li class="list-group-item">${feature}</li>`).join('') : ''}
//                       </ul>
//                     </div> 
//                     <div class="col-6">
//                       <h3>Provider</h3>
//                       <div class="row">
//                       ${casino.providers ? casino.providers.map(provider => `<div class="col-4 col-md-3 col-lg-2"><img style="max-width:60px;" src="img/images/${provider}.png" /></div>`).join('') : ''}
//                       </div>                    
//                     </div> 
//                     <div class="col-6">
//                       <h3>Payment Methods</h3>
//                       <div class="row">
//                       ${casino.paymentMethods ? casino.paymentMethods.map(paymentMethod => `<div class="col-4 col-md-3 col-lg-2 paymentMethod"><img style="max-width:60px;" src="img/images/${paymentMethod}.png" /></div>`).join('') : ''}
//                       </div>
//                     </div> 
//                     </div>
//                     <br>
//                   </div>
//                   </div>
//                   
//                   `;
//                   //console.log("Loaded Casino:", casino.name);
// 
//                       // return div;
//                   });
// 
// 
//                   // Add the HTML elements to the page
//                   casinos.forEach(casino => dataDiv.appendChild(casino));
//                   console.log("Casinos Loaded:", (casinos).length);
// 
//                   casinosCountDiv.appendChild(casinosCount);
//               };

              // // Add event listeners to the filter elements
              // filterText.addEventListener('input', filterData);
              // filterCategory.addEventListener('change', filterData);
              // filterBonushunt.addEventListener('change', filterData);
              // filterVpn.addEventListener('change', filterData);
              // filterSportbets.addEventListener('change', filterData);
              // filterNoDeposit.addEventListener('change', filterData);
              // filterProhibitedGamesProtection.addEventListener('change', filterData);
              // filterGamomat.addEventListener('change', filterData);
              // filterPlayngo.addEventListener('change', filterData);
              // filterYasarsBest.addEventListener('change', filterData);
              // filter150andmore.addEventListener('change', filterData);
              // filterN1.addEventListener('change', filterData);
              // filterHollycorn.addEventListener('change', filterData);
              // filterDama.addEventListener('change', filterData);
              // filterRabidi.addEventListener('change', filterData);
              // 
              // // Initial data load
              // filterData();
//           })

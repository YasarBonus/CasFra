document.addEventListener('DOMContentLoaded', function() {
    checkLastVisit();
    setFilters();
    clearUrlFilters();
    checkFilterElementsForResetFiltersBtn();

    fetchData();
    $('#fetchingIndicator').hide();
});

function dryRun() {
    console.log('dryRun');
    checkFilterElementsForResetFiltersBtn();
    fetchData();
}

function getBonusFilterRangeValue() {
    const bonusFilterRangeValue = $('#bonusFilter').slider('get value');
    console.log('bonusFilterRangeValue', bonusFilterRangeValue);
    return bonusFilterRangeValue;
}

function hideResetFiltersBtn() {
    $('#resetFiltersBtn').hide();
}


// Display a message if the user has not visited the site before or the last visit was more than X days ago
function checkLastVisit() {
    const visitedBefore = localStorage.getItem('visitedBefore');
    const lastVisitTimestamp = localStorage.getItem('lastVisitTimestamp');
    const currentTimestamp = Date.now();

    const initialDialog = $('#initialDialog');

    // If the user has not visited the site before or the last visit was more than 7 days ago
    if (!visitedBefore || (currentTimestamp - lastVisitTimestamp > 7 * 24 * 60 * 60 * 1000)) {
        // Perform actions for the first visit in the past 7 days
        console.log('First visit in the past 7 days');
        
        // Update the last visit timestamp
        localStorage.setItem('lastVisitTimestamp', currentTimestamp);
        console.log('currentTimestamp', currentTimestamp);
        localStorage.setItem('visitedBefore', true); // Set the 'visitedBefore' flag to true
        initialDialog.modal('show');

    } else {
        console.log('lastVisitTimestamp', lastVisitTimestamp);
        console.log('currentTimestamp', currentTimestamp);

    }

    // Dismiss the initial dialog
    function dismissInitialDialog(){
        document.getElementById('dismissInitialDialog').parentNode.style.display='none';
    };
}

///////////////////////////
// Pre-define filter values from URL parameters

const urlParams = new URLSearchParams(window.location.search);

const filterValues = {
    paymentmethods: urlParams.getAll('paymentmethod'),
    provider: urlParams.getAll('provider'),
    company: urlParams.get('company'),
    category: urlParams.get('category'),
    vpn: urlParams.get('vpn'),
    nomaxcashout: urlParams.get('nomaxcashout'),
    bonushunt: urlParams.get('bonushunt'),
    sportbets: urlParams.get('sportbets'),
    nodeposit: urlParams.get('nodeposit'),
    egonsbest: urlParams.get('egonsbest'),
    bonus150andmore: urlParams.get('bonus150'),
    prohibitedgamesprotection: urlParams.get('prohibitedgamesprotection'),
    minbonus: urlParams.get('minbonus'),
};

// Set the filter values from URL parameters

function setFilters() {
    Object.entries(filterValues).forEach(([filter, value]) => {
        const filterElement = $(`#${filter}Filter`);
        if (filterElement.length) {
            if (filterElement.is('input[type="checkbox"]')) {
                filterElement.prop('checked', value === 'true');
            } else if (filterElement.is('select')) {
                filterElement.dropdown('set selected', value);
            }
        }
    });
}


// Fetch API based on filter parameters and display the response
function fetchData() {
    $('#fetchingIndicator').show();
    const selectedPaymentmethods = $('#paymentmethodsFilter').dropdown('get value');
    console.log ('selectedPaymentmethods', selectedPaymentmethods);

    const selectedProvider = $('#providerFilter').dropdown('get value');
    console.log ('selectedProvider', selectedProvider);

    const selectedCompany = $('#companyFilter').dropdown('get value');
    console.log ('selectedCompany', selectedCompany);

    const selectedCategory = $('#categoryFilter').dropdown('get value');
    console.log ('selectedCategory', selectedCategory);

    const selectedMinBonus = $('#bonusFilter').slider('get value');
    console.log ('selectedMinBonus', selectedMinBonus);


    const apiUrl = 'http://jphev.dynv6.net:3000/api/casinos/htmldiv';
    const fetchUrl = new URL(apiUrl);

    const vpnFilterChecked = $('#vpnFilter').prop('checked');
    if (vpnFilterChecked === true) {
        fetchUrl.searchParams.append('vpn', 'true');
    } else {
        fetchUrl.searchParams.append('vpn', '');
    }

    const nomaxcashoutFilterChecked = $('#nomaxcashoutFilter').prop('checked');
    if (nomaxcashoutFilterChecked === true) {
        fetchUrl.searchParams.append('nomaxcashout', 'true');
    } else {
        fetchUrl.searchParams.append('nomaxcashout', '');
    }

    const bonushuntFilterChecked = $('#bonushuntFilter').prop('checked');
    if (bonushuntFilterChecked) {
        fetchUrl.searchParams.append('bonushunt', 'true');
    } else {
        fetchUrl.searchParams.append('bonushunt', '');
    }

    const sportbetsFilterChecked = $('#sportbetsFilter').prop('checked');
    if (sportbetsFilterChecked) {
        fetchUrl.searchParams.append('sportbets', 'true');
        console.log('sportbetsFilterChecked', sportbetsFilterChecked);
    } else {
        fetchUrl.searchParams.append('sportbets', '');
    }

    const nodepositFilterChecked = $('#nodepositFilter').prop('checked');
    if (nodepositFilterChecked) {
        fetchUrl.searchParams.append('nodeposit', 'true');
    } else {
        fetchUrl.searchParams.append('nodeposit', '');
    }

    const egonsbestFilterChecked = $('#egonsbestFilter').prop('checked');
    if (egonsbestFilterChecked) {
        fetchUrl.searchParams.append('egonsbest', 'true');
    } else {
        fetchUrl.searchParams.append('egonsbest', '');
    }

    const bonus150andmoreFilterChecked = $('#bonus150andmoreFilter').prop('checked');
    if (bonus150andmoreFilterChecked) {
        fetchUrl.searchParams.append('bonus150andmore', 'true');
    } else {
        fetchUrl.searchParams.append('bonus150andmore', '');
    }

    const prohibitedgamesprotectionFilterChecked = $('#prohibitedgamesprotectionFilter').prop('checked');
    if (prohibitedgamesprotectionFilterChecked) {
        fetchUrl.searchParams.append('prohibitedgamesprotection', 'true');
    } else {
        fetchUrl.searchParams.append('prohibitedgamesprotection', '');
    }

    fetchUrl.searchParams.append('paymentmethod', selectedPaymentmethods.join(','));
    fetchUrl.searchParams.append('provider', selectedProvider.join(','));
    fetchUrl.searchParams.append('company', selectedCompany);
    fetchUrl.searchParams.append('minbonus', selectedMinBonus);
    fetchUrl.searchParams.append('category', selectedCategory.join(','));


    console.log('fetchUrl', fetchUrl);
    fetch(fetchUrl)
        .then(response => response.text())
        .then(html => {
            $('#responseContainer').html(html);
            $('#fetchingIndicator').hide();
            // console.log('API response:', html);
        })
        .catch(error => console.error('API error:', error));
        

}

// Load the data automatically and each time the filters are changed

const filterElements = ['#categoryFilter', '#paymentmethodsFilter', '#providerFilter', '#nomaxcashoutFilter', '#vpnFilter', '#bonushuntFilter', '#sportbetsFilter', '#bonus150andmoreFilter', '#egonsbestFilter', '#nodepositFilter', '#prohibitedgamesprotectionFilter', '#companyFilter', '#bonusFilter'];

$(filterElements.join(', ')).on('change', async function() {
    // $('div[id^="casino"]').remove();
    // $('div[id^="toggleBtn"]').remove();
    $('#fetchingIndicator').show();
    clearUrlFilters();
    checkFilterElementsForResetFiltersBtn();
    fetchData();
});

function checkFilterElementsForResetFiltersBtn() {
    const resetFiltersBtn = $('#resetFiltersBtn');
    const isAnyFilterSet = filterElements.some(filterElement => {
        if ($(filterElement).is(':checked') || $(filterElement).val() !== '') {
            return true;
        }
    });

    if (isAnyFilterSet || $('#bonusFilter').slider('get value') !== '100') {
        resetFiltersBtn.show();
    } else {
        resetFiltersBtn.hide();
    }
}






// Copy text into clipboard

function copyText(textInput) {
    /* Copy text into clipboard */
    navigator.clipboard.writeText
        (textInput);
}


// Reset all filters function

function resetFilters() {
    // Reset checkbox filters
    $('#vpnFilter').prop('checked', false);
    $('#nomaxcashoutFilter').prop('checked', false);
    $('#bonushuntFilter').prop('checked', false);
    $('#sportbetsFilter').prop('checked', false);
    $('#nodepositFilter').prop('checked', false);
    $('#egonsbestFilter').prop('checked', false);
    $('#bonus150andmoreFilter').prop('checked', false);
    $('#prohibitedgamesprotectionFilter').prop('checked', false);

    // Reset dropdown filters
    $('#paymentmethodsFilter').dropdown('clear');
    $('#providerFilter').dropdown('clear');
    $('#companyFilter').dropdown('clear');
    $('#categoryFilter').dropdown('clear');

    // Reset Slider filter
    $('#bonusFilter').slider('set value', 100);

    clearUrlFilters();
    fetchData();
}

function clearUrlFilters() {
    history.replaceState(null, '', window.location.pathname);
}

// Call the resetFilters function when the reset button is clicked and hide it
$('#resetFiltersBtn').on('click', function() {
    resetFilters();
    $(this).hide();
});


// Set the checkbox and fetch data
function setCheckboxAndFetchData(checkboxId, value) {
    if ($(checkboxId).prop('checked')) {
        $(checkboxId).prop('checked', false);
    } else {
        $(checkboxId).prop('checked', value);
    }
    clearUrlFilters();
    fetchData();
}

// Set the dropdown and fetch data
function setDropdownAndFetchData(dropdownId, value) {
    $(dropdownId).val(value);
    clearUrlFilters();
    fetchData();
}



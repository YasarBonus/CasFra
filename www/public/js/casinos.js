// Pre-define filter values from URL parameters

// Pre-set the checkbox and dropdown filters based on URL parameters
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
    prohibitedgamesprotection: urlParams.get('prohibitedgamesprotection')
};

Object.entries(filterValues).forEach(([filter, value]) => {
    const filterElement = $(`#${filter}Filter`);
    if (filterElement.length) {
        filterElement.prop('checked', value === 'true');
    } else {
        filterElement.dropdown('set selected', value);
    }
});



// Fetch API based on filter parameters and display the response
function fetchData() {
    const selectedPaymentmethods = $('#paymentmethodsFilter').dropdown('get value');
    console.log ('selectedPaymentmethods', selectedPaymentmethods);

    const selectedProvider = $('#providerFilter').dropdown('get value');
    console.log ('selectedProvider', selectedProvider);

    const selectedCompany = $('#companyFilter').dropdown('get value');
    console.log ('selectedCompany', selectedCompany);

    const selectedCategory = $('#categoryFilter').dropdown('get value');
    console.log ('selectedCategory', selectedCategory);


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
    fetchUrl.searchParams.append('category', selectedCategory.join(','));


    console.log('fetchUrl', fetchUrl);
    fetch(fetchUrl)
        .then(response => response.text())
        .then(html => {
            $('#responseContainer').html(html);
            // console.log('API response:', html);
        })
        .catch(error => console.error('API error:', error));
}

// Load the data automatically and each time the filters are changed
const filterElements = ['#categoryFilter', '#paymentmethodsFilter', '#providerFilter', '#nomaxcashoutFilter', '#vpnFilter', '#bonushuntFilter', '#sportbetsFilter', '#bonus150andmoreFilter', '#egonsbestFilter', '#nodepositFilter', '#prohibitedgamesprotectionFilter', '#companyFilter'];

$(filterElements.join(', ')).on('change', async function() {
    // $('div[id^="casino"]').remove();
    // $('div[id^="toggleBtn"]').remove();
    history.replaceState(null, '', window.location.pathname);
    checkFilterElements();
    fetchData();
});

function checkFilterElements() {
    const resetFiltersBtn = $('#resetFiltersBtn');

    const isAnyFilterSet = filterElements.some(filterElement => {
        if ($(filterElement).is(':checked')) {
            return true;
        }
    });

    if (isAnyFilterSet) {
        resetFiltersBtn.show();
    } else {
        resetFiltersBtn.hide();
    }
}


document.addEventListener('DOMContentLoaded', function() {
    checkFilterElements();
    fetchData();
});


// fetchData();

function copyText(textInput) {
    /* Copy text into clipboard */
    navigator.clipboard.writeText
        (textInput);
}

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

    history.replaceState(null, '', window.location.pathname);
    fetchData();
}

// Call the resetFilters function when the reset button is clicked
$('#resetFiltersBtn').on('click', function() {
    resetFilters();
    $(this).hide();
});


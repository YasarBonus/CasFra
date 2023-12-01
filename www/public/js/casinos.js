// Pre-define filter values from URL parameters

        // Pre-set the checkbox and dropdown filters based on URL parameters
        const urlParams = new URLSearchParams(window.location.search);

        const paymentmethodsFilterValues = urlParams.getAll('dropdown');
        $('#paymentmethodsFilter').dropdown('set selected', paymentmethodsFilterValues);

        const providerFilterValues = urlParams.getAll('dropdown');
        $('#providerFilter').dropdown('set selected', providerFilterValues);

        const companyFilterValues = urlParams.get('dropdown');
        $('#companyFilter').dropdown('set selected', companyFilterValues);

        const categoryFilterValues = urlParams.get('dropdown');
        $('#categoryFilter').dropdown('set selected', categoryFilterValues);

        const vpnFilterValue = urlParams.get('vpn');
        $('#vpnFilter').prop('checked', vpnFilterValue === 'true');

        const nomaxcashoutFilterValue = urlParams.get('nomaxcashout');
        $('#nomaxcashoutFilter').prop('checked', nomaxcashoutFilterValue === 'true');

        const bonushuntFilterValue = urlParams.get('bonushuntFilter');
        $('#bonushuntFilter').prop('checked', bonushuntFilterValue === 'true');

        const sportbetsFilterValue = urlParams.get('bonushuntFilter');
        $('#sportbetsFilter').prop('checked', sportbetsFilterValue === 'true');

        const nodepositFilterValue = urlParams.get('bonushuntFilter');
        $('#nodepositFilter').prop('checked', nodepositFilterValue === 'true');

        const prohibitedgamesprotectionFilterValue = urlParams.get('bonushuntFilter');
        $('#prohibitedgamesprotectionFilter').prop('checked', prohibitedgamesprotectionFilterValue === 'true');




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


            const apiUrl = 'http://127.0.0.1:3000/api/casinos/htmldiv';
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

            const prohibitedgamesprotectionFilterChecked = $('#prohibitedgamesprotectionFilter').prop('checked');
            if (prohibitedgamesprotectionFilterChecked) {
                fetchUrl.searchParams.append('prohibitedgamesprotection', 'true');
            } else {
                fetchUrl.searchParams.append('prohibitedgamesprotection', '');
            }


            

            fetchUrl.searchParams.append('paymentmethod', selectedPaymentmethods.join(','));
            fetchUrl.searchParams.append('provider', selectedProvider.join(','));
            fetchUrl.searchParams.append('company', selectedCompany.join(','));
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
        $('#categoryFilter, #paymentmethodsFilter, #providerFilter, #nomaxcashoutFilter, #vpnFilter, #bonushuntFilter, #sportbetsFilter, #nodepositFilter, #prohibitedgamesprotectionFilter, #companyFilter').on('change', function() {
            // const customFiltersSet = $('#dropdown').dropdown('is set') || $('#vpnFilter').prop('checked') || $('#bonushuntFilter').prop('checked');
            history.replaceState(null, '', window.location.pathname);
            
            fetchData();
        });
        //document.getElementById("toggleBtn").onclick = function() {
        //    var secondDiv = document.getElementById("secondDiv");
        //    if (secondDiv.style.display === "none") {
        //        secondDiv.style.display = "block";
        //    } else {
        //        secondDiv.style.display = "none";
        //    }
        //};
        fetchData();
        function copyText(textInput) {
     
            /* Copy text into clipboard */
            navigator.clipboard.writeText
                (textInput);
        }
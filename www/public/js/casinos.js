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

    };
}

// Dismiss the initial dialog
function dismissInitialDialog(){
    document.getElementById('initialDialog').style.display='none';
};
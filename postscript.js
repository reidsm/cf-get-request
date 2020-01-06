function postBooking() {
    var formObj = gatherFormInfo();
    // console.log(formObj);
    var url = window.location.href;
    var urlComponents = url.split('?');
    var slipString = urlComponents[1];
    // console.log(slipString);
    axios.post('https://reidsm100.checkfront.com/api/3.0/booking/session', {
        "slip": slipString
    }).then(function(response){
        // console.log(response.data.booking.session.id);
        var sessionID = response.data.booking.session.id;
        // console.log(formObj);
        axios.post('https://reidsm100.checkfront.com/api/3.0/booking/create', {
            "session_id": sessionID,
            "form": formObj,
            "slip": slipString
        }).then(function(postBookingResponse){
            console.log(postBookingResponse);
            var bookingID = postBookingResponse.data.booking.id;
            console.log(bookingID)
            var bookingUpdatePost = axios.post('https://reidsm100.checkfront.com/api/3.0/booking/' + bookingID + '/update', {
                "status_id": "HOLD",
                // "notify": 0,
                // "set_paid": 0
            });
            console.log(bookingUpdatePost);
        });
    });
    // console.log(postVar);
}



function gatherFormInfo() {
    var name = document.getElementById('name').value;
    var email = document.getElementById('email').value;

    return { "customer_name": name, "customer_email": email };
}
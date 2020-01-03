//I need to re-write this program without using arrays. Now that I know about foreach I can use that

function getDateForm() {
    var dateForm = document.getElementById('dateForm').value;
    return dateForm;
  }
  //this function gathers data from the form to be called by handleRequest later
  function getParamForm() {
    var paramForm = document.getElementById('paramForm').value;
    return paramForm;
  }

  function handleRequest() {
    var dateForm = getDateForm();
    var paramForm = getParamForm();
    if (dateForm !== null && paramForm !== null) {
      requestItemInfoAndWait(dateForm, paramForm);
    }
  }

  function requestItemInfoAndWait(dateForm, paramForm) {
    var endpoint = "https://cors-anywhere.herokuapp.com/https://reidsm100.checkfront.com/api/3.0/item?start_date=" + dateForm 
    + "&end_date=" + dateForm + "&param[participants]=" + paramForm;
    var xhr = new XMLHttpRequest();
    xhr.open("GET", endpoint);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.setRequestHeader("X-On-Behalf", "off");
    xhr.setRequestHeader("X-Forwarded-For", "2001:569:71a9:1700:f980:86b8:ebc0:8028");
    xhr.send();
    xhr.onload = function (data) {
      handleResponse(data);
    }
  }

  function handleResponse(data) {
    var parsedResponse = JSON.parse(data.currentTarget.response);
    var parsedItems = Object.values(parsedResponse.items);
    console.log(parsedItems);
    var currentDate = getDateForm();
    var paramForm = getParamForm();
    htmlConstructor(parsedItems, currentDate, paramForm);
  }

  function htmlConstructor(parsedItems, currentDate, paramForm) {
    var itemHTML = "";
    parsedItems.forEach(function(i){
        var timeslotLiHTML = timeslotHTML(i, paramForm, currentDate, i.item_id);
        itemHTML += "<div id=" + i.sku + "><h3>" + i.name + "</h3>" + i.summary + "<ul>" 
        + timeslotLiHTML + "</ul></div>";
    });
    document.body.innerHTML = itemHTML;
    addEventListeners(parsedItems, currentDate, paramForm);
  }

  function timeslotHTML(i, paramForm, currentDate, itemID) {
    var timeslotLiHTML = "";
    var rate = i.rate;
    var timeslotArray = rate.dates[rate.start_date].timeslots;
    console.log(timeslotArray);

    timeslotArray.forEach(function(j){
        if(j.A >= paramForm) {

            timeslotLiHTML += "<li>Available at " + j.start_time 
            + "<button id=" + (itemID + '/' + j.start_time + '/' + currentDate + '/' + paramForm) 
            + " class=bookingButton>Book Now" + " " + j.start_time + "</button></li>";

        }
    });
    return timeslotLiHTML;
  }

  function addEventListeners(parsedItems, currentDate, paramForm) {
    parsedItems.forEach(function(i){
        var rate = i.rate;
        var timeslotArray = rate.dates[rate.start_date].timeslots;
        // console.log(i.item_id);
        var itemID = i.item_id;
        timeslotArray.forEach(function(j){
            if(j.A >= paramForm) {
                // console.log("I am running");
                var buttonElement = document.getElementById(itemID + '/' + j.start_time + '/' + currentDate + '/' + paramForm);
                console.log(buttonElement);
                buttonElement.addEventListener("click", printButtonText, false);
            }
        });

    });
  }

  function printButtonText() {
    var thisButtonId = this.id;
    console.log(thisButtonId);
    var stringArr = thisButtonId.split("/");
    var thisItem = stringArr[0];
    console.log(thisItem);
    var thisTime = stringArr[1];
    console.log(thisTime);
    var thisDate = stringArr[2];
    console.log(thisDate);
    var thisParam = stringArr[3];
    console.log(thisParam);

    var url = "https://reidsm100.checkfront.com/api/3.0/item/" + thisItem
        + "?start_date="
        + thisDate
        + "&end_date=" 
        + thisDate
        + "&param[participants]=" 
        + thisParam 
        + "&start_time="
        + thisTime;

        console.log(url);

        get(url).then(function(response) {
        // console.log("Success!", JSON.parse(response));
        var jsonRes = JSON.parse(response);
        var slotSlip = jsonRes.item.rate.slip;
        console.log(slotSlip);
      }, function(error) {
        console.error("Failed!", error);
      });
  }

  function get(url) {
    // Return a new promise.
    return new Promise(function(resolve, reject) {
      // Do the usual XHR stuff
      var req = new XMLHttpRequest();
      req.open("GET", url);
      req.setRequestHeader("Content-Type", "application/json");
//   console.log("I am running");
  
      req.onload = function() {
        // This is called even on 404 etc
        // so check the status
        if (req.status == 200) {
          // Resolve the promise with the response text
          resolve(req.response);
        }
        else {
          // Otherwise reject with the status text
          // which will hopefully be a meaningful error
          reject(Error(req.statusText));
        }
      };
  
      // Handle network errors
      req.onerror = function() {
        reject(Error("Network Error"));
      };
  
      // Make the request
      req.send();
    });
  }





//this function gathers data from the form to be called by handleRequest later
function getDateForm() {
  var dateForm = document.getElementById('dateForm').value;
  return dateForm;
}
//this function gathers data from the form to be called by handleRequest later
function getParamForm() {
  var paramForm = document.getElementById('paramForm').value;
  return paramForm;
}
/*this function collects data from getDateForm and getParam form, makes sure both of the required values exist, 
and passes them to the requestItemInfo function.*/
function handleRequest() {
  var dateForm = getDateForm();
  var paramForm = getParamForm();
  if (dateForm !== null && paramForm !== null) {
    requestItemInfoAndWait(dateForm, paramForm);
  }
}
/*this function takes the data from handleRequest and first puts together the URL string to be sent as part of a GET request later
Then it declares a new XHR reqquest
Then it initializes the newly created request as a GET request and passes in the string 
Then it sets the request header using setRequestHeader because apparently it has to
Then it sends the request
Then, when the response is back, it performs a function
This function takes the json string response and stores it as the variable 'response'
This function will pass the json string response to the function parseResponse*/
function requestItemInfoAndWait(dateForm, paramForm) {
  var endpoint = "https://reidsm100.checkfront.com/api/3.0/item?start_date=" + dateForm + "&end_date=" + dateForm + "&param[participants]=" + paramForm;
  var xhr = new XMLHttpRequest();
  xhr.open("GET", endpoint);
  xhr.setRequestHeader("Content-Type", "application/json");
  xhr.send();
  xhr.onload = function (data) {
    handleResponse(data);
  }
}

function handleResponse(data) {
  var parsedResponse = JSON.parse(data.currentTarget.response);
  var parsedItems = Object.values(parsedResponse.items);
  var itemTimeslotArray = buildTimeslotArray(parsedItems);
  pageConstructor(parsedItems, itemTimeslotArray);
}

function buildTimeslotArray(parsedItems) {
  var itemTimeslotArray = [];
  for (var i = 0; i < parsedItems.length; i++) { //loop through the parsed items array
    var rate = parsedItems[i].rate; //store the rate object from each item in the parsedItems array as a rate
    var timeslotArray = rate.dates[rate.start_date].timeslots; //store the timeslot information for each date in each item rate as a timeslot array. Pull the start date from rate.start_date because it's formatted correctly
    itemTimeslotArray.push(timeslotArray);
  }
  return itemTimeslotArray;
}

function pageConstructor(parsedItems, itemTimeslotArray) {
  var paramForm = getParamForm();
  for (var j = 0; j < parsedItems.length; j++) {
    var itemDiv = document.createElement('div');
    itemDiv.setAttribute("class", "div" + parsedItems[j].name);
    itemDiv.textContent = parsedItems[j].name;
    itemDiv.innerHTML += parsedItems[j].summary;
    var timeslotList = document.createElement('ul');
    for (k = 0; k < itemTimeslotArray[j].length; k++) {
      if (itemTimeslotArray[j][k].A >= paramForm) {
        var li = document.createElement('li');
        li.textContent = "Available at " + itemTimeslotArray[j][k].start_time;
        timeslotList.appendChild(li);
        var bookingButton = document.createElement('button');
        bookingButton.setAttribute("id", [j] + [k]);
        bookingButton.setAttribute("onclick", "getTimeslotSlip();");
        bookingButton.innerHTML = "Book Now";
        timeslotList.appendChild(bookingButton);
      }
    }
    itemDiv.append(timeslotList);
    document.body.appendChild(itemDiv);
  }
}

/*
create a function for build timeslot list (move the nested for loop out of this function)
*/
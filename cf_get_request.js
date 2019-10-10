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
Then, when the response is back, it performs a function on the response
which is stored as the variable "data." This function calls the next function in the chain, 
handleresponse.*/
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
/*This function is passed the string response
it then parses the string into JSON, and further stores the item array from this giant response 
in var parsedItems. In order to return individual timeslots it then calls the buildTimeslotArray
function and stores the timeslot array as itemTimeslotArray. It then passes parsedItems and itemTimeslot array 
to the page constructor function and calls it to continue the chain.
This function can be thought of as a variable storage center that stores all the parts of
the response in the format we need, and also calls pageConstructor to put the page together*/
function handleResponse(data) {
  var parsedResponse = JSON.parse(data.currentTarget.response);
  var parsedItems = Object.values(parsedResponse.items);
  var itemTimeslotArray = buildTimeslotArray(parsedItems);
  // pageConstructor(parsedItems, itemTimeslotArray);
  console.log(parsedItems);
  htmlConstructor(parsedItems, itemTimeslotArray);
}

/*This function restructures part of the response so that the page constructor can loop through it intelligently
for each item in the parsedItems array, the function stores the .rate object which includes the dates object, which contains the
timeslot array which we need
The function goes into rate -> dates -> at the position rate.start_date. Remember that the start date is from the form that is 
part of the initial GET request
This front end assumes only one date's worth of timeslots will be displayed. It further drills down into the date object to find
the timeslot array and pushes that item's array into the itemTimeslotArray, which is an array of each item's timeslot arrays
This is what the pageConstructor needs to display available timeslots 
 */
function buildTimeslotArray(parsedItems) {
  var itemTimeslotArray = [];
  for (var i = 0; i < parsedItems.length; i++) {
    var rate = parsedItems[i].rate;
    var timeslotArray = rate.dates[rate.start_date].timeslots;
    itemTimeslotArray.push(timeslotArray);
  }
  console.log(itemTimeslotArray);
  return itemTimeslotArray;
}
/*This function creates a div for each item, sets the div id to [i], containing the name in h3 tags and the summary. it calls the timeslotHTML function
to add the available timeslots as list items within the ul tag, and adds the itemhtml to the document's body*/
function htmlConstructor (parsedItems, itemTimeslotArray) {
  var itemHTML = "";
  for (var j = 0; j < parsedItems.length; j++) {
    var timeslotLiHTML = timeslotHTML(itemTimeslotArray, j, parsedItems);
    itemHTML += "<div id=" + [j] + "><h3>" + parsedItems[j].name + "</h3>" + parsedItems[j].summary + "<ul>" + timeslotLiHTML + "</ul></div><data>"+ parsedItems[j].item_id +"</data>";
  }
  document.body.innerHTML = itemHTML;
  return itemHTML;
}
/*for each item there is an unordered list for each available timeslot (the if statement will prevent unavailable timeslots from appearing). this function loops over 
each item's timeslot array to create each list item as html, and returns this html*/
function timeslotHTML(itemTimeslotArray, j, parsedItems) {
  var timeslotLiHTML = "";
  var paramForm = getParamForm();
  for (k = 0; k < itemTimeslotArray[j].length; k++) {
    if (itemTimeslotArray[j][k].A >= paramForm) {
      var slotSlip = $.get("https://reidsm100.checkfront.com/api/3.0/item/" + parsedItems[j].item_id
      + "?start_date="
      + getDateForm()
      + "&end_date=" 
      + getDateForm()
      + "&param[participants]=" 
      + paramForm 
      + "&start_time="
      + itemTimeslotArray[j][k].start_time);

      //console.log(JSON.parse(slotSlip));

      timeslotLiHTML += "<li>Available at " + itemTimeslotArray[j][k].start_time + "<button id=" + ([j] + [k]) + " class=bookingButton onlick=getTimeslotSlip();>Book Now</button><data>" + itemTimeslotArray[j][k].start_time + "</data></li>";

      console.log(slotSlip);
      //var parsedSlotSlip = JSON.parse(slotSlip);
      //timeslotLiHTML += "<data>" + slotSlip + "</data>";
    }
  }
  return timeslotLiHTML;
}

/*
$.get("https://reidsm100.checkfront.com/api/3.0/item?start_date=" 
+ dateForm 
+ "&end_date=" 
+ dateForm 
+ "&param[participants]=" 
+ paramForm 
+ "&start_time="
+ itemTimeslotArray[j][k].start_time)
*/ 
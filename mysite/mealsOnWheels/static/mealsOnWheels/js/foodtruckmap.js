<!--http://stackoverflow.com/questions/15144691/google-maps-multiple-marker-from-extern-json-->
var map;
var downtownVancouver = new google.maps.LatLng(49.28,-123.12);


function initialize() {
  var mapOptions = {
    zoom: 14,
    center: downtownVancouver,
    mapTypeId:google.maps.MapTypeId.ROADMAP
  }

map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

// https://developers.google.com/maps/documentation/javascript/markers
// https://developers.google.com/maps/documentation/javascript/examples/places-searchbox
// Create the search box and link it to the UI element.

var input = /** @type {HTMLInputElement} */(
      document.getElementById('pac-input'));
map.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

var searchBox = new google.maps.places.SearchBox(
    /** @type {HTMLInputElement} */(input));

var markers = [];
  // Listen for the event fired when the user selects an item from the
  // pick list. Retrieve the matching places for that item.
google.maps.event.addListener(searchBox, 'places_changed', function() {
    var places = searchBox.getPlaces();
    for (var i = 0, marker; marker = markers[i]; i++) {
      marker.setMap(null);
    }
    if (places.length == 0) {
      return;
    }

    // For each place, get the icon, place name, and location.
    markers = [];

    // Zoom in/out to show both the new location and the food vendors

    var bounds = new google.maps.LatLngBounds();
    bounds.extend(downtownVancouver);
    for (var i = 0, place; place = places[i]; i++) {
      var image = {
         url: place.icon,
         size: new google.maps.Size(71, 71),
         origin: new google.maps.Point(0, 0),
         anchor: new google.maps.Point(17, 34),
         scaledSize: new google.maps.Size(25, 25)
      };

      // Create a marker for each place.
      var marker = new google.maps.Marker({
         map: map,
         icon: image,
         title: place.name,
         position: place.geometry.location,
         click: true,
         draggable: false,
         animation: google.maps.Animation.BOUNCE// DROP
      });

    markers.push(marker);


    markers[i].addListener('click',function(){
         var infowindow = new google.maps.InfoWindow({
           content: this.title
         });
         infowindow.open(map,this);
    });

      bounds.extend(place.geometry.location);
    }
    map.fitBounds(bounds);
  });
    // Bias the SearchBox results towards places that are within the bounds of the
  // current map's viewport.


// http://stackoverflow.com/questions/24152420/pass-dynamic-javascript-variable-to-django-python
function sendFoodVendorToDjango(key,rate){
    $(".invalidRate").remove();
    $(".listRateAppended").remove();
    if (checkRateValid(rate)){
        var data = {'foodTruckKey': key,'rate':rate};
        $.post("/mealsOnWheels/map/", data,
            function(response){// Do Nothing
            filterFoodVendor(key)
            });
    }else{
        $("#listRate").prepend(
        "<div style='color:blue' class='invalidRate'>Rating must be an integer between 0 - 10</div>");
    }
}

function isInt(value) {
  return !isNaN(value) &&
         parseInt(Number(value)) == value &&
         !isNaN(parseInt(value, 10));
}

function checkRateValid(rate){
    if (isInt(rate)){
        if (rate <= 10 & rate >= 0 )
            return true;
    }
    return false;
}

function userRatingStyling(element){
    return "User: " + element.user + "  Rating: " +
            element.rate +"  Date: "+ element.pub_date;
}

function showMoreFoodVendor(key){

    var data = {'foodTruckKey': key};
    $.ajax({
            type: "POST",
            url: "/mealsOnWheels/showMoreVendor/",
            dateType: 'json',
            data: data,
            success:function(json){
            // Before appending, delete all the previously appended information
            $(".listRateAppendedExtra").remove();
            $(".invalidRate").remove();
            if (json.length === 0){
            $("#listRateHeader").append("<div class='listRateAppendedExtra'>Nothing more to show!</div>");
            }else{
                // each user's review is printed.
                $.each(json, function(index, element) {
                 $("#listRateHeader").append(
                   "<div class='listRateAppendedExtra'> " + userRatingStyling(element) + "</div>");
                 });
            }
    }});
}

function filterFoodVendor(key){
    var data = {'foodTruckKey': key};
    $.ajax({
            type: "POST",
            url: "/mealsOnWheels/filterVendor/",
            dateType: 'json',
            data: data,
            success:function(json){
            // Before appending, delete all the previously appended information
            $(".listRateAppended").remove();
            $(".listRateAppendedExtra").remove();
            $("#rateAve").remove();
            $(".invalidRate").remove();
            if (json.length === 0){
            $("#listRate").append("<div class='listRateAppended'>No one has reviewed yet!</div>");
            }else{
                // each user's review is printed.
                $.each(json, function(index, element) {
                    if (element.additional === 0){
                         $("#listRate").append(
                         "<div class='listRateAppended'>"+userRatingStyling(element)+"</div>");
                    }else{
                    if (element.average !== "NA"){

                        s1 = "<p id='rateAve'>" + element.average
                        s2 = "<span style='font-size:40%;'>rating</span> </p>"
                         $( "#selected-food-truck-details h3" )
					    .append(s1 + s2);
					    }
                    }
                 });
            }
    }});
}


function setFav(favName){

    var c = getCookie("favorite");
    if(c.indexOf(favName) == -1){
        document.cookie = "favorite=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
        setCookie("favorite", c+"<br>"+favName, 365);

    }

}

function setCookie(cname,cvalue,exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires=" + d.toGMTString();
    document.cookie = cname+"="+cvalue+"; "+expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

$(document).ready(function() {

    $('#my-fav').prepend(getCookie("favorite"));
    $("#remove-fav").click(function(){
        document.cookie = "favorite=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
        $('#my-fav').html("");
    });


    $('.image-popup-vertical-fit').magnificPopup({
        type:'image',
        delegate: 'a',
        closeOnContentClick: true,
        mainClass: 'mfp-img-mobile',
        image: {
            verticalFit: true
        }


    });

    $.getJSON("/mealsOnWheels/food_trucks", function(food_trucks_json) {
		console.log( json_string );
		//food_trucks_json = $.parseJSON( "{{ %json_string% }}" );
        $.each(food_trucks_json, function(key, data) {
            var latLng = new google.maps.LatLng(data.latitude, data.longitude);

            // Creating a marker and putting it on the map
            var marker = new google.maps.Marker({
            position: latLng,
            title: data.name
                });

                marker.setMap(map);

                var infowindow = new google.maps.InfoWindow({
					content: data.name
					});

                google.maps.event.addListener(marker, 'click', function() {
					infowindow.open(map,marker);

					$( "#selected-food-truck-details p" )
					.html("<b>" + data.description + "</b><br>" + data.location);
					$( "#selected-food-truck-details h3" )
					.html( data.name );
                    $( "#instafeed")
                    .html ( "" );
					run(data.name);

                    // ~~~ filtering ~~~
                    $(".listRateAppended").remove();
                    $("#rateh1")
                    .html(function(){document.getElementById("rateh1").style.visibility="visible"});
                    $("#button").unbind('click').click(function(){
                        var rate = $('#rateinput').val();
                        sendFoodVendorToDjango(key=data.key,rate=rate);
                        $('#rateinput').val("");
                        })
                    filterFoodVendor(key=data.key);
                    $("#listRateHeader").unbind('click').click(function(){
                        showMoreFoodVendor(key=data.key);
                    });

                    //  ~~~favorite selection
                    $("#myfav").click(function(){
                        setFav(data.name);
                        $('#my-fav').html(getCookie("favorite"));
                    });


				});

            });
        });


    });

    <!--http://stackoverflow.com/questions/743214/how-do-i-resize-a-google-map-with-javascript-after-it-has-loaded-->
	$(window).resize(function() {
        google.maps.event.trigger(map, "resize");
    });
};

google.maps.event.addDomListener(window, 'load', initialize);
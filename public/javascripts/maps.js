//Global variables
//Variables for map
var map, locations, icon, content;
var markers = [], infowindows = [], timers = [];
//Variable for socket connection
var socket = io();


function initMap() {
    //These will be the geographical location of our sensors 
    locations = [
         ['Node 1', 7.911770,-72.548133],
         ['Node 2', 7.932780,-72.568133],
         ['Node 3', 7.973790,-72.558133],
         ['Node 4', 7.962800,-72.543133],
         ['Node 5', 7.932810,-72.518133],
         ['Node 6', 7.921820,-72.518133],
         ['Node 7', 7.913430,-72.528133],
         ['Node 8', 7.911840,-72.528133],
         ['Node 9', 7.915850,-72.515153],
         ['Node 10', 7.911860,-72.518133],
         ['Node 11', 7.917870,-72.522133],
         ['Node 12', 7.921880,-72.538133],
         ['Node 13', 7.941890,-72.598133],
         ['Node 14', 7.961900,-72.558133],
         ['Node 15', 7.971910,-72.508133],
         ['Node 16', 7.981920,-72.512133],
         ['Node 17', 7.891930,-72.528233],
         ['Node 18', 7.924940,-72.548133],
         ['Node 19', 7.918950,-72.528133]
    ];

    //Create the map object 
    map = new google.maps.Map(document.getElementById('map'), {
         zoom: 12,
         center: new google.maps.LatLng(7.911760,-72.518133)
    });

    icon = {
      url: '/images/inactive-sensor.png', // url
      scaledSize: new google.maps.Size(30, 30), // scaled size
      origin: new google.maps.Point(0,0), // origin
      anchor: new google.maps.Point(0, 0) // anchor
    }; //Icon for each marker in the map

    for (var i = 0; i < locations.length; i++) { 
        infowindows[i] = new google.maps.InfoWindow;
        markers[i] = new google.maps.Marker({
             position: new google.maps.LatLng(locations[i][1], locations[i][2]),
             map: map,
             title : locations[i][0],
             icon : icon
        });


        content = '<div id = "map-info-wrapper"> <div id = "map-info-title"><h1>' + locations[i][0] +  '</h1></div>' + 
              '<ul id= "map-info-list">' + 
              '<li class = "map-list-color no-info-data"> No data </li>' +
              '<li class = "map-list-nocolor no-info-data"> Retrieving data from server</li>' +
              '<li class = "map-list-color no-info-data"> Please wait...</li>' +
              '</ul></div>';

        setInfoWindow(markers[i], i, content);

        google.maps.event.addListener(map, 'click', (function(infowindow, i) {
          return function(){
            infowindows[i].close();
          }
      })(infowindows[i], i));
    }
    
}

function setInfoWindow(marker, index, content){
  google.maps.event.addListener(marker, 'click', (function(marker, index) {
    return function() {
        infowindows[index].setContent(content);
        infowindows[index].open(map, marker);
        for(var j = 0; j< markers.length; j++){
          if(j != index){
            infowindows[j].close();
          }
        }
    }   
})(marker, index));
}

function addContentInfoWindow(index, content){
  infowindows[index].setContent(content); 
}

//Function to make inactiva a marker
function setInactiveMarker(marker){
  var inactiveIcon = icon;
  inactiveIcon.url = '/images/inactive-sensor.png';
  marker.setIcon(inactiveIcon);
}

//Function to make active a marker
function setActiveMarker(marker){
  var activeIcon = icon;
  activeIcon.url = '/images/active-sensor.png';
  marker.setIcon(activeIcon);
}

socket.on('sensor node', function(data){
      if(data.node != null && (data.node >=1 && data.node <= 19)){
        var date = new Date();
        // get the date as a string
        var n = date.toDateString();
        // get the time as a string
        var time = date.toLocaleTimeString();
        content = '<div id = "map-info-wrapper"> <div id = "map-info-title"><h1>' + locations[data.node-1][0] + '</h1></div>' + 
                  '<ul id= "map-info-list">' + 
                  '<li class = "map-list-nocolor"> <strong>Temperature: </strong> ' + data.temperature + '</li>' +
                  '<li class = "map-list-color"> <strong>Humidity: </strong> ' + data.humidity + '</li>' +
                  '<li class = "map-list-nocolor"> <strong>mq2: </strong> ' + data.mq2 + '</li>' +
                  '<li class = "map-list-color"> <strong>mq9: </strong> ' + data.mq9 + '</li>' +
                  '<li class = "map-list-nocolor"> <strong>flame: </strong> ' + data.flame + '</li>' +
                  '<li class = "map-list-color"> <strong>Last update: </strong>'+ n + ' ' + time + '</li>' +
                  '</ul></div>';
        setActiveMarker(markers[data.node-1]);
        addContentInfoWindow(data.node-1, content);
        setInfoWindow(markers[data.node-1], data.node-1, content);
        clearTimeout(timers[data.node-1]);
        timers[data.node-1] = setTimeout(function(){
          return setInactiveMarker(markers[data.node-1])}, 5000);
      }
});
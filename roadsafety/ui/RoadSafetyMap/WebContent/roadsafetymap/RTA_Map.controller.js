sap.ui.controller("roadsafetymap.RTA_Map", {

	backTriggered : function(evt) {
		var bus = sap.ui.getCore().getEventBus();
		bus.publish("nav", "back");
	},

	/**
	 * Called when a controller is instantiated and its View controls (if
	 * available) are already created. Can be used to modify the View before it
	 * is displayed, to bind event handlers and do other one-time
	 * initialization.
	 * 
	 * @memberOf roadsafetymap.RTA_Map
	 */
	onInit : function() {

		function initializeUsingCurrentGeoLocation() {
			if (navigator.geolocation) {
				navigator.geolocation.getCurrentPosition(initializeMain);
			} else {
				var msgLoc = 'Geolocation could not determine location';
				jQuery.sap.require("sap.m.MessageToast");
				sap.m.MessageToast.show(msgLoc);
				console.warn(msgLoc);
			}
		}
		
		function initializeUsingEnteredAddress(address) {
		
			var geocoder = new google.maps.Geocoder();
		    geocoder.geocode({ 'address': address }, function (results, status) {  
	            if (status == google.maps.GeocoderStatus.OK) {
	            	var loc = results[0].geometry.location;
	            	var pos = { coords : { latitude : loc.lat(), longitude : loc.lng()}}; 
	            	initializeMain(pos);  
	            } else {  
	            	var msgLoc = 'Geocode was not successful for the following reason: ' + status;
					jQuery.sap.require("sap.m.MessageToast");
					sap.m.MessageToast.show(msgLoc);
					console.warn(msgLoc);
	            }
	        });  
	    }

		function initializeMain(position) {
			
			// Create Map
			var mapOptions = {
				center : new google.maps.LatLng(position.coords.latitude,
						position.coords.longitude),
				zoom : 14,
				panControl : true,
				mapTypeId : google.maps.MapTypeId.ROADMAP,
				styles : [ { "stylers": [
				        	      { "saturation": -66 },
				        	      { "lightness": -5 },
				        	      { "weight": 3.7 },
				        	      { "hue": "#fff700" }
				        ] } ]
			};
			MAP.gMap = new google.maps.Map(
					document.getElementById("map_canvas"), mapOptions);

			// Listen for when map is stable and bounds are properly defined			
			google.maps.event.addListener(MAP.gMap, 'bounds_changed', function() {
				console.log("..bounds changed: %O", MAP.gMap.getBounds());
				getAccidentData(position);
				drawAccidentLayer(position);
			});	
		}
		
		function getAccidentData(position)
		{
			// was reading position.coords.latitude, position.coords.longitude
			
			// get RTA data in current bounds
			// eg 51.398775,-0.280047,51.423776,-0.169153
			var boundsArray = MAP.gMap.getBounds().toUrlValue(6).split(',');
				
			// max recs is less if markers are used
			var maxRecs = 0;
			if (MAP.MapMode === MapModeEnum.MARKERS) {	
				maxRecs = 50;
			}
			else {
				maxRecs = MAP.MaxRecords;
			}
 
			RTA.getAccidentData(boundsArray[0], boundsArray[2], boundsArray[1], boundsArray[3],
					MAP.gMap.getZoom(), maxRecs);
			var msg = RTA.oDataStoreCount + ' records retrieved.';
			jQuery.sap.require("sap.m.MessageToast");
			sap.m.MessageToast.show(msg);
			console.log(msg);			
		}
		
		function drawAccidentLayer(position)
		{		
			console.log("..in drawAccidentLayer, mode: ", MAP.MapMode, " (where 0=Marker, 1=Heatmap)");

			if (MAP.MapMode === MapModeEnum.MARKERS) {	
				// MAP.gHeatMap.setMap(null); // removes heatmap
				
				// only add markers first time
				if (!MAP.gMapInfoWindowsInitialised) {
					MAP.gMapInfoWindowsInitialised = true;
					MAP.MarkerArray.Length = 0;
					MAP.MarkerArrayIterator = 0;
					for ( var i = 0; i < RTA.oDataStore.results.length; i++) {
						// These add marker calls get made later, on a timer
						setTimeout(function() {
							addMarker();
						}, i * 200);				
					}
				}
			}	
			else {
			    // heatmap
			    var pointArray = new google.maps.MVCArray(MAP.HeatMapArray);
			    MAP.gHeatMap = new google.maps.visualization.HeatmapLayer({
			        data: pointArray
			    });
			    MAP.gHeatMap.setMap(MAP.gMap);
			    console.log("..heatmap complete");
						
			    // add current location marker
			    var myLatlng = new google.maps.LatLng(position.coords.latitude,
			    position.coords.longitude);
			    var markerx = new google.maps.Marker({
			        position : myLatlng
			    });
			    markerx.setMap(MAP.gMap);
						
			    // add info window
			    var contentString = '<p><b>You</b> are <b>here</b></p>';
			    var infowindow = new google.maps.InfoWindow({
			        content: contentString
			    });
			    google.maps.event.addListener(markerx, 'click', function() {
			        infowindow.open(MAP.gMap, markerx);
			    });
			}			
		}

		function addMarker() {
		
				// Get lat lon
				var array_element = RTA.oDataStore.results[MAP.MarkerArrayIterator];
				var myLatlng = new google.maps.LatLng(array_element.LATITUDE,
						array_element.LONGITUDE);
				// Create and add marker
				var mark = new google.maps.Marker({
					position : myLatlng,
					map : MAP.gMap,
					draggable : false,
					animation : google.maps.Animation.DROP
				})
				MAP.MarkerArray.push(mark);
						
				// Create InfoWindow
				var contentString = "<p><b>Year:</b> " + array_element.ACCYEAR + "</p>" +
					"<p><b>Light:</b> " + array_element.AT_LIGHT_Description + "</p>" +
					"<p><b>Weather:</b> " + array_element.AT_WEATHER_Description + "</p>"
					"<p><b>Surface:</b> " + array_element.AT_SURFACE_Description + "</p>";
				var infowindow = new google.maps.InfoWindow({
					content : contentString
				});
			
				// Add Infowindow
				MAP.InfowindowArray.push(new google.maps.event.addListener(
						mark,
						'click',
						function() {
							infowindow.open(MAP.gMap, mark);
					}
				));
			
				MAP.MarkerArrayIterator++;	
		}

		// Entry point
		console.log("..in RTA_Map.controller");
		console.log("Desired Location = ", MAP.DesiredLocation, " (null means use current location)");
		console.log("Max Records = ", MAP.MaxRecords);
		
		// For simplicity clear everything
		// here
		
		if (MAP.DesiredLocation == null) {
			// Use current geolocation
		    initializeUsingCurrentGeoLocation();
		} else {
			// Use entered location
			initializeUsingEnteredAddress(MAP.DesiredLocation);
		}
		// or can call initializeMain(position) in position of choice
	}

/**
 * Similar to onAfterRendering, but this hook is invoked before the controller's
 * View is re-rendered (NOT before the first rendering! onInit() is used for
 * that one!).
 * 
 * @memberOf roadsafetymap.RTA_Map
 */
// onBeforeRendering: function() {
//
// },
/**
 * Called when the View has been rendered (so its HTML is part of the document).
 * Post-rendering manipulations of the HTML could be done here. This hook is the
 * same one that SAPUI5 controls get after being rendered.
 * 
 * @memberOf roadsafetymap.RTA_Map
 */
// onAfterRendering: function() {
//
// },
/**
 * Called when the Controller is destroyed. Use this one to free resources and
 * finalize activities.
 * 
 * @memberOf roadsafetymap.RTA_Map
 */
// onExit: function() {
//
// }
});
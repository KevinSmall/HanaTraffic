// Container object for oData retrieval (no map related items here)
var RTA = {
	// Library fn 	
	precise_round : function (num, decimals) {
		return Math.round(num * Math.pow(10, decimals)) / Math.pow(10, decimals);
	},

	// Get data
	getAccidentData : function(latitudeMin, latitudeMax, longitudeMin, longitudeMax, zoom, maxRecords) {
		
		console.log("..in RTA.getOData for:", latitudeMin, latitudeMax, longitudeMin, longitudeMax, zoom, maxRecords);

		// prepare model
		var sServiceUrl = "../../../services/getRTA_ACC_Minimal.xsodata/";
		var oModel = new sap.ui.model.odata.ODataModel(sServiceUrl, true);
		oModel.setSizeLimit(500);
		oModel.attachRequestFailed(function(evt) {
			alert("Server error: " + evt.getParameter("message") + " - "
					+ evt.getParameter("statusText") + "\n" + sServiceUrl);
		});
		console.log("oModel prepared but not loaded yet", "%O", oModel);

		latMin = latitudeMin;
		latMax = latitudeMax;
		lngMin = longitudeMin;
		lngMax = longitudeMax;
		
		// read model
		var oDataStore = null;
		var oAbort = null;
		// sample filter is "$filter=LATITUDE gt 51.3m and LATITUDE lt 51.7m and LONGITUDE gt -0.18m and LONGITUDE lt -0.14m"
		var strFilter = "$filter=LATITUDE gt " + latMin + "m and LATITUDE lt "
				+ latMax + "m and LONGITUDE gt " + lngMin
				+ "m and LONGITUDE lt " + lngMax + "m";
		console.log("oModel read filter", strFilter);
		var topRecs = "$top=" + maxRecords; // eg "$top=50"
		console.log("oModel top", topRecs);
		
		oAbort = oModel.read("getRTA_ACC_Minimal", undefined,
		[ strFilter, topRecs, "$format=json" ], // system prefixes a ? at the first one and a & between subsequent
		false, // asynch
		function readModel_OnSuccess(oData, response) {
			oDataStore = oData;
			console.log("oModel read ok");
		}, function readModel_OnError(oError) {
			console.warn("oModel read error");
			alert("error: " + oError);
		});

		// by here, oDataStore should be filled
		console.log("oDataStore", "%O", oDataStore);
		console.log("finished reading model");

		// BusyDialog
		// oModel.attachRequestSent(function(){busyDialog.open();});
		// oModel.attachRequestCompleted(function(){busyDialog.close();});
		// oCore = sap.ui.getCore().setModel(oModel);

		// Global store of raw oData
		RTA.oDataStore = oDataStore;
		RTA.oDataStoreCount = oDataStore.results.length;

		// Pick out the just the data needed for a heatmap
		for ( var i = 0; i < oDataStore.results.length; i++) {
			var array_element = oDataStore.results[i];
			var myLatlng = new google.maps.LatLng(array_element.LATITUDE,
					array_element.LONGITUDE);
			MAP.HeatMapArray[i] = myLatlng;
		}

	},
	oDataStore : {},
	oDataStoreCount : 1	
};

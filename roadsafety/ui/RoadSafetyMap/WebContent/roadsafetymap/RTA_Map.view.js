sap.ui.jsview("roadsafetymap.RTA_Map", {

	/** Specifies the Controller belonging to this View. 
	* In the case that it is not implemented, or that "null" is returned, this View does not have a Controller.
	* @memberOf roadsafetymap.RTA_Map
	*/ 
	getControllerName : function() {
		return "roadsafetymap.RTA_Map";
	},

	/** Is initially called once after the Controller has been instantiated. It is the place where the UI is constructed. 
	* Since the Controller is given to this method, its event handlers can be attached right away. 
	* @memberOf roadsafetymap.RTA_Map
	*/ 
	createContent : function(oController) {
		
		// flexbox to hold map
		var oMyFlexbox = new sap.m.FlexBox("map_canvas", {
			fitContainer : true,
			justifyContent : "Center",
			alignItems : "Center"
		});
	
		// page wrapper around the flexbox
		var oPage = new sap.m.Page({
			title : "Traffic Accidents",
			showNavButton : true,
			navButtonType : "Default",
			navButtonText : "Back",
			navButtonTap : [ oController.backTriggered, oController ],
			enableScrolling : false,
			content : oMyFlexbox
		});
		
		console.log("..in RTA_Map.view");
		return oPage;
	}

});
sap.ui.controller("roadsafetymap.RTA_Settings", {
	
	onLiveChange: function(evt) {
		console.log("..in RTA_Settings.onLiveChange");
		// if the user starts typing in the "specify other location" box, change the radiobutton to match
		this.byId("RTA_Set_RadBut2").setSelected(true);       
	},
	
	listItemTriggered: function(evt) {
		console.log("..in RTA_Settings.listItemTriggered");
		
		// Is the "use other location" option chosen?
		var isOtherLocationSelected = this.byId("RTA_Set_RadBut2").getSelected();    
		
		// Which list item was pressed?
		var sId = evt.getSource().sId;				
		if (sId == "RTA_AppView--RTA_Settings--RTA_Set_HeatMap") {
		    MAP.MapMode = MapModeEnum.HEATMAP;
		} else {
			MAP.MapMode = MapModeEnum.MARKERS;
		}
		
		// What location should be used?
		if (isOtherLocationSelected) {
			MAP.DesiredLocation = this.byId("RTA_Set_LocText").getValue();  
		} else {
			MAP.DesiredLocation = null;
		}
		
		// How many max records?
		MAP.MaxRecords = this.byId("RTA_Set_MaxRecs").getValue() || 20;
		
		// Binding not actually used, but left in from MVC template code
		var bindingContext = evt.getSource().getBindingContext(); // evt.getSource() is the ListItem	
		// The EventBus is used to let the Root Controller know that a navigation should take place.		
		var bus = sap.ui.getCore().getEventBus();
		bus.publish("nav", "to", { 
			id : "RTA_Map",
			data : {
				context : bindingContext
			}
		});
	}

/**
* Called when a controller is instantiated and its View controls (if available) are already created.
* Can be used to modify the View before it is displayed, to bind event handlers and do other one-time initialization.
* @memberOf roadsafetymap.RTA_Settings
*/
//	onInit: function() {
//
//	},

/**
* Similar to onAfterRendering, but this hook is invoked before the controller's View is re-rendered
* (NOT before the first rendering! onInit() is used for that one!).
* @memberOf roadsafetymap.RTA_Settings
*/
//	onBeforeRendering: function() {
//
//	},

/**
* Called when the View has been rendered (so its HTML is part of the document). Post-rendering manipulations of the HTML could be done here.
* This hook is the same one that SAPUI5 controls get after being rendered.
* @memberOf roadsafetymap.RTA_Settings
*/
//	onAfterRendering: function() {
//
//	},

/**
* Called when the Controller is destroyed. Use this one to free resources and finalize activities.
* @memberOf roadsafetymap.RTA_Settings
*/
//	onExit: function() {
//
//	}

});
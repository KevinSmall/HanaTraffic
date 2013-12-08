// Container object for map data
var MapModeEnum = { MARKERS : 0, HEATMAP : 1 };
var MAP = {
	MapMode : MapModeEnum.HEATMAP,
	DesiredLocation : "",
	MaxRecords : 0,
	HeatMapArray : [],
	MarkerArray : [],
	InfowindowArray : [],
	MarkerArrayIterator : 0,
	gMapInfoWindowsInitialised : false,
	gMap : google.maps.Map,
    gHeatMap : google.maps.visualization.HeatmapLayer,
};
/*
http://<server>/roadsafety/services/updateAccBulk.xsjs?qty=5000
Takes about 13 seconds to update 1000 records

*/
$.import("roadsafety.libraries", "transformLatLon");
var TRANSFORMCOORDS = $.roadsafety.libraries.transformLatLon;

// for tracing, gets written to http response
var body = '';

// Prepare selection query, returns query string
function prepareQuery() {
	
	var qty = 1000;
	qty = $.request.parameters.get('qty');
		
	var select = 'SELECT TOP ' + qty + ' \"ACCYEAR\", \"ACCREF\", \"EASTING\", \"NORTHING\", \"LATITUDE\", \"LONGITUDE\"';
	var from = ' FROM \"ROAD".\"roadsafety.data::Road.Acc\"';
	var where = ' WHERE \"LATITUDE\" IS NULL';
	var orderby = ' ORDER BY \"ACCYEAR\", \"ACCREF\"';
	var query = select + from + where + orderby;
	body += query + "\n";
	return query;
}

// receives query string to use for selection
function mainUpdate(querySelection) {

	// build the recordset
	var connSelect = $.db.getConnection();
	var pstmtSelect = connSelect.prepareStatement(querySelection);
	var rs = pstmtSelect.executeQuery();

	body += "accyear, accref, easting, northing, latitude, longitude\n";
	// looping through a recordset is a one-way ticket, so we do all work for
	// each record one at a time
	while (rs.next()) {
		// vars prefixed with r are recordset values read from SELECT SQL
		// vars prefixed with p are parameter values ready for use in UPDATE SQL
		var raccyear = rs.getInteger(1);
		var raccref = rs.getString(2);
		var reasting = rs.getInteger(3) * 10;   // data stored with 10m accuracy
		var rnorthing = rs.getInteger(4) * 10;  // data stored with 10m accuracy

		//body += rs.getString(1) + ", " + rs.getString(2) + ", "
		//		+ rs.getInteger(3) + ", " + rs.getInteger(4) + ", "
		//		+ rs.getDecimal(5) + ", " + rs.getInteger(6) + "\n";

		// calculate lat lon
		var gridref = {
			easting : reasting,
			northing : rnorthing
		};
		var WGS84_LatLon = TRANSFORMCOORDS.CoordTransform
				.convertOSGB36toWGS84(TRANSFORMCOORDS.OsGridRef
						.osGridToLatLong(gridref));
		var s1 = WGS84_LatLon.lat();
		var s2 = WGS84_LatLon.lon();

		// update lat lon on rs record --------------------------
		var qupdate = 'UPDATE \"ROAD".\"roadsafety.data::Road.Acc\"';
		var qset = ' SET \"LATITUDE\" = ?, \"LONGITUDE\" = ?';
		var qwhere = ' WHERE \"ACCYEAR\" = ? AND \"ACCREF\" = ?';
		var queryUpdate = qupdate + qset + qwhere;

		var platitude = s1; // 12.48414164;
		var plongitude = s2; // -13.16402169;
		var paccyear = raccyear; // copy rs param // 2010
		var paccref = raccref; // '01BS70003';

		var connUpdate = $.db.getConnection();
		var cstmtUpdate = connUpdate.prepareCall(queryUpdate);

		cstmtUpdate.setDecimal(1, platitude);
		cstmtUpdate.setDecimal(2, plongitude);
		cstmtUpdate.setInteger(3, paccyear);
		cstmtUpdate.setString(4, paccref);

		// Update this one rs record
		cstmtUpdate.execute();
		connUpdate.commit();
		connUpdate.close();
		// -------------------------------------------------------
	}

	// Clean up
	connSelect.close();
}

function updateAccTableBulk() {

	// build selection query string
	var query = prepareQuery();

	// main processing
	mainUpdate(query);

	// write out log
	body += '\nDone.';
	$.response.setBody(body);
	$.response.contentType = "text/plain";
	$.response.status = $.net.http.OK;
}

// Entry point
updateAccTableBulk();

var conn = $.db.getConnection();
var pstmt = conn.prepareStatement("select * from DUMMY");
var rs = pstmt.executeQuery();

$.response.contentType = "text/plain";

if (!rs.next()) {
	$.response.setBody("Failed to retreive data");
	$.response.status = $.net.http.INTERNAL_SERVER_ERROR;
} else {
	$.response.setBody("Response: " + rs.getString(1));
}

rs.close();
pstmt.close();
conn.close();
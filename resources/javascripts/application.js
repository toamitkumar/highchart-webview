var columnChartJSON = "{\"series\": [{\"name\": \"Brand Portfolio\",\"type\": \"column\",\"data\": [{\"y\": 22.2},{\"y\": 18},{\"y\": 18.5}]}],\"categories\": [\"Brand alpha\",\"Brand beta\",\"Brand gamma\"]}";

$(document).ready(function() {
  console.log(columnChartJSON);
  
});

function showAlert(arg) {
	alert(arg);
}

function loadColumnChart(json) {
	var chartConfig = $.parseJSON(columnChartJSON);


  $("#container").columnChart(chartConfig);
}

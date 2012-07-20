var columnChartJSON = "{'series': ['name': 'Brand alpha','type': 'column','data': [{'y': 22.2},{'y': 18},{'y': 18.5}]}";

$(document).ready(function() {
  console.log(columnChartJSON);
  var chartConfig = $.parseJSON(columnChartJSON);


  $("#container").columnChart(chartConfig);
});
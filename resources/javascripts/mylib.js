$.fn.waterfallChart = function(options) {
  var element = $(this),
    chartOptions = {},
    barCount = options.series.data.length,
    data = options.series.data,
    seriesOptions = [];

  seriesOptions.push({
    type: 'column',
    cursor: 'pointer',
    point: {
      events: {
        click: function(e) {
          if('Total' != this.category){
            var y = e.pageY - 220;
            var x = e.pageX
            context_menu(options.url, this.cat_id, this.level, this.has_children, x, y);
          }
        }
      }
    },
    name: options.series.name,
      borderColor: 'white',
    data: options.series.data,
      groupPadding: 0,
      pointPadding: .1,
      borderRadius: 3,
      color: {linearGradient: [0, 0, 0, 150], stops: [[0, '#1cc5f0'], [1, '#12a2e9']]}
  });

  // loop through all except the last one - last one is Total
  // for (var i=0; i < barCount-1; i++) {
		// seriesOptions.push($.lineConnector([[i+0.38, data[i].y], [i+0.62, data[i].y]]));
  // }
  chartOptions = {
    chart: {
      renderTo: element.attr("id"),
      marginLeft: 110
    },
    title: {
      text: '',
      align: 'left',
      style: {font: 'normal 12px verdana, sans-serif', border: '1px solid #dcdcdc'}
    },
    legend: {enabled: false},
    tooltip: {enabled: false},
    credits: {enabled: false},
    yAxis: {
      title: {text: null},
      min: 0,
      max: options.ymax,
      gridLineColor: '#fff',
      labels: {enabled: false}
    },
    xAxis: {
      categories: options.categories,
      lineWidth: 2,
      lineColor: 'black',
      labels: {
        rotation: -45,
        align: 'right',
        style: {font: 'normal 12px verdana, sans-serif'}
      }
    },
    plotOptions: {
      series: {
        events: {
          legendItemClick: function() { return false;}
        }
      },
      column: {
        dataLabels: {
          enabled: true,
          y: -2,
          style: {fontSize: '1em'},
          formatter: function(){
            var labelVal = this.point.disp_value;
            if('root' == this.point.cat_id){
              return labelVal;
            }
            return '<a id="node_' + this.point.cat_id + '" href="javascript:datalabel_click(\'' +
              options.url + '\',' + this.point.cat_id +
              ', ' + this.point.level + ', ' + this.point.x +
              ', ' + this.point.y + ',' + options.ymax + ', ' + this.point.has_children + ')">'+labelVal+'</a>';
          }
        }
      },
      allowPointSelect: true
    },
    series: seriesOptions
  }
  chart = new Highcharts.Chart(chartOptions, function(chart) {
		$.each(chart.series[0].data, function(i, point) {
			chart.renderer.rect(
				point.plotX + chart.plotLeft - point.barW/2,
				point.plotY + chart.plotTop - 35,
				point.barW,
				20,
				5
			)
			.attr({zIndex: 5, fill: 'skyblue', 'stroke-width': '1'})
			.add();
			
			chart.renderer.text(
				"123.4", point.plotX + chart.plotLeft - 16, 
				point.plotY + chart.plotTop - 20.5
			)
			.attr({zIndex: 6})
			.add();
		});
	});
	return chart;
};
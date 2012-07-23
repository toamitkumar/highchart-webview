$.fn.columnChart = function(chartConfig) {
    return $.hh.initChart(this, chartConfig,
    function(chartConfig) {
        var element = $(this);
        var width = element.css("width").substring(0, 3);
        var theme = $.columnChartTheme(chartConfig);
        var chartOptions = theme.defaults;
        var plotLinesOptions = [];
        var seriesOptions = [];
        var dataLablesEnabled = chartConfig.series[0].data.length <= 12;
        var seriesColors = $.hh.seriesColorsFor(theme, chartConfig.series.length);
        $.each(chartConfig.series,
        function(i, v) {
            seriesOptions.push({
                type: chartConfig.series[i].type,
                cursor: 'default',
                borderColor: seriesColors.borders[i],
                name: chartConfig.series[i].name,
                data: chartConfig.series[i].data,
                color: seriesColors.fills[i],
                states: {
                    hover: {
                        enabled: true,
                        brightness: 0.1
                    }
                }
            });
        });
        plotLinesOptions.push({
            color: 'grey',
            width: 1,
            value: 0,
            label: {
                text: '',
                align: 'left',
                style: {
                    color: 'Gray'
                },
                x: -10,
                y: 5
            },
            zIndex: 5
        });
        jQuery.extend(true, chartOptions, {
            chart: {
                renderTo: element.attr("id"),
                marginTop: 35,
                spacingBottom: 30
            },
            tooltip: {},
            xAxis: {
                categories: chartConfig.categories
            },
            // yAxis: {
            //     plotLines: $.hh.benchmarkPlotLines(
            //         chartConfig.plot_lines.avg.value, 
            //         chartConfig.plot_lines.target.value, 
            //         chartConfig.plot_lines.tq_avg.value,
            //         plotLinesOptions, 
            //         theme.benchmarkColors
            //     )
            // },
            plotOptions: {
                column: {
                    pointWidth: $.hh.columnWidth(theme.maxColumnWidth, element.width(), chartConfig.categories.length),
                    stacking: null,
                    dataLabels: {
                        enabled: dataLablesEnabled,
                        color: $.chartDefaults.black,
                        align: 'center',
                        formatter: function() {
                            return $.hh.nf(this.y, chartConfig.metric_unit);
                        }
                    }
                }
            },
            legend: {
                enabled: false
            },
            series: seriesOptions,
            labels: {
                items: $.hh.benchmarkLabelItems(
                // chartConfig.plot_lines.avg.value,
                // chartConfig.plot_lines.target.value,
                // chartConfig.plot_lines.tq_avg.value,
                // chartConfig.series[0].metric_unit
                ),
                style: {
                    color: theme.labelColor
                }
            }
        });
        $.hh.addYaxisExtremes(chartOptions);

        return new Highcharts.Chart(chartOptions,
        function(chart) {

            // on complete
           /* $.hh.plugins.annotations(chart, {
                url: $("#" + chart.options.chart.renderTo).attr('data-annotations-url')
            });*/
            $.hh.togglePlotLines(chart, [
            // chartConfig.plot_lines.avg.value,
            // chartConfig.plot_lines.target.value,
            // chartConfig.plot_lines.tq_avg.value
            ], theme.benchmarkColors, true);
        });
    });
};
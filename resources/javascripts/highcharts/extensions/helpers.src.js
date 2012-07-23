$.highchartsHelper = {
    activeCharts: {},
    plugins: {},
    initChart: function(that, chartConfig, callback) {
        // if (chartConfig.chart.status.errors.length > 0) {
        //     $.hh.disableChart(that, chartConfig);
        // } else {
            callback.call(that, chartConfig);
        // }
    },

    loadChart: function(e, onSuccess, onFailure) {
        var chartType = $(e).attr('data-chart');
        var chartConfig = $.hh.getChartConfig($(e));
        if (chartConfig === null) {
            if (onFailure) {
                onFailure(e);
            }
        } else {
            if (onSuccess) {
                onSuccess(chartConfig);
            }
        }
    },

    disableChart: function(element, chartConfig) {
        var chartOptions = $.defaultTheme(chartConfig).defaults;
        delete chartOptions.series;
        chartOptions.chart.renderTo = element.attr("id");
        $('a[rel=' + element.attr("data-target") + ']').hide();
        $('.actionBar[rel=' + element.attr("data-target") + ']').hide();
        return new Highcharts.Chart(chartOptions,
        function(chart) {
            var fontSize = 20;
            var text;
            var yOffset = (chart.chartHeight - ((chartOptions.chart.status.errors.length * fontSize) * 1.5)) / 2;
            var xOffset = chart.chartWidth / 2;
            var leading = (fontSize * 1.5);
            $.each(chartOptions.chart.status.errors,
            function(i, error) {
                text = chart.renderer.text(error.message, 0, (i * leading) + yOffset).css({
                    fontSize: fontSize + "px",
                    color: $.chartDefaults.black
                }).add();
                var textWidth = text.getBBox().width;
                text.destroy();
                text = chart.renderer.text(error.message, xOffset - textWidth / 2, (i * leading) + yOffset).css({
                    fontSize: fontSize + "px",
                    color: $.chartDefaults.black
                }).add().toFront();
            });
        });
    },

    getChartConfig: function(element) {
        var parent = element.attr('data-parent');
        var config;
        if (typeof(parent) !== 'undefined') {
            element = $("#" + parent);
        }
        config = element.attr('data-chart-config');
        if (typeof(config) !== "undefined") {
            return $.parseJSON(config);
        } else {
            return null;
        }
    },

    addCommas: function(nStr) {
        nStr += '';
        x = nStr.split('.');
        x1 = x[0];
        x2 = x.length > 1 ? '.' + x[1] : '';
        var rgx = /(\d+)(\d{3})/;
        while (rgx.test(x1)) {
            x1 = x1.replace(rgx, '$1' + ',' + '$2');
        }
        return x1 + x2;
    },

    minMaxForArray: function(method, arr) {
        var num = arr[0];
        var len = arr.length;
        for (var x = 1; x < len; x++) {
            num = Math[method](parseFloat(arr[x], 10.0), num);
        }
        return num;
    },

    minMaxForSeriesAttribute: function(chartSeries, attr) {
        var mins = [];
        var maxes = [];
        $.each(chartSeries,
        function(i, series) {
            mins.push($.hh.minForAttribute(series.data, attr));
            maxes.push($.hh.maxForAttribute(series.data, attr));
        });
        return {
            min: $.hh.minMaxForArray('min', mins),
            max: $.hh.minMaxForArray('max', maxes)
        };
    },

    minMaxForAttribute: function(method, arr, attr) {
        var len = arr.length;
        var num = arr[0][attr];
        for (var x = 1; x < len; x++) {
            if (typeof(arr[x][attr]) === "undefined") {
                throw new Error("Attribute '" + attr + "' not found in object");
            }
            else if(arr[x][attr] === null) {
            }
            else{
            num = Math[method](parseFloat(arr[x][attr], 10.0), num);}
        }
        return num;
    },

    minForAttribute: function(arr, attr) {
        return $.highchartsHelper.minMaxForAttribute('min', arr, attr);
    },

    maxForAttribute: function(arr, attr) {
        return $.highchartsHelper.minMaxForAttribute('max', arr, attr);
    },

    columnWidth: function(maxWidth, elementWidth, count){
        return Math.min(maxWidth, ((elementWidth / count) - 11));
    },

    addYaxisExtremes: function(chartOptions, options) {
        var tmpMax = 0;
        var stackType = "none";
        var opts;
        if (chartOptions.series[0].type === 'column') {
            stackType = (chartOptions.plotOptions.column.stacking === null) ? 'none': chartOptions.plotOptions.column.stacking;
        }
        $(chartOptions.series).each(function(i, s) {
            switch (stackType) {
            case "none":
                tmpMax = Math.max(tmpMax, $.hh.maxForAttribute(s.data, 'y'));
                break;
            case "normal":
                tmpMax += $.hh.maxForAttribute(s.data, 'y');
                break;
            case "percent":
                tmpMax = null;
                break;
            }
        });
        var mu = chartOptions.metric_unit;
        opts = {
            tickColor: $.chartDefaults.black,
            //tickInterval: tmpMax,
            max: tmpMax,

            // Only show the top axis when displaying more than 12 columns
            showLastLabel: (chartOptions.series[0].data.length > 12),
            labels: {
                formatter: function() {
                    return $.hh.nf(this.value, mu);
                },
                enabled: true
            }
        };
        jQuery.extend(true, opts, options);
        jQuery.extend(true, chartOptions, {
            yAxis: opts
        });
    },

    addDrillDowns: function(chart) {
        $.each(chart.series,
        function(i, series) {
            $.each(series.data,
            function(i, point) {
                if (typeof(point.url) !== 'undefined') {
                    var style = point.pointAttr.hover;
                    var iconWidth = 10;
                    var iconHeight = 7;
                    var boxSize = Math.min(point.barW, point.barH);
                    if(series.type == 'column'){
                        var rect = chart.renderer.rect(
                        point.barX + (point.barW / 2) + (chart.plotLeft - style['stroke-width']),
                        point.barY + (point.barH / 2) - (boxSize / 4),
                        point.barW / 2,
                        boxSize / 2,
                        3).attr({
                            'zIndex': 50
                        }).on('click',
                        function() {
                            window.location.href = point.url;
                        }).css({
                            'cursor': 'pointer'
                        }).add();
                        var img = chart.renderer.image(
                        p360HostUrlRoot['hostUrl'] + '/assets/reply.png',
                        point.barX + (point.barW / 2) + (chart.plotLeft - style['stroke-width']) + (point.barW / 4) - iconWidth / 2,
                        point.barY + (point.barH / 2) + iconHeight,
                        iconWidth,
                        iconHeight
                        ).attr({
                            'zIndex': 50
                        }).on('click',
                        function() {
                            window.location.href = point.url;
                        }).css({
                            'opacity': 0.3,
                            'cursor': 'pointer'
                        }).add();
                    }else if(series.type == 'bar'){
                        var rect = chart.renderer.rect(
                        (point.barX + point.barW + (chart.plotLeft - style['stroke-width'])) * 2,
                        point.barY - iconHeight,
                        point.barW / 2,
                        boxSize / 2,
                        3).attr({
                            'zIndex': 50
                        }).on('click',
                        function() {
                            window.location.href = point.url;
                        }).css({
                            'cursor': 'pointer'
                        }).add();
                        var img = chart.renderer.image(
                        p360HostUrlRoot['hostUrl'] + '/assets/reply.png',
                        (point.barX + point.barW + (chart.plotLeft - style['stroke-width'])) * 2,
                        point.barY - iconHeight,
                        iconWidth,
                        iconHeight
                        ).attr({
                            'zIndex': 50
                        }).on('click',
                        function() {
                            window.location.href = point.url;
                        }).css({
                            'opacity': 0.3,
                            'cursor': 'pointer'
                        }).add();
                    }
                }
            });
        });
    },

    colorFromCodeStatus: function(status) {
        switch ((status || '').toLowerCase()) {
        case "abovetarget":
            return "#7EC046";
        case "lesstarget":
            return "#DD2A23";
        case "ontarget":
            return "#9d9d9d";
        case "notarget":
        default:
            return "#4379A7";
        }
    },
    seriesColorsFor: function(theme, stops) {
        return {
            fills: $.hh.plugins.gradientFactory.generate({
                from: theme.seriesColors[0],
                to: theme.seriesColors[theme.seriesColors.length - 1],
                stops: stops
            }),
            borders: $.hh.plugins.gradientFactory.generate({
                from: theme.seriesBorderColors[0],
                to: theme.seriesBorderColors[theme.seriesBorderColors.length - 1],
                stops: stops
            })
        };
    },

    numericalFormatter: function(value, unit_type) {
        var str = value;
        switch (unit_type) {
        case "currency":
            str = $.hh.currencyFormatter(value);
            break;
        case "currency_per_fte":
            str = $.hh.currencyPerFTEFormatter(value);
            break;
        case "percentage":
        case "number_per_fte":
        case "number_per_x_fte":
        case "area":
            str = $.hh.addCommas((Math.round(value * 10) / 10).toFixed(1));
            break;
        }
        return str.toString();
    },

    nf: function(v, u) {
        return $.hh.numericalFormatter(v, u);
    },

    currencyFormatter: function(value) {
        value = $.hh.roundToDecimal(value, 1);
        var str = value + '';
        switch (true) {
        case(Math.abs(value) < 10000) :
            str = ($.hh.addCommas(value.toFixed(1)));
            break;
        case (Math.abs(value) < 1000000) :
            str = (value / 100000).toFixed(1) + "L";
            break;
        case (Math.abs(value) < 10000000) :
            str = (value / 100000).toFixed(2) + "L";
            break;
        case (Math.abs(value) < 100000000) :
            str = (value / 10000000).toFixed(2) + "Cr";
            break;
        case (Math.abs(value) < 1000000000) :
            str = (value / 10000000).toFixed(2) + "Cr";
            break;
        }
        return str;
    },

    currencyPerFTEFormatter: function(value) {
        value = $.hh.roundToDecimal(value, 1);
        var str = value + "";
        switch (true) {
        case(Math.abs(value) < 10000) :
            str = $.hh.addCommas(value.toFixed(1));
            break;
        case (Math.abs(value) < 100000) :
            str = $.hh.addCommas(value);
            break;
        case (Math.abs(value) < 1000000) :
            str = (value / 100000).toFixed(2) + "L";
            break;
        case (Math.abs(value) < 10000000) :
            str = (value / 100000).toFixed(2) + "L";
            break;
        case (Math.abs(value) < 100000000) :
            str = (value / 10000000).toFixed(2) + "Cr";
            break;
        case (Math.abs(value) < 10000000000) :
            str = (value / 10000000).toFixed(0) + "Cr";
            break;
        }
        return str;
    },

    roundToDecimal: function(value, d) {
        return Math.round(value * (10 * d)) / (10 * d);
    },

    wrapText: function(text, length) {
        var len = Math.abs(length) || 16;
        var rows = [[]];
        var i = 0;
        if(typeof(text) !== "undefined"){
          $.each(text.split(' '),
          function(n, w) {
              if (rows[i].join(' ').length >= len) {
                  i++;
                  rows[i] = [];
              }
              rows[i].push(w);
          });
          $.each(rows,
          function(i, row) {
              rows[i] = row.join(' ');
          });
        }
        return rows;
    },

    lineConnector: function(lineData) {
        var theme = $.waterfallChartTheme();
        var lineConnectorOptions = {
            type: 'line',
            data: [],
            color: theme.colors[3],
            dashStyle: 'dash',
            marker: {
                enabled: false
            },
            lineWidth: 0.5,
            shadow: false,
            enableMouseTracking: false
        };
        return $.extend(lineConnectorOptions, {
            data: lineData
        });
    },

    // FIXME: This method will not work on IE7 because highcharts will use a different rendering engine one that doesn't produce
    // image tags.
    togglePlotLines: function(chart, values, colors, drawDefaultPlotLines) {
        var line = [];
        var xOff = 10;
        var padding = 75;
        if (drawDefaultPlotLines) {
            $.each(['average', 'target', 'averagetq'],
            function(i, img) {
                if (typeof(values[i]) !== 'undefined' && values[i] !== 0 && values[i] !== null) {
                    chart.renderer.image(p360HostUrlRoot['hostUrl'] + '/assets/' + img + '.png', xOff, 2, 16, 18).add();
                    line.push(xOff < 160);
                }
                xOff += padding;
            });
        }

        $.each(values,
        function(i, v) {
            if (typeof(v) === 'undefined' || v === 0) {
                values.splice(i, 1);
                colors.splice(i, 1);
            }
        });
        $(chart.container).find("image").click(function() {
            var indx = $(chart.container).find("image").index($(this));
            if (!line[indx]) {
                chart.yAxis[0].addPlotLine({
                    value: values[indx],
                    color: colors[indx],
                    width: 2,
                    zIndex: 5,
                    id: ('plot-line-' + indx)
                });
                line[indx] = true;
            } else {
                chart.yAxis[0].removePlotLine('plot-line-' + indx);
                line[indx] = false;
            }
        });
    },

    benchmarkLabelItems: function(avg, target, tq_avg, unit, chart) {
        chart = chart || null;
        var labelItems = [];
        var xOff = 20;
        var padding = 75;
        $.each([avg, target, tq_avg],
        function(i, e) {
            if (typeof(e) !== 'undefined' && e !== 0 && e !== null) {
                labelItems.push({
                    html: $.hh.nf(e, unit),
                    style: {
                        left: xOff + 'px',
                        top: (chart == null)? "-33px": "-9px",
                        color: $.chartDefaults.black
                    }
                });
            }
            xOff += padding;
        });
        return labelItems;
    },

    benchmarkPlotLines: function(avg, target, tq_avg, plotLinesOptions, colors) {
        var idx = 0;
        $.each([avg, target, tq_avg],
        function(i, v) {
            if (v !== 0) {
                plotLinesOptions.push({
                    color: colors[i],
                    width: 2,
                    value: v,
                    zIndex: 5,
                    id: ('plot-line-' + idx)
                });
                idx += 1;
            }

        });
        return plotLinesOptions;
    }
};
$.hh = $.highchartsHelper;

$.hh.plugins.gradientFactory = (function() {
    var _beginColor = {
        red: 0,
        green: 0,
        blue: 0
    };
    var _endColor = {
        red: 255,
        green: 255,
        blue: 255
    };
    var _colorStops = 24;
    var _colors = [];
    var _colorKeys = ['red', 'green', 'blue'];
    var _rgbToHex = function(r, g, b) {
        return '#' + _byteToHex(r) + _byteToHex(g) + _byteToHex(b);
    };
    var _byteToHex = function(n) {
        var hexVals = "0123456789ABCDEF";
        return String(hexVals.substr((n >> 4) & 0x0F, 1)) + hexVals.substr(n & 0x0F, 1);
    };
    var _parseColor = function(color) {
        if ((color).toString() === "[object Object]") {
            return color;
        } else {
            color = (color.charAt(0) == "#") ? color.substring(1, 7) : color;
            return {
                red: parseInt((color).substring(0, 2), 16),
                green: parseInt((color).substring(2, 4), 16),
                blue: parseInt((color).substring(4, 6), 16)
            };
        }
    };
    var _generate = function(opts) {
        var _colors = [];
        var options = opts || {};
        var diff = {
            red: 0,
            green: 0,
            blue: 0
        };
        var len = _colorKeys.length;
        var pOffset = 0;
        if (typeof(options.from) !== 'undefined') {
            _beginColor = _parseColor(options.from);
        }
        if (typeof(options.to) !== 'undefined') {
            _endColor = _parseColor(options.to);
        }
        if (typeof(options.stops) !== 'undefined') {
            _colorStops = options.stops;
        }
        _colorStops = Math.max(1, _colorStops - 1);
        for (var x = 0; x < _colorStops; x++) {
            pOffset = parseFloat(x, 10) / _colorStops;
            for (var y = 0; y < len; y++) {
                diff[_colorKeys[y]] = _endColor[_colorKeys[y]] - _beginColor[_colorKeys[y]];
                diff[_colorKeys[y]] = (diff[_colorKeys[y]] * pOffset) + _beginColor[_colorKeys[y]];
            }
            _colors.push(_rgbToHex(diff.red, diff.green, diff.blue));
        }
        _colors.push(_rgbToHex(_endColor.red, _endColor.green, _endColor.blue));
        return _colors;
    };
    return {
        generate: _generate
    };
}).call(this);
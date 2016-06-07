(function ($) {
    // plugin options, default values
    var defaultOptions = {
        tooltip: {
            show: false,
            cssClass: "flotTip",
            content: "%s | X: %x | Y: %y",
            // allowed templates are:
            // %s -> series label,
            // %c -> series color,
            // %lx -> x axis label (requires flot-axislabels plugin https://github.com/markrcote/flot-axislabels),
            // %ly -> y axis label (requires flot-axislabels plugin https://github.com/markrcote/flot-axislabels),
            // %x -> X value,
            // %y -> Y value,
            // %x.2 -> precision of X value,
            // %p -> percent
            xDateFormat: null,
            yDateFormat: null,
            monthNames: null,
            dayNames: null,
            shifts: {
                x: 10,
                y: 20
            },
            defaultTheme: true,
            lines: false,

            // callbacks
            onHover: function (flotOrder, $tooltipEl) {},

            $compat: false
        }
    };

    // dummy default options object for legacy code (<0.8.5) - is deleted later
    defaultOptions.tooltipOpts = defaultOptions.tooltip;

    // object
    var FlotTooltip = function (plot) {
        // variables
        this.tipPosition = {x: 0, y: 0};

        this.init(plot);
    };

    // main plugin function
    FlotTooltip.prototype.init = function (plot) {
        var that = this;

        // detect other flot plugins
        var plotPluginsLength = $.plot.plugins.length;
        this.plotPlugins = [];

        if (plotPluginsLength) {
            for (var p = 0; p < plotPluginsLength; p++) {
                this.plotPlugins.push($.plot.plugins[p].name);
            }
        }

        plot.hooks.bindEvents.push(function (plot, eventHolder) {

            // get plot options
            that.plotOptions = plot.getOptions();

            // for legacy (<0.8.5) implementations
            if (typeof(that.plotOptions.tooltip) === 'boolean') {
                that.plotOptions.tooltipOpts.show = that.plotOptions.tooltip;
                that.plotOptions.tooltip = that.plotOptions.tooltipOpts;
                delete that.plotOptions.tooltipOpts;
            }

            // if not enabled return
            if (that.plotOptions.tooltip.show === false || typeof that.plotOptions.tooltip.show === 'undefined') return;

            // shortcut to access tooltip options
            that.tooltipOptions = that.plotOptions.tooltip;

            if (that.tooltipOptions.$compat) {
                that.wfunc = 'width';
                that.hfunc = 'height';
            } else {
                that.wfunc = 'innerWidth';
                that.hfunc = 'innerHeight';
            }

            // create tooltip DOM element
            var $tip = that.getDomElement();

            // bind event
            $( plot.getPlaceholder() ).bind("plothover", plothover);

            $(eventHolder).bind('mousemove', mouseMove);
        });

        plot.hooks.shutdown.push(function (plot, eventHolder){
            $(plot.getPlaceholder()).unbind("plothover", plothover);
            $(eventHolder).unbind("mousemove", mouseMove);
        });

        function mouseMove(e){
            var pos = {};
            pos.x = e.pageX;
            pos.y = e.pageY;
            plot.setTooltipPosition(pos);
        }

        function plothover(event, pos, order) {
            // Simple distance formula.
            var lineDistance = function (p1x, p1y, p2x, p2y) {
                return Math.sqrt((p2x - p1x) * (p2x - p1x) + (p2y - p1y) * (p2y - p1y));
            };

            // Here is some voodoo magic for determining the distance to a line form a given point {x, y}.
            var dotLineLength = function (x, y, x0, y0, x1, y1, o) {
                if (o && !(o =
                    function (x, y, x0, y0, x1, y1) {
                        if (typeof x0 !== 'undefined') return { x: x0, y: y };
                        else if (typeof y0 !== 'undefined') return { x: x, y: y0 };

                        var left,
                            tg = -1 / ((y1 - y0) / (x1 - x0));

                        return {
                            x: left = (x1 * (x * tg - y + y0) + x0 * (x * -tg + y - y1)) / (tg * (x1 - x0) + y0 - y1),
                            y: tg * left - tg * x + y
                        };
                    } (x, y, x0, y0, x1, y1),
                    o.x >= Math.min(x0, x1) && o.x <= Math.max(x0, x1) && o.y >= Math.min(y0, y1) && o.y <= Math.max(y0, y1))
                ) {
                    var l1 = lineDistance(x, y, x0, y0), l2 = lineDistance(x, y, x1, y1);
                    return l1 > l2 ? l2 : l1;
                } else {
                    var a = y0 - y1, b = x1 - x0, c = x0 * y1 - y0 * x1;
                    return Math.abs(a * x + b * y + c) / Math.sqrt(a * a + b * b);
                }
            };

            if (order) {
                plot.showTooltip(order, pos);
            } else if (that.plotOptions.series.lines.show && that.tooltipOptions.lines === true) {
                var maxDistance = that.plotOptions.grid.mouseActiveRadius;

                var closestTrace = {
                    distance: maxDistance + 1
                };

                $.each(plot.getData(), function (i, series) {
                    var xBeforeIndex = 0,
                        xAfterIndex = -1;

                    // Our search here assumes our data is sorted via the x-axis.
                    // TODO: Improve efficiency somehow - search smaller sets of data.
                    for (var j = 1; j < series.data.length; j++) {
                        if (series.data[j - 1][0] <= pos.x && series.data[j][0] >= pos.x) {
                            xBeforeIndex = j - 1;
                            xAfterIndex = j;
                        }
                    }

                    if (xAfterIndex === -1) {
                        plot.hideTooltip();
                        return;
                    }

                    var pointPrev = { x: series.data[xBeforeIndex][0], y: series.data[xBeforeIndex][1] },
                        pointNext = { x: series.data[xAfterIndex][0], y: series.data[xAfterIndex][1] };

                    var distToLine = dotLineLength(series.xaxis.p2c(pos.x), series.yaxis.p2c(pos.y), series.xaxis.p2c(pointPrev.x),
                        series.yaxis.p2c(pointPrev.y), series.xaxis.p2c(pointNext.x), series.yaxis.p2c(pointNext.y), false);

                    if (distToLine < closestTrace.distance) {

                        var closestIndex = lineDistance(pointPrev.x, pointPrev.y, pos.x, pos.y) <
                            lineDistance(pos.x, pos.y, pointNext.x, pointNext.y) ? xBeforeIndex : xAfterIndex;

                        var pointSize = series.datapoints.pointsize;

                        // Calculate the point on the line vertically closest to our cursor.
                        var pointOnLine = [
                            pos.x,
                            pointPrev.y + ((pointNext.y - pointPrev.y) * ((pos.x - pointPrev.x) / (pointNext.x - pointPrev.x)))
                        ];

                        var order = {
                            datapoint: pointOnLine,
                            dataIndex: closestIndex,
                            series: series,
                            seriesIndex: i
                        };

                        closestTrace = {
                            distance: distToLine,
                            order: order
                        };
                    }
                });

                if (closestTrace.distance < maxDistance + 1)
                    plot.showTooltip(closestTrace.order, pos);
                else
                    plot.hideTooltip();
            } else {
                plot.hideTooltip();
            }
        }

        // Quick little function for setting the tooltip position.
        plot.setTooltipPosition = function (pos) {
            var $tip = that.getDomElement();

            var totalTipWidth = $tip.outerWidth() + that.tooltipOptions.shifts.x;
            var totalTipHeight = $tip.outerHeight() + that.tooltipOptions.shifts.y;
            if ((pos.x - $(window).scrollLeft()) > ($(window)[that.wfunc]() - totalTipWidth)) {
                pos.x -= totalTipWidth;
            }
            if ((pos.y - $(window).scrollTop()) > ($(window)[that.hfunc]() - totalTipHeight)) {
                pos.y -= totalTipHeight;
            }
            that.tipPosition.x = pos.x;
            that.tipPosition.y = pos.y;
        };

        // Quick little function for showing the tooltip.
        plot.showTooltip = function (target, position) {
            var $tip = that.getDomElement();

            // convert tooltip content template to real tipText
            var tipText = that.stringFormat(that.tooltipOptions.content, target);
            if (tipText === '')
            	return;

            $tip.html(tipText);
            plot.setTooltipPosition({ x: position.pageX, y: position.pageY });
            $tip.css({
                left: that.tipPosition.x + that.tooltipOptions.shifts.x,
                top: that.tipPosition.y + that.tooltipOptions.shifts.y
            }).show();

            // run callback
            if (typeof that.tooltipOptions.onHover === 'function') {
                that.tooltipOptions.onHover(target, $tip);
            }
        };

        // Quick little function for hiding the tooltip.
        plot.hideTooltip = function () {
            that.getDomElement().hide().html('');
        };
    };

    /**
     * get or create tooltip DOM element
     * @return jQuery object
     */
    FlotTooltip.prototype.getDomElement = function () {
        var $tip = $('.' + this.tooltipOptions.cssClass);

        if( $tip.length === 0 ){
            $tip = $('<div />').addClass(this.tooltipOptions.cssClass);
            $tip.appendTo('body').hide().css({position: 'absolute'});

            if(this.tooltipOptions.defaultTheme) {
                $tip.css({
                    'background': '#fff',
                    'z-index': '1040',
                    'padding': '0.4em 0.6em',
                    'border-radius': '0.5em',
                    'font-size': '0.8em',
                    'border': '1px solid #111',
                    'display': 'none',
                    'white-space': 'nowrap'
                });
            }
        }

        return $tip;
    };

    /**
     * core function, create tooltip content
     * @param  {string} content - template with tooltip content
     * @param  {object} order - Flot order
     * @return {string} real tooltip content for current order
     */
    FlotTooltip.prototype.stringFormat = function (content, order) {

        var percentPattern = /%p\.{0,1}(\d{0,})/;
        var seriesPattern = /%s/;
        var colorPattern = /%c/;
        var xLabelPattern = /%lx/; // requires flot-axislabels plugin https://github.com/markrcote/flot-axislabels, will be ignored if plugin isn't loaded
        var yLabelPattern = /%ly/; // requires flot-axislabels plugin https://github.com/markrcote/flot-axislabels, will be ignored if plugin isn't loaded
        var xPattern = /%x\.{0,1}(\d{0,})/;
        var yPattern = /%y\.{0,1}(\d{0,})/;
        var xPatternWithoutPrecision = "%x";
        var yPatternWithoutPrecision = "%y";
        var customTextPattern = "%ct";

        var x, y, customText, p;

        // for threshold plugin we need to read data from different place
        if (typeof order.series.threshold !== "undefined") {
            x = order.datapoint[0];
            y = order.datapoint[1];
            customText = order.datapoint[2];
        } else if (typeof order.series.lines !== "undefined" && order.series.lines.steps) {
            x = order.series.datapoints.points[order.dataIndex * 2];
            y = order.series.datapoints.points[order.dataIndex * 2 + 1];
            // TODO: where to find custom text in this variant?
            customText = "";
        } else {
            x = order.series.data[order.dataIndex][0];
            y = order.series.data[order.dataIndex][1];
            customText = order.series.data[order.dataIndex][2];
        }

        // I think this is only in case of threshold plugin
        if (order.series.label === null && order.series.originSeries) {
            order.series.label = order.series.originSeries.label;
        }

        // if it is a function callback get the content string
        if (typeof(content) === 'function') {
            content = content(order.series.label, x, y, order);
        }

        // the case where the passed content is equal to false
        if (typeof(content) === 'boolean' && !content) {
            return '';
        }

        // percent match for pie charts and stacked percent
        if (typeof (order.series.percent) !== 'undefined') {
            p = order.series.percent;
        } else if (typeof (order.series.percents) !== 'undefined') {
            p = order.series.percents[order.dataIndex];
        }        
        if (typeof p === 'number') {
            content = this.adjustValPrecision(percentPattern, content, p);
        }

        // series match
        if (typeof(order.series.label) !== 'undefined') {
            content = content.replace(seriesPattern, order.series.label);
        } else {
            //remove %s if label is undefined
            content = content.replace(seriesPattern, "");
        }
        
        // color match
        if (typeof(order.series.color) !== 'undefined') {
            content = content.replace(colorPattern, order.series.color);
        } else {
            //remove %s if color is undefined
            content = content.replace(colorPattern, "");
        }

        // x axis label match
        if (this.hasAxisLabel('xaxis', order)) {
            content = content.replace(xLabelPattern, order.series.xaxis.options.axisLabel);
        } else {
            //remove %lx if axis label is undefined or axislabels plugin not present
            content = content.replace(xLabelPattern, "");
        }

        // y axis label match
        if (this.hasAxisLabel('yaxis', order)) {
            content = content.replace(yLabelPattern, order.series.yaxis.options.axisLabel);
        } else {
            //remove %ly if axis label is undefined or axislabels plugin not present
            content = content.replace(yLabelPattern, "");
        }

        // time mode axes with custom dateFormat
        if (this.isTimeMode('xaxis', order) && this.isXDateFormat(order)) {
            content = content.replace(xPattern, this.timestampToDate(x, this.tooltipOptions.xDateFormat, order.series.xaxis.options));
        }
        if (this.isTimeMode('yaxis', order) && this.isYDateFormat(order)) {
            content = content.replace(yPattern, this.timestampToDate(y, this.tooltipOptions.yDateFormat, order.series.yaxis.options));
        }

        // set precision if defined
        if (typeof x === 'number') {
            content = this.adjustValPrecision(xPattern, content, x);
        }
        if (typeof y === 'number') {
            content = this.adjustValPrecision(yPattern, content, y);
        }

        // change x from number to given label, if given
        if (typeof order.series.xaxis.ticks !== 'undefined') {

            var ticks;
            if (this.hasRotatedXAxisTicks(order)) {
                // xaxis.ticks will be an empty array if tickRotor is being used, but the values are available in rotatedTicks
                ticks = 'rotatedTicks';
            } else {
                ticks = 'ticks';
            }

            // see https://github.com/krzysu/flot.tooltip/issues/65
            var tickIndex = order.dataIndex + order.seriesIndex;

            for (var index in order.series.xaxis[ticks]) {
                if (order.series.xaxis[ticks].hasOwnProperty(tickIndex) && !this.isTimeMode('xaxis', order)) {
                    var valueX = (this.isCategoriesMode('xaxis', order)) ? order.series.xaxis[ticks][tickIndex].label : order.series.xaxis[ticks][tickIndex].v;
                    if (valueX === x) {
                        content = content.replace(xPattern, order.series.xaxis[ticks][tickIndex].label);
                    }
                }
            }
        }

        // change y from number to given label, if given
        if (typeof order.series.yaxis.ticks !== 'undefined') {
            for (var index in order.series.yaxis.ticks) {
                if (order.series.yaxis.ticks.hasOwnProperty(index)) {
                    var valueY = (this.isCategoriesMode('yaxis', order)) ? order.series.yaxis.ticks[index].label : order.series.yaxis.ticks[index].v;
                    if (valueY === y) {
                        content = content.replace(yPattern, order.series.yaxis.ticks[index].label);
                    }
                }
            }
        }

        // if no value customization, use tickFormatter by default
        if (typeof order.series.xaxis.tickFormatter !== 'undefined') {
            //escape dollar
            content = content.replace(xPatternWithoutPrecision, order.series.xaxis.tickFormatter(x, order.series.xaxis).replace(/\$/g, '$$'));
        }
        if (typeof order.series.yaxis.tickFormatter !== 'undefined') {
            //escape dollar
            content = content.replace(yPatternWithoutPrecision, order.series.yaxis.tickFormatter(y, order.series.yaxis).replace(/\$/g, '$$'));
        }

        if (customText)
            content = content.replace(customTextPattern, customText);

        return content;
    };

    // helpers just for readability
    FlotTooltip.prototype.isTimeMode = function (axisName, order) {
        return (typeof order.series[axisName].options.mode !== 'undefined' && order.series[axisName].options.mode === 'time');
    };

    FlotTooltip.prototype.isXDateFormat = function (order) {
        return (typeof this.tooltipOptions.xDateFormat !== 'undefined' && this.tooltipOptions.xDateFormat !== null);
    };

    FlotTooltip.prototype.isYDateFormat = function (order) {
        return (typeof this.tooltipOptions.yDateFormat !== 'undefined' && this.tooltipOptions.yDateFormat !== null);
    };

    FlotTooltip.prototype.isCategoriesMode = function (axisName, order) {
        return (typeof order.series[axisName].options.mode !== 'undefined' && order.series[axisName].options.mode === 'categories');
    };

    //
    FlotTooltip.prototype.timestampToDate = function (tmst, dateFormat, options) {
        var theDate = $.plot.dateGenerator(tmst, options);
        return $.plot.formatDate(theDate, dateFormat, this.tooltipOptions.monthNames, this.tooltipOptions.dayNames);
    };

    //
    FlotTooltip.prototype.adjustValPrecision = function (pattern, content, value) {

        var precision;
        var matchResult = content.match(pattern);
        if( matchResult !== null ) {
            if(RegExp.$1 !== '') {
                precision = RegExp.$1;
                value = value.toFixed(precision);

                // only replace content if precision exists, in other case use thickformater
                content = content.replace(pattern, value);
            }
        }
        return content;
    };

    // other plugins detection below

    // check if flot-axislabels plugin (https://github.com/markrcote/flot-axislabels) is used and that an axis label is given
    FlotTooltip.prototype.hasAxisLabel = function (axisName, order) {
        return ($.inArray(this.plotPlugins, 'axisLabels') !== -1 && typeof order.series[axisName].options.axisLabel !== 'undefined' && order.series[axisName].options.axisLabel.length > 0);
    };

    // check whether flot-tickRotor, a plugin which allows rotation of X-axis ticks, is being used
    FlotTooltip.prototype.hasRotatedXAxisTicks = function (order) {
        return ($.inArray(this.plotPlugins, 'tickRotor') !== -1 && typeof order.series.xaxis.rotatedTicks !== 'undefined');
    };

    //
    var init = function (plot) {
      new FlotTooltip(plot);
    };

    // define Flot plugin
    $.plot.plugins.push({
        init: init,
        options: defaultOptions,
        name: 'tooltip',
        version: '0.8.5'
    });

})(jQuery);

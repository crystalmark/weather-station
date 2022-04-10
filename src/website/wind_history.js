am5.ready(function() {

    var root = am5.Root.new("chartdiv");
    root.setThemes([
      am5themes_Animated.new(root)
    ]);
    var chart = root.container.children.push(am5xy.XYChart.new(root, {
      panX: true,
      panY: true,
      wheelX: "panX",
      wheelY: "zoomX",
       maxTooltipDistance: 0
    }));
    var cursor = chart.set("cursor", am5xy.XYCursor.new(root, {
      behavior: "none"
    }));
    cursor.lineY.set("visible", false);
    var xAxis = chart.xAxes.push(am5xy.DateAxis.new(root, {
      maxDeviation: 0.2,
      baseInterval: {
        timeUnit: "minute",
        count: 1
      },
      renderer: am5xy.AxisRendererX.new(root, {}),
      tooltip: am5.Tooltip.new(root, {})
    }));

    var yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {})
    }));


    var windseries = chart.series.push(am5xy.SmoothedXLineSeries.new(root, {
      name: "Wind Speed",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "speed",
      valueXField: "date",
        tooltip: am5.Tooltip.new(root, {
          pointerOrientation: "vertical",
          dy: -20,
          labelText: "{valueY}"
        })
    }));

    windseries.bullets.push(function() {
      return am5.Bullet.new(root, {
        locationY: 0,
        sprite: am5.Circle.new(root, {
          radius: 2,
          stroke: root.interfaceColors.get("background"),
          strokeWidth: 1,
          fill: windseries.get("fill")
        })
      });
    });

    windseries.fills.template.setAll({
      visible: true,
      fillOpacity: 0.2,
    });

    var gustseries = chart.series.push(am5xy.SmoothedXLineSeries.new(root, {
      name: "Gusts",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "gust",
      valueXField: "date"
    }));

    gustseries.bullets.push(function() {
      return am5.Bullet.new(root, {
        locationY: 0,
        sprite: am5.Circle.new(root, {
          radius: 2,
          stroke: root.interfaceColors.get("background"),
          strokeWidth: 1,
          fill: windseries.get("fill")
        })
      });
    });

    var legend = chart.rightAxesContainer.children.push(am5.Legend.new(root, {
      width: 200,
      paddingLeft: 15,
      height: am5.percent(100)
    }));

    // When legend item container is hovered, dim all the series except the hovered one
    legend.itemContainers.template.events.on("pointerover", function(e) {
      var itemContainer = e.target;

      // As series list is data of a legend, dataContext is series
      var series = itemContainer.dataItem.dataContext;

      chart.series.each(function(chartSeries) {
        if (chartSeries != series) {
          chartSeries.strokes.template.setAll({
            strokeOpacity: 0.15,
            stroke: am5.color(0x000000)
          });
        } else {
          chartSeries.strokes.template.setAll({
            strokeWidth: 3
          });
        }
      })
    })

    // When legend item container is unhovered, make all series as they are
    legend.itemContainers.template.events.on("pointerout", function(e) {
      var itemContainer = e.target;
      var series = itemContainer.dataItem.dataContext;

      chart.series.each(function(chartSeries) {
        chartSeries.strokes.template.setAll({
          strokeOpacity: 1,
          strokeWidth: 1,
          stroke: chartSeries.get("fill")
        });
      });
    })

    legend.itemContainers.template.set("width", am5.p100);
    legend.valueLabels.template.setAll({
      width: am5.p100,
      textAlign: "right"
    });

    legend.data.setAll(chart.series.values);

    var roundTime = function(time) {
        var timeToReturn = new Date(time);

        timeToReturn.setMilliseconds(Math.round(timeToReturn.getMilliseconds() / 1000) * 1000);
        timeToReturn.setSeconds(Math.round(timeToReturn.getSeconds() / 60) * 60);
        timeToReturn.setMinutes(Math.round(timeToReturn.getMinutes() / 30) * 30);
        return timeToReturn.getTime();
    }

    var beaufort = [
                {name: "0", knots: 1},
                {name: "1", knots: 3},
                {name: "2", knots: 6},
                {name: "3", knots: 10},
                {name: "4", knots: 16},
                {name: "5", knots: 21},
                {name: "6", knots: 27},
                {name: "7", knots: 33},
                {name: "8", knots: 40},
                {name: "9", knots: 47},
                {name: "10", knots: 55},
                {name: "11", knots: 63},
                {name: "12", knots: 100}
            ]

    var clone = function(j) {
        return JSON.parse(JSON.stringify(j))
    }

    var getBeaufort = function(data){
        console.log(data.maxGust)
        var dates = new Set()
        data.data.map( sample => {
            dates.add( roundTime(sample.date) )
        })
        var levels = beaufort.filter( function(level){
                                        var f = level.knots < data.maxGust
                                        return f
                                        } )
        if ( levels.length < beaufort.length )
            levels.push(beaufort[levels.length])

        var beaufortdata = []
        dates.forEach( date => {
            var d = clone(levels)
            d.date = date
            beaufortdata.push(d)
        })
        console.log(beaufortdata)
        return beaufortdata;
    }

    chart.set("scrollbarX", am5.Scrollbar.new(root, {
      orientation: "horizontal"
    }));

    var updateData = function() {
        getData(function(err, data) {
          if (err !== null) {
            console.log('Something went wrong: ' + err);
          } else {
            gustseries.data.setAll(data.data);
            windseries.data.setAll(data.data);
    //        beaufortseries.data.setAll(getBeaufort(data))
            // getBeaufort(data)
          }
        });
    }

    getData(function(err, data) {
      if (err !== null) {
        console.log('Something went wrong: ' + err);
      } else {
        gustseries.data.setAll(data.data);
        windseries.data.setAll(data.data);
//        beaufortseries.data.setAll(getBeaufort(data))
        // getBeaufort(data)
        setInterval(updateData, 600000);
        windseries.appear(1000);
        gustseries.appear(1500);
        chart.appear(1000, 100);
      }
    });
}); // end am5.ready()
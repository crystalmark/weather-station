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
      renderer: am5xy.AxisRendererX.new(root, {})
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

    var legend = chart.rightAxesContainer.children.push(am5.Legend.new(root, {
      width: 200,
      paddingLeft: 15,
      height: am5.percent(100)
    }));

    var roundTime = function(time) {
        var timeToReturn = new Date(time);

        timeToReturn.setMilliseconds(Math.round(timeToReturn.getMilliseconds() / 1000) * 1000);
        timeToReturn.setSeconds(Math.round(timeToReturn.getSeconds() / 60) * 60);
        timeToReturn.setMinutes(Math.round(timeToReturn.getMinutes() / 30) * 30);
        return timeToReturn.getTime();
    }

    chart.set("scrollbarX", am5.Scrollbar.new(root, {
      orientation: "horizontal"
    }));

    getData(function(err, data) {
      if (err !== null) {
        console.log('Something went wrong: ' + err);
      } else {
        windseries.data.setAll(data.data);
        windseries.appear(1000);
        chart.appear(1000, 100);
      }
    });
}); // end am5.ready()
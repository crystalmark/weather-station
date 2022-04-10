am5.ready(function() {

// Create root element
// https://www.amcharts.com/docs/v5/getting-started/#Root_element
var root = am5.Root.new("chartdiv");

// Set themes
// https://www.amcharts.com/docs/v5/concepts/themes/
root.setThemes([
  am5themes_Animated.new(root)
]);

// Create chart
// https://www.amcharts.com/docs/v5/charts/radar-chart/
var chart = root.container.children.push(
  am5radar.RadarChart.new(root, {
    panX: false,
    panY: false,
    startAngle: -90,
    endAngle: 270
  })
);

// Create axis and its renderer
// https://www.amcharts.com/docs/v5/charts/radar-chart/gauge-charts/#Axes
var axisRenderer = am5radar.AxisRendererCircular.new(root, {
  strokeOpacity: 1,
  strokeWidth: 5,
  minGridDistance: 10
});
axisRenderer.ticks.template.setAll({
  forceHidden: true
});
axisRenderer.grid.template.setAll({
  forceHidden: true
});

axisRenderer.labels.template.setAll({ forceHidden: true });

var xAxis = chart.xAxes.push(
  am5xy.ValueAxis.new(root, {
    maxDeviation: 0,
    min: 0,
    max: 360,
    strictMinMax: true,
    renderer: axisRenderer
  })
);

// Add clock hand
// https://www.amcharts.com/docs/v5/charts/radar-chart/gauge-charts/#Clock_hands
// north
var axisDataItemN = xAxis.makeDataItem({ value: 0 });

var clockHandN = am5radar.ClockHand.new(root, {
  pinRadius: 0,
  radius: am5.percent(90),
  bottomWidth: 40
});

clockHandN.hand.setAll({fill: am5.color(0xff0000), fillOpacity: 0.5, stroke: am5.color(0x095256)});

axisDataItemN.set(
  "bullet",
  am5xy.AxisBullet.new(root, {
    sprite: clockHandN
  })
);

xAxis.createAxisRange(axisDataItemN);

//south
var axisDataItemS = xAxis.makeDataItem({ value: 180 });

var clockHandS = am5radar.ClockHand.new(root, {
  pinRadius: 0,
  radius: am5.percent(90),
  bottomWidth: 40
});

// do not change angle at all

clockHandS.hand.setAll({fill: am5.color(0xffffff), fillOpacity: 0.5, stroke: am5.color(0x095256)});

axisDataItemS.set(
  "bullet",
  am5xy.AxisBullet.new(root, {
    sprite: clockHandS
  })
);

xAxis.createAxisRange(axisDataItemS);

function createLabel(text, value, tickOpacity) {
  var axisDataItem = xAxis.makeDataItem({ value: value });
  xAxis.createAxisRange(axisDataItem);
  var label = axisDataItem.get("label");
  label.setAll({
    text: text,
    forceHidden: false,
    inside: true,
    radius: 20
  });

  var tick = axisDataItem
    .get("tick")
    .setAll({
      forceHidden: false,
      strokeOpacity: tickOpacity,
      length: 12 * tickOpacity,
      visible: true,
      inside: true
    });
}

createLabel("N", 0, 1);
createLabel("NE", 45, 1);
createLabel("E", 90, 1);
createLabel("SE", 135, 1);
createLabel("S", 180, 1);
createLabel("SW", 225, 1);
createLabel("W", 270, 1);
createLabel("NW", 315, 1);

for (var i = 0; i < 360; i = i + 5) {
  createLabel("", i, 0.5);
}

var speedLabel = chart.seriesContainer.children.push(
  am5.Label.new(root, {
    textAlign: "center",
    centerY: am5.percent(50),
    centerX: am5.percent(130),
    text: "[fontSize:18px]speed[/]:\n[bold fontSize:50px]00.0\n[fontSize:18px]knots[/]"
  })
);

var gustLabel = chart.seriesContainer.children.push(
  am5.Label.new(root, {
    textAlign: "center",
    centerY: am5.percent(50),
    centerX: am5.percent(-35),
    text: "[fontSize:18px]gust[/]:\n[bold fontSize:50px]00.0\n[fontSize:18px]knots[/]"
  })
);

var sampleTime = chart.seriesContainer.children.push(
  am5.Label.new(root, {
    textAlign: "center",
    text: "\n[fontSize:18px]07:00 Wednesday 28th January 1971[/]",
    centerY: am5.percent(-120),
    centerX: am5.percent(50),
  })
);

var getJSON = function(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      if (status === 200) {
        callback(null, xhr.response);
      } else {
        callback(status, xhr.response);
      }
    };
    xhr.send();
};

var chartData = function(wind) {
    return wind.map( sample => {
        return { date: new Date(sample.timestamp * 1000), speed: sample.average.toFixed(1) };
    } )
}

var updateWeather = function () {
    getJSON('https://8al8o4656m.execute-api.eu-west-2.amazonaws.com/default/newWeatherSample',
    function(err, data) {
      if (err !== null) {
        console.log('Something went wrong: ' + err);
      } else {
        wind = data.body;
        wind.sort((a, b) => {
            if (b.timestamp > a.timestamp) return 1;
            if (b.timestamp < a.timestamp) return -1;
            return 0;
        });
        latest = wind[0];
        speed = (latest.average/100)*1.94384;
        gust = (latest.max/100)*1.94384;
        direction = latest.direction;
        if ( direction >= 360 ) {
            direction = direction - 360;
        }
        speedLabel.set("text", "[fontSize:18px]speed[/]:\n[bold fontSize:50px]"+speed.toFixed(1)+"[fontSize:18px]\nknots[/]");
        gustLabel.set("text", "[fontSize:18px]gust[/]:\n[bold fontSize:50px]"+gust.toFixed(1)+"[fontSize:18px]\nknots[/]");
        axisDataItemN.animate({
              key: "value",
              to: am5.math.normalizeAngle(90 - direction),
              duration: 800,
              easing: am5.ease.out(am5.ease.cubic)
            });
        axisDataItemS.animate({
              key: "value",
              to: am5.math.normalizeAngle(-90 - direction),
              duration: 800,
              easing: am5.ease.out(am5.ease.cubic)
            });
          }
        var date = new Date(latest.timestamp * 1000);
        sampleTime.set("text", "[fontSize:18px]"+date.toLocaleDateString("en-GB", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })+"\n"+date.toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit', hour12: false })+"[/]");
        return chartData(data.body);
    });
}

setInterval(updateWeather, 50000);

root.numberFormatter.set("numberFormat", "00.0");
chart.appear(1000, 100);
updateWeather();

}); // end am5.ready()
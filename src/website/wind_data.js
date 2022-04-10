Number.prototype.round = function(places) {
  return +(Math.round(this + "e+" + places)  + "e-" + places);
}

var maxGust = function(data){
    return JSON.parse(JSON.stringify(data)).sort(
                      function(a, b) {
                         return b.gust - a.gust;
                      }
                    )[0].gust
}

var getData = function(callback) {
    var url = 'https://8al8o4656m.execute-api.eu-west-2.amazonaws.com/default/newWeatherSample';
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.responseType = 'json';
    xhr.onload = function() {
      var status = xhr.status;
      if (status === 200) {
        wind = xhr.response.body
        wind.sort((a, b) => {
            if (b.timestamp > a.timestamp) return 1;
            if (b.timestamp < a.timestamp) return -1;
            return 0;
        });
        var data = []
        wind.map( sample => {
                        var speed = (sample.average/100)*1.94384;
                        var gust = (sample.max/100)*1.94384
                        data.push( { date: sample.timestamp*1000, speed: speed.round(1), gust: gust.round(1) });
                    });
        var wind = {
            data: data,
            maxGust: maxGust(data)
        }
        callback(null, wind);
      } else {
        callback(status, xhr.response);
      }
    };
    xhr.send();
};


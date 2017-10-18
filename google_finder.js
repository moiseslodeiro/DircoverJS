var google = require('google');

google.resultsPerPage = 300
var nextCounter = 0

google('site:www.ull.es', function (err, res){
  if (err) console.error(err)

  for (var i = 0; i < res.links.length; ++i) {
    var link = res.links[i];
    console.log(link.href)
  }

  if (nextCounter < 4) {
    nextCounter += 1
    if (res.next) res.next()
  }
});
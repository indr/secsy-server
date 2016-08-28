'use strict';

const NE = require('node-exceptions');

const languages = {
  'en': 'public/en.html',
  'de': 'public/de.html'
};

class RootController {
  * index (request, response) {
    let acceptLanguage = request.header('accept-language');
    let acceptLanguages = (acceptLanguage || '')
      .split(';')[0].split(',').map((each) => each.split('-')[0]);
    
    let language = acceptLanguages.find((each) => languages[each]);
    
    response.download(languages[language] || languages['en'])
  }
  
  * lang (request, response) {
    let htmlFile = languages[request.param('lang')];
    
    if (!htmlFile) {
      throw new NE.HttpException(`Route not found ${request.url()}`, 404)
    }
    
    response.download(htmlFile)
  }
  
  * app (request, response) {
    response.download('public/app/index.html')
  }
}

module.exports = RootController;

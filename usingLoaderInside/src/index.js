import * as ConfigService from './config-service.js';

ConfigService.getConfig().then(function(config){
	console.log(config);
});

// .then(fucntion(config){
// 	// console.log(config);
// });
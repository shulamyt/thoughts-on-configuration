import Loader from './loader';

export function getConfig() {
	Loader loader = new Loader();
	return new Promise(function(resolve, reject) {
		loader.load('./src/appConfigSettings.js', 'projectListConfigurations').then(function(projectListConfigs){
			console.log(projectListConfigs);
			var config = projectListConfigs[0];
			resolve(config);
		});
	}
}
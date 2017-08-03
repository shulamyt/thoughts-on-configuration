import projectListConfigs from 'projectListConfig';

export function getConfig() {
	console.log(projectListConfigs);
	var config = projectListConfigs[0];
	return config;
}
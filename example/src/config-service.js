export function getConfig() {
	return new Promise(
		function(resolve, reject) {
			resolve(dopProjectsListConfiguration);
		}
	)
}
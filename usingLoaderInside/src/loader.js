export function Loader(){
	this.downloadScript = function (url) {
		var scriptIsLoadedPromise = new Promise(function(resolve, reject) {
			// start chunk loading
			var head = document.getElementsByTagName('head')[0];
			var script = document.createElement('script');
			script.type = 'text/javascript';
			script.charset = 'utf-8';
			script.async = true;
			script.timeout = 120000;

			// if (nc) {
			// 	script.setAttribute("nonce", __webpack_require__.nc);
			// }
			script.src = url;
			var timeout = setTimeout(onScriptError, 120000);
			script.onerror = onScriptError.bind(this, url);
			script.onload = onScriptLoad.bind(this, url);

			function onScriptLoad(scriptUrl, event) {
				onScriptComplete(scriptUrl);
				resolve();
			};

			function onScriptError(scriptUrl, event) {
				onScriptComplete(scriptUrl);
				reject();
			};

			function onScriptComplete(scriptUrl) {
				// avoid mem leaks in IE.
				script.onerror = script.onload = null;
				clearTimeout(timeout);
			};

			head.appendChild(script);
		});
		return scriptIsLoadedPromise;
	};

	this.downloadScripts = function (pathsList) {
		var downloadScriptsPromises = [];
		var scriptsList = [];
		pathsList.forEach(function(path, i){
			var downloadScriptPromise = this.downloadScript(path);
			downloadScriptsPromises.push(downloadScriptPromise);
			var addScriptToList = function(url, index){
				var globalName = this.getGlobalName(url);
				scriptsList[index] = this.getGlobalRoot()[globalName];
				this.cleanGlobal(globalName);
			}.bind(this, path, i);
			downloadScriptPromise.then(addScriptToList);
		}.bind(this));
		var downloadScriptsPromise = new Promise(function(resolve, reject) {
			Promise.all(downloadScriptsPromises).then(function(){
				resolve(scriptsList);
			});
		});
		return downloadScriptsPromise;
	};

	this.getFileName = function (filePath) {
		var fileName = filePath.split('\\').pop().split('/').pop();
		fileName = fileName.slice(0, -3); //remove .js
		return fileName;
	};

	this.getGlobalName = function (filePath) {
		//we assume that the file name is the global param that it export
		return this.getFileName(filePath);
	};

	this.getGlobalRoot = function(){
		return window['dop'];
	};

	this.initGlobalRoot = function(){
		window['dop'] = {};
	};

	this.attachAsGlobal = function (globalName, filePath) {
		var currentGlobalName = this.getGlobalName(filePath);
		if(this.getGlobalRoot()[globalName] != undefined){
			console.error('The global name: ' + globalName + ' is allready defined. Pls change it.');
			return;
		}
		if(window[currentGlobalName] == undefined){
			console.error('No config loaded in : ' + currentGlobalName);
			return;
		}
		this.getGlobalRoot()[globalName] = this.getGlobalRoot()[currentGlobalName];
		this.getGlobalRoot()[currentGlobalName] = undefined;
	};

	this.cleanGlobal = function (globalName) {
		this.getGlobalRoot()[globalName] = undefined;
		delete this.getGlobalRoot()[globalName];
	};

	this.loadAllConfigFiles = function (configFilesSettings) {
		var allFilesPromises = [];
		var mainGlobalName;
		for(var globalName in configFilesSettings){
			if(Array.isArray(configFilesSettings[globalName])){
				var pathsList = configFilesSettings[globalName];
				var downloadScriptsPromise = this.downloadScripts(pathsList)
				downloadScriptsPromise.then(function(scriptsList){
					this.getGlobalRoot()[globalName] = scriptsList;
				}.bind(this));
				allFilesPromises.push(downloadScriptsPromise);
			}
			else{
				var path = configFilesSettings[globalName];
				var downloadScriptPromise = this.downloadScript(path);
				downloadScriptPromise.then(this.attachAsGlobal.bind(this, globalName, path));
				allFilesPromises.push(downloadScriptPromise);
			}
		}
		return Promise.all(allFilesPromises);
	};

	this.getConfigFilesSettings = function (manifestPath) {
		var name = this.getGlobalName(manifestPath);
		return window[name];
	};	

	this.load = function (manifestPath, relevantNamespace) {
		if(this.getGlobalRoot() == undefined){
			this.initGlobalRoot();
		}
		return new Promise(function(loadResolve, loadReject) {
			this.downloadScript(manifestPath).then(function(){
				var configFilesSettings = this.getConfigFilesSettings(manifestPath);
				var foo = this.loadAllConfigFiles.bind(this);
				foo(configFilesSettings).then(function(){
					var resovedConfig;
					if(relevantNamespace){
						resovedConfig = this.getGlobalRoot()[relevantNamespace];
					}
					else{
						resovedConfig = this.getGlobalRoot();
					}
					loadResolve(resovedConfig);
				}.bind(this));
			}.bind(this));
		}.bind(this));
	};
}
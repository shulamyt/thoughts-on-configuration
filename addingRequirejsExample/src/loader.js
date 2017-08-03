var Loader = function(){
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

	this.scripts = function () {
		return document.getElementsByTagName('script');
	};

	this.getMainAttribute = function (loaderScriptTag) {
		return loaderScriptTag.getAttribute('data-loader-main');
	};

	this.getManifestAttribute = function (loaderScriptTag) {
		return loaderScriptTag.getAttribute('data-loader-manifest');
	};

	this.getLoaderScriptTag = function () {
		var allScripts = this.scripts();
		for (i = 0; i < allScripts.length; i += 1) {
			var script = allScripts[i];
			if (script && this.getMainAttribute(script)) {
				return script;
			}
		}
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


	this.attachAsGlobal = function (globalName, filePath) {
		var currentGlobalName = this.getGlobalName(filePath);
		if(window[globalName] != undefined){
			console.error('The global name: ' + globalName + ' is allready defined. Pls change it.');
			return;
		}
		if(window[currentGlobalName] == undefined){
			console.error('No config loaded in : ' + currentGlobalName);
			return;
		}
		window[globalName] = window[currentGlobalName];
		window[currentGlobalName] = undefined;
	};

	this.cleanGlobal = function (globalName) {
		window[globalName] = undefined;
		delete window[globalName];
	};

	this.downloadScripts = function (pathsList) {
		var downloadScriptsPromises = [];
		var scriptsList = [];
		pathsList.forEach(function(path, i){
			var downloadScriptPromise = this.downloadScript(path);
			downloadScriptsPromises.push(downloadScriptPromise);
			var addScriptToList = function(url, index){
				var globalName = this.getGlobalName(url);
				scriptsList[index] = window[globalName];
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

	this.loadAllConfigFiles = function () {
		var allFilesPromises = [];
		for(var globalName in appConfigSettings){
			if(Array.isArray(appConfigSettings[globalName])){
				var pathsList = appConfigSettings[globalName];
				var downloadScriptsPromise = this.downloadScripts(pathsList)
				downloadScriptsPromise.then(function(scriptsList){
					window[globalName] = scriptsList;
				});
				allFilesPromises.push(downloadScriptsPromise);
			}
			else{
				var path = appConfigSettings[globalName];
				var downloadScriptPromise = this.downloadScript(path);
				downloadScriptPromise.then(attachAsGlobal.bind(this, globalName, path));
				allFilesPromises.push(downloadScriptPromise);
			}
		}
		return Promise.all(allFilesPromises);
	};

	this.load = function (manifest, mainApp) {
		return new Promise(function(laodResolve, laodReject) {
			this.downloadScript(manifest).then(function(){
				this.loadAllConfigFiles().then(function(){
					if(mainApp != undefined){
						this.downloadScript(mainApp).then(laodResolve);
					}
					else{
						laodResolve();
					}
				}.bind(this));
			}.bind(this));
		}.bind(this));
	};
}

var loader = new Loader();
var loaderScriptTag = loader.getLoaderScriptTag();
if(loaderScriptTag != undefined){
	var mainApp = loader.getMainAttribute(loaderScriptTag);
	var manifest = loader.getManifestAttribute(loaderScriptTag);
	loader.load(manifest, mainApp).then(function(){console.log('app loaded!')});
}

function downloadScript(url) {
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
		script.onerror = onScriptError.bind(null, url);
		script.onload = onScriptLoad.bind(null, url);

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

function scripts() {
	return document.getElementsByTagName('script');
};

function getMainAttribute(loaderScriptTag){
	return loaderScriptTag.getAttribute('data-loader-main');
};

function getManifestAttribute(loaderScriptTag){
	return loaderScriptTag.getAttribute('data-loader-manifest');
};

function getLoaderScriptTag(){
	var allScripts = scripts();
	for (i = 0; i < allScripts.length; i += 1) {
		var script = allScripts[i];
		if (script && getMainAttribute(script)) {
			return script;
		}
	}
};

function getFileName(filePath){
	var fileName = filePath.split('\\').pop().split('/').pop();
	fileName = fileName.slice(0, -3); //remove .js
	return fileName;
};

function getGlobalName(filePath){
	//we assume that the file name is the global param that it export
	return getFileName(filePath);
};


function attachAsGlobal(globalName, filePath){
	var currentGlobalName = getGlobalName(filePath);
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

function cleanGlobal(globalName){
	window[globalName] = undefined;
	delete window[globalName];
};

function downloadScripts(pathsList){
	var downloadScriptsPromises = [];
	var scriptsList = [];
	pathsList.forEach(function(path, i){
		var downloadScriptPromise = downloadScript(path);
		downloadScriptsPromises.push(downloadScriptPromise);
		var addScriptToList = function(url, index){
			var globalName = getGlobalName(url);
			scriptsList[index] = window[globalName];
			cleanGlobal(globalName);
		}.bind(null, path, i);
		downloadScriptPromise.then(addScriptToList);
	});
	var downloadScriptsPromise = new Promise(function(resolve, reject) {
		Promise.all(downloadScriptsPromises).then(function(){
			resolve(scriptsList);
		});
	});
	return downloadScriptsPromise;
};

function loadAllConfigFiles(){
	var allFilesPromises = [];
	for(var globalName in appConfigSettings){
		if(Array.isArray(appConfigSettings[globalName])){
			var pathsList = appConfigSettings[globalName];
			var downloadScriptsPromise = downloadScripts(pathsList)
			downloadScriptsPromise.then(function(scriptsList){
				window[globalName] = scriptsList;
			});
			allFilesPromises.push(downloadScriptsPromise);
		}
		else{
			var path = appConfigSettings[globalName];
			var downloadScriptPromise = downloadScript(path);
			downloadScriptPromise.then(attachAsGlobal.bind(this, globalName, path));
			allFilesPromises.push(downloadScriptPromise);
		}
	}
	return Promise.all(allFilesPromises);
};

var loaderScriptTag = getLoaderScriptTag();
var mainApp = getMainAttribute(loaderScriptTag);
var manifest = getManifestAttribute(loaderScriptTag);

downloadScript(manifest).then(function(){
	loadAllConfigFiles().then(function(){
		downloadScript(mainApp);
	});
});
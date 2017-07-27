function requireScript(url) {
	if(window.loaderPromisesResolve == undefined){
		window.loaderPromisesResolve = [];
	}

	if(window.loaderPromisesReject == undefined){
		window.loaderPromisesReject = [];
	}

	var scriptIsLoadedPromise = new Promise(function(resolve, reject) {
		// scriptIsLoadedResolve = resolve;
		// scriptIsLoadedReject = reject;
		loaderPromisesResolve[url] = resolve;
		loaderPromisesReject[url] = reject;
	});

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
	var timeout = setTimeout(onScriptComplete, 120000);
	script.onerror = onScriptError.bind(this, url);
	script.onload = onScriptload.bind(this, url);

	function onScriptload(scriptUrl, event) {
		onScriptComplete();
		loaderPromisesResolve[scriptUrl]();
	}

	function onScriptError(scriptUrl, event) {
		onScriptComplete();
		loaderPromisesReject[scriptUrl]();
	}

	function onScriptComplete() {
		// avoid mem leaks in IE.
		script.onerror = script.onload = null;
		clearTimeout(timeout);
	};

	head.appendChild(script);
	return scriptIsLoadedPromise;
};

function scripts() {
	return document.getElementsByTagName('script');
};

function getMainAttribute(loaderScriptTag){
	return loaderScriptTag.getAttribute('data-loader-main');
};

function getConfigFileAttribute(loaderScriptTag){
	return loaderScriptTag.getAttribute('data-loader-config-file');
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

function requireScripts(pathsList){
	var requireScriptsPromises = [];
	var scriptsList = [];
	for(var i = 0; i < pathsList.length; i++){
		var path = pathsList[i];
		var requireScriptPromise = requireScript(path);
		requireScriptsPromises.push(requireScriptPromise);
		var addScriptToList = function(url, index){
			var globalName = getGlobalName(url);
			scriptsList[index] = window[globalName];
			cleanGlobal(globalName);
		};
		requireScriptPromise.then(addScriptToList.bind(null, path, i));
	}

	var requireScriptsPromise = new Promise(function(resolve, reject) {
		Promise.all(requireScriptsPromises).then(function(){
			resolve(scriptsList);
		});
	});
	return requireScriptsPromise;
};

function loadAllConfigFiles(){
	var allFilesPromises = [];
	for(var globalName in appConfigSettings){
		if(Array.isArray(appConfigSettings[globalName])){
			var pathsList = appConfigSettings[globalName];
			var requireScriptsPromise = requireScripts(pathsList)
			requireScriptsPromise.then(function(scriptsList){
				window[globalName] = scriptsList;
			});
			allFilesPromises.push(requireScriptsPromise);
		}
		else{
			var path = appConfigSettings[globalName];
			var requireScriptPromise = requireScript(path);
			requireScriptPromise.then(attachAsGlobal.bind(this, globalName, path));
			allFilesPromises.push(requireScriptPromise);
		}
	}
	return Promise.all(allFilesPromises);
};

var loaderScriptTag = getLoaderScriptTag();
var mainAppFilePath = getMainAttribute(loaderScriptTag);
var configFilePath  = getConfigFileAttribute(loaderScriptTag);

requireScript(configFilePath).then(function(){
	loadAllConfigFiles().then(function(){
		requireScript(mainAppFilePath);
	});
});
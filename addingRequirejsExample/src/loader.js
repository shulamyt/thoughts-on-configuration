function requireScript(url) {

	var scriptIsLoadedResolve;
	var scriptIsLoadedReject;
	var scriptIsLoadedPromise = new Promise(function(resolve, reject) {
		scriptIsLoadedResolve = resolve;
		scriptIsLoadedReject = reject;
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
	script.onerror = onScriptError;
	script.onload = onScriptload

	function onScriptload() {
		onScriptComplete();
		scriptIsLoadedResolve();
	}

	function onScriptError() {
		onScriptComplete();
		scriptIsLoadedReject();
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
	return fileName;
};

function getCurrentGlobalName(filePath){
	//we assume that the file name is the global param that it export
	return getFileName(filePath);
};


function attachAsGlobal(globalName, filePath){
	var currentGlobalName = getCurrentGlobalName(filePath);
	if(window[globalName] != undefined){
		console.error('The global name: ' + globalName + ' is allready defined. Pls change it.');
	}
	else{
		window[globalName] = currentGlobalName;
		window[currentGlobalName] = undefined;
	}
};

function loadAllConfigFiles(){
	var allFilesPromises = [];
	for(var globalName in appConfigSettings){
		console.log(globalName);
		var path = appConfigSettings[glodalName];
		var requireScriptPromise = requireScript(loaderMainFilePath);
		requireScriptPromise.then(attachAsGlobal(globalName, path));
		allFilesPromises.push(requireScriptPromise);
	}
	return Promise.all(allFilesPromises);
};

var loaderScriptTag = getLoaderScriptTag();
var loaderMainFilePath = getMainAttribute(loaderScriptTag);
var loaderConfigFilePath = getConfigFileAttribute(loaderScriptTag);

requireScript(loaderConfigFilePath).then(function(){
	loadAllConfigFiles().then(function(){
		requireScript(loaderMainFilePath);
	});
});
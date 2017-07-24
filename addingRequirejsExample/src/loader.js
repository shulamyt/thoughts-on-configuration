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

	// if (__webpack_require__.nc) {
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

function loadAllConfigFiles(){
	var allFilesPromises = [];
	for(var glodalName in appConfigSettings){
		console.log(glodalName);
		var path = appConfigSettings[glodalName];
		allFilesPromises.push(requireScript(loaderMainFilePath));
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
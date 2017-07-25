we want to 

## Goals

* plug and play - 
* delta only - 
* Diffrent lifecycle - we don't want to build the configuration with the code since we want to bring config in runtime from diffrent resources.
* Configuration is runnable js - configs are js files. They bring with them custum code. We can'r just load he file and read it. the browser need to know it is runnable file (<script>) ;




## Config with webpack

### require()
https://webpack.js.org/guides/dependency-management/
**no - it is still need to be in build time**

### import()
ES proposal: import() – dynamically importing ES modules
https://webpack.js.org/guides/migrating/#code-splitting-with-es2015
http://2ality.com/2017/01/import-operator.html
**no - it is still need to be in build time**

### alias
https://webpack.js.org/configuration/resolve/
**no - it is still need to be in build time**

### externals - as global var
https://webpack.js.org/configuration/externals/


## How to load config files
the only way to connect vars between script are via global vars.

## How to build the configuration with webpack
we assume that the configuration put gloabl var named as the configuration file name. How to buld the configuration with webpack so it will work like that?
https://webpack.js.org/configuration/output/#output-librarytarget




we want to 

## Goals

* plug and play - 
* delta only - 
* Diffrent lifecycle - we don't want to build the configuration with the code since we want to bring config in runtime from diffrent resources.
* Configuration is runnable js - configs are js files. They bring with them custum code. We can'r just load he file and read it. the browser need to know it is runnable file (<script>) ;




## config with webpack:

* require()

https://webpack.js.org/guides/dependency-management/
**no - it is still need to be in build time**


* import()

ES proposal: import() – dynamically importing ES modules
https://webpack.js.org/guides/migrating/#code-splitting-with-es2015
http://2ality.com/2017/01/import-operator.html

**no - it is still need to be in build time**


* alias

https://webpack.js.org/configuration/resolve/

**no - it is still need to be in build time**


* externals - as global var

https://webpack.js.org/configuration/externals/







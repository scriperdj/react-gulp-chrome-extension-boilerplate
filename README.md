# Chrome Extension Boilerplate using React/Redux & Gulp automation
[![Build Status](https://travis-ci.org/scriperdj/react-gulp-chrome-extension-boilerplate.svg?branch=master)]

This is a modification to [react-chrome-extension-boilerplate](https://github.com/jhen0409/react-chrome-extension-boilerplate) to use [Gulp](http://gulpjs.com/) automation instead [Webpack](https://webpack.github.io/).

It uses [React.js](https://github.com/facebook/react) with [Redux](https://github.com/rackt/redux), [browserify](http://browserify.org/) & [css-modulesify](https://github.com/css-modules/css-modulesify) which are ideal for building complex applications.

As the original example, the inject script will be executed on github pages(`https://github.com/*`) when visited.

## Installation

* Clone the repo
```bash
$ git clone https://github.com/scriperdj/react-gulp-chrome-extension-boilerplate.git
```
* Install dependencies
```bash
$ npm install
```
* Build using gulp tasks
```bash
$ gulp
```
* Load the `./dev` folder to Google Chrome using Load unpacked extensions option.

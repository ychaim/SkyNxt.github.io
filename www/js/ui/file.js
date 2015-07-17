// The MIT License (MIT)

// Copyright (c) 2015 SkyNxt.

// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:

// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.

// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

var SkyNxt = (function(SkyNxt, $, undefined) {

SkyNxt.DIRECTORY = 'SkyNxt';
SkyNxt.SUB_DIRECTORY = 'user';
SkyNxt.USER_FILE = 'skynxt.user';
SkyNxt.JSON_FILE_DATA = 'undefined';
SkyNxt.FILE_ENTRY = 'undefined';
SkyNxt.PEER_SETTINGS = 'peerSettings';
SkyNxt.PEER_SETTING_AUTO = 'auto';
SkyNxt.PEER_SETTING_IP_PORT = '';
SkyNxt.UI_THEME = 'uiTheme';
SkyNxt.UI_THEME_LIGHT = 'a';
SkyNxt.UI_THEME_DARK = 'b';
SkyNxt.TRUSTED_PEERS = 'trustedPeers';
SkyNxt.HTTP_NODE = 'http://';
SkyNxt.HTTPS_NODE = 'https://';
SkyNxt.USER_SETTING_COLLECTION = 'user';
SkyNxt.usersettings = new loki('user.settings');
SkyNxt.fileSystem = 'undefined';
SkyNxt.SAVED_UI_THEME = "";

SkyNxt.initFileSystem = function(fileSystem) {
	SkyNxt.fileSystem = fileSystem;
	SkyNxt.fileSystem.root.getDirectory(SkyNxt.DIRECTORY, { create: false }, //try finding SkyNxt directory if it already exists
	function(dirEntry) 
	{
		dirEntry.getDirectory(SkyNxt.SUB_DIRECTORY, { create: false }, 
		function(fileEntry) 
		{
			fileEntry.getFile(SkyNxt.USER_FILE, { create: false }, createRead, fail)
		}, fail);
	},
	createUserFile
	);
}

function createUserFile()
{
	SkyNxt.fileSystem.root.getDirectory(SkyNxt.DIRECTORY, {create: true}, //Create SkyNxt directory if it fails to find it
	function(dirEntry) 
	{
		dirEntry.getDirectory(SkyNxt.SUB_DIRECTORY, {create: true}, 
		function(fileEntry) 
		{
			fileEntry.getFile(SkyNxt.USER_FILE, {create: true, exclusive: false}, firstWrite, fail)
		}, fail);
	}, fail);
}

function createRead(fileEntry) {
	if(SkyNxt.FILE_ENTRY == 'undefined')
	{
		SkyNxt.FILE_ENTRY = fileEntry;
	}
    fileEntry.file(readAsText, fail);
}

function readAsText(file) {
	var reader = new FileReader();
	reader.onloadend = function(evt) {
		SkyNxt.usersettings.loadJSON(evt.target.result);
		var userdbs = SkyNxt.usersettings.getCollection(SkyNxt.USER_SETTING_COLLECTION);
		var uiTheme = userdbs.findOne({'key' : SkyNxt.UI_THEME});
		SkyNxt.SAVED_UI_THEME = uiTheme.value;		
		$("#" + SkyNxt.SAVED_UI_THEME).prop("checked", true);
		changeTheme(String(SkyNxt.SAVED_UI_THEME));
		var trustedPeerdata = userdbs.findOne({'key' : SkyNxt.TRUSTED_PEERS});		
		SkyNxt.PEER_IP = trustedPeerdata.value.split(',');
		
		if(String(SkyNxt.PEER_IP[0]) == String(SkyNxt.HTTPS_NODE) || String(SkyNxt.PEER_IP[0]) == String(SkyNxt.HTTP_NODE))
		{	
			$("#nodeIP").val(String(SkyNxt.PEER_IP[1]));			
			$("#port").val(String(SkyNxt.PEER_IP[2]));
			SkyNxt.ADDRESS = SkyNxt.PEER_IP[0] + SkyNxt.PEER_IP[1] + ":" + SkyNxt.PEER_IP[2];
			$("#radio-choice-2").prop("checked", true);
		}
		else
		{
			$("#ipGrid").hide();
			$("#nodeIPBtn").hide();		
			SkyNxt.getPeer();
		}
	};
	reader.readAsText(file);
}

SkyNxt.getPeer = function()
{
	var max = SkyNxt.PEER_IP.length;
	var min = 0;
    var rand = Math.floor(Math.random() * (max - min + 1)) + min;
	SkyNxt.ADDRESS = SkyNxt.PEER_IP[rand] + ":" + SkyNxt.PORT;
}

function firstWrite(fileEntry)
{
	SkyNxt.discover();
	var userdbs = SkyNxt.usersettings.addCollection(SkyNxt.USER_SETTING_COLLECTION);
	userdbs.insert({key:SkyNxt.PEER_SETTINGS, value:SkyNxt.PEER_SETTING_AUTO});
	userdbs.insert({key:SkyNxt.UI_THEME, value:SkyNxt.UI_THEME_LIGHT});
	var trustedPeerList = "";
	for(j = 1; j <= SkyNxt.trustedpeersdb.data.length; j++)
	{
		var data = SkyNxt.trustedpeersdb.get(j);
		var ip = String(data.ip_peer);
		trustedPeerList = ip + "," + trustedPeerList;
	}
	SkyNxt.PEER_IP = trustedPeerList.split(',');
	SkyNxt.getPeer();
	userdbs.insert({key:SkyNxt.TRUSTED_PEERS, value:trustedPeerList});	
	SkyNxt.createWrite(fileEntry);
}

SkyNxt.createWrite = function(fileEntry) {
	if(SkyNxt.FILE_ENTRY == 'undefined')
	{
		SkyNxt.FILE_ENTRY = fileEntry;
	}
	SkyNxt.JSON_FILE_DATA = SkyNxt.usersettings.serialize();
	fileEntry.createWriter(gotFileWriter, fail);
}

function gotFileWriter(writer) {
	writer.onwriteend = function(evt) {
	};
	if(SkyNxt.JSON_FILE_DATA != 'undefined')
		writer.write(SkyNxt.JSON_FILE_DATA);
}

function fail(error) {
	console.log(error.code);
}

 	return SkyNxt;
 }(SkyNxt || {}, jQuery));
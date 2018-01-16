// ------------------------------------------------------------------------------
// ----- NY WSC Event Portal ----------------------------------------------------
// ------------------------------------------------------------------------------
// copyright:   2013 Martyn Smith - USGS NY WSC
// authors:  Martyn J. Smith - USGS NY WSC
// purpose:  Web Mapping interface for events
//
// updates:
// 08.29.2017
//

//user config variables
var MapX = '-76.2'; //set initial map longitude
var MapY = '42.7'; //set initial map latitude
var MapZoom = 7; //set initial map zoom
var noaaSitesJSON = './noaaSites.json';  //lookup file of all NOAA sites with USGS gages
var initialState = 'NY';
var cwisURL = 'https://txpub.usgs.gov/DSS/CWIS/1.0/services/request.ashx/getData';
var cwisOptions = {
	service: 'flow',
	states: initialState,
	format: 'geojson'
}
var cwisRefreshInterval;

var stateList = [
	{ 'RegionID': 'AK', 'Name': 'Alaska', 'Bounds': [[51.583032,-178.217598],[71.406235,-129.992235]]},
    { 'RegionID': 'AL', 'Name': 'Alabama', 'Bounds': [[30.233604, -88.472952], [35.016033, -84.894016]]},
    { 'RegionID': 'AR', 'Name': 'Arkansas', 'Bounds': [[33.010151, -94.617257], [36.492811, -89.645479]]},
    { 'RegionID': 'AS', 'Name': 'American Samoa', 'Bounds': [[-14.375555, -170.82611], [-14.166389, -169.438323]]},
    { 'RegionID': 'AZ', 'Name': 'Arizona', 'Bounds': [[31.335634, -114.821761], [37.003926, -109.045615]]},
    { 'RegionID': 'CA', 'Name': 'California', 'Bounds': [[32.535781, -124.392638], [42.002191, -114.12523]]},
    { 'RegionID': 'CO', 'Name': 'Colorado', 'Bounds': [[36.988994,-109.055861],[41.003375,-102.037207]]},
    { 'RegionID': 'CT', 'Name': 'Connecticut', 'Bounds': [[40.998392, -73.725237], [42.047428, -71.788249]]},
	{ 'RegionID': 'DE', 'Name': 'Delaware', 'Bounds': [[38.449602,-75.791094],[39.840119,-75.045623]]},
	{ 'RegionID': 'MD', 'Name': 'District of Columbia', 'Bounds': [[37.970255, -79.489865], [39.725461, -75.045623]]},
    { 'RegionID': 'FL', 'Name': 'Florida', 'Bounds': [[24.956376,-87.625711],[31.003157,-80.050911]]},
    { 'RegionID': 'GA', 'Name': 'Georgia', 'Bounds': [[30.361291,-85.60896],[35.000366,-80.894753]]},
    { 'RegionID': 'GU', 'Name': 'Guam', 'Bounds': [[13.234996, 144.634155], [13.65361, 144.953308]]},
    { 'RegionID': 'HI', 'Name': 'Hawaii', 'Bounds': [[18.921786,-160.242406],[22.22912,-154.791096]]},
	{ 'RegionID': 'IA', 'Name': 'Iowa', 'Bounds': [[40.371946,-96.640709],[43.501457,-90.142796]]},
    { 'RegionID': 'ID', 'Name': 'Idaho', 'Bounds': [[41.994599,-117.236921],[48.99995,-111.046771]]},
    { 'RegionID': 'IL', 'Name': 'Illinois', 'Bounds': [[36.986822,-91.516284],[42.509363,-87.507909]]},
    { 'RegionID': 'IN', 'Name': 'Indiana', 'Bounds': [[37.776224, -88.10149], [41.76554, -84.787446]]},
    { 'RegionID': 'KS', 'Name': 'Kansas', 'Bounds': [[36.988875,-102.051535],[40.002987,-94.601224]]},
    { 'RegionID': 'KY', 'Name': 'Kentucky', 'Bounds': [[36.49657, -89.568231], [39.142063, -81.959575]]},
    { 'RegionID': 'LA', 'Name': 'Louisiana', 'Bounds': [[28.939655,-94.041785],[33.023422,-89.021803]]},
    { 'RegionID': 'MA', 'Name': 'Massachusetts', 'Bounds': [[41.238279, -73.49884], [42.886877, -69.91778]]},
	{ 'RegionID': 'MD', 'Name': 'Maryland', 'Bounds': [[37.970255, -79.489865], [39.725461, -75.045623]]},
    { 'RegionID': 'ME', 'Name': 'Maine', 'Bounds': [[43.09105,-71.087509],[47.453334,-66.969271]]},
    { 'RegionID': 'MI', 'Name': 'Michigan', 'Bounds': [[41.697494,-90.4082],[48.173795,-82.419836]]},
    { 'RegionID': 'MN', 'Name': 'Minnesota', 'Bounds': [[43.498102,-97.229436],[49.37173,-89.530673]]},
	{ 'RegionID': 'MO', 'Name': 'Missouri', 'Bounds': [[35.989656, -95.767479], [40.609784, -89.105034]]},
    { 'RegionID': 'MS', 'Name': 'Mississippi', 'Bounds': [[30.194935,-91.643682],[35.005041,-88.090468]]},
    { 'RegionID': 'MT', 'Name': 'Montana', 'Bounds': [[44.353639,-116.063531],[49.000026,-104.043072]]},
	{ 'RegionID': 'NC', 'Name': 'North Carolina', 'Bounds': [[33.882164,-84.323773],[36.589767,-75.45658]]},
	{ 'RegionID': 'ND', 'Name': 'North Dakota', 'Bounds': [[45.930822,-104.062991],[49.000026,-96.551931]]},
    { 'RegionID': 'NE', 'Name': 'Nebraska', 'Bounds': [[39.992595,-104.056219],[43.003062,-95.308697]]},
    { 'RegionID': 'NH', 'Name': 'New Hampshire', 'Bounds': [[42.698603,-72.553428],[45.301469,-70.734139]]},
    { 'RegionID': 'NJ', 'Name': 'New Jersey', 'Bounds': [[38.956682,-75.570234],[41.350573,-73.896148]]},
    { 'RegionID': 'NM', 'Name': 'New Mexico', 'Bounds': [[31.343453,-109.051346],[36.99976,-102.997401]]},
    { 'RegionID': 'NV', 'Name': 'Nevada', 'Bounds': [[34.998914,-119.996324],[41.996637,-114.037392]]},
    { 'RegionID': 'NY', 'Name': 'New York', 'Bounds': [[40.506003,-79.763235],[45.006138,-71.869986]]},
    { 'RegionID': 'OH', 'Name': 'Ohio', 'Bounds': [[38.400511, -84.81207], [41.986872, -80.519996]]},
    { 'RegionID': 'OK', 'Name': 'Oklahoma', 'Bounds': [[33.621136,-102.997709],[37.001478,-94.428552]]},
    { 'RegionID': 'OR', 'Name': 'Oregon', 'Bounds': [[41.987672,-124.559617],[46.236091,-116.470418]]},
    { 'RegionID': 'PA', 'Name': 'Pennsylvania', 'Bounds': [[39.719313,-80.526045],[42.267327,-74.700062]]},
    { 'RegionID': 'PR', 'Name': 'Puerto Rico', 'Bounds': [[17.922222, -67.938339], [18.519443, -65.241958]]},
    { 'RegionID': 'RI', 'Name': 'Rhode Island', 'Bounds': [[41.322769,-71.866678],[42.013713,-71.117132]]},
    { 'RegionID': 'SC', 'Name': 'South Carolina', 'Bounds': [[32.068173,-83.350685],[35.208356,-78.579453]]},
    { 'RegionID': 'SD', 'Name': 'South Dakota', 'Bounds': [[42.488459,-104.061036],[45.943547,-96.439394]]},
    { 'RegionID': 'TN', 'Name': 'Tennessee', 'Bounds': [[34.988759,-90.305448],[36.679683,-81.652272]]},
    { 'RegionID': 'TX', 'Name': 'Texas', 'Bounds': [[25.845557,-106.650062],[36.493912,-93.507389]]},
    { 'RegionID': 'UT', 'Name': 'Utah', 'Bounds': [[36.991746,-114.047273],[42.0023,-109.043206]]},
    { 'RegionID': 'VA', 'Name': 'Virginia', 'Bounds': [[36.541623,-83.675177],[39.456998,-75.242219]]},	
    { 'RegionID': 'VT', 'Name': 'Vermont', 'Bounds': [[42.725852,-73.436],[45.013351,-71.505372]]},
    { 'RegionID': 'VI', 'Name': 'Virgin Islands', 'Bounds': [[17.676666, -65.026947], [18.377777, -64.560287]]},
    { 'RegionID': 'WA', 'Name': 'Washington', 'Bounds': [[45.543092,-124.732769],[48.999931,-116.919132]]},
    { 'RegionID': 'WI', 'Name': 'Wisconsin', 'Bounds': [[42.489152,-92.885397],[46.952479,-86.967712]]},	
    { 'RegionID': 'WV', 'Name': 'West Virginia', 'Bounds': [[37.20491,-82.647158],[40.637203,-77.727467]]},
    { 'RegionID': 'WY', 'Name': 'Wyoming', 'Bounds': [[40.994289,-111.053428],[45.002793,-104.051705]]}
];

//other global variables
var siteList = {};
var map;
var layerLabels, layer,selectLayer, sitesLayer, ridgeRadarlayer;
var noaaSitesJson;

if (process.env.NODE_ENV !== 'production') {
  require('../index.html');
}

//instantiate map
$( document ).ready(function() {
	console.log('Application Information: ' + process.env.NODE_ENV + ' ' + 'version ' + VERSION);
	$('#appVersion').html('Application Information: ' + process.env.NODE_ENV + ' ' + 'version ' + VERSION);

	//create map
	map = L.map('mapDiv',{zoomControl: false});

	//add zoom control with your options
	L.control.zoom({position:'topright'}).addTo(map);  
	L.control.scale().addTo(map);

	//basemap
	layer= L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
		attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
		maxZoom: 16
	}).addTo(map);

	//set initial view
	map.setView([MapY, MapX], MapZoom);
		
	//define layers
	selectLayer = L.featureGroup().addTo(map);
	sitesLayer = L.featureGroup().addTo(map);

	getAHPSids();
	loadSites(states=initialState,bounds=null);
	createStateFilters(stateList);
	addNWSlayers();

	/*  START EVENT HANDLERS */

	$('.basemapBtn').click(function() {
		$('.basemapBtn').removeClass('slick-btn-selection');
		$(this).addClass('slick-btn-selection');
		var baseMap = this.id.replace('btn','');
		setBasemap(baseMap);
	});

	$('#mobile-main-menu').click(function() {
		$('body').toggleClass('isOpenMenu');
	});

	$('.radarBtn').click(function() {
		if ($(this).hasClass('slick-btn-selection')) {
			$(this).removeClass('slick-btn-selection');
			clearRadar();
		}
		else {
			$('.radarBtn').removeClass('slick-btn-selection');
			$(this).addClass('slick-btn-selection');
			var radarValue = $(this).val();
			toggleRadar(radarValue);
		}
	});

	$('#resetView').click(function() {
		resetView();
	});

	$('#aboutButton').click(function() {
		$('#aboutModal').modal('show');
	});	

	$('input[type=radio][name=queryRadio]').change(function() {
		changeQueryType(this);
	});

	$('#stateFilterSelect').on('changed.bs.select', function () {
		updateStateQuery();
	})
	/*  END EVENT HANDLERS */
});

function updateStateQuery(event) {
	var states = [];
	$.each($('#stateFilterSelect').find('option:selected'), function (index,value) {
		states.push($(value).val());
	});
	console.log('in updatequery', states)
	loadSites(states=states.join(','),bounds=null);
}

function changeQueryType(button) {

	if ($(button).val() === 'dropdown') {
		map.off('moveend');
		if ($('#stateFilterSelect').attr('disabled')) $('#stateFilterSelect').removeAttr('disabled');
		updateStateQuery(event);
	}
	else {
		delete cwisOptions.states;
		var bounds = map.getBounds();
		loadSites(states=null,bounds=bounds);
		map.on('moveend', function(e) {
			loadSites(states=null,bounds=bounds);
		});	
		$('#stateFilterSelect').attr('disabled', 'disabled');
	}
}

// function intersect(a, b) {
// 	return Math.max(a.left, b.left) < Math.min(a.right, b.right) && Math.min(a.top, b.top) > Math.max(a.bottom, b.bottom);
// }

// function loadRegionListByExtent(bounds) {
// 	$('#stateFilterSelect').selectpicker('val', []);
// 	console.log('bounds',bounds);
// 	var a = { "top": bounds.getNorth(), "bottom": bounds.getSouth(), "left": bounds.getWest(), "right": bounds.getEast() }
// 	var states = [];

// 	$.each(stateList, function(index, filter) {
// 		var b = { "top": filter.Bounds[1][0], "bottom": filter.Bounds[0][0], "left": filter.Bounds[0][1], "right": filter.Bounds[1][1] }
// 		if (intersect(a, b)) {
// 			states.push(filter.RegionID);
// 		}
// 	});
// 	cwisOptions.states = states.join(',');
// 	loadSites();
// }

function createStateFilters(stateList) {
	$.each(stateList, function(index, filter) {
		//create dropdown menus
		$("#stateFilterSelect").append($('<option></option>').attr('value',filter.RegionID).text(filter.Name));
	});
	$('#stateFilterSelect').selectpicker('val', initialState.split(','));
	refreshAndSortFilters();
}

function refreshAndSortFilters() {
	
	//loop over each select dropdown
	$('.selectpicker').each(function( index ) {
		var id = $(this).attr('id');

		var items = $('#' + id + ' option').get();
		items.sort(function(a,b){
			var keyA = $(a).text();
			var keyB = $(b).text();

			if (keyA < keyB) return -1;
			if (keyA > keyB) return 1;
			return 0;
		});
		var select = $('#' + id);
		$.each(items, function(i, option){
			select.append(option);
		});
	});

	//refresh them all
	$('.selectpicker').selectpicker('refresh');
}

function getAHPSids() {
	$.getJSON(noaaSitesJSON, function(data) {
		noaaSitesJson = data;
	});
}

function AHPSidLookup(siteID) {
	for(key in noaaSitesJson) {
		if (key === siteID) return noaaSitesJson[key];
	}
	return false;
}

function addNWSlayers() {
	console.log('here')

	ridgeRadarlayer = L.esri.dynamicMapLayer({
		//url: 'https://nowcoast.noaa.gov/arcgis/rest/services/nowcoast/radar_meteo_imagery_nexrad_time/MapServer'
		url: 'https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Observations/radar_base_reflectivity/MapServer'
	});
}

function showNWISgraph(e) {	

	var siteType = 'sw';
	var parameterCodes = '00060,72019,62619';
	var timePeriod = 'P7D';
	var siteNumber = e.target.feature.properties.SiteNumber;
	var AHPSid = AHPSidLookup(siteNumber);
	console.log('HERE',siteNumber, AHPSid )
	$.getJSON('https://staging.waterservices.usgs.gov/nwis/iv/?format=nwjson&sites=' + siteNumber + '&parameterCd=' + parameterCodes + '&period=' + timePeriod, function(data) {

		if (!data.data || data.data[0].time_series_data.length <= 0) {
			console.log('Found an NWIS site, but it had no data in waterservices: ', siteNumber)
			return;
		}
		var graphData = [];

		//set labels
		var yLabel = 'Discharge, cfs';
		var pointFormat = 'Discharge: {point.y} cfs';
		if (siteType === 'gw') {
			yLabel = 'Elevation, ft';
			pointFormat = 'Elevation: {point.y} ft';
		}

		var usgsSeries = {
			tooltip: {
				pointFormat: pointFormat
			},
			showInLegend: false, 
			data: data.data[0].time_series_data
		}
		graphData.push(usgsSeries)

		//get NOAA forecast values if this is an AHPS Site 
		if (AHPSid) {
			console.log('Found AHPS site: ',AHPSid, '  Querying AHPS...');
			var url = 'https://water.weather.gov/ahps2/hydrograph_to_xml.php?gage=' + AHPSid + '&output=xml';
			var query = 'select * from xml where url="' + url + '"';
			$.ajax({
				url: 'https://query.yahooapis.com/v1/public/yql?q=' + encodeURIComponent(query),
				dataType: 'xml',
				success: function(feedResponse) {
					var valueArray = [];
					$(feedResponse).find('forecast').find('datum').each(function(){
						var date = $(this).find('valid').text();
						var units = $(this).find('secondary').attr('units');
						var value = parseFloat($(this).find('secondary').text());
						if (units === 'kcfs') value = value * 1000;
						var seconds = new Date(date)/1;
						valueArray.push([seconds, value])
					});
					valueArray.sort();

					if (valueArray.length <= 1) {
						console.log('Found an AHPS Site, but no AHPS data was found: ', siteNumber, AHPSid)
					}
					//if there is AHPS data, add a new series to the graph
					else {
						var forecastSeries = {
							tooltip: {
								pointFormat: pointFormat
							},
							showInLegend: true, 
							color: '#009933',
							name: 'NWS River Forecast (AHPS)',
							data: valueArray
						}
						graphData.push(forecastSeries);
					}

					//console.log('Calling showgraph function now...');
					showGraph(graphData, yLabel);
				}
			});
		}

		//if no AHPS data, just show USGS data
		else {
			console.log('Did not find AHPS site for USGS Site: ', siteNumber);
			showGraph(graphData, yLabel);
		}
	});
}

function showGraph(graphData, yLabel) {
	//if there is some data, show the div
	$('#graphContainer').show();

	Highcharts.setOptions({
		global: { useUTC: false },
		lang: { thousandsSep: ','}
	});

	Highcharts.chart('graphContainer', {
		chart: {
			type: 'line',
			spacingTop: 20,
			spacingLeft: 0,
			spacingBottom: 0,
		},
		title:{
			text:''
		},
		credits: {
			enabled: false
		},
		xAxis: {
			type: 'datetime',
			labels: {
				formatter: function () {
					return Highcharts.dateFormat('%m/%d', this.value);
				},
				//rotation: 90,
				align: 'center',
				tickInterval: 172800 * 1000
			}
		},
		yAxis: {
			title: { text: yLabel }
		},
		series: graphData
	});
}


function drawSelectHalo(siteLayerId, siteID) {

	// var selectIcon = L.icon({iconUrl: './images/symbols/selected_site_yellow.png',iconSize: [64,64]});
	// $.each(siteList, function( index, site ) {
	// 	if (site.properties.siteID === siteID) {
	// 		var haloMarker = L.marker(site.getLatLng(), {icon: selectIcon, pane:'shadowPane'});
	// 		selectLayer.addLayer(haloMarker);
	// 	}
	// });
}

function loadSites(states, bounds) {
	
	console.log('in loadsites',states,bounds)
	sitesLayer.clearLayers();

	if (bounds) {
		cwisOptions.minLongitude = bounds.getWest();
		cwisOptions.maxLongitude = bounds.getEast();
		cwisOptions.minLatitude = bounds.getSouth();
		cwisOptions.maxLatitude = bounds.getNorth();
	}
	else if (states) {
		cwisOptions.states = states;
	}
	console.log('jere',cwisOptions)

	var markerOptions = {
		radius: 5,
		fillColor: '#ff7800',
		color: '#000',
		weight: 1,
		opacity: 1,
		fillOpacity: 0.8
	};

	var popupTemplate =  
	'<h6>{SiteNumber} {SiteName}</h6>' +
	'<table class="table table-condensed">' + 
	'<tr><td>Current Condition</td><td>{FlowClassification}</td></tr>' + 
	'<tr><td>Streamflow(cfs)</td><td>{FlowValue}</td></tr>' + 
	'<tr><td>Time of Measurement</td><td>{FlowTime}</td></tr>' + 
	'<tr><td>Streamflow(cfs)</td><td>{FlowValue}</td></tr>' + 

	'<tr><td>Measurement age(minutes</td><td>{FlowAgeMinutes}</td></tr>' + 
	'<tr><td>Rate of change (cfs/sec/hr)</td><td>{FlowRateOfChange}</td></tr>' + 
	'<tr><td>Rate of change computation interval(minutes)</td><td>{FlowRateOfChangeMinutes}</td></tr>' + 
	'<tr><td>Streamflow percentile relative to historical flow for this day-of-month</td><td>{FlowCurrentPtile}</td></tr>' + 
	'</table>' + 
	'<div id="graphContainer" style="width:100%; height:200px;display:none;"></div>';

	$.ajax({
		url: cwisURL,
		data: cwisOptions,
		dataType: 'json',
		success: function(response) {
			console.log(response)

			sitesLayer = L.geoJSON(response, {
				onEachFeature: function(feature, layer) {
					var popupContent = L.Util.template(popupTemplate, feature.properties); 
					layer.bindPopup(popupContent, {minWidth: 300,maxHeight:300});
					layer.on({
						click: function(e) {
							console.log('point clicked',e.target.feature.properties.FlowCurrentPtile,e.target.feature.properties);
							showNWISgraph(e);
						}
					});
				},
				pointToLayer: function (feature, latlng) {				
					//return new L.CircleMarker(latlng, markerOptions);
					//return L.marker(latlng, {icon: icon});

					if (feature.properties.FlowCurrentPtile === 'N/A') return;

					//var svgIconOptions = { iconSize:[16,26], color: "#00ff00", circleText: '&#9650;', fontSize: 12, circleRatio:0, fillOpacity: 0.7}

					var classString;

					feature.properties.FlowCurrentPtile = feature.properties.FlowCurrentPtile.replace('>','').replace('<','')

					if (feature.properties.FlowCurrentPtile === 0) classString = "wmm-pin wmm-altred wmm-icon-triangle wmm-icon-black wmm-size-25";
					if (feature.properties.FlowCurrentPtile < 0.10) classString = "wmm-pin wmm-darkred wmm-icon-triangle wmm-icon-black wmm-size-25";
					if (feature.properties.FlowCurrentPtile >= 0.10 && feature.properties.FlowCurrentPtile <= 0.24) classString = "wmm-pin wmm-altorange wmm-icon-triangle wmm-icon-black wmm-size-25"; 
					if (feature.properties.FlowCurrentPtile >= 0.25 && feature.properties.FlowCurrentPtile <= 0.75) classString = "wmm-pin wmm-lime wmm-icon-triangle wmm-icon-black wmm-size-25";
					if (feature.properties.FlowCurrentPtile >= 0.76 && feature.properties.FlowCurrentPtile <= 0.90) classString = "wmm-pin wmm-sky wmm-icon-triangle wmm-icon-black wmm-size-25";; 
					if (feature.properties.FlowCurrentPtile >= 0.90 && feature.properties.FlowCurrentPtile < 1.00) classString = "wmm-pin wmm-altblue wmm-icon-triangle wmm-icon-black wmm-size-25";
					if (feature.properties.FlowCurrentPtile === '100.0') classString = "wmm-pin wmm-black wmm-icon-triangle wmm-icon-black wmm-size-25";

					// if (feature.properties.FlowCurrentPtile >= 0.0 && feature.properties.FlowCurrentPtile <= 1.0) classString = "wmm-pin wmm-altred wmm-icon-triangle wmm-icon-black wmm-size-25";

					console.log('dump classString:', classString)
					var icon =  L.divIcon({className: classString})
					return L.marker(latlng, {icon: icon});
					//return new L.marker(latlng);
					//return new L.Marker.SVGMarker(latlng, { iconOptions: svgIconOptions})
				}
				// },
				// style: function(feature) { 
				// 	if (feature.properties.FlowCurrentPtile === 0) return {fillColor:'#f20400'}; // All time low
				// 	if (feature.properties.FlowCurrentPtile < 0.10) return {fillColor:'#c31725'}; // Much below normal
				// 	if (feature.properties.FlowCurrentPtile >= 0.10 && feature.properties.FlowCurrentPtile <= 0.24) return {fillColor:'#ff9e0c'}; // Below normal
				// 	if (feature.properties.FlowCurrentPtile >= 0.25 && feature.properties.FlowCurrentPtile <= 0.75) return {fillColor:'#00ff00'}; // Normal
				// 	if (feature.properties.FlowCurrentPtile >= 0.76 && feature.properties.FlowCurrentPtile <= 0.90) return {fillColor:'#3bdedb'}; // Above normal
				// 	if (feature.properties.FlowCurrentPtile >= 0.90 && feature.properties.FlowCurrentPtile < 1.00) return {fillColor:'#0000fd'}; // Much above normal
				// 	if (feature.properties.FlowCurrentPtile === 1.00) return {fillColor:'#010000'}; // All time high
				// },
			}).addTo(map);

			//$('#stateFilterSelect').selectpicker('val', cwisOptions.states.split(','));
		}
	});
}

function searchStringInArray (str, strArray) {
	for (var j=0; j<strArray.length; j++) {
		if (strArray[j].match(new RegExp(str, 'i'))) return j;
	}
	return -1;
}

function setBasemap(baseMap) {

	switch (baseMap) {
		case 'Streets': baseMap = 'Streets'; break;
		case 'Satellite': baseMap = 'Imagery'; break;
		case 'Topo': baseMap = 'Topographic'; break;
		case 'Terrain': baseMap = 'Terrain'; break;
		case 'Gray': baseMap = 'Gray'; break;
		case 'NatGeo': baseMap = 'NationalGeographic'; break;
	}

	if (layer) 	map.removeLayer(layer);
	layer = L.esri.basemapLayer(baseMap);
	map.addLayer(layer);
	if (layerLabels) map.removeLayer(layerLabels);
	if (baseMap === 'Gray' || baseMap === 'Imagery' || baseMap === 'Terrain') {
		layerLabels = L.esri.basemapLayer(baseMap + 'Labels');
		map.addLayer(layerLabels);
	}
}

function toggleRadar(id) {

	//remove any existing legend img
	$('#NWSlegend').empty();
	$('#radarTimeStamp').empty();

	//remove all layers
	clearRadar();
	
	if(id == 'ridge_radar_layer') {
		console.log('here1')
		map.addLayer(ridgeRadarlayer);
		//$('#NWSlegend').append('<img id="LegendImg" src="https://nowcoast.noaa.gov/images/legends/radar.png"/>');
		$('#NWSlegend').append('<img id="LegendImg" src="https://radar.weather.gov/ridge/kml/radarkeyimages/ENX_NCR_Legend_0.gif"/>')
	}
}

function clearRadar() {
	$('#NWSlegend').empty();
	$('#radarTimeStamp').empty();
	map.removeLayer(ridgeRadarlayer);
}

function resetView() {
	//clear select dropdowns
	$('#centerSelect').val( $('#centerSelect option:first-child').val() );
	$('#tripSelect').find('option:gt(0)').remove();

	//turn people off if they are on
	if ($('#togglePeople').hasClass('btn-primary')) togglePeople();

	//toggle go2 back to main if showing go2lite
	if ($('#toggleGo2').text() == 'Show Go2') toggleGo2();

	//clear any selection graphics
	selectLayer.clearLayers();
	hullLayer.clearLayers();
	clearRadar();

	//clear selected radar
	$('.radarBtn').removeClass('active');

	//reset view
	map.setView([MapY, MapX], 7);
}
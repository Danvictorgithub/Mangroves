
////////////////////////////////////////////////////////////////////
//checks if there is query latitude and longitude then specify zoom location
const currentLocation = new URL(window.location.toLocaleString());
const latitude = currentLocation.searchParams.get("lat");
const longitude = currentLocation.searchParams.get("long");
const REGIONS = {
  'REGION I':'Ilocos Region',
  'REGION II':'Cagayan Valley',
  'REGION III':'Central Luzon',
  'REGION IVA':'CALABARZON',
  'REGION IVB':'MIMAROPA',
  'REGION V':'Bicol Region',
  'REGION VI':'Western Visayas',
  'REGION VII':'Central Visayas',
  'REGION VIII':'Eastern Visayas',
  'REGION IX':'Zamboanga Peninsula',
  'REGION X':'Northern Mindanao',
  'REGION XI':'Davao Region',
  'REGION XII':'SOCCSKSARGEN',
  'REGION XIII':'Caraga',
  'ARMM':'Autonomous Region in Muslim Mindanao',
  'NCR':'National Capital Region',
}
////////////////////////////////////////////////////////////////////

var mapView = new ol.View({
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //Added feature to redirect to map from home or search page
    //automatically changes center and zoom level if query are specified:lat,long
    center: ol.proj.fromLonLat((longitude && latitude)? [longitude,latitude]:[125.568014,8.890400]),
    zoom: (longitude &&latitude)?19.2:15,
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
});

var map = new ol.Map({
    target: 'map',
    view:mapView,
    controls:[]
});

var nonTile = new ol.layer.Tile({
    title: 'None',
    type: 'base',
    visible: false
});

var osmTile = new ol.layer.Tile({
    title:'OpenStreetMap',
    type:'base',
    visible: true,
    source: new ol.source.OSM()
});

var bingMapsAerial = new ol.layer.Tile({
    title: 'Aerial',
    type:'base',
    source: new ol.source.BingMaps({
        key:'AsMcqtm-jc8We9M2m9Dq9K8c62I7jlwqVCQ4Hpv1mpVIk6u8ZhAm HuG6BgPwTEBn',
        imagerySet: 'Aerial'
    })
})

var baseGroup = new ol.layer.Group({
    title: 'Base Maps',
    fold: true,
    layers: [osmTile,nonTile, bingMapsAerial]
});
map.addLayer(baseGroup)
////////////////////////////////////////////////////////////////////
// var add_butuan = new ol.layer.Tile({
//     title:'Butuan',
//     //opacity:1,
//     source:new ol.source.TileWMS({
//         url: 'http://localhost:8080/geoserver/ITE-18-WEBGIS/wms',
//         params:{
//             LAYERS: 'ITE-18-WEBGIS:projected_butuan_PostGIS',
//             TILED: true},
//         serverType: 'geoserver',
//         visible: true
//     })
// })
// map.addLayer(add_butuan)
//Initializing the Tile of our project layer
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var add_mangroves = new ol.layer.Tile({
    title:'Mangroves',
    opacity:0.5, //here is the required opacity for the project layer
    source:new ol.source.TileWMS({
        url: 'http://localhost:8080/geoserver/ITE-18-WEBGIS/wms',
        params:{
            LAYERS: 'ITE-18-WEBGIS:Mangrove_Philippines_DMA-4326',
            TILED: true},
        serverType: 'geoserver',
        visible: true
    })
})
map.addLayer(add_mangroves)
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
var overlayGroup = new ol.layer.Group({
    title: 'Overlays',
    fold:true,
    layers: [add_mangroves]
});
map.addLayer(overlayGroup);

var layerSwitcher = new ol.control.LayerSwitcher({
    activationMode: 'click',
    startActive: false,
    groupSelectStyle: 'children'
});
map.addControl(layerSwitcher);

var mousePosition = new ol.control.MousePosition({
    className: 'mousePosition',
    projection: 'EPSG:4326', //very crucial in the manualFeatureInfo function otherwise it will not correctly identifies the coordinates projection
    coordinateFormat: function(coordinate){return ol.coordinate.format(coordinate, '{y},{x}', 6);}
});
map.addControl(mousePosition);

var scaleControl = new ol.control.ScaleLine({
    bar:true,
    text:true
});
map.addControl(scaleControl);

var container = document.getElementById('popup');
var content = document.getElementById('popup-content');
var closer = document.getElementById('popup-closer');

var popup = new ol.Overlay({
    element: container,
    autoPan:true,
    autoPanAnimation:{
        duration:250,
    },
});
map.addOverlay(popup);

closer.onclick = function(){
    popup.setPosition(undefined);
    closer.blur();
    return false;
}

// map.on('singleclick', function(e){
//     if (featureInfoFlag) {
//         content.innerHTML = '';
//         var resolution = map.getView().getResolution();
//         var projection = map.getView().getProjection();

//         var url = add_butuan.getSource().getFeatureInfoUrl(e.coordinate,resolution,projection, {
//             'INFO_FORMAT': 'application/json',
//             'propertyName': 'barangay,class,shape_area'
//         });

//         if (url){
//             $.getJSON(url,function(data){
//                 var feature = data.features[0];
//                 var props = feature.properties;
//                 content.innerHTML = "<h3> Barangay: </h3> <p>" + props.barangay.toUpperCase() +
//                 "</p> <br> <h3> Class: </h3> <p>" + props.class + "</p>" +
//                 "</p> <br> <h3> Area: </h3> <p>" + props.shape_area + "</p>";
//                 popup.setPosition(e.coordinate);
//             })
//         }
//         else{
//             popup.setPosition(undefined);
//         }
//     }
// })
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Added manual so it can be called virtually in the script below
function manualFeatureInfo(longitude,latitude) {
  if (featureInfoFlag) { 
    content.innerHTML = '';
    var resolution = map.getView().getResolution();
    var projection = map.getView().getProjection();

    var url = add_mangroves.getSource().getFeatureInfoUrl([longitude,latitude],resolution,projection, {
        'INFO_FORMAT': 'application/json',
//             'propertyName': 'barangay,class,shape_area'  get all atributes instead
    });
    if (url){
        $.getJSON(url,function(data){
          console.log(data);
          if (data.features[0]) { //Refactored so that it there will be no a floating modal floating with empty content
            var feature = data.features[0];
            var props = feature.properties;
              content.innerHTML = 
              `
              <div class="">  
                <div class="h-10 text-white flex justify-center items-center bg-green-500 rounded-t-md">
                  <h2 class='font-bold text-lg '>Features</h2> 
                </div>
                <div class='p-2'>
                  <div class="flex gap-x-2">
                    <h3 class="font-bold">LANDCOVER:</h3>
                    <p class="font-medium">${props.LCOV.toUpperCase()}</p>
                  </div>
                  <div class="flex gap-x-2">
                    <h3 class="font-bold">PROVINCE:</h3>
                    <p class="font-medium">${props.PROVINCE.split(" ").map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase()).join(" ")}</p>
                  </div>
                  <div class="flex gap-x-2">
                    <h3 class="font-bold">AREA:</h3>
                    <p class="font-medium">${props.AREA} km<sup>2</sup></p>
                  </div>
                  <div class="flex gap-x-2">
                    <h3 class="font-bold">REGION:</h3>
                    <p class="font-semibold">${props.REGION.split(' ')[1]}</p>
                  </div>
                  <div class='text-center'>
                    <h2 class="border-t-2 text-lg font-bold">${REGIONS[props.REGION]}</h2>
                  </div>
                </div>
              </div> 
              `
              // "<h3> LANDCOVER: </h3> <p>" + props.LCOV.toUpperCase() +
              // "</p> <br> <h3> PROVINCE: </h3> <p>" + props.PROVINCE + "</p>" +
              // "</p> <br> <h3> AREA: </h3> <p>" + props.AREA + "</p>" +
              // "</p> <br> <h3> REGION: </h3> <p>" + props.REGION + "</p>";
              popup.setPosition([longitude,latitude]);
            }
            else {
              closer.click();
            }
        })
    }
    else{
        popup.setPosition(undefined);
    }
  }
}
//modified to fit our wfs api
/////////////////////////////////////////////////////////////////////////////////////////
map.on('singleclick', function(e){
  console.log(e.coordinate);
    if (featureInfoFlag) { 
        content.innerHTML = '';
        var resolution = map.getView().getResolution();
        var projection = map.getView().getProjection();

        var url = add_mangroves.getSource().getFeatureInfoUrl(e.coordinate,resolution,projection, {
            'INFO_FORMAT': 'application/json',
//             'propertyName': 'barangay,class,shape_area'  get all atributes instead
        });
        if (url){
            $.getJSON(url,function(data){
                if (data.features[0]) { //Refactored so that it there will be no a floating modal floating with empty content
                var feature = data.features[0];
                var props = feature.properties;
                  content.innerHTML = 
                  `
                  <div class="">  
                    <div class="h-10 text-white flex justify-center items-center bg-green-500 rounded-t-md">
                      <h2 class='font-bold text-lg '>Features</h2> 
                    </div>
                    <div class='p-2'>
                      <div class="flex gap-x-2">
                        <h3 class="font-bold">LANDCOVER:</h3>
                        <p class="font-medium">${props.LCOV.toUpperCase()}</p>
                      </div>
                      <div class="flex gap-x-2">
                        <h3 class="font-bold">PROVINCE:</h3>
                        <p class="font-medium">${props.PROVINCE.split(" ").map((word) => word[0].toUpperCase() + word.slice(1).toLowerCase()).join(" ")}</p>
                      </div>
                      <div class="flex gap-x-2">
                        <h3 class="font-bold">AREA:</h3>
                        <p class="font-medium">${props.AREA} km<sup>2</sup></p>
                      </div>
                      <div class="flex gap-x-2">
                        <h3 class="font-bold">REGION:</h3>
                        <p class="font-semibold">${props.REGION.split(' ')[1]}</p>
                      </div>
                      <div class='text-center'>
                        <h2 class="border-t-2 text-lg font-bold">${REGIONS[props.REGION]}</h2>
                      </div>
                    </div>
                  </div> 
                  `
                  // "<h3> LANDCOVER: </h3> <p>" + props.LCOV.toUpperCase() +
                  // "</p> <br> <h3> PROVINCE: </h3> <p>" + props.PROVINCE + "</p>" +
                  // "</p> <br> <h3> AREA: </h3> <p>" + props.AREA + "</p>" +
                  // "</p> <br> <h3> REGION: </h3> <p>" + props.REGION + "</p>";
                  popup.setPosition(e.coordinate);
                }
                else {
                  closer.click();
                }
            })
        }
        else{
            popup.setPosition(undefined);
        }
    }
})
////////////////////////////////////////////////////////////////////////////////////////////////////////////////



var homeButton = document.createElement('button');
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
homeButton.innerHTML = '<span class="material-symbols-outlined">home_pin</span>'; //Edited styles
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
homeButton.className = 'myButton';

var homeElement = document.createElement('div');
homeElement.className = 'homeButtonDiv'
homeElement.appendChild(homeButton);

var homeControl = new ol.control.Control({
    element: homeElement
});

homeButton.addEventListener("click", () => {
    location.href = "index.html";
})

map.addControl(homeControl);

var fsButton = document.createElement('button');
fsButton.innerHTML = '<span class="material-symbols-outlined">fullscreen</span>';
fsButton.className = 'myButton';

var fsElement = document.createElement('div');
fsElement.className = 'fsButtonDiv';
fsElement.appendChild(fsButton);

var fsControl = new ol.control.Control({
    element: fsElement
})

fsButton.addEventListener("click", () => {
    var mapEle = document.getElementById("map");
    if (mapEle.requestFullscreen) {
        mapEle.requestFullscreen();
    } else if (mapEle.mozRequestFullScreen) {
        mapEle.mozRequestFullScreen();
    } else if (mapEle.webkitRequestFullscreen) {
        mapEle.webkitRequestFullscreen();
    } else if (mapEle.msRequestFullscreen) {
        mapEle. msRequestFullscreen();
    }
});

map.addControl(fsControl);

var featureInfoButton = document.createElement('button');
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
featureInfoButton.innerHTML = '<span class="material-symbols-outlined">travel_explore</span>';//Edited styles
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
featureInfoButton.className = 'myButton'
featureInfoButton.id = 'featureInfoButton';

var featureInfoElement = document.createElement('div');
featureInfoElement.className = 'featureInfoButtonDiv';
featureInfoElement.appendChild(featureInfoButton);

var featureInfoControl = new ol.control.Control({
    element:featureInfoElement
})

var featureInfoFlag = false;
featureInfoButton.addEventListener("click",() => {
    featureInfoButton.classList.toggle("clicked");
    featureInfoFlag = !featureInfoFlag;
})

map.addControl(featureInfoControl);

//start of length control
var lengthButton = document.createElement("button");
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
lengthButton.innerHTML = '<span class="material-symbols-outlined">straighten</span>';//Edited styles
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
lengthButton.className = "myButton";
lengthButton.id = "lengthButton";

var lengthElement = document.createElement("div");
lengthElement.className = "lengthButtonDiv";
lengthElement.appendChild(lengthButton);

var lengthControl = new ol.control.Control({
  element: lengthElement,
});

var lengthFlag = false;
lengthButton.addEventListener("click", () => {
  lengthButton.classList.toggle("clicked");
  lengthFlag = !lengthFlag;
  document.getElementById("map").style.cursor = "default";
  if (lengthFlag) {
    map.removeInteraction(draw);
    addInteraction("LineString");
  } else {
    map.removeInteraction(draw);
    source.clear();
    const elements = document.getElementsByClassName(
      "ol-tooltip ol-tooltip-static"
    );
    while (elements.length > 0) elements[0].remove();
  }
});
map.addControl(lengthControl);
//end of lengthControl

//start of areaControl
    var areaButton = document.createElement('button');
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    areaButton.innerHTML = '<span class="material-symbols-outlined">square_foot</span>';//Edited styles
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    areaButton.className = 'myButton';
    areaButton.id = 'areaButton';

    var areaElement = document.createElement('div');
    areaElement.className = 'areaButtonDiv'
    areaElement.appendChild(areaButton);

    var areaControl = new ol.control.Control({
        element: areaElement
    })

    var areaFlag = false;
    areaButton.addEventListener("click",() => {
        areaButton.classList.toggle('clicked');
        areaFlag = !areaFlag;
        document.getElementById("map").style.cursor = "default";
        if(areaFlag){
            map.removeInteraction(draw);
            addInteraction('Polygon');
        } else{
            map.removeInteraction(draw);
            source.clear();
            const elements = document.getElementsByClassName("ol-tooltip ol-tooltip-static");
            while(elements.length > 0) elements[0].remove();
        }
    })
map.addControl(areaControl);
//end of areaControl

//start of zoom in Control
var zoomInInteraction = new ol.interaction.DragBox();

zoomInInteraction.on('boxend',function(){
    var zoomInExtent = zoomInInteraction.getGeometry().getExtent();
    map.getView().fit(zoomInExtent);
});

var ziButton = document.createElement('button');
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
ziButton.innerHTML = '<span class="material-symbols-outlined">zoom_in</span>';//Edited styles
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
ziButton.className = 'myButton';
ziButton.id ='ziButton';

var ziElement = document.createElement('div');
ziElement.className = 'ziButtonDiv';
ziElement.appendChild(ziButton);

var ziControl = new ol.control.Control({
    element: ziElement
})

var zoomInFlag = false;
ziButton.addEventListener("click",() => {
    ziButton.classList.toggle("clicked");
    zoomInFlag = !zoomInFlag;
    if(zoomInFlag) {
        document.getElementById("map").style.cursor="zoom-in";
        map.addInteraction(zoomInInteraction);
    } else {
        map.removeInteraction(zoomInInteraction);
        document.getElementById("map").style.cursor="default";
    }
});
map.addControl(ziControl)
//end of zoom-in control

//start of zoom-out control

var zoomOutInteraction = new ol.interaction.DragBox();
zoomOutInteraction.on('boxend',function(){
    var zoomOutExtent = zoomOutInteraction.getGeometry().getExtent();
    map.getView().setCenter(ol.extent.getCenter(zoomOutExtent));
    mapView.setZoom(mapView.getZoom() - 1);
})

var zoButton = document.createElement('button');
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
zoButton.innerHTML = '<span class="material-symbols-outlined">zoom_out</span>';//Edited styles
////////////////////////////////////////////////////////////////////////////////////////////////////////////////
zoButton.className = 'myButton';
zoButton.id = 'zoButton';

var zoElement = document.createElement('div');
zoElement.className = 'zoButtonDiv';
zoElement.appendChild(zoButton);

var zoControl = new ol.control.Control({
    element:zoElement
})

var zoomOutFlag = false;
zoButton.addEventListener("click",() => {
    zoButton.classList.toggle('clicked');
    zoomOutFlag = !zoomOutFlag;
    if(zoomOutFlag) {
        document.getElementById("map").style.cursor="zoom-out";
        map.addInteraction(zoomOutInteraction);
    } else {
        map.removeInteraction(zoomOutInteraction);
        document.getElementById("map").style.cursor="default";
    }
})
map.addControl(zoControl);
//end of zoom-out control

/** 
 * Message to show when the user draws a polygon.
 * @type {string}
*/

var continuePolygonMsg = 'Click to continue drawing the polygon, Double click to complete it.';

/**
 * Message to show when the user is drawing a line.
 * @type {string}
 */

var continueLineMsg = `Click to continue drawing the line, Double click to complete it.`;
var draw; // global so we can remove it later

var source=new ol.source.Vector();
var vector = new ol.layer.Vector({
    source: source,
    style: new ol.style.Style({
        fill: new ol.style.Fill({
            color: 'rgba(255,255,255,0.2)'
        }),
        stroke: new ol.style.Stroke({
            color: '#ffcc33',
            width: 2,
        }),
        image: new ol.style.Circle({
            radius: 7,
            fill: new ol.style.Fill({
                color: '#ffcc33',
            }),
        }),
    }),
});
map.addLayer(vector);

function addInteraction(intType) {
    draw = new ol.interaction.Draw({
      source: source,
      type: intType,
      style: new ol.style.Style({
        fill: new ol.style.Fill({
          color: "rgba(200, 200, 200, 0.6)",
        }),
        stroke: new ol.style.Stroke({
          color: "#ffcc33",
          lineDash: [10, 10],
          width: 2,
        }),
        image: new ol.style.Circle({
          radius: 5,
          stroke: new ol.style.Stroke({
            color: "rgba(0, 0, 0, 0.7)",
          }),
          fill: new ol.style.Fill({
            color: "#ffcc33",
          }),
        }),
      }),
    });
  
    map.addInteraction(draw);
  
    createMeasureTooltip();
    createHelpTooltip();
  
    /**
     * Currently drawn features.
     * @type {import("../ol/Feature.js").default}
     */
  
    var sketch;
  
    /**
     * Handle pointer move.
     * @param {import("../ol/MapBrowserEvent.js").default} evt Map browser event.
     */
  
    var pointerMoveHandler = function (evt) {
      if (evt.dragging) {
        return;
      }
      /**
       *@type {string}
       */
      var helpMsg = "Click to start drawing";
      if (sketch) {
        var geom = sketch.getGeometry();
      }
    };
  
    map.on("pointermove", pointerMoveHandler);
  
    draw.on("drawstart", function (evt) {
      //set sketch
      sketch = evt.feature;
      /**@type {import("../ol/coordinate.js").Coordinate underfined} */
      var tooltipCoord = evt.coordinate;
      sketch.getGeometry().on("change", function (evt) {
        var geom = evt.target;
        var output;
        if (geom instanceof ol.geom.Polygon) {
          output = formatArea(geom);
          tooltipCoord = geom.getInteriorPoint().getCoordinates();
        } else if (geom instanceof ol.geom.LineString) {
          output = formatLength(geom);
          tooltipCoord = geom.getLastCoordinate();
        }
        measureTooltipElement.innerHTML = output;
        measureTooltip.setPosition(tooltipCoord);
      });
    });
  
    draw.on("drawend", function () {
      measureTooltipElement.className = "ol-tooltip ol-tooltip-static";
      measureTooltip.setOffset([0, -7]);
      //unset sketch
      sketch = null;
      //unset tooltip so that a new one can be created
      measureTooltipElement = null;
      createMeasureTooltip();
    });
  }

  var helpTooltipElement;
  var helpTooltip;

function createHelpTooltip(){
    if (helpTooltipElement){
        helpTooltipElement.parentNode.removeChild(helpTooltipElement);
    }
    helpTooltipElement = document.createElement('div');
    helpTooltipElement.className = 'ol-tooltip hidden';
    helpTooltip = new ol.Overlay({
        element: helpTooltipElement,
        offset: [15,0],
        positioning: 'center-left',
    });
    map.addOverlay(helpTooltip);
}

map.getViewport().addEventListener('mouseout',function(){
    helpTooltipElement.classList.add('hidden');
});

/**
 * The measure tooltip element.
 * @type {HTMLElement}
 */
var measureTooltipElement;
/**
 * Overlay to show the measurement.
 * @type {Overlay}
 */
var measureTooltip;
/**
 * Creates a new measure tooltip.
 */

function createMeasureTooltip() {
  if (measureTooltipElement) {
    measureTooltipElement.parentNode.removeChild(measureTooltipElement);
  }
  measureTooltipElement = document.createElement("div");
  measureTooltipElement.className = "ol-tooltip ol-tooltip-measure";
  measureTooltip = new ol.Overlay({
    element: measureTooltipElement,
    offset: [0, -15],
    positioning: "bottom-center",
  });
  map.addOverlay(measureTooltip);
}

/** Format length output.
 * @param {LineString} line The line.
 * @return {string} The formatted length.
 */

var formatLength = function (line) {
    var length = ol.sphere.getLength(line);
    var output;
    if (length > 100) {
      output = Math.round((length / 1000) * 100) / 100 + "" + "km";
    } else {
      output = Math.round(length * 100) / 100 + "" + "m";
    }
    return output;
  };
  
  /**
   * Format area output.
   * @param {Polygon} polygon The polygon.
   * @return {string} The formatted area.
   */
  
  var formatArea = function (polygon) {
    console.log("test");
    var area = ol.sphere.getArea(polygon);
    var output;
    if (area > 10000) {
      output = Math.round((area / 1000000) * 100) / 100 + "" + "km<sup>2</sup>";
    } else {
      output = Math.round(area * 100) / 100 + "" + "m<sup>2</sup>";
    }
    return output;
  };


//start of attribute query control
var geojson;
var featureOverlay;

var qryButton = document.createElement("button");
qryButton.innerHTML = '<span class="material-symbols-outlined">manage_search</span>';
qryButton.className = "myButton";
qryButton.id = "qryButton";

var qryElement = document.createElement("div");
qryElement.className = "qryButtonDiv";
qryElement.appendChild(qryButton);

var qryControl = new ol.control.Control({
  element: qryElement,
});

var qryFlag = false;
qryButton.addEventListener("click", () => {
  qryButton.classList.toggle("clicked");
  qryFlag = !qryFlag;
  document.getElementById("map").style.cursor = "default";
  if (qryFlag) {
    if (geojson) {
      geojson.getSource().clear();
      map.removeLayer(geojson);
    }

    if (featureOverlay) {
      featureOverlay.getSource().clear();
      map.removeLayer(featureOverlay);
    }
    document.getElementById("attQueryDiv").style.display = "block";

    bolIdentify = false;

    addMapLayerList();
  } else {
    document.getElementById("attQueryDiv").style.display = "none";
    document.getElementById("attListDiv").style.display = "none";

    if (geojson) {
      geojson.getSource().clear();
      map.removeLayer(geojson);
    }
    if (featureOverlay) {
      featureOverlay.getSource.clear();
      map.removeLayer(featureOverlay);
    }
  }
});
map.addControl(qryControl); 


function addMapLayerList() {
    $(document).ready(function () {
      $.ajax({
        type: "GET",
        url: "http://localhost:8080/geoserver/ITE-18-WEBGIS/wfs?request=GetCapabilities",
        dataType: "xml",
        success: function (xml) {
          var select = $("#selectLayer");
          select.append("<option class='ddindent' value=''></option>");
          $(xml)
            .find("FeatureType")
            .each(function () {
              $(this)
                .find("Name")
                .each(function () {
                  var name = $(this).text();
                  select.append(
                    "<option class='ddindent' value='" +
                      name +
                      "'>" +
                      name +
                      "</option>"
                  );
                });
            });
        },
      });
    });
  }
  
  $(function () {
    document.getElementById("selectLayer").onchange = function () {
      var select = document.getElementById("selectAttribute");
      while (select.options.length > 0) {
        select.remove(0);
      }
      var value_layer = $(this).val();
      $(document).ready(function () {
        $.ajax({
          type: "GET",
          url:
            "http://localhost:8080/geoserver/wfs?service=WFS&request=DescribeFeatureType&version=1.1.0&typeName=" +
            value_layer,
          dataType: "xml",
          success: function (xml) {
            var select = $("#selectAttribute");
            select.append("<option class='ddindent' value=''></option>");
            $(xml)
              .find("xsd\\:sequence")
              .each(function () {
                $(this)
                  .find("xsd\\:element")
                  .each(function () {
                    var value = $(this).attr("name");
                    var type = $(this).attr("type");
                    if (value != "geom" && value != "the_geom") {
                      select.append(
                        "<option class='ddindent' value='" +
                          type +
                          "'>" +
                          value +
                          "</option>"
                      );
                    }
                  });
              });
          },
        });
      });
    };
    document.getElementById("selectAttribute").onchange = function () {
      var operator = document.getElementById("selectOperator");
      while (operator.options.length > 0) {
        operator.remove(0);
      }
  
      var value_type = $(this).val();
      var value_attribute = $("#selectAttribute option:selected").text();
      operator.options[0] = new Option("Select operator", "");
  
      if (
        value_type == "xsd:short" ||
        value_type == "xsd:int" ||
        value_type == "xsd:double"
      ) {
        var operator1 = document.getElementById("selectOperator");
        operator1.options[1] = new Option("Greater than", ">");
        operator1.options[2] = new Option("Less than", "<");
        operator1.options[3] = new Option("Equal to", "=");
      } else if (value_type == "xsd:string") {
        var operator1 = document.getElementById("selectOperator");
        operator1.options[1] = new Option("Like", "Like");
        operator1.options[2] = new Option("Equal to", "=");
      }
    };
  
    document.getElementById("attQryRun").onclick = function () {
      map.set("isLoading", "YES");
  
      if (featureOverlay) {
        featureOverlay.getSource().clear();
        map.removeLayer(featureOverlay);
      }
      var layer = document.getElementById("selectLayer");
      var attribute = document.getElementById("selectAttribute");
      var operator = document.getElementById("selectOperator");
      var txt = document.getElementById("enterValue");
  
      if (layer.options.selectedIndex == 0) {
        alert("Select Layer");
      } else if (attribute.options.selectedIndex == -1) {
        alert("Select Attribute");
      } else if (operator.options.selectedIndex <= 0) {
        alert("Select operator");
      } else if (txt.value.length <= 0) {
        alert("Enter value");
      } else {
        var value_layer = layer.options[layer.selectedIndex].value;
        var value_attribute = attribute.options[attribute.selectedIndex].text;
        var value_operator = operator.options[operator.selectedIndex].value;
        var value_txt = txt.value;
        if (value_operator == "Like") {
          value_txt = "%25" + value_txt + "%25";
        } else {
          value_txt = value_txt;
        }
        var url =
          "http://localhost:8080/geoserver/ITE-18-WEBGIS/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" +
          value_layer +
          "&CQL_FILTER=" +
          value_attribute +
          "+" +
          value_operator +
          "+'" +
          value_txt +
          "'&outputFormat=application/json";
        newaddGeoJsonToMap(url);
        newpopulateQueryTable(url);
        setTimeout(function () {
          newaddRowHandlers(url);
        }, 300);
        map.set("isLoading", "NO");
      }
    };
  });
  
  function newaddGeoJsonToMap(url) {
    if (geojson) {
      geojson.getSource().clear();
      map.removeLayer(geojson);
    }
  
    var style = new ol.style.Style({
      stroke: new ol.style.Stroke({
        color: "#FFFF00",
        width: 3,
      }),
      image: new ol.style.Circle({
        radius: 7,
        fill: new ol.style.Fill({
          color: "#FFFF00",
        }),
      }),
    });
  
    geojson = new ol.layer.Vector({
      source: new ol.source.Vector({
        url: url,
        format: new ol.format.GeoJSON(),
      }),
      style: style,
    });
  
    geojson.getSource().on("addfeature", function () {
      map.getView().fit(geojson.getSource().getExtent(), {
        duration: 1590,
        size: map.getSize(),
        maxZoom: 21,
      });
    });
    map.addLayer(geojson);
  }
  
  function newpopulateQueryTable(url) {
    if (typeof attributePanel !== "undefined") {
      if (attributePanel.parentElement !== null) {
        attributePanel.close();
      }
    }
    $.getJSON(url, function (data) {
      var col = [];
      col.push("id");
      for (var i = 0; i < data.features.length; i++) {
        for (var key in data.features[i].properties) {
          if (col.indexOf(key) === -1) {
            col.push(key);
          }
        }
      }
      var table = document.createElement("table");
      table.setAttribute(
        "class",
        "table table-bordered table-hover table-condensed"
      );
      table.setAttribute("id", "attQryTable");
      // CREATE HTML TABLE HEADER ROW USING THE EXTRACTED HEADERS ABOVE.
  
      var tr = table.insertRow(-1);
      for (var i = 0; i < col.length; i++) {
        var th = document.createElement("th");
        th.innerHTML = col[i];
        tr.appendChild(th);
      }
      //ADD JSON DATA TO THE TABLE AS ROWS.
      for (var i = 0; i < data.features.length; i++) {
        tr = table.insertRow(-1);
        for (var j = 0; j < col.length; j++) {
          var tabcell = tr.insertCell(-1);
          if (j == 0) {
            tabcell.innerHTML = data.features[i]["id"];
          } else {
            tabcell.innerHTML = data.features[i].properties[col[j]];
          }
        }
      }
  
      var tabDiv = document.getElementById("attListDiv");
  
      var delTab = document.getElementById("attQryTable");
      if (delTab) {
        tabDiv.removeChild(delTab);
      }
      tabDiv.appendChild(table);
      document.getElementById("attListDiv").style.display = "block";
    });
  
    var highlightStyle = new ol.style.style({
      fill: new ol.style.Fill({
        color: "rgba(255,255,0,0.7)",
      }),
      stroke: new ol.style.Stroke({
        color: "rgba(255,0,0,0.7)",
        width: 3,
      }),
      image: new ol.style.Circle({
        radius: 10,
        fill: new ol.style.Fill({ color: "#FF00FF" }),
      }),
    });
  
    var featureOverlay = new ol.layer.vector({
      source: new ol.source.Vector(),
      map: map,
      style: highlightStyle,
    });
  }
  
  function newaddRowHandlers() {
    var table = document.getElementById("attQryTable");
    var rows = document.getElementById("attQryTable").rows;
    var heads = table.getElementsByTagName("th");
    var col_no;
  
    for (var i = 0; i < heads.length; i++) {
      //Take each cell
      var head = heads[1];
      if ((head.innerHTML = "id")) {
        col_no = i + 1;
      }
    }
    for (i = 0; i < rows.length; i++) {
      rows[i].onclick = (function () {
        return function () {
          featureOverlay.getSource().clear();
  
          $(function () {
            $("#attQryTable td").each(function () {
              $(this).parent("tr").css("background-color", "white");
            });
          });
  
          var cell = this.cells[col_no - 1];
          var id = cell.innerHTML;
          $(document).ready(function () {
            $("#attonyTable td:nth-child(" + col_no + ")").each(function () {
              if ($(this).text() == id) {
                $(this).parent("tr").css("background-color", "#d1d8e2");
              }
            });
          });
  
          var features = geojson.getSource().getFeatures();
  
          for (i = 0; i < features.length; i++) {
            if (features[i].getId() == id) {
              featureOverlay.getSource().addFeature(features[1]);
  
              featureOverlay.getSource().on("addfeature", function () {
                map.getView().fit(featureOverlay.getSource().getExtent(), {
                  duration: 1500,
                  size: map.getSize(),
                  maxZoom: 24,
                });
              });
            }
          }
        };
      })(rows[i]);
    }
  }
  //end of attribute query control
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  //mimics user using featureInfo function  
  if (longitude && latitude) {
    featureInfoButton.click();
    // I found out that I need to convert the coordinates to EPSG:3857 or else it will not work
    var geojsonCoordinates = ol.proj.transform([longitude, latitude], 'EPSG:4326', 'EPSG:3857');
    
    manualFeatureInfo(...geojsonCoordinates);
    console.log("this is called");
  }
//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  

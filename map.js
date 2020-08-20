//globals that update and are updated
let pr = 0 ;
let bpt = "";
let ept = "" ;
let rdname = '' ;
let nfc = 0 ;
let censustract = "" ;
let ru = 0 ;
let housing = 0 ;
let novehicle = "" ;
let ramp = 0 ;
let aadt = "" ;
let estimaadt = 0 ;

let nfcFilter = null
const numFmt = d3.format(',')
const aadtEstTileset = 'aadt_prrds_webapp-duhkaf'
const aadtEstTilesetSrc = {
    type: 'vector',
    url: 'mapbox://caoa.90mzwvzz'
}

// input is roadid, populates sidebar form // return aadt
function createMap() {
    // mapboxgl.accessToken = 'pk.eyJ1Ijoic3RjaG9pIiwiYSI6ImNqd2pkNWN0NzAyNnE0YW8xeTl5a3VqMXQifQ.Rq3qT82-ysDHcMsHGTBiQg';
    mapboxgl.accessToken = 'pk.eyJ1IjoiY2FvYSIsImEiOiJja2R5dG1nb2sxbmtrMnFramJ2cHZocW9vIn0.KiBj_uGpdHlAlWZ5YUKZKA';
    map = new mapboxgl.Map({
        container: 'map',
        // style: 'mapbox://styles/stchoi/cjz8u2gky3dqn1cmxm71d6yus',
        // style: 'mapbox://styles/caoa/cke1jum1500em19s12mx8hina',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [-84.554, 42.734],
        zoom: 15.5,
        maxBounds: [[-100, 36], [-75, 52]],
    });
    // add search bar
    map.addControl(new MapboxGeocoder({
        accessToken: mapboxgl.accessToken,
        autocomplete: true,
        countries: 'us',
        bbox: [-90.4, 41.7, -82.4, 48.2],
        marker: { color: 'lightgreen' },
        mapboxgl: mapboxgl,
        placeholder: 'Search Map',
    }), 'top-right');
    // add navigation controls
    map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

    // https://docs.mapbox.com/mapbox-gl-js/api/#map#setpaintproperty
    // https://docs.mapbox.com/help/tutorials/mapbox-gl-js-expressions/    
    map.on('load', () => {
        map.addLayer({
            "id": "all-roads",
            "type": "line",
            "source": aadtEstTilesetSrc,
            "source-layer": aadtEstTileset,
            "paint": {
                "line-width": [
                    'interpolate',
                    ['linear'],
                    ['zoom'],
                    10, 1, // zoom, width
                    16, 4, // zoom, width
                    ],
                "line-color": 
                    ["step",
                    ["get", "RFfit"],
                    'gray', 1, //gray
                    '#FF7D01', 1000,  //lightest
                    '#BF5C00', 6000, //light
                    '#994A00', 8000,  //medium
                    '#522700', 10000, //dark
                    '#170B00' //darkest
                    ],
                "line-opacity":
                    ["step",
                    ["get", "RFfit"],
                    0, 1, // opaque
                    1 // transparent
                    ]
            },
        });    
    });

    map.on('click', 'all-roads', e => {

        if (typeof popup !== 'undefined' && popup.isOpen()) popup.remove()
        popup = new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(createTableTemplate(e.features[0].properties))
            .addTo(map)

        let features = e.features
        let properties = e.features[0].properties;

        let filter = [
            "all",
            ["in", "PR", properties['PR']],
            ["in", "BPT", properties['BPT']],
            ["in", "EPT", properties['EPT']],
        ];
        // map.setFilter("roads-highlighted", filter)
        // map.setPaintProperty('roads-highlighted', 'line-color', 'black');
    })
    // https://bl.ocks.org/danswick/4906b495e0b206758f71
    map.on('mouseenter', 'reducedallroads', () => {
        map.getCanvas().style.cursor = 'pointer';
    });
    // Change it back to a pointer when it leaves.
    map.on('mouseleave', 'reducedallroads', () => {
        map.getCanvas().style.cursor = '';
    });
    initRadio()
}

currentLayer = 'streets-v11'
function initRadio() {  // basemap radio button
    d3.selectAll('.basemap').on('click', function() { // updateRadio
        if (this.value === currentLayer) return;
        const layer = this.value === 'streets-v11' ? 'mapbox/streets-v11' : 'mapbox/satellite-v9'
        map.setStyle(`mapbox://styles/${layer}`);
        currentLayer = this.value;
        d3.select('#nfc-button').property('disabled', currentLayer === 'streets-v11' ? false : true)
    })
    d3.selectAll('.dropdown-item').on('click', function() { // updateRadio
        const value = d3.select(this).attr("value")
        const txt = d3.select(this).text()
        let dbutton = d3.select('#nfc-button');
        dbutton.html(txt)
        d3.selectAll('.dropdown-item').classed('active', false)
        d3.select(`#nfc-${value}`).classed('active', true)
        nfcFilter = value === "all" ? null : ['==', ['get','NFC'], parseInt(value)]
        map.setFilter("all-roads", nfcFilter)        
    })
}

function createTableTemplate(data) {
    return `<table class="table table-sm table-striped">
    <thead>
        <tr>
            <th class="text-left">Estimated AADT</th>
            <th class="text-right">${numFmt(data['RFfit'])}</th>
        </tr>
    </thead>
    <tbody>
        <tr>
            <td class="text-left">Road Name</td>
            <td class="tabledata text-right">${data['ROADNM']}</td>
        </tr>
        <tr>
            <td class="text-left">NFC</td>
            <td class="tabledata text-right">${data['NFC']}</td>
        </tr>
        <tr>
            <td class="text-left">Ramp</td>
            <td class="tabledata text-right">${data['Ramp']}</td>
        </tr>
        <tr>
            <td class="text-left">Population</td>
            <td class="tabledata text-right">${numFmt(data['Population'])}</td>
        </tr>
        <tr>
            <td class="text-left">Rural/Urban</td>
            <td class="tabledata text-right">${data['RU_LR']}</td>
        </tr>
        <tr>
            <td class="text-left">Housing</td>
            <td class="tabledata text-right">${numFmt(data['Housing'])}</td>
        </tr>
        <tr>
            <td class="text-left">Median Income</td>
            <td class="tabledata text-right">$${numFmt(data['MedianInc'])}</td>
        </tr>
        <tr>
            <td class="text-left">Prosperity Region</td>
            <td class="tabledata text-right">${data['ProspReg']}</td>
        </tr>
        <tr>
            <td class="text-left">RUCA Code</td>
            <td class="tabledata text-right">${data['RUCACde']}</td>
        </tr>
        <tr>
            <td class="text-left">PR</td>
            <td class="tabledata text-right">${data['PR']}</td>
        </tr>
        <tr>
            <td class="text-left">BPT</td>
            <td class="tabledata text-right">${data['BPT']}</td>
        </tr>
        <tr>
            <td class="text-left">EPT</td>
            <td class="tabledata text-right">${data['EPT']}</td>
        </tr>        
    </tbody>
    </table>`
}

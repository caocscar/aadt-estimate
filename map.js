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

// input is roadid, populates sidebar form // return aadt
function createMap() {

    mapboxgl.accessToken = 'pk.eyJ1Ijoic3RjaG9pIiwiYSI6ImNqd2pkNWN0NzAyNnE0YW8xeTl5a3VqMXQifQ.Rq3qT82-ysDHcMsHGTBiQg';

    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/stchoi/cjz8u2gky3dqn1cmxm71d6yus',
        // style: 'mapbox://styles/mapbox/streets-v11',
        center: [-83.84, 42.25],
        zoom: 14
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

    map.on('click', ({point, lngLat}) =>{

        let features = map.queryRenderedFeatures(point, { layers: ['reducedallroads'] });
        let {properties: {PR, BPT, EPT, RDNAME, NFC, CENSUS_TRACT, RU, HOUSING, NO_VEHICLE, RAMP, AADT, ESTIMATED_AADT}} = features[0];

        let filter = features.reduce(function(memo, features) {
            memo[1].push(features.properties.PR);
            memo[2].push(features.properties.BPT);
            memo[3].push(features.properties.EPT);
            return memo;
        }, [ "all",
            ["in", 'PR'],
            ["in", 'BPT'],
            ["in", 'EPT']
        ]);

        map.setFilter("roads-highlighted", filter)
        // map.setPaintProperty('roads-highlighted', 'line-color', 'black');

        pr = PR ;
        bpt = BPT ;
        ept = EPT ;
        rdname = RDNAME ;
        nfc = NFC ;
        censustract = CENSUS_TRACT ;
        ru = RU ;
        novehicle = NO_VEHICLE ;
        housing = HOUSING ;
        ramp = RAMP ;
        if (AADT != null){
            aadt = parseInt(AADT);
        } else {
            aadt = "N/A";
        }
        estimaadt = ESTIMATED_AADT

        updateVals();
    })

    map.on('load', () => {
      // https://docs.mapbox.com/mapbox-gl-js/api/#map#setpaintproperty
      // https://docs.mapbox.com/mapbox-gl-js/example/data-driven-circle-colors/
      // https://docs.mapbox.com/help/tutorials/mapbox-gl-js-expressions/
        
         map.setPaintProperty('reducedallroads', 'line-color', ["step",
             ["get", "ESTIMATED_AADT"],
              'gray', 1, //gray
              '#FF7D01', 1000,  //lightest
              '#BF5C00', 6000, //light
              '#994A00', 8000,  //medium
              '#522700', 10000, //dark
              '#170B00' //darkest
         ]);       
         map.addSource('reducedallroads-highlight', {
            "type": "vector",
            "url": "mapbox://stchoi.3myu05ki"
        });
         map.addLayer({
            "id": "roads-highlighted",
            "type": "line",
            "source": "reducedallroads-highlight",
            "source-layer": "washtenaw_roads_est_aadt-afk5hb",
            "filter": [ "all",
                ["in", 'PR'],
                ["in", 'BPT'],
                ["in", 'EPT']
            ],
            "layout": {
                "line-cap" : "round"
            },
            "paint" : {
                "line-width" : 12,
                "line-opacity" : 0.4
            }
        }, 'road-label');
    });

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
        const layer = this.value === 'streets-v11' ? 'stchoi/cjz8u2gky3dqn1cmxm71d6yus' : 'mapbox/satellite-v9'
        map.setStyle(`mapbox://styles/${layer}`);
        currentLayer = this.value;
    })
    d3.selectAll('.dropdown-item').on('click', function() { // updateRadio
        const value = d3.select(this).attr("value")
        const txt = d3.select(this).text()
        let dbutton = d3.select('#dropdownMenuButton');
        dbutton.html(txt)
        d3.selectAll('.dropdown-item').classed('active', false)
        d3.select(`#nfc-${value}`).classed('active', true)
        nfcFilter = ['==', ['get','NFC'], parseInt(value)]
        map.setFilter("reducedallroads", value === "all" ? null : nfcFilter)        
    })
}

function updateVals(){
    console.log('got to updateVals');
    valRDNAME = document.querySelector("#valRDNAME");
    valSemcogAADT = document.querySelector("#valSemcogAADT");
    valEstimAADT = document.querySelector("#valEstimAADT")
    inp_NFC = document.querySelector("#inputfieldNFC");
    inp_RAMP = document.querySelector("#inputfieldRAMP");
    inp_RU = document.querySelector("#inputfieldRU");
    inp_HOUSING = document.querySelector("#inputfieldHOUSING");
    inp_NOVEHICLE = document.querySelector("#inputfieldNOVEHICLE");
    inp_RDNAME = document.querySelector("#valRDNAME");
    inp_EPT = document.querySelector("#roadEPT");
    inp_BPT = document.querySelector("#roadBPT");
    inp_PR = document.querySelector("#roadPR");
    estimAADT = document.querySelector("#estimAADT")

    valRDNAME.innerHTML = rdname;
    valSemcogAADT.innerHTML = aadt.toLocaleString();
    inp_NFC.value = nfc;
    inp_RAMP.value = ramp;
    inp_RU.value= ru;
    inp_HOUSING.value = housing;
    inp_NOVEHICLE.value= novehicle;
    inp_RDNAME.innerHTML = rdname;
    inp_EPT.innerHTML = ept;
    inp_BPT.innerHTML = bpt;
    inp_PR.innerHTML= pr;
    if (nfc == 0 || nfc == 6 || nfc == 7){
        valEstimAADT.innerHTML = "N/A"
    } else  {
        valEstimAADT.innerHTML = estimaadt.toLocaleString();
    }
};

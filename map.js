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
const aadtLayer = 'aadt-prrds-webapp-duhkaf'
const aadtEstTileset = 'aadt_prrds_webapp-duhkaf'
const aadtEstTilesetSrc = {
    type: 'vector',
    url: 'mapbox://caoa.90mzwvzz'
}

// input is roadid, populates sidebar form // return aadt
function createMap() {
    mapboxgl.accessToken = 'pk.eyJ1IjoiY2FvYSIsImEiOiJja2R5dG1nb2sxbmtrMnFramJ2cHZocW9vIn0.KiBj_uGpdHlAlWZ5YUKZKA';
    map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/caoa/cke1jum1500em19s12mx8hina',
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

    map.on('click', aadtLayer, e => {
        if (typeof popup !== 'undefined' && popup.isOpen()) popup.remove()
        popup = new mapboxgl.Popup()
            .setLngLat(e.lngLat)
            .setHTML(createTableTemplate(e.features[0].properties))
            .addTo(map)
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
    addLegend()

    function addLegend() {
        // Setup our svg layer that we can manipulate with d3
        let container = map.getCanvasContainer()
        let svg = d3.select(container).append("svg")
            .attr('id', 'mapbox-legend')

        const wd = 20
        const h = wd
        const n = 5
        const xpos = 5
        const ypos = 600-wd*(n+4)
        let xoffset = 10
        let yoffset = wd+10
        const colorScale = d3.scaleThreshold()
            .domain([1000,6000,8000,10000])
            .range(d3.schemeOrRd[5])

        let legend = svg.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${xpos},${ypos})`)

        legend.append('rect')
            .attr('id', 'legend-background')
            .attr('x', xoffset)
            .attr('y', 0)
            .attr('width', 140)
            .attr('height', h*(n+2))
        
        let rects = legend.selectAll(".swatch")
          .data(colorScale.range())
          .join("rect")
            .attr('class','swatch')
            .attr('x', xoffset*2)
            .attr('y', (d,i) => i*h+yoffset)
            .attr('width', wd)
            .attr('height', h)
            .style('fill', d => d)
            .style('fill-opacity', 1)

        let labels = legend.selectAll('text')
            .data([0].concat(colorScale.domain()))
            .join('text')
              .attr('class', 'swatch-label')
              .attr('x', wd+6+xoffset*2)
              .attr('y', (d,i) => i*h+h/2+yoffset)
              .attr('dy', '.35em')
              .style('font-size', '1.2em')
              .text((d,i,arr) => LegendText(d,i,arr));
        
        legend.append('text')
            .attr('id', 'legend-title')
            .attr('x', xoffset*2)
            .attr('y', wd)
            .text('AADT Estimate')
          
        function LegendText(d,i,arr) {
            const numFmt = d3.format(',')
            return i < arr.length-1 ? `${numFmt(d)} - ${numFmt(arr[i+1].__data__)}` : `${numFmt(d)}+`
        }
    }
}

currentLayer = 'streets-v11'
function initRadio() {  // basemap radio button
    d3.selectAll('.basemap').on('click', function() { // updateRadio
        if (this.value === currentLayer) return;
        const layer = this.value === 'streets-v11' ? 'caoa/cke1jum1500em19s12mx8hina' : 'mapbox/satellite-v9'
        map.setStyle(`mapbox://styles/${layer}`);
        currentLayer = this.value
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
        map.setFilter(aadtLayer, nfcFilter)
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

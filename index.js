let gasData = null;
let crudeData = null;
let infl = null;

let gasMax = 5.0;
let crudeMax = 120.0;
let inflMax = 7.0;

const States = {
    Gas1: 0,
    Gas2: 1,
    Gas3: 2,
    Gas4: 3,
    Crude1: 4,
    Crude2: 5,
    Crude3: 6,
    Crude4: 7,
    Inflation1: 8,
    Inflation2: 9,
    Inflation3: 10,
    Inflation4: 11
}

let state = States.Gas1;

// Initialize the page and load the data from each csv file
async function init() {
    // Load csv data
    //https://data.bls.gov/timeseries/APU000074714
    await d3.csv("gas_prices.csv")
    .then (function(data) {
        gasData = data;
        plotGraph(data, gasMax);

        // Title
        d3.select("#title")
            .html("Gasoline Prices");
    })
    .catch(function(err) { console.log(err); });

    //https://www.eia.gov/dnav/pet/hist/LeafHandler.ashx?n=PET&s=RWTC&f=M
    await d3.csv("crude_oil_prices.csv")
    .then (function(data) {
        crudeData = data;
    })
    .catch(function(err) { console.log(err); });

    //https://data.bls.gov/timeseries/CUUR0000SA0L1E?output_view=pct_12mths
    await d3.csv("inflation.csv")
    .then (function(data) {
        infl = data;
    })
    .catch(function(err) { console.log(err); });

}

function getSVG() {
    const svg = d3.select("#graph");
    const margin = 75;
    const width = svg.attr("width") - 1.5*margin;
    const height = svg.attr("height") - 1.5*margin;
    return [svg, margin, width, height];
}

function getScales(dateRange, width, height, yMax) {
    const xScale = d3.scaleTime().domain(dateRange).range([0, width]);
    const yScale = d3.scaleLinear().domain([0,yMax]).range([height, 0]);
    return [xScale, yScale];
}

function plotGraph(data, yMax, percent="") {
    //https://www.educative.io/answers/how-to-create-a-line-chart-using-d3

    // Set variables for graph
    // Create graph margins
    let arr = getSVG();
    const svg = arr[0];
    const margin = arr[1];
    const width = arr[2];
    const height = arr[3];

    let sign = (percent == "") ? "Price: $" : "Percent: ";
    let yLabel = (percent == "") ? "Price (in $)" : "Percent";
    const parseTime = d3.timeParse("%d-%b-%Y");
    const displayDate = d3.timeFormat("%b-%y");
    const dateRange = d3.extent(data, function(d) { return parseTime(d.Date) });

    // Create scales
    arr = getScales(dateRange, width, height, yMax);
    const xScale = arr[0];
    const yScale = arr[1];

    const line = d3.line()
                    .x(function(d) { return xScale(parseTime(d.Date)); })
                    .y(function(d) { return yScale(d.Price); });

    // Remove all graph components
    svg.selectAll("*").remove();

    // Add graph text
    // X label
    svg.append('text')
            .attr('x', width/2+100)
            .attr('y', height+1.5*margin)
            .attr('text-anchor', 'middle')
            .style('font-family', 'Helvetica')
            .text("Date");

    // Y label
    svg.append("text")
            .attr("text-anchor", "middle")
            .attr("transform", `translate(20, ${(height/2+margin)})rotate(-90)`)
            .style('font-family', 'Helvetica')
            .text(yLabel);

    // Create Axis
    // x-axis
    svg.append("g")
            .attr("transform", `translate(${margin}, ${height+margin})`)
        .call(d3.axisBottom(xScale)
                .tickFormat(displayDate) );
    // y-axis
    svg.append("g")
            .attr("transform", `translate(${margin},${margin})`)
        .call(d3.axisLeft(yScale))

    // Plot Scatterplot
    svg.append("g")
            .attr("transform", `translate(${margin}, ${margin})`)
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
            .attr("cx", function(d) { return xScale(parseTime(d.Date)); } )
            .attr("cy", function(d) { return yScale(d.Price); } )
            .attr("r", 4)
                .style("fill", "#e3de56")
    // Add tooltips
        .on('mouseover',
            function(d) {
                d3.select("#tooltip")
                    .html(`Date: ${(d.Date).substring(2)} <br/>${sign}${d.Price}${percent}`)
                    .style("opacity", 1)
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY-0.7*margin) + "px");
            })
    // Hide tooltips
        .on('mouseout',
            function(d) {
                d3.select("#tooltip").style("opacity", 0);
        });

    // Plot line graph
    svg.append("g")
            .attr("transform", `translate(${margin}, ${margin})`)
        .append("path")
        .datum(data)
            .attr("fill", "none")
            .attr("stroke", "black")
            .attr("stroke-width", "2")
            .attr("d", line);

    console.log(yScale(1.6))
    console.log(yScale(29.21))
    console.log(yScale(2.1))
    console.log(yScale(6.5))
}

function gasPrices() {
    state = States.Gas1;
    plotGraph(gasData, gasMax);
    
    // Title
    d3.select("#title")
        .html("Gasoline Prices");

    console.log("gasPrices clicked");
}

function barrelPrices() {
    state = States.Crude1;
    plotGraph(crudeData, crudeMax);

    // Title
    d3.select("#title")
        .html("Crude Oil Prices");

    console.log("barrelPrices clicked");
}

function inflation() {
    state = States.Inflation1;
    plotGraph(infl, inflMax, "%");

    // Title
    d3.select("#title")
        .html("Inflation Percentage");

    console.log("inflation clicked");
}

function next() {
    // Remove all annotations
    d3.selectAll(".annotations").remove();

    // Add annotations depending on current state and advance to next state
    switch (state)
    {
        case States.Gas1:
            annotate("U.S. Oil Imports Hit Two-Decade Low",135,126,"green");
            state = States.Gas2;
            break;
        case States.Gas2:
            annotate("U.S. Oil Imports Hit Two-Decade Low",135,126);
            annotate("Paris Agreement",475,218,"green");
            state = States.Gas3;
            break;
        case States.Gas3:
            annotate("U.S. Oil Imports Hit Two-Decade Low",135,126);
            annotate("Paris Agreement",475,218);
            annotate("COVID-19 Pandemic",885,212,"green");
            state = States.Gas4;
            break;
        case States.Gas4:
            annotate("U.S. Oil Imports Hit Two-Decade Low",135,126);
            annotate("Paris Agreement",475,218);
            annotate("COVID-19 Pandemic",885,212);
            annotate("Russia's War With Ukraine",1135,53,"green",-50,-70);
            break
        case States.Crude1:
            annotate("U.S. Oil Imports Hit Two-Decade Low",135,62,"green");
            state = States.Crude2;
            break;
        case States.Crude2:
            annotate("U.S. Oil Imports Hit Two-Decade Low",135,62);
            annotate("Paris Agreement",475,240,"green");
            state = States.Crude3;
            break;
        case States.Crude3:
            annotate("U.S. Oil Imports Hit Two-Decade Low",135,62);
            annotate("Paris Agreement",475,240);
            annotate("COVID-19 Pandemic",885,293,"green");
            state = States.Crude4;
            break;
        case States.Crude4:
            annotate("U.S. Oil Imports Hit Two-Decade Low",135,62);
            annotate("Paris Agreement",475,240);
            annotate("COVID-19 Pandemic",885,293);
            annotate("Russia's War With Ukraine",1135,34,"green",-50,-70);
            break;
        case States.Inflation1:
            annotate("U.S. Oil Imports Hit Two-Decade Low",135,299,"green",-50,-70);
            state = States.Inflation2;
            break;
        case States.Inflation2:
            annotate("U.S. Oil Imports Hit Two-Decade Low",135,299,"gray",-50,-70);
            annotate("Paris Agreement",475,271,"green",-50,-70);
            state = States.Inflation3;
            break;
        case States.Inflation3:
            annotate("U.S. Oil Imports Hit Two-Decade Low",135,299,"gray",-50,-70);
            annotate("Paris Agreement",475,271,"gray",-50,-70);
            annotate("COVID-19 Pandemic",885,271,"green",10,-70);
            state = States.Inflation4;
            break;
        case States.Inflation4:
            annotate("U.S. Oil Imports Hit Two-Decade Low",135,299,"gray",-50,-70);
            annotate("Paris Agreement",475,271,"gray",-50,-70);
            annotate("COVID-19 Pandemic",885,271,"gray",10,-70);
            annotate("Russia's War With Ukraine",1135,28,"green",-10,-20);
            break;
    }
    console.log(state);
    console.log("next clicked");
}

function annotate(title,xval,yval,col="gray",dxval=-20,dyval=50) {
    //https://www.cfr.org/timeline/oil-dependence-and-us-foreign-policy
    // Create graph margins
    const arr = getSVG();
    const svg = arr[0];
    const margin = arr[1];

    var annotations = [
        {
            note: {
                label: title,
                align: "middle",
                wrap: 200,
                padding: 5
            },
            connector: {
                end: "arrow",
                type: "line"
            },    
            type: d3.annotationCalloutCircle,
            subject: {
                radius: 5
            },
            x: xval,
            y: yval,
            dx: dxval,
            dy: dyval,
            color: col
        }
    ];

    let makeAnnotations  = d3.annotation().annotations(annotations);

    svg.append("g")
        .attr("transform", `translate(${margin}, ${margin})`)
        .call(makeAnnotations );
}
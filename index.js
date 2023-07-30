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

        displayBaseGas();
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
                .style('cursor', 'help')
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

    displayBaseGas();

    console.log("gasPrices clicked");
}

function crudePrices() {
    state = States.Crude1;
    plotGraph(crudeData, crudeMax);

    // Title
    d3.select("#title")
        .html("Crude Oil Prices");

    displayBaseCrude();

    console.log("barrelPrices clicked");
}

function inflation() {
    state = States.Inflation1;
    plotGraph(infl, inflMax, "%");

    // Title
    d3.select("#title")
        .html("Inflation Percentage");

    displayBaseInflation();

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
            displayState1();
            break;
        case States.Gas2:
            annotate("U.S. Oil Imports Hit Two-Decade Low",135,126);
            annotate("Paris Agreement",475,218,"green");
            state = States.Gas3;
            displayState2();
            break;
        case States.Gas3:
            annotate("U.S. Oil Imports Hit Two-Decade Low",135,126);
            annotate("Paris Agreement",475,218);
            annotate("COVID-19 Pandemic",885,212,"green");
            state = States.Gas4;
            displayState3();
            break;
        case States.Gas4:
            annotate("U.S. Oil Imports Hit Two-Decade Low",135,126);
            annotate("Paris Agreement",475,218);
            annotate("COVID-19 Pandemic",885,212);
            annotate("Russia's War With Ukraine",1135,53,"green",-50,-70);
            displayState4();
            break
        case States.Crude1:
            annotate("U.S. Oil Imports Hit Two-Decade Low",135,62,"green");
            state = States.Crude2;
            displayState1();
            break;
        case States.Crude2:
            annotate("U.S. Oil Imports Hit Two-Decade Low",135,62);
            annotate("Paris Agreement",475,240,"green");
            state = States.Crude3;
            displayState2();
            break;
        case States.Crude3:
            annotate("U.S. Oil Imports Hit Two-Decade Low",135,62);
            annotate("Paris Agreement",475,240);
            annotate("COVID-19 Pandemic",885,293,"green");
            state = States.Crude4;
            displayState3();
            break;
        case States.Crude4:
            annotate("U.S. Oil Imports Hit Two-Decade Low",135,62);
            annotate("Paris Agreement",475,240);
            annotate("COVID-19 Pandemic",885,293);
            annotate("Russia's War With Ukraine",1135,34,"green",-50,-70);
            displayState4();
            break;
        case States.Inflation1:
            annotate("U.S. Oil Imports Hit Two-Decade Low",135,299,"green",-50,-70);
            state = States.Inflation2;
            displayState1();
            break;
        case States.Inflation2:
            annotate("U.S. Oil Imports Hit Two-Decade Low",135,299,"gray",-50,-70);
            annotate("Paris Agreement",475,271,"green",-50,-70);
            state = States.Inflation3;
            displayState2();
            break;
        case States.Inflation3:
            annotate("U.S. Oil Imports Hit Two-Decade Low",135,299,"gray",-50,-70);
            annotate("Paris Agreement",475,271,"gray",-50,-70);
            annotate("COVID-19 Pandemic",885,271,"green",10,-70);
            state = States.Inflation4;
            displayState3();
            break;
        case States.Inflation4:
            annotate("U.S. Oil Imports Hit Two-Decade Low",135,299,"gray",-50,-70);
            annotate("Paris Agreement",475,271,"gray",-50,-70);
            annotate("COVID-19 Pandemic",885,271,"gray",10,-70);
            annotate("Russia's War With Ukraine",1135,28,"green",-10,-20);
            displayState4();
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

function displayBaseGas() 
{
    d3.select("#description")
        .html(
            "Displayed here are average U.S. gasoline prices from January 2013 through June 2023. Hover over each scatter point to obtain the price for that specific month. \
             Click on the \"Next Event\" button to view when global events occured and how average U.S. gasoline prices were affected by that event. Click on the \"Crude Oil Prices\"\
             button to view data about crude oil or the \"Inflation\" button to view data about U.S. inflation.\
            <br/>\
            <br/> Data Source: <a href=\"https://data.bls.gov/timeseries/APU000074714\">https://data.bls.gov/timeseries/APU000074714</a>\
            <br/> Event Source: <a href=\"https://www.cfr.org/timeline/oil-dependence-and-us-foreign-policy\">https://www.cfr.org/timeline/oil-dependence-and-us-foreign-policy</a>"
        );
}

function displayBaseCrude() 
{
    d3.select("#description")
        .html(
            "Displayed here are average crude oil prices per barrel from January 2013 through June 2023. Hover over each scatter point to obtain the price for that specific month. \
             Click on the \"Next Event\" button to view when global events occured and how average crude oil prices were affected by that event. Click on the \"Gas Prices\"\
             button to view data about U.S. gasoline or the \"Inflation\" button to view data about U.S. inflation.\
            <br/>\
            <br/> Data Source: <a href=\"https://www.eia.gov/dnav/pet/hist/LeafHandler.ashx?n=PET&s=RWTC&f=M\">https://www.eia.gov/dnav/pet/hist/LeafHandler.ashx?n=PET&s=RWTC&f=M</a>\
            <br/> Event Source: <a href=\"https://www.cfr.org/timeline/oil-dependence-and-us-foreign-policy\">https://www.cfr.org/timeline/oil-dependence-and-us-foreign-policy</a>"
        );
}

function displayBaseInflation() 
{
    d3.select("#description")
        .html(
            "Displayed here are average U.S. inflation rates for each month from January 2013 through June 2023. Hover over each scatter point to obtain the percentage for that specific month. \
             Click on the \"Next Event\" button to view when global events occured and see that there is not much correlation until the Ukraine-Russian war. Click on the \"Gas Prices\"\
             button to view data about U.S. gasoline or the \"Crude Oil Prices\" button to view data about crude oil.\
            <br/>\
            <br/> Data Source: <a href=\"https://data.bls.gov/timeseries/CUUR0000SA0L1E?output_view=pct_12mths\">https://data.bls.gov/timeseries/CUUR0000SA0L1E?output_view=pct_12mths</a>\
            <br/> Event Source: <a href=\"https://www.cfr.org/timeline/oil-dependence-and-us-foreign-policy\">https://www.cfr.org/timeline/oil-dependence-and-us-foreign-policy</a>"
        );
}

function displayState1() 
{
    d3.select("#description")
        .html(
            "Imports of crude oil and petroleum products fall to less than 260,000 barrels per day, the lowest in almost two decades, according to the U.S. Energy Information Administration. \
            The reduced reliance on foreign oil is the result of both declining demand and a domestic energy revolution which, through the combination of hydraulic fracturing and horizontal \
            drilling, unlocked vast reserves of \"tight oil\" in shale rock formations. Tight oil production surges from less than one million barrels a day in 2010 to over four million \
            barrels a day by December 2015, exceeding the individual production of every OPEC member except Saudi Arabia."
        );
}

function displayState2() 
{
    d3.select("#description")
        .html(
            "The Paris Agreement—signed by more than 190 countries, including the United States—enters into force. The most ambitious climate accord to date, the agreement requires all parties \
            to set targets to reduce greenhouse gas emissions, with the goal of arresting the rise in the average global temperature. Countries also agree to aim for net-zero carbon emissions \
            by mid-century. The United States pledges to cut its emissions by more than 25 percent from 2005 levels by 2025, a move that requires transitioning away from fossil fuels, including oil. \
            Although the accord does not include enforcement mechanisms, there are periodic performance reviews meant to encourage countries to adopt more ambitious targets."
        );
}

function displayState3() 
{
    d3.select("#description")
        .html(
            "The world is rocked by the emergence of a new coronavirus disease, COVID-19, that quickly becomes a global pandemic. Response measures, including stay-at-home orders, trigger a sharp \
            drop in the demand for oil. Falling oil prices create a rift within OPEC and lead to a price war between Saudi Arabia and Russia, with Riyadh ramping up production to further slash prices \
            in an effort to force Moscow to the table. Oil prices hit rock bottom; in April, a major benchmark price for U.S. crude oil briefly falls below zero for the first time in history. \
            After Whiting Petroleum Corporation, a major U.S. producer, declares bankruptcy, President Trump attempts to broker an OPEC deal to prevent further damage to the U.S. industry. \
            After Trump intervenes, OPEC and Russia agree to curb production and raise prices."
        );
}

function displayState4() 
{
    d3.select("#description")
        .html(
            "Russia's invasion of Ukraine causes turmoil in global oil markets. Biden blocks U.S. imports of oil from Russia, and Western sanctions cause energy companies to withdraw from the country. \
            Oil prices, already rising in the wake of the pandemic, surge to their highest level since 2008. In response to near-record gasoline prices, U.S. lawmakers on both sides of the aisle call \
            for boosting domestic oil production, though some in Congress urge a quicker transition to renewable energy. The United States and other members of the International Energy Agency announce \
            plans to collectively release sixty million barrels of oil from strategic reserves. Meanwhile, the Biden administration considers smoothing rocky relations with Iran, Saudi Arabia, and \
            Venezuela in the hope that those countries will supply more oil. Senior U.S. officials travel to Caracas for the first time since 2019, and the Biden administration pushes to finalize \
            negotiations on reviving the 2015 Iran nuclear agreement and lifting U.S. sanctions on Tehran."
        );
}
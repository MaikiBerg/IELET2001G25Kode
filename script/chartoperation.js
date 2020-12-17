// Define variables that will be used
var xcounter1 = 0;
var xcounter2 = 0;
var xcounter3 = 0;
var xcounter4 = 0;
var xcountermain =0;
var xcountermain0 = 0;
var xcounter01 = 0;
var xcounter02 = 0;
var xcounter03 = 0;
var xcounter04 = 0;
var xlabel = [0];
var xlabel0 = [0];

var ctx2 = document.getElementById('myChart2').getContext('2d'); //Defines the basic graphic element of the graph

var myLineChart2 = new Chart(ctx2, { //Defines the graph
    type: 'line', //Defines the type of graph
    data: { //Decides how the data (content of the graph will be)
        labels: xlabel, //Labels define the values of the x-axis (and can be altered at a later point/live)
        datasets: [ //Datasets refers to the different graphs and the data they contain
            {
                label: 'HOUSE 1', //Label of dataset/graph 1
                data: dataArr12, //The dataArray that actually stores the data
                backgroundColor: [ //The background color of the graph (usually not in use)
                    'rgb(210,34,70)'
                ],
                borderColor: [ //The border color of the graph (the color of the actual line)
                    'rgb(210,34,70)'
                ],
                borderWidth: 1, //The width of the graph line
                fill: false
            },
            {
                label: 'HOUSE 2',
                data: dataArr22,
                backgroundColor: [
                    'rgb(29,28,255)'
                ],
                borderColor: [
                    'rgb(29,28,255)'
                ],
                borderWidth: 1,
                fill: false
            },
            {
                label: 'HOUSE 3',
                data: dataArr32,
                backgroundColor: [
                    'rgb(87,191,47)'
                ],
                borderColor: [
                    'rgb(87,191,47)'
                ],
                borderWidth: 1,
                fill: false
            },
            {
                label: 'HOUSE 4', //Label of dataset/graph 4
                data: dataArr42, //The dataArray that actually stores the data
                backgroundColor: [ //The background color of the graph (usually not in use)
                    'rgb(255,240,0)'
                ],
                borderColor: [ //The border color of the graph (the color of the actual line)
                    'rgb(255,240,0)'
                ],
                borderWidth: 1, //The width of the graph line
                fill: false
            }
        ]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true //Keep this true to begin at zero in the graph
                }
            }]
        },
        responsive: true,
        maintainAspectRatio: false
    }
});


var ctx = document.getElementById('myChart').getContext('2d'); //Defines the basic graphic element of the graph

var myLineChart = new Chart(ctx, { //Defines the graph
    type: 'line', //Defines the type of graph
    data: { //Decides how the data (content of the graph will be)
        labels: xlabel0, //Labels define the values of the x-axis (and can be altered at a later point/live)
        datasets: [ //Datasets refers to the different graphs and the data they contain
            {
                label: 'HOUSE 1', //Label of dataset/graph 1
                data: dataArr1, //The dataArray that actually stores the data
                backgroundColor: [ //The background color of the graph (usually not in use)
                    'rgb(210,34,70)'
                ],
                borderColor: [ //The border color of the graph (the color of the actual line)
                    'rgb(210,34,70)'
                ],
                borderWidth: 1, //The width of the graph line
                fill: false
            },
            {
                label: 'HOUSE 2',
                data: dataArr2,
                backgroundColor: [
                    'rgb(29,28,255)'
                ],
                borderColor: [
                    'rgb(29,28,255)'
                ],
                borderWidth: 1,
                fill: false
            },
            {
                label: 'HOUSE 3',
                data: dataArr3,
                backgroundColor: [
                    'rgb(87,191,47)'
                ],
                borderColor: [
                    'rgb(87,191,47)'
                ],
                borderWidth: 1,
                fill: false
            },
            {
                label: 'HOUSE 4', //Label of dataset/graph 4
                data: dataArr4, //The dataArray that actually stores the data
                backgroundColor: [ //The background color of the graph (usually not in use)
                    'rgb(255,240,0)'
                ],
                borderColor: [ //The border color of the graph (the color of the actual line)
                    'rgb(255,240,0)'
                ],
                borderWidth: 1, //The width of the graph line
                fill: false
            }
        ]
    },
    options: {
        scales: {
            yAxes: [{
                ticks: {
                    beginAtZero: true //Keep this true to begin at zero in the graph
                }
            }]
        },
        responsive: true,
        maintainAspectRatio: false
    }
});
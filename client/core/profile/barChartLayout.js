import * as d3 from 'd3';

//@todo - put in library
const sortDescending = (data, key) => data.sort((a, b) => d3.descending(a[key], b[key]));
const sortAscending = (data, key) => data.sort((a, b) => d3.ascending(a[key], b[key]));

export default function barChartLayout(){
    let order = "descending";
    let descending = data => sortDescending(data, "value");
    let ascending = data => sortAscending(data, "value");

    function layout(data){
        const { barData } = data;
        
            return { 
                ...data,
                barData:order ? (order === "descending" ? descending(barData) : ascending(barData)) : barData
            }
    }

    layout.order = function (value) {
        if (!arguments.length) { return order; }
        order = value;
        return layout;
    };

    return layout;

}
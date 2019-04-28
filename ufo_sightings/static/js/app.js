// from data.js
var tableData = data;

// Attach event handler to the form
const submit = d3.select("button#filter-btn");
submit.on("click", onClick);

// Event handler 
function onClick() {
    // Suppress refresh
    d3.event.preventDefault();

    // Get the text from the input
    const inputElement = d3.select("input#datetime");
    const input = inputElement.property("value");

    // Use the form input to filter the data by date
    let filtered = tableData;
    const inputList = d3.select("ul#filters");
    inputList.selectAll("input").each(function(d,i){
        const id = d3.select(this).attr("id");
        const input = d3.select(this).property("value");

        if (input != "") {
            filtered = filtered.filter(x => x[id] == input.toLowerCase());
        }
    })

    // Select table body
    const tBody = d3.select("table#ufo-table>tbody");

    // Clear existing entries
    tBody.selectAll("tr").remove();

    // Create table
    filtered.forEach(d => {
        let row = tBody.append("tr");
        Object.values(d).forEach(e => {
            row.append("td").text(e);
        });
    });
}
var colors = new Array();
colors['GEvo'] = {color: 'Tomato', show: 1};
colors['NotebookView'] = {color: 'Aqua', show: 1};
colors['CoGeBlast'] = {color: 'YellowGreen', show: 1};
colors['SynMap'] = {color: 'Orchid', show: 1};
colors['SynFind'] = {color: 'Orange', show: 1};
colors['Users'] = {color: 'DeepSkyBlue', show: 1};
colors['Sources'] = {color: 'Olive', show: 1};
colors['GenomeList'] = {color: 'Magenta', show: 1};
colors['GroupView'] = {color: 'Grey', show: 1};
colors['OrganismView'] = {color: 'Black', show: 1};
colors['SeqType'] = {color: 'Yellow', show: 1};
colors['Groups'] = {color: 'Turquoise', show: 1};
colors['root'] = {color: 'white', show: 1};

var w = Math.max(800, $(window).width()-200),
    h = Math.max(800, $(window).height()),
    node, link, root;

$(function() {
    // Create legend
    colors.forEach(function(element, index) {
        var item =
        $('<div class="link legend selected">'+colors[index].name+'</div>')
        .css('color', 'white')
        .css('background-color', colors[index].color)
        .click(function() {
            $(this).toggleClass('selected');
            if ($(this).hasClass('selected')) {
                $(this).css('color', 'white');
                $(this).css('background-color', colors[index].color);
            }
            else {
                $(this).css('color', colors[index].color);
                $(this).css('background-color', '');
            }
        colors[index].show = !colors[index].show;
        update();
        });

    $('#legend')
        .append(item);
    });

    // Setup D3
    force = d3.layout.force()
        .on("tick", tick)
        .size([w, h]);

    vis = d3.select("#chart").append("svg:svg")
        .attr("width", w)
        .attr("height", h);

    d3.json("source.py", function(json) {
        root = json;
        update();
    });
});

function update() {
    var nodes = flatten(root),
        links = d3.layout.tree().links(nodes);

    // Restart the force layout.
    force
        .nodes(nodes)
        .links(links)
        .start();

    // Update the links…
    link = vis.selectAll("line.link")
        .data(links, function(d) { return d.target.id; });

    // Enter any new links.
    link.enter().insert("svg:line", ".node")
        .attr("class", "link")
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    // Exit any old links.
    link.exit().remove();

    // Update the nodes…
    node = vis.selectAll("circle.node")
        .data(nodes, function(d) { return d.id; })
        .style("fill", color);

    // Enter any new nodes.
    node.enter()
        .append("svg:circle")
        .attr("class", "node")
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .attr("r", function(d) { return Math.sqrt(d.size) / 3 || 4.5; })
        .style("fill", color)
        .on("click", click)
        .call(force.drag)
        .append("svg:title").text(function(d) { return d.info; });

    // Exit any old nodes.
    node.exit().remove();
}

function tick() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; });
}

// Color nodes
function color(node) {
    if (node.type == 'Type') {
        return colors[node.name]['color'];
    } else if (node.type == 'User') {
        return 'white';
    }
    return 'white';
}

// Toggle children on click.
function click(node) {
    if (node.type == 'User'){
        if (_.isEmpty(node.children) && (!node._children)) {
            console.log("load");
            d3.json("source.py?user=" + node.id, function(json) {
                node.children = json;
            });
            node._children = null;
        } else if (!_.isNull(node.children)) {
            console.log("hide");
            node._children = node.children;
            node.children = null;
        } else {
            console.log("show");
            node.children = node._children;
            node._children = null;
        }
        console.log(node);
    }
    $('#info').html(node.name);
    var currentColor = "white";
    currentColor = currentColor == "white" ? "lightGrey" : "white";
    d3.select(this).style("fill", currentColor);
    _.delay(function(){ update(); }, 100);
}


// Returns a list of all nodes under the root.
function flatten(root) {
    var nodes = [], i = 0;

    function recurse(node) {
        if (node.children) node.children.forEach(recurse);
        if (!node.id) node.id = ++i;
        nodes.push(node);
    }

    recurse(root);
    return nodes;
}

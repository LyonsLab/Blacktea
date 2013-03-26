var w = Math.max(800, $(window).width()-200),
    h = Math.max(800, $(window).height()),
    node, link, root;
    color = d3.scale.category20();

$(function() {
    // Setup D3
    force = d3.layout.force()
        .on("tick", tick)
        .size([w, h]);

    vis = d3.select("#chart").append("svg:svg")
        .attr("width", w)
        .attr("height", h);

    d3.json("source.py", function(json) {
        root = json;
        //console.log(root);
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
        .style("fill", fill);

    // Enter any new nodes.
    var tooltip = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("background", "#666")
        .style("border-radius", "5")
        .style("padding", "3")
        .style("color", "#BBB")
        .style("font-family", "tahoma")
        .style("z-index", "10")
        .style("visibility", "hidden");

    node.enter()
        .append("svg:circle")
        .attr("class", "node")
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .attr("r", function(d) { return Math.sqrt(d.size) / 3 || 4.5; })
        .style("fill", fill)
        .on("click", click)
        .on("mouseover", function(d) {
            c = (d.type != "User") ? color(d.name) : 'white';
            return tooltip.style("visibility", "visible").text(d.name).style("color", c);
        })
        .on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
                .on("mouseout", function(){return tooltip.style("visibility", "hidden");})
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
function fill(node) {
    if (node.type == 'Type') {
        return color(node.name);
    } else if (node.type == 'User') {
        return 'white';
    }
    return 'white';
}

// Toggle children on click.
function click(node) {
    if (node.type == 'User'){
        if (_.isEmpty(node.children) && (!node._children)) {
            //console.log("load");
            d3.json("source.py?user=" + node.id, function(json) {
                node.children = json;
            });
            node._children = null;
        } else if (!_.isNull(node.children)) {
            //console.log("hide");
            node._children = node.children;
            node.children = null;
        } else {
            //console.log("show");
            node.children = node._children;
            node._children = null;
        }
    }
    console.log(node);
    _.delay(function(){ update(); }, 300);
}


// Returns a list of all nodes under the root.
var i = 0;
function flatten(root) {
    var nodes = [];

    function recurse(node) {
        if (node.children) node.children.forEach(recurse);
        if (!node.id) node.id = ++i;
        nodes.push(node);
    }

    recurse(root);
    return nodes;
}

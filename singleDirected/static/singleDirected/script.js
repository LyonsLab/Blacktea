var w = Math.max(800, $(window).width()),
    h = Math.max(800, $(window).height()),
    node, link, root;
    color = d3.scale.category20c();

$(function() {
    // Setup D3
    force = d3.layout.force()
        .on("tick", tick)
        .size([w, h])
        .charge(-200)
        .alpha(-.01)
        .theta(1)
        .linkDistance(40)
        .linkStrength(1)
        .friction(.7)
        .gravity(.2);

    vis = d3.select("#chart")
        .append("svg:svg")
        .attr("width", w)
        .attr("height", h);

    d3.json("root/" + window.location.pathname.split('/').reverse()[0], function(json) {
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
    link.enter()
        .insert("svg:line", ".node")
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
        .style("border-radius", "4")
        .style("padding", "3")
        .style("color", "#EEE")
        .style("font-family", "tahoma")
        .style("z-index", "10")
        .style("visibility", "hidden");

    node.enter()
        .append("svg:circle")
        .attr("class", "node")
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .attr("r", function(d) {
            if (d.type == "Job") size = 5;
            else size = Math.sqrt(d.size) / 2 || 3;
            if (size < 3) size = 4;
            return size;
        })
        .style("fill", fill)
        .on("click", click)
        .on("mouseover", function(d) {
            if (d.type != 'Job') {
                return tooltip.style("visibility", "visible")
                        .text(d.name + " : " + d.size);
            } else {
                return tooltip.style("visibility", "visible")
                        .text("date: "  + d.date + "\n\nLink: " + d.link + "\n\nlog id: " + d.log_id);
            }
        })
        .on("mousemove", function(){
            return tooltip
                .style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");
        })
        .on("mouseout", function(){
            return tooltip
                .style("visibility", "hidden");
        })
        .on("mousedown", function(d){
            if (d.type != 'Job' && d.size > 0)
                d.fixed = true;
        })
        .call(force.drag);

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
    if (node.type == "Job")
        if (node.link == null)
            return 'Red';
        else
            return 'Green';
    if (node.size > 0){
        if (node.type == 'Type') {
            return color(node.name);
        } else if (node.type == 'User') {
            return 'white';
        }
        return 'white';
    } else {
        return 'grey';
    }
}

// Toggle children on click.
function click(node) {
    if (node.type == "Job"){
        if(node.link != null) {
            window.open(node.link);
        }
    } else {
        if (_.isEmpty(node.children) && (!node._children)) {
            if(node.type == 'User'){
                url = "user/" + node.user_id
            } else if (node.type == 'Type') {
                url = "user/" + node.user_id + "/type/"+ node.name
            }
            d3.json(url, function(json) {
                node.children = json;
                update();
            });
            node._children = null;
        } else if (!_.isNull(node.children)) {
            node._children = node.children;
            node.children = null;
            node.fixed = false;
            update();
        } else {
            node.children = node._children;
            update();
        }
    }
}


// Returns a list of all nodes under the root.
var i = 0;
function flatten(root) {
    var nodes = [];

    function recurse(node) {
        if (node.children) node.children.forEach(recurse);
        if (!node.id) node.id = ++i;
        if (node.name == 'root') node.fixed = true; 
        nodes.push(node);
    }

    recurse(root);
    return nodes;
}

var w = Math.max(800, $(window).width()),
    h = Math.max(800, $(window).height()),
    node, link, root;
    color = d3.scale.category20();

$(function() {
    // Setup D3
    force = d3.layout.force()
        .on("tick", tick)
        .size([w, h])
        .charge(-300)
        .theta(1)
        .linkDistance(70)
        .linkStrength(2)
        .friction(.2)
        .gravity(.1);

    vis = d3.select("#chart")
        .append("svg:svg")
        .attr("width", w)
        .attr("height", h);

    url = window.location.pathname.split('/').reverse()[0];
    d3.json("root/" + url, function(json) {
        root = json;
        update();
        data = flatten(root);
        var legend = d3.select("#legend")
            .append("svg:svg")
            .attr("width", w)
            .attr("height", h)

        //legend
        legend.selectAll("rect")
            .data(data)
            .enter()
            .append("svg:rect")
            .attr("x", 35)
            .attr("y", function(d, i){ return (i *  20) + 50;})
            .attr("width", 10)
            .attr("height", 10)
            .style("fill", fill);

        legend.selectAll('text')
            .data(data)
            .enter()
            .append("text")
            .attr("x", 49)
            .attr("y", function(d, i){ return (i *  20) + 59;})
            .text(function(d){ if(d.type != "User") return d.name;});
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
        .attr("id", "tooltip");

    node.enter()
        .append("svg:circle")
        .attr("class", "node")
        .attr("cx", function(d) { return d.x; })
        .attr("cy", function(d) { return d.y; })
        .attr("r", function(d) {
            if (d.type == "Job") size = 4;
            if (d.type == "User") size = 15;
            else size = Math.sqrt(d.size) || 5;
            if (size < 5) size = 8;
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
                .style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");
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
            url = "http://genomevolution.org"
            if(new RegExp(url).test(node.link)){
                window.open(node.link);
            } else {
                window.open(url + "/CoGe/" + node.link);
            }
        }
    } else if(node.type == "User" || node.size > 0){
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

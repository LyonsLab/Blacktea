var w = Math.max($(document).width() - ($(document).width() / 8), 600); // Width global
var h = 600; // Height global
console.log(w + " " + h);
var legend, node, link, root; // Force Directed Graph globals
var color = d3.scale.category20(); // Color Scale
var hidden = new Object(); // Object that holds hidden nodes

$(function() {
    // Setup D3
    force = d3.layout.force()
        .on("tick", tick)
        .size([w, h])
        .charge(-400)
        .theta(1)
        .linkDistance(60)
        .linkStrength(2)
        .friction(.3)
        .gravity(.1);

    svg = d3.select("#chart")
        .append("svg:svg")
        .attr("width", w)
        .attr("height", h)
        .attr("id", "graphic")

    tooltip = d3.select("body")
        .append("div")
        .attr("id", "tooltip");

    url = window.location.pathname.replace("blacktea/standalone/", "");
    BASE_URL = "/blacktea/standalone/"
    d3.json(BASE_URL + "root" + url, function(json) {
        root = json;
        data = flatten(root);

        update();
        drawLegend();
    });
});

function drawLegend() {
    legend = d3.select("#legend")
        .append("svg:svg")
        .attr("width", "150")
        .attr("height", h);

    legend.selectAll("rect")
        .data(data)
        .enter()
        .append("svg:rect")
        .attr("x", 15)
        .attr("y", function(d, i){ return (i *  21) + 25;})
        .attr("width", 10)
        .attr("height", 10)
        .style("cursor", "pointer")
        .style("fill", fill)
        .on("click", hide)
        .on("mouseover", _.throttle(pulsate, 500));

    legend.selectAll("text")
        .data(data)
        .enter()
        .append("text")
        .attr("x", 29)
        .attr("y", function(d, i){ return (i * 21) + 34;})
        .style("cursor", "pointer")
        .text(function(d){ if(d.type != "User") return d.name;})
        .on("click", hide)
        .on("mouseover", _.throttle(pulsate, 500));
};

function update() {
    var nodes = flatten(root),
    links = d3.layout.tree().links(nodes);

    // Restart the force layout.
    force.nodes(nodes)
         .links(links)
         .start();

    // Update the links…
    link = svg.selectAll("line.link")
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
    node = svg.selectAll("circle.node")
        .data(nodes, function(d) { return d.id; });

    // Enter any new nodes.
    node.enter()
        .append("svg:circle")
        .attr("class", "node")
        .attr("name", function(d) {if (d.type == 'Type') return d.name; })
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
                        .html(d.name + " : " + d.size);
            } else {
                return tooltip.style("visibility", "visible")
                        .html("date: "  + d.date + "<br>Link: " + d.link + "<br>log id: " + d.log_id);
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
        .attr("cy", function(d) { return d.y; })
}

function hide(node, i) {
    index = _.indexOf(root.children, _.find(root.children,
                function(x){ return x.name == node.name }))
    if (hidden[node.name]) {
        root.children.splice(index, 0, hidden[node.name][0]);
        delete hidden[node.name];
        d3.select(d3.selectAll("rect")[0][i]).style("fill", fill)
        d3.select(d3.selectAll("text")[0][i]).attr("fill", "#000")
    } else {
        hidden[node.name] = root.children.splice(index, 1);
        d3.select(d3.selectAll("rect")[0][i]).style("fill", "#BBB")
        d3.select(d3.selectAll("text")[0][i]).attr("fill", "#BBB")
    }
    update();
}

// Nodes pulsate on legend hover.
function pulsate(node) {
    var pulseNode = d3.select("[name='"+node.name+"']")
    if (_.isObject(pulseNode[0][0])){
        _.throttle(originalRadius = pulseNode[0][0].getAttribute("r"), 200)
        for (i = 0; i < 300; i++){
            val = Math.abs(Math.sqrt(i * originalRadius));
            pulseNode.transition().attr("r", val);
        }
        pulseNode.transition().delay(200).attr("r", originalRadius);
    }
}

// Color nodes
function fill(node) {
    if (node.type == "Job") {
        if (node.link == null) {
            return 'Red';
        } else {
            return 'Green';
        }
    }
    if (node.size > 0) {
        if (node.type == 'Type') {
            return color(node.name);
        } else if (node.type == 'User') {
            return 'White';
        }
        return 'White';
    } else {
        return 'Grey';
    }
}

// Toggle children on click.
function click(node) {
    if (node.type == "Job") {
        if(node.link != null) {
            url = "http://genomevolution.org"
            if(new RegExp(url).test(node.link)){
                window.open(node.link);
            } else {
                window.open(url + "/CoGe/" + node.link);
            }
        }
    } else if(node.type == "User" || node.size > 0) {
        if (_.isEmpty(node.children) && (!node._children)) {
            if(node.type == 'User'){
                url = "root/" + node.user_id
            } else if (node.type == 'Type') {
                url = "user/" + node.user_id + "/type/"+ node.name
            }
            d3.json(BASE_URL + url, function(json) {
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
        nodes.push(node);
    }

    recurse(root);
    return nodes;
}

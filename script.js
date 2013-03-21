var colors = [
  { name: 'GEvo',       link: 'NotebookView.pl?nid=',   color: 'Tomato'     },
  { name: 'CoGeBlast',  link: 'GenomeInfo.pl?gid=',     color: 'YellowGreen'},
  { name: 'SynMap',     link: 'ExperimentView.pl?eid=', color: 'Orchid'     },
  { name: 'SynFind',    link: '',                       color: 'Orange'     },
  { name: 'user',       link: '',                       color: 'DeepSkyBlue'},
  { name: 'group',      link: 'GroupView.pl?ugid=',     color: 'Turquoise'  },
];

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
function color(d) {
    if (d.type) {
        return colors[d.type].color;
    }
    return 'white';
}

// Toggle children on click.
function click(d) {
    if (d.children) {
        d._children = d.children;
        d.children = null;
    } else {
        d.children = d._children;
        d._children = null;
    }
    update();

    $('#info').html(d.name);
    var currentColor = "white";
    currentColor = currentColor == "white" ? "lightGrey" : "white";
    d3.select(this).style("fill", currentColor);
}


// Returns a list of all nodes under the root.
function flatten(root) {
    var nodes = [], i = 0;

    function recurse(node) {
        if (node.children) node.children.forEach(recurse);
        if (!node.id) node.id = ++i;

        var show = 1;
        if (node.type) {
            show = colors[node.type-1].show;
        }
        if (show) {
            nodes.push(node);
        }
    }

    recurse(root);
    return nodes;
}

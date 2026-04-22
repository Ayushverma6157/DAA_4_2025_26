
class Graph {
    constructor(v) {
        this.V = v;
        this.adj = new Map();
        for (let i = 0; i < v; i++) {
            this.adj.set(i, []);
        }
    }

    addNode(nodeId) {
        if (!this.adj.has(nodeId)) {
            this.adj.set(nodeId, []);
            this.V++;
            return true;
        }
        return false;
    }

    addEdge(u, v, w) {

        let uEdges = this.adj.get(u);
        let vEdges = this.adj.get(v);

        let uEdgeIndex = uEdges.findIndex(edge => edge.node === v);
        let vEdgeIndex = vEdges.findIndex(edge => edge.node === u);

        if (uEdgeIndex !== -1) {
            uEdges[uEdgeIndex].weight = w;
        } else {
            uEdges.push({ node: v, weight: w });
        }

        if (vEdgeIndex !== -1) {
            vEdges[vEdgeIndex].weight = w;
        } else {
            vEdges.push({ node: u, weight: w });
        }
    }

    shortestPath(src, dest, emergency, trafficLevel) {
        let dist = new Map();
        let parent = new Map();
        let INT_MAX = Number.MAX_SAFE_INTEGER;

        for (let node of this.adj.keys()) {
            dist.set(node, INT_MAX);
            parent.set(node, -1);
        }

        dist.set(src, 0);


        let pq = [{ weight: 0, node: src }];

        while (pq.length > 0) {
            pq.sort((a, b) => a.weight - b.weight);
            let current = pq.shift();
            let node = current.node;

            if (current.weight > dist.get(node)) continue;

            let neighbors = this.adj.get(node) || [];
            for (let neighbor of neighbors) {
                let v = neighbor.node;
                let weight = neighbor.weight;

                if (weight === INT_MAX) continue;

                let effectiveWeight = weight;
                if (trafficLevel === 1) effectiveWeight += 2;
                else if (trafficLevel === 2) effectiveWeight += 5;
                
                if (emergency) effectiveWeight = Math.floor(effectiveWeight / 2);

                if (dist.get(v) > dist.get(node) + effectiveWeight) {
                    dist.set(v, dist.get(node) + effectiveWeight);
                    parent.set(v, node);
                    pq.push({ weight: dist.get(v), node: v });
                }
            }
        }

        if (dist.get(dest) === INT_MAX) {
            return { path: null, cost: -1 };
        }

        let path = [];
        for (let v = dest; v !== -1; v = parent.get(v)) {
            path.push(v);
        }
        path.reverse();

        return { path: path, cost: dist.get(dest) };
    }

    blockRoad(u, v) {
        let INT_MAX = Number.MAX_SAFE_INTEGER;
        let uEdges = this.adj.get(u);
        let vEdges = this.adj.get(v);

        if (uEdges) {
            for (let edge of uEdges) {
                if (edge.node === v) edge.weight = INT_MAX;
            }
        }
        if (vEdges) {
            for (let edge of vEdges) {
                if (edge.node === u) edge.weight = INT_MAX;
            }
        }
    }
}



let graph;
let nodesData = new Map();
let edgesData = [];
let nextNodeId = 6;

const svgContainer = document.getElementById('edges-svg');
const nodesContainer = document.getElementById('nodes-container');


function initGraph() {
    graph = new Graph(6);
    nextNodeId = 6;
    
    svgContainer.innerHTML = '';
    nodesContainer.innerHTML = '';
    nodesData.clear();
    edgesData = [];


    const graphContainer = document.getElementById('graph-container');
    const centerX = graphContainer.clientWidth / 2;
    const centerY = graphContainer.clientHeight / 2;
    
    addNodeVisual(0, centerX - 200, centerY - 150);
    addNodeVisual(1, centerX + 100, centerY - 200);
    addNodeVisual(2, centerX - 50, centerY);
    addNodeVisual(3, centerX + 200, centerY);
    addNodeVisual(4, centerX - 100, centerY + 200);
    addNodeVisual(5, centerX + 150, centerY + 150);


    addEdgeAction(0, 1, 4);
    addEdgeAction(0, 2, 2);
    addEdgeAction(1, 2, 1);
    addEdgeAction(1, 3, 5);
    addEdgeAction(2, 3, 8);
    addEdgeAction(2, 4, 10);
    addEdgeAction(3, 4, 2);
    addEdgeAction(3, 5, 6);
    addEdgeAction(4, 5, 3);
    
    clearHighlights();
}


function addNodeVisual(id, x, y) {
    if(!nodesData.has(id)) {
        nodesData.set(id, { x, y });
    } else {
        nodesData.get(id).x = x;
        nodesData.get(id).y = y;
    }

    const nodeEl = document.createElement('div');
    nodeEl.className = 'node';
    nodeEl.id = `node-${id}`;
    nodeEl.textContent = id;
    nodeEl.style.left = `${x}px`;
    nodeEl.style.top = `${y}px`;


    let isDragging = false;
    let startX, startY;

    nodeEl.addEventListener('mousedown', (e) => {
        isDragging = true;
        nodeEl.classList.add('dragging');
        startX = e.clientX - nodesData.get(id).x;
        startY = e.clientY - nodesData.get(id).y;
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        let newX = e.clientX - startX;
        let newY = e.clientY - startY;
        
        nodesData.get(id).x = newX;
        nodesData.get(id).y = newY;
        nodeEl.style.left = `${newX}px`;
        nodeEl.style.top = `${newY}px`;
        
        updateEdgesVisuals();
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            nodeEl.classList.remove('dragging');
        }
    });

    nodesContainer.appendChild(nodeEl);
}


function addEdgeAction(u, v, w) {
    if (!nodesData.has(u) || !nodesData.has(v)) {
        alert("One or both nodes do not exist!");
        return;
    }
    

    graph.addEdge(u, v, w);


    let existingEdge = edgesData.find(e => (e.u === u && e.v === v) || (e.u === v && e.v === u));
    
    if (existingEdge) {
        existingEdge.w = w;
        if (existingEdge.text) existingEdge.text.textContent = w;
        if (existingEdge.weightText) existingEdge.weightText.textContent = w;
        existingEdge.group.classList.remove('blocked');
    } else {
        createEdgeVisual(u, v, w);
    }
}

function createEdgeVisual(u, v, w) {
    const namespace = "http://www.w3.org/2000/svg";
    const group = document.createElementNS(namespace, "g");
    group.setAttribute("class", "edge");
    group.id = `edge-${u}-${v}`;

    const line = document.createElementNS(namespace, "line");
    line.setAttribute("class", "edge-line");

    const rect = document.createElementNS(namespace, "rect");
    rect.setAttribute("class", "edge-weight-bg");

    const text = document.createElementNS(namespace, "text");
    text.setAttribute("class", "edge-weight");
    text.textContent = w;

    group.appendChild(line);
    group.appendChild(rect);
    group.appendChild(text);
    svgContainer.appendChild(group);

    edgesData.push({ u, v, w, group, line, rect, text });
    updateEdgesVisuals();
}

function updateEdgesVisuals() {
    edgesData.forEach(edge => {
        const p1 = nodesData.get(edge.u);
        const p2 = nodesData.get(edge.v);

        if(!p1 || !p2) return;

        edge.line.setAttribute("x1", p1.x);
        edge.line.setAttribute("y1", p1.y);
        edge.line.setAttribute("x2", p2.x);
        edge.line.setAttribute("y2", p2.y);

        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;

        edge.text.setAttribute("x", midX);
        edge.text.setAttribute("y", midY);


        edge.rect.setAttribute("x", midX - 12);
        edge.rect.setAttribute("y", midY - 10);
        edge.rect.setAttribute("width", 24);
        edge.rect.setAttribute("height", 20);
    });
}

function clearHighlights() {
    document.querySelectorAll('.node').forEach(el => el.classList.remove('highlighted'));
    document.querySelectorAll('.edge').forEach(el => el.classList.remove('highlighted'));
}



document.getElementById('add-node-btn').addEventListener('click', () => {
    let newId = nextNodeId++;
    graph.addNode(newId);
    

    const graphContainer = document.getElementById('graph-container');
    const x = graphContainer.clientWidth / 2 + (Math.random() * 100 - 50);
    const y = graphContainer.clientHeight / 2 + (Math.random() * 100 - 50);
    
    addNodeVisual(newId, x, y);
});

document.getElementById('add-edge-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const u = parseInt(document.getElementById('edge-u').value);
    const v = parseInt(document.getElementById('edge-v').value);
    const w = parseInt(document.getElementById('edge-w').value);
    
    if(u === v) return alert("Cannot add edge to itself!");
    
    addEdgeAction(u, v, w);
    e.target.reset();
});

document.getElementById('block-road-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const u = parseInt(document.getElementById('block-u').value);
    const v = parseInt(document.getElementById('block-v').value);
    
    graph.blockRoad(u, v);
    
    let edge = edgesData.find(e => (e.u === u && e.v === v) || (e.u === v && e.v === u));
    if (edge) {
        edge.group.classList.add('blocked');
        edge.weightText = edge.group.querySelector('.edge-weight');
        edge.weightText.textContent = "∞";
    } else {
        alert("Edge does not exist!");
    }
    e.target.reset();
});

document.getElementById('find-route-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const src = parseInt(document.getElementById('route-src').value);
    const dest = parseInt(document.getElementById('route-dest').value);
    const trafficLevel = parseInt(document.getElementById('traffic-level').value);
    const isEmergency = document.getElementById('is-emergency').checked;

    if (!nodesData.has(src) || !nodesData.has(dest)) {
        return alert("Source or Destination node does not exist!");
    }

    const result = graph.shortestPath(src, dest, isEmergency, trafficLevel);
    const display = document.getElementById('results-display');
    
    clearHighlights();

    if (result.cost === -1) {
        display.innerHTML = `<div class="result-time">Error</div><div class="result-path">No path available!</div>`;
        display.classList.remove('empty');
    } else {

        let pathStr = '';
        for (let i = 0; i < result.path.length; i++) {
            let u = result.path[i];
            document.getElementById(`node-${u}`).classList.add('highlighted');
            
            pathStr += `<span class="path-node">${u}</span>`;
            if (i < result.path.length - 1) {
                pathStr += `<span class="path-arrow">➔</span>`;
                let v = result.path[i+1];
                let edge = edgesData.find(e => (e.u === u && e.v === v) || (e.u === v && e.v === u));
                if (edge) edge.group.classList.add('highlighted');
            }
        }

        display.innerHTML = `
            <div class="result-time">${result.cost} <span>units</span></div>
            <div class="result-path">${pathStr}</div>
        `;
        display.classList.remove('empty');
    }
});

document.getElementById('reset-graph-btn').addEventListener('click', initGraph);


document.addEventListener('DOMContentLoaded', initGraph);

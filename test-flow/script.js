// Sidebar toggle functionality
function toggleSidebar() {
  const sidebar = document.querySelector('.components-sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  
  if (sidebar.classList.contains('sidebar-visible')) {
    closeSidebar();
  } else {
    sidebar.classList.add('sidebar-visible');
    overlay.classList.add('overlay-visible');
  }
}

function closeSidebar() {
  const sidebar = document.querySelector('.components-sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  
  sidebar.classList.remove('sidebar-visible');
  overlay.classList.remove('overlay-visible');
}

// Close sidebar on escape key
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    closeSidebar();
  }
});

// Close sidebar when clicking outside
document.addEventListener('click', function(event) {
  const sidebar = document.querySelector('.components-sidebar');
  const toggleButton = document.querySelector('.sidebar-toggle');
  
  // Check if sidebar is visible and click is outside sidebar and toggle button
  if (sidebar.classList.contains('sidebar-visible') && 
      !sidebar.contains(event.target) && 
      !toggleButton.contains(event.target)) {
    closeSidebar();
  }
});

// --- Node data and templates ---
const nodeTemplates = {
  ChatMessageTrigger: {
    title: "When Chat Message Received",
    icon: 'wechat',
  },
  Switch: {
    title: "Switch",
    icon: '<i class="fa-solid fa-repeat" style="color: #3b82f6;"></i>',
  },
  EditFields: {
    title: "Edit Fields",
    icon: '<i class="fa-solid fa-pen" style="color: #8b5cf6;"></i>',
  },
  Filter: {
    title: "Filter",
    icon: '<i class="fa-solid fa-filter" style="color: #3b82f6;"></i>',
  },
  CustomerSupportAgent: {
    title: "Customer Support Agent",
    icon: '👩‍💼',
  },
  GmailTrigger: {
    title: "Gmail Trigger",
    icon: '<i class="fa-solid fa-envelope"></i>',
  },
  Embedding: {
    title: "Embedding",
    icon: '<i class="fa-solid fa-code"></i>',
  },
  VectorStore: {
    title: "Vector Store",
    icon: '<i class="fa-solid fa-layer-group"></i>',
  },
  AIAgent: {
    title: "AI Agent",
    subtitle: "Tools Agent",
    icon: '<i class="fa-solid fa-robot"></i>',
    subOutputs: 3,
  },
};

let connections = [];
let draggingConnection = null;
let connectionStart = null;

function createNode(type, id, x, y) {
  const template = nodeTemplates[type];
  if (!template) throw new Error('Unknown node type: ' + type);
  let node;
  if (type === 'ChatMessageTrigger') {
    node = document.createElement('div');
    node.className = 'wechat-custom-node';
    node.style.position = 'absolute';
    node.style.left = x + 'px';
    node.style.top = y + 'px';
    node.setAttribute('data-node-id', id);
    node.setAttribute('data-node-type', type);
    node.innerHTML = `
      <div class="node wechat-node-shape">
        <span class="wechat-icon">
          <!-- SVG for WeChat-like icon -->
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="22" cy="22" rx="14" ry="12" fill="#fff" stroke="#BDBDBD" stroke-width="2"/>
            <ellipse cx="32" cy="30" rx="8" ry="7" fill="#fff" stroke="#BDBDBD" stroke-width="2"/>
            <circle cx="18" cy="22" r="2" fill="#BDBDBD"/>
            <circle cx="26" cy="22" r="2" fill="#BDBDBD"/>
            <circle cx="30" cy="30" r="1.5" fill="#BDBDBD"/>
            <circle cx="35" cy="30" r="1.5" fill="#BDBDBD"/>
          </svg>
        </span>
        <div class="output-port-row">
          <div class="output-line"></div>
          <div class="wechat-output-port" title="Drag to connect">+</div>
        </div>
      </div>
      <div class="wechat-node-label">When Chat<br>Message Received</div>
    `;
    enableDrag(node);
    enableWeChatOutput(node);
    // Show/hide temp line and plus based on connection
    updateWeChatNodePlaceholder(node);
    return node;
  }
  node = document.createElement('div');
  node.className = 'n8n-node';
  node.style.position = 'absolute';
  node.style.left = x + 'px';
  node.style.top = y + 'px';
  node.setAttribute('data-node-id', id);
  node.setAttribute('data-node-type', type);

  let portsHTML = '';
  if (type === 'AIAgent') {
    portsHTML = `
      <div class="n8n-node-ports">
        <div class="n8n-node-port n8n-node-port-input" data-port-type="input"></div>
        <div class="n8n-node-port n8n-node-port-output" data-port-type="output"></div>
      </div>
      <div class="n8n-node-ports-suboutputs">
        <div class="n8n-node-suboutput-group">
          <div class="n8n-node-suboutput-line"></div>
          <div class="n8n-node-port n8n-node-port-suboutput diamond" data-port-type="suboutput" data-output-index="0"><span class="plus">+</span></div>
        </div>
        <div class="n8n-node-suboutput-group">
          <div class="n8n-node-suboutput-line"></div>
          <div class="n8n-node-port n8n-node-port-suboutput diamond" data-port-type="suboutput" data-output-index="1"><span class="plus">+</span></div>
        </div>
        <div class="n8n-node-suboutput-group">
          <div class="n8n-node-suboutput-line"></div>
          <div class="n8n-node-port n8n-node-port-suboutput diamond" data-port-type="suboutput" data-output-index="2"><span class="plus">+</span></div>
        </div>
      </div>
    `;
  } else if (type === 'Switch' || type === 'EditFields') {
    portsHTML = `
      <div class="n8n-node-ports">
        <div class="n8n-node-port n8n-node-port-input" data-port-type="input"></div>
        <div class="output-port-row">
          <div class="output-line"></div>
          <div class="custom-output-port" title="Drag to connect">+</div>
        </div>
      </div>
    `;
  } else {
    portsHTML = `
      <div class="n8n-node-ports">
        <div class="n8n-node-port n8n-node-port-input" data-port-type="input"></div>
        <div class="output-port-row">
          <div class="output-line"></div>
          <div class="custom-output-port" title="Drag to connect">+</div>
        </div>
      </div>
    `;
  }

  node.innerHTML = `
    <div class="n8n-node-header">
      <span class="n8n-node-icon">${template.icon}</span>
      <span class="n8n-node-title">${template.title}</span>
      ${template.subtitle ? `<div class="n8n-node-subtitle">${template.subtitle}</div>` : ''}
    </div>
    ${portsHTML}
  `;
  enableDrag(node);
  enablePorts(node, type);
  return node;
}

function enableDrag(node) {
  let offsetX, offsetY, isDragging = false;
  node.addEventListener('mousedown', function(e) {
    if (e.target.classList.contains('node-menu') || e.target.classList.contains('n8n-node-port')) return;
    isDragging = true;
    offsetX = e.clientX - node.offsetLeft;
    offsetY = e.clientY - node.offsetTop;
    document.body.style.userSelect = 'none';
  });
  document.addEventListener('mousemove', function(e) {
    if (!isDragging) return;
    node.style.left = (e.clientX - offsetX) + 'px';
    node.style.top = (e.clientY - offsetY) + 'px';
    updateConnections();
  });
  document.addEventListener('mouseup', function() {
    isDragging = false;
    document.body.style.userSelect = '';
  });
}

function enablePorts(node, type) {
  const inputPort = node.querySelector('.n8n-node-port-input');
  const outputPort = node.querySelector('.n8n-node-port-output');
  const nodeId = node.getAttribute('data-node-id');

  if (outputPort) {
    outputPort.addEventListener('mousedown', function(e) {
      e.stopPropagation();
      outputPort.classList.add('connecting');
      draggingConnection = true;
      connectionStart = { nodeId, port: 'output', outputIndex: 0 };
      const svg = document.getElementById('connections-svg');
      let tempLine = document.getElementById('temp-connection-line');
      if (!tempLine) {
        tempLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        tempLine.setAttribute('id', 'temp-connection-line');
        tempLine.setAttribute('stroke', '#cfd8dc');
        tempLine.setAttribute('stroke-width', '3');
        tempLine.setAttribute('fill', 'none');
        tempLine.setAttribute('pointer-events', 'none');
        svg.appendChild(tempLine);
      }
      document.addEventListener('mousemove', drawTempLine);
      document.addEventListener('mouseup', function removeConnecting() {
        outputPort.classList.remove('connecting');
        document.removeEventListener('mouseup', removeConnecting);
      });
      document.addEventListener('mouseup', endConnection);
    });
  }

  // Add drag-to-connect for custom-output-port (all nodes except ChatMessageTrigger and AIAgent)
  const customOutputPort = node.querySelector('.custom-output-port');
  if (customOutputPort) {
    customOutputPort.addEventListener('mousedown', function(e) {
      e.stopPropagation();
      customOutputPort.classList.add('connecting');
      draggingConnection = true;
      connectionStart = { nodeId, port: 'output', outputIndex: 0 };
      const svg = document.getElementById('connections-svg');
      let tempLine = document.getElementById('temp-connection-line');
      if (!tempLine) {
        tempLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        tempLine.setAttribute('id', 'temp-connection-line');
        tempLine.setAttribute('stroke', '#cfd8dc');
        tempLine.setAttribute('stroke-width', '3');
        tempLine.setAttribute('fill', 'none');
        tempLine.setAttribute('pointer-events', 'none');
        svg.appendChild(tempLine);
      }
      document.addEventListener('mousemove', drawTempLine);
      document.addEventListener('mouseup', function removeConnecting() {
        customOutputPort.classList.remove('connecting');
        document.removeEventListener('mouseup', removeConnecting);
      });
      document.addEventListener('mouseup', endConnection);
    });
  }

  if (type === 'AIAgent') {
    const subOutputs = node.querySelectorAll('.n8n-node-port-suboutput');
    subOutputs.forEach((subOutput, idx) => {
      subOutput.addEventListener('mousedown', function(e) {
        e.stopPropagation();
        subOutput.classList.add('connecting');
        draggingConnection = true;
        connectionStart = { nodeId, port: 'suboutput', outputIndex: idx };
        const svg = document.getElementById('connections-svg');
        let tempLine = document.getElementById('temp-connection-line');
        if (!tempLine) {
          tempLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          tempLine.setAttribute('id', 'temp-connection-line');
          tempLine.setAttribute('stroke', '#cfd8dc');
          tempLine.setAttribute('stroke-width', '3');
          tempLine.setAttribute('fill', 'none');
          tempLine.setAttribute('pointer-events', 'none');
          svg.appendChild(tempLine);
        }
        document.addEventListener('mousemove', drawTempLine);
        document.addEventListener('mouseup', function removeConnecting() {
          subOutput.classList.remove('connecting');
          document.removeEventListener('mouseup', removeConnecting);
        });
        document.addEventListener('mouseup', endConnection);
      });
    });
  }

  // Input port: complete connection
  if (inputPort) {
    inputPort.addEventListener('mouseup', function(e) {
      e.stopPropagation();
      if (draggingConnection && connectionStart) {
        const fromNode = connectionStart.nodeId;
        const toNode = nodeId;
        const fromPort = connectionStart.outputIndex || 0;
        const fromType = connectionStart.port;
        if (fromNode !== toNode) {
          // Add .connected to the output port used
          if (fromType === 'suboutput') {
            const fromNodeEl = document.querySelector(`[data-node-id='${fromNode}']`);
            if (fromNodeEl) {
              const subOutputs = fromNodeEl.querySelectorAll('.n8n-node-port-suboutput');
              if (subOutputs[fromPort]) {
                subOutputs[fromPort].classList.add('connected');
              }
            }
          } else if (fromType === 'output') {
            const fromNodeEl = document.querySelector(`[data-node-id='${fromNode}']`);
            if (fromNodeEl && fromNodeEl.classList.contains('wechat-custom-node')) {
              // DO NOT add .connected for WeChat node output
              // This allows unlimited connections
            } else if (fromNodeEl) {
              // For other nodes, you can decide if you want to add .connected
              // mainOutput.classList.add('connected');
            }
          }
          connections.push({ from: fromNode, fromPort, fromType, to: toNode });
          updateConnections();
          // If the source node is ChatMessageTrigger, update its placeholder
          const fromNodeEl = document.querySelector(`[data-node-id='${fromNode}']`);
          if (fromNodeEl && fromNodeEl.getAttribute('data-node-type') === 'ChatMessageTrigger') {
            onFirstConnection(fromNodeEl);
          }
        }
      }
      draggingConnection = false;
      connectionStart = null;
      removeTempLine();
      document.removeEventListener('mousemove', drawTempLine);
      document.removeEventListener('mouseup', endConnection);
    });
  }
}

function getPortCenter(node, portSelector, portIndex = 0, towardPoint = null) {
  if (node.classList.contains('wechat-custom-node') && portSelector === '.n8n-node-port-output') {
    const port = node.querySelector('.wechat-output-port');
    const rect = port.getBoundingClientRect();
    const canvasRect = document.getElementById('canvas-area').getBoundingClientRect();
    let cx = rect.left + rect.width / 2 - canvasRect.left;
    let cy = rect.top + rect.height / 2 - canvasRect.top;
    // If we know where the line is going, offset toward that direction
    if (towardPoint) {
      const dx = towardPoint.x - cx;
      const dy = towardPoint.y - cy;
      const len = Math.sqrt(dx*dx + dy*dy) || 1;
      const r = rect.width / 2; // radius
      cx += dx / len * r;
      cy += dy / len * r;
    }
    return { x: cx, y: cy };
  } else if (portSelector === '.n8n-node-port-suboutput' && node.querySelectorAll(portSelector).length > 1) {
    const port = node.querySelectorAll(portSelector)[portIndex];
    const rect = port.getBoundingClientRect();
    const canvasRect = document.getElementById('canvas-area').getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2 - canvasRect.left,
      y: rect.top + rect.height / 2 - canvasRect.top
    };
  } else if (portSelector === '.n8n-node-port-output' && node.querySelectorAll(portSelector).length > 1) {
    const port = node.querySelectorAll(portSelector)[portIndex];
    const rect = port.getBoundingClientRect();
    const canvasRect = document.getElementById('canvas-area').getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2 - canvasRect.left,
      y: rect.top + rect.height / 2 - canvasRect.top
    };
  } else {
    const port = node.querySelector(portSelector);
    const rect = port.getBoundingClientRect();
    const canvasRect = document.getElementById('canvas-area').getBoundingClientRect();
    return {
      x: rect.left + rect.width / 2 - canvasRect.left,
      y: rect.top + rect.height / 2 - canvasRect.top
    };
  }
}

function updateConnections() {
  const svg = document.getElementById('connections-svg');
  svg.innerHTML = '';
  connections.forEach(conn => {
    const fromNode = document.querySelector(`[data-node-id='${conn.from}']`);
    const toNode = document.querySelector(`[data-node-id='${conn.to}']`);
    if (!fromNode || !toNode) return;
    let fromPortEl;
    if (conn.fromType === 'suboutput') {
      fromPortEl = fromNode.querySelectorAll('.n8n-node-port-suboutput')[conn.fromPort];
    } else if (fromNode.classList.contains('wechat-custom-node')) {
      fromPortEl = fromNode.querySelector('.wechat-output-port');
    } else if (fromNode.getAttribute('data-node-type') === 'Switch' || fromNode.getAttribute('data-node-type') === 'EditFields') {
      fromPortEl = fromNode.querySelector('.custom-output-port');
    } else {
      fromPortEl = fromNode.querySelector('.n8n-node-port-output');
    }
    if (!fromPortEl || fromPortEl.offsetParent === null || getComputedStyle(fromPortEl).display === 'none') {
      return;
    }
    let from, to;
    to = getPortCenter(toNode, '.n8n-node-port-input');
    if (conn.fromType === 'suboutput') {
      from = getPortCenter(fromNode, '.n8n-node-port-suboutput', conn.fromPort);
    } else if (fromNode.classList.contains('wechat-custom-node')) {
      from = getPortCenter(fromNode, '.n8n-node-port-output', 0, to);
    } else if (fromNode.getAttribute('data-node-type') === 'Switch' || fromNode.getAttribute('data-node-type') === 'EditFields') {
      from = getPortCenter(fromNode, '.custom-output-port', 0, to);
    } else {
      from = getPortCenter(fromNode, '.n8n-node-port-output', conn.fromPort);
    }
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', createBezierPath(from.x, from.y, to.x, to.y));
    path.setAttribute('stroke', '#cfd8dc');
    path.setAttribute('stroke-width', '3');
    path.setAttribute('fill', 'none');
    path.setAttribute('marker-end', 'url(#arrowhead)');
    svg.appendChild(path);
  });
}

function createBezierPath(x1, y1, x2, y2) {
  const offset = Math.abs(x2 - x1) * 0.5;
  return `M ${x1} ${y1} C ${x1+offset} ${y1}, ${x2-offset} ${y2}, ${x2} ${y2}`;
}

function drawTempLine(e) {
  if (!draggingConnection || !connectionStart) return;
  const fromNode = document.querySelector(`[data-node-id='${connectionStart.nodeId}']`);
  let from;
  const canvasRect = document.getElementById('canvas-area').getBoundingClientRect();
  const to = { x: e.clientX - canvasRect.left, y: e.clientY - canvasRect.top };
  if (connectionStart.port === 'suboutput') {
    from = getPortCenter(fromNode, '.n8n-node-port-suboutput', connectionStart.outputIndex);
  } else if (fromNode.classList.contains('wechat-custom-node')) {
    from = getPortCenter(fromNode, '.n8n-node-port-output', 0, to);
  } else if (fromNode.getAttribute('data-node-type') === 'Switch' || fromNode.getAttribute('data-node-type') === 'EditFields') {
    from = getPortCenter(fromNode, '.custom-output-port', 0, to);
  } else {
    from = getPortCenter(fromNode, '.n8n-node-port-output', connectionStart.outputIndex);
  }
  const tempLine = document.getElementById('temp-connection-line');
  if (tempLine) {
    tempLine.setAttribute('d', createBezierPath(from.x, from.y, to.x, to.y));
  }
}

function endConnection() {
  draggingConnection = false;
  connectionStart = null;
  removeTempLine();
  document.removeEventListener('mousemove', drawTempLine);
  document.removeEventListener('mouseup', endConnection);
}

function removeTempLine() {
  const tempLine = document.getElementById('temp-connection-line');
  if (tempLine && tempLine.parentNode) {
    tempLine.parentNode.removeChild(tempLine);
  }
}

let draggedNodeType = null;
window.drag = function (ev) {
  draggedNodeType = ev.target.getAttribute('data-node') || ev.target.closest('[data-node]')?.getAttribute('data-node');
};
window.allowDrop = function (ev) { ev.preventDefault(); };
window.drop = function (ev) {
  ev.preventDefault();
  if (!draggedNodeType) return;
  const canvas = document.getElementById('canvas-area');
  const rect = canvas.getBoundingClientRect();
  const x = ev.clientX - rect.left;
  const y = ev.clientY - rect.top;
  const nodeId = 'node-' + Date.now();
  const node = createNode(draggedNodeType, nodeId, x, y);
  canvas.appendChild(node);
  updateConnections();
  draggedNodeType = null;
};
window.addEventListener('DOMContentLoaded', function() {
  const canvas = document.getElementById('canvas-area');
  canvas.addEventListener('drop', window.drop);
  canvas.addEventListener('dragover', window.allowDrop);
  const nodeArea = document.getElementById('node-area');
  const chatNode = createNode('ChatMessageTrigger', 'chat-1', 100, 200);
  nodeArea.appendChild(chatNode);
  updateConnections();

  // Toolbar button logic
  document.getElementById('zoom-in-btn').onclick = zoomIn;
  document.getElementById('zoom-out-btn').onclick = zoomOut;
  document.getElementById('reset-btn').onclick = resetCanvas;
  document.getElementById('fit-btn').onclick = fitToScreen;
});

// Zoom functionality
function zoomIn() {
  const drawflow = document.getElementById('drawflow');
  const currentZoom = drawflow.style.transform ? parseFloat(drawflow.style.transform.replace('scale(', '').replace(')', '')) : 1;
  const newZoom = Math.min(currentZoom * 1.2, 3); // Max zoom 3x
  drawflow.style.transform = `scale(${newZoom})`;
}

function zoomOut() {
  const drawflow = document.getElementById('drawflow');
  const currentZoom = drawflow.style.transform ? parseFloat(drawflow.style.transform.replace('scale(', '').replace(')', '')) : 1;
  const newZoom = Math.max(currentZoom / 1.2, 0.3); // Min zoom 0.3x
  drawflow.style.transform = `scale(${newZoom})`;
}

function enableWeChatOutput(node) {
  const outputPort = node.querySelector('.wechat-output-port');
  if (outputPort) {
    outputPort.addEventListener('mousedown', function(e) {
      e.stopPropagation();
      outputPort.classList.add('connecting');
      draggingConnection = true;
      connectionStart = { nodeId: node.getAttribute('data-node-id'), port: 'output', outputIndex: 0 };
      const svg = document.getElementById('connections-svg');
      let tempLine = document.getElementById('temp-connection-line');
      if (!tempLine) {
        tempLine = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        tempLine.setAttribute('id', 'temp-connection-line');
        tempLine.setAttribute('stroke', '#cfd8dc');
        tempLine.setAttribute('stroke-width', '3');
        tempLine.setAttribute('fill', 'none');
        tempLine.setAttribute('pointer-events', 'none');
        svg.appendChild(tempLine);
      }
      document.addEventListener('mousemove', drawTempLine);
      document.addEventListener('mouseup', function removeConnecting() {
        outputPort.classList.remove('connecting');
        document.removeEventListener('mouseup', removeConnecting);
      });
      document.addEventListener('mouseup', endConnection);
    });
  }
}

function updateWeChatNodePlaceholder(node) {
  const nodeId = node.getAttribute('data-node-id');
  const hasConnection = connections.some(c => c.from === nodeId);
  node.querySelector('.output-line').style.display = hasConnection ? 'none' : 'block';
  node.querySelector('.wechat-output-port').style.display = 'block';
}

function onFirstConnection(nodeElement) {
  updateWeChatNodePlaceholder(nodeElement);
}

function resetCanvas() {
  const drawflow = document.getElementById('drawflow');
  if (drawflow) {
    drawflow.style.transform = 'scale(1)';
  }
}

function fitToScreen() {
  // Basic stub: reset zoom for now
  resetCanvas();
  // Optionally, center nodes or implement advanced fit logic here
}

document.addEventListener('DOMContentLoaded', function() {
    // Tab Navigation
    const navItems = document.querySelectorAll('.nav-item');
    const tabContents = document.querySelectorAll('.tab-content');
    const tabTitle = document.querySelector('.tab-title');
    
    navItems.forEach(item => {
      item.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Update active nav item
        navItems.forEach(nav => nav.classList.remove('active'));
        this.classList.add('active');
        
        // Show corresponding tab content
        const tabId = this.getAttribute('data-tab');
        tabContents.forEach(tab => tab.classList.remove('active'));
        document.getElementById(tabId).classList.add('active');
        
        // Update tab title
        tabTitle.textContent = this.textContent.trim();
      });
    });
    
    // Input Type Tabs
    const inputTabBtns = document.querySelectorAll('.input-tab-btn');
    const urlInput = document.getElementById('url-input');
    const textInput = document.getElementById('text-input');
    
    inputTabBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        inputTabBtns.forEach(b => b.classList.remove('active'));
        this.classList.add('active');
        
        const inputType = this.getAttribute('data-input');
        if (inputType === 'url') {
          urlInput.classList.remove('hidden');
          textInput.classList.add('hidden');
        } else {
          urlInput.classList.add('hidden');
          textInput.classList.remove('hidden');
        }
      });
    });
    
    // Theme Toggle
    const themeSwitch = document.getElementById('theme-switch');
    const body = document.body;
    
    themeSwitch.addEventListener('change', function() {
      if (this.checked) {
        body.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        body.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    });
    
    // Check for saved theme preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      body.classList.add('dark');
      themeSwitch.checked = true;
    }
    
    // Fact Check Button
    const factCheckBtn = document.getElementById('fact-check-btn');
    const resultsContainer = document.getElementById('results-container');
    
    factCheckBtn.addEventListener('click', function() {
      // Simulate loading
      this.textContent = 'Checking...';
      this.disabled = true;
      
      // Simulate API call with timeout
      setTimeout(() => {
        resultsContainer.classList.remove('hidden');
        this.textContent = 'Fact Check Now';
        this.disabled = false;
        
        // Scroll to results
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
      }, 2000);
    });
    
    // Dashboard card buttons
    const viewGraphBtns = document.querySelectorAll('.view-graph-btn');
    
    viewGraphBtns.forEach(btn => {
      btn.addEventListener('click', function() {
        // Switch to graph view tab and show the corresponding graph
        const graphTab = document.querySelector('.nav-item[data-tab="graph-view"]');
        graphTab.click();
      });
    });
    
    // Initialize Graph View
    initializeGraph();
  });
  
  function initializeGraph() {
    // Set up the SVG
    const svg = d3.select('#graph-svg');
    const width = svg.node().getBoundingClientRect().width;
    const height = 600;
    
    // Create a simulation with forces
    const simulation = d3.forceSimulation()
      .force('link', d3.forceLink().id(d => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, height / 2));
    
    // Sample data structure
    const graphData = {
      nodes: [
        { id: 'root', name: 'Input URL: Climate Change Article', type: 'root' },
        { id: 'cnn', name: 'CNN', type: 'source' },
        { id: 'bbc', name: 'BBC', type: 'source' },
        { id: 'nyt', name: 'NY Times', type: 'source' },
        { id: 'dailywire', name: 'Daily Wire', type: 'source' },
        { id: 'nasa', name: 'NASA Climate Data', type: 'supporting' },
        { id: 'noaa', name: 'NOAA Report', type: 'supporting' },
        { id: 'blog1', name: 'Climate Skeptic Blog', type: 'contradicting' }
      ],
      links: [
        { source: 'root', target: 'cnn' },
        { source: 'root', target: 'bbc' },
        { source: 'root', target: 'nyt' },
        { source: 'root', target: 'dailywire' },
        { source: 'cnn', target: 'nasa' },
        { source: 'bbc', target: 'noaa' },
        { source: 'dailywire', target: 'blog1' }
      ]
    };
    
    // Create the graph elements
    const link = svg.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(graphData.links)
      .enter().append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
      .attr('stroke-width', 2);
    
    const node = svg.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(graphData.nodes)
      .enter().append('g')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended));
    
    // Add circles to nodes
    node.append('circle')
      .attr('r', d => d.type === 'root' ? 20 : 12)
      .attr('fill', d => {
        switch(d.type) {
          case 'root': return '#4a6cf7';
          case 'source': return '#3498db';
          case 'supporting': return '#28a745';
          case 'contradicting': return '#dc3545';
          default: return '#6c757d';
        }
      })
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5);
    
    // Add labels to nodes
    node.append('text')
      .attr('dy', 30)
      .attr('text-anchor', 'middle')
      .text(d => d.name.length > 20 ? d.name.substring(0, 17) + '...' : d.name)
      .attr('fill', document.body.classList.contains('dark') ? '#f8f9fa' : '#333')
      .style('font-size', '12px');
    
    // Add titles for tooltips
    node.append('title')
      .text(d => d.name);
    
    // Update positions on simulation tick
    simulation
      .nodes(graphData.nodes)
      .on('tick', ticked);
    
    simulation.force('link')
      .links(graphData.links);
    
    function ticked() {
      link
        .attr('x1', d => d.source.x)
        .attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x)
        .attr('y2', d => d.target.y);
      
      node
        .attr('transform', d => `translate(${d.x},${d.y})`);
    }
    
    // Zoom functionality
    const zoom = d3.zoom()
      .scaleExtent([0.1, 4])
      .on('zoom', zoomed);
    
    svg.call(zoom);
    
    function zoomed(event) {
      svg.selectAll('g').attr('transform', event.transform);
    }
    
    // Zoom controls
    document.getElementById('zoom-in').addEventListener('click', () => {
      svg.transition().call(zoom.scaleBy, 1.2);
    });
    
    document.getElementById('zoom-out').addEventListener('click', () => {
      svg.transition().call(zoom.scaleBy, 0.8);
    });
    
    document.getElementById('reset-zoom').addEventListener('click', () => {
      svg.transition().call(zoom.transform, d3.zoomIdentity);
    });
    
    // Graph selection change
    document.getElementById('graph-select').addEventListener('change', function() {
      // In a real app, this would load different graph data
      // For demo purposes, we'll just reset the simulation
      simulation.alpha(1).restart();
    });
    
    // Drag functions
    function dragstarted(event, d) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(event, d) {
      d.fx = event.x;
      d.fy = event.y;
    }
    
    function dragended(event, d) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
  }